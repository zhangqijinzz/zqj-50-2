import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  StockIngredient,
  StockIngredientWithStatus,
  ExpiryStatus,
  Recipe,
  MatchedRecipe,
  UserPreferences,
  Ingredient,
  IngredientCategory,
  RecipeIngredient,
} from '@/types';
import { INGREDIENTS, INGREDIENT_MAP } from '@/data/ingredients';
import type { UnitType } from '@/types';
import { RECIPES } from '@/data/recipes';

interface StoreState {
  stockIngredients: StockIngredient[];
  preferences: UserPreferences;
  customIngredients: Ingredient[];

  addStockIngredient: (ingredientId: string, purchaseDate?: string, quantity?: number) => void;
  removeStockIngredient: (ingredientId: string) => void;
  isInStock: (ingredientId: string) => boolean;
  getStockQuantity: (ingredientId: string) => number;
  updateStockQuantity: (ingredientId: string, quantity: number) => void;
  updatePurchaseDate: (ingredientId: string, purchaseDate: string) => void;
  consumeRecipeIngredients: (recipeId: string) => { consumed: string[]; insufficient: string[] };
  togglePreference: (key: keyof UserPreferences) => void;
  addCustomIngredient: (ingredient: Ingredient) => void;

  getAllIngredients: () => Ingredient[];
  getIngredientsByCategory: (category: IngredientCategory) => Ingredient[];
  getStockWithStatus: () => StockIngredientWithStatus[];
  getStockByStatus: () => {
    urgent: StockIngredientWithStatus[];
    warning: StockIngredientWithStatus[];
    fresh: StockIngredientWithStatus[];
    expired: StockIngredientWithStatus[];
  };
  getStockIds: () => string[];
  getMatchedRecipes: () => MatchedRecipe[];
  getFilteredRecipes: () => MatchedRecipe[];
}

const today = () => new Date().toISOString().split('T')[0];

const daysBetween = (dateStr1: string, dateStr2: string): number => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diff = d2.getTime() - d1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (remainingDays: number): ExpiryStatus => {
  if (remainingDays < 0) return 'expired';
  if (remainingDays <= 3) return 'urgent';
  if (remainingDays <= 7) return 'warning';
  return 'fresh';
};

const getSafeQuantity = (
  item: { quantity?: unknown; id: string },
  ingredientMap: Record<string, Ingredient>,
  customList: Ingredient[]
): number => {
  if (
    typeof item.quantity === 'number' &&
    !Number.isNaN(item.quantity) &&
    item.quantity >= 0
  ) {
    return item.quantity;
  }
  const base = ingredientMap[item.id];
  if (base) return base.defaultQuantity;
  const custom = customList.find((c) => c.id === item.id);
  return custom?.defaultQuantity ?? 1;
};

const getSafeUnit = (
  item: { unit?: unknown; id: string },
  ingredientMap: Record<string, Ingredient>,
  customList: Ingredient[]
): UnitType => {
  if (item.unit === 'piece' || item.unit === 'gram' || item.unit === 'pack') {
    return item.unit;
  }
  const base = ingredientMap[item.id];
  if (base) return base.defaultUnit;
  const custom = customList.find((c) => c.id === item.id);
  return custom?.defaultUnit ?? 'piece';
};

const initialPreferences: UserPreferences = {
  onePot: false,
  quickMeal: false,
  lessDishes: false,
  vegetarian: false,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      stockIngredients: [],
      preferences: initialPreferences,
      customIngredients: [],

      addStockIngredient: (ingredientId, purchaseDate, quantity) => {
        const base = INGREDIENT_MAP[ingredientId] ||
          get().customIngredients.find(i => i.id === ingredientId);
        if (!base) return;

        const customList = get().customIngredients;
        const existing = get().stockIngredients.find(s => s.id === ingredientId);
        if (existing) {
          const existingQty = getSafeQuantity(existing, INGREDIENT_MAP, customList);
          const newQty = (quantity ?? base.defaultQuantity) + existingQty;
          set({
            stockIngredients: get().stockIngredients.map(s =>
              s.id === ingredientId ? { ...s, quantity: newQty, unit: getSafeUnit(s, INGREDIENT_MAP, customList) } : s
            ),
          });
          return;
        }

        const stock: StockIngredient = {
          ...base,
          purchaseDate: purchaseDate || today(),
          quantity: quantity ?? base.defaultQuantity,
          unit: base.defaultUnit,
        };
        set({ stockIngredients: [...get().stockIngredients, stock] });
      },

      removeStockIngredient: (ingredientId) => {
        set({
          stockIngredients: get().stockIngredients.filter(
            (s) => s.id !== ingredientId
          ),
        });
      },

      isInStock: (ingredientId) => {
        const stock = get().stockIngredients.find(s => s.id === ingredientId);
        if (!stock) return false;
        return get().getStockQuantity(ingredientId) > 0;
      },

      getStockQuantity: (ingredientId) => {
        const stock = get().stockIngredients.find(s => s.id === ingredientId);
        if (!stock) return 0;
        if (typeof stock.quantity === 'number' && !Number.isNaN(stock.quantity) && stock.quantity >= 0) {
          return Math.max(0, stock.quantity);
        }
        const base = INGREDIENT_MAP[ingredientId];
        if (base) return base.defaultQuantity;
        const custom = get().customIngredients.find((c) => c.id === ingredientId);
        return custom?.defaultQuantity ?? 1;
      },

      updateStockQuantity: (ingredientId, quantity) => {
        if (quantity <= 0) {
          get().removeStockIngredient(ingredientId);
          return;
        }
        set({
          stockIngredients: get().stockIngredients.map((s) =>
            s.id === ingredientId ? { ...s, quantity } : s
          ),
        });
      },

      updatePurchaseDate: (ingredientId, purchaseDate) => {
        set({
          stockIngredients: get().stockIngredients.map((s) =>
            s.id === ingredientId ? { ...s, purchaseDate } : s
          ),
        });
      },

      consumeRecipeIngredients: (recipeId) => {
        const recipe = RECIPES.find(r => r.id === recipeId);
        if (!recipe) return { consumed: [], insufficient: [] };

        const consumed: string[] = [];
        const insufficient: string[] = [];
        const newStock = [...get().stockIngredients];
        const customIngredients = get().customIngredients;

        const getSafeQty = (item: StockIngredient): number => {
          return getSafeQuantity(item, INGREDIENT_MAP, customIngredients);
        };

        const getSafeUnitLocal = (item: StockIngredient): UnitType => {
          return getSafeUnit(item, INGREDIENT_MAP, customIngredients);
        };

        for (const ri of recipe.requiredIngredients) {
          if (ri.amount <= 0) continue;

          const idx = newStock.findIndex(s => s.id === ri.id);
          if (idx === -1) {
            insufficient.push(ri.id);
            continue;
          }

          const stockItem = newStock[idx];
          const safeQty = getSafeQty(stockItem);
          const safeUnit = getSafeUnitLocal(stockItem);
          if (safeQty < ri.amount) {
            insufficient.push(ri.id);
            if (safeQty > 0) {
              consumed.push(ri.id);
            }
            newStock.splice(idx, 1);
          } else {
            const newQty = safeQty - ri.amount;
            consumed.push(ri.id);
            if (newQty <= 0) {
              newStock.splice(idx, 1);
            } else {
              newStock[idx] = { ...stockItem, quantity: newQty, unit: safeUnit };
            }
          }
        }

        set({ stockIngredients: newStock });
        return { consumed, insufficient };
      },

      togglePreference: (key) => {
        set({
          preferences: {
            ...get().preferences,
            [key]: !get().preferences[key],
          },
        });
      },

      addCustomIngredient: (ingredient) => {
        set({ customIngredients: [...get().customIngredients, ingredient] });
      },

      getAllIngredients: () => {
        return [...INGREDIENTS, ...get().customIngredients];
      },

      getIngredientsByCategory: (category) => {
        return get().getAllIngredients().filter((i) => i.category === category);
      },

      getStockWithStatus: () => {
        const now = today();
        const customList = get().customIngredients;
        return get().stockIngredients
          .filter((s) => {
            const safeQty = getSafeQuantity(s, INGREDIENT_MAP, customList);
            return safeQty > 0;
          })
          .map((s) => {
            const base = INGREDIENT_MAP[s.id];
            const customList = get().customIngredients;
            const safeUnit = getSafeUnit(s, INGREDIENT_MAP, customList);
            const safeQty = getSafeQuantity(s, INGREDIENT_MAP, customList);
            const safeShelfLife = s.shelfLifeDays ?? base?.shelfLifeDays ?? 7;
            const expiryDate = new Date(s.purchaseDate || now);
            expiryDate.setDate(expiryDate.getDate() + safeShelfLife);
            const expiryStr = expiryDate.toISOString().split('T')[0];
            const remainingDays = daysBetween(now, expiryStr);
            return {
              ...s,
              unit: safeUnit,
              quantity: safeQty,
              shelfLifeDays: safeShelfLife,
              remainingDays,
              status: getExpiryStatus(remainingDays),
            };
          })
          .sort((a, b) => a.remainingDays - b.remainingDays);
      },

      getStockByStatus: () => {
        const withStatus = get().getStockWithStatus();
        return {
          urgent: withStatus.filter((s) => s.status === 'urgent'),
          warning: withStatus.filter((s) => s.status === 'warning'),
          fresh: withStatus.filter((s) => s.status === 'fresh'),
          expired: withStatus.filter((s) => s.status === 'expired'),
        };
      },

      getStockIds: () => {
        const customList = get().customIngredients;
        return get().stockIngredients.filter(s => {
          const safeQty = getSafeQuantity(s, INGREDIENT_MAP, customList);
          return safeQty > 0;
        }).map((s) => s.id);
      },

      getMatchedRecipes: () => {
        const customList = get().customIngredients;
        const stockMap: Record<string, number> = {};
        for (const s of get().stockIngredients) {
          stockMap[s.id] = getSafeQuantity(s, INGREDIENT_MAP, customList);
        }

        const matched: MatchedRecipe[] = [];

        for (const recipe of RECIPES) {
          const sufficientIds: string[] = [];
          const insufficientIds: string[] = [];
          const missingIds: string[] = [];

          for (const ri of recipe.requiredIngredients) {
            const stockQty = stockMap[ri.id] ?? 0;
            if (stockQty <= 0) {
              missingIds.push(ri.id);
            } else if (ri.amount <= 0 || stockQty >= ri.amount) {
              sufficientIds.push(ri.id);
            } else {
              insufficientIds.push(ri.id);
            }
          }

          const totalIngredients = recipe.requiredIngredients.length;
          if (sufficientIds.length === 0 && insufficientIds.length === 0) continue;

          let matchScore = 0;
          for (const ri of recipe.requiredIngredients) {
            const stockQty = stockMap[ri.id] ?? 0;
            if (ri.amount <= 0) {
              matchScore += stockQty > 0 ? 1 : 0;
            } else if (stockQty >= ri.amount) {
              matchScore += 1;
            } else if (stockQty > 0) {
              matchScore += stockQty / ri.amount * 0.7;
            }
          }

          const matchPercentage = Math.min(100, Math.round((matchScore / totalIngredients) * 100));

          matched.push({
            ...recipe,
            matchPercentage,
            matchedIngredients: sufficientIds,
            insufficientIngredients: insufficientIds,
            missingIngredients: missingIds,
          });
        }

        return matched.sort((a, b) => {
          if (b.matchPercentage !== a.matchPercentage) {
            return b.matchPercentage - a.matchPercentage;
          }
          return a.cookTimeMinutes - b.cookTimeMinutes;
        });
      },

      getFilteredRecipes: () => {
        const { preferences } = get();
        let recipes = get().getMatchedRecipes();

        const prefEntries = Object.entries(preferences) as [keyof UserPreferences, boolean][];
        const activePrefs = prefEntries.filter(([, v]) => v);

        if (activePrefs.length === 0) return recipes;

        return recipes.filter((r) =>
          activePrefs.every(([key]) => {
            switch (key) {
              case 'onePot':
                return r.tags.onePot;
              case 'quickMeal':
                return r.tags.quickMeal;
              case 'lessDishes':
                return r.tags.lessDishes;
              case 'vegetarian':
                return r.tags.vegetarian;
              default:
                return true;
            }
          })
        );
      },
    }),
    {
      name: 'kitchen-rescue-storage',
      version: 3,
      partialize: (state) => ({
        stockIngredients: state.stockIngredients,
        preferences: state.preferences,
        customIngredients: state.customIngredients,
      }),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<{
          stockIngredients: any[];
          customIngredients: any[];
          preferences: UserPreferences;
        }>;

        const getIngredientDefault = (id: string, customList: any[] | undefined) => {
          const base = INGREDIENT_MAP[id];
          if (base) {
            return { defaultUnit: base.defaultUnit, defaultQuantity: base.defaultQuantity };
          }
          const custom = customList?.find((c) => c.id === id);
          if (custom) {
            return {
              defaultUnit: custom.defaultUnit ?? 'piece',
              defaultQuantity:
                typeof custom.defaultQuantity === 'number' && !Number.isNaN(custom.defaultQuantity)
                  ? custom.defaultQuantity
                  : 1,
            };
          }
          return { defaultUnit: 'piece' as UnitType, defaultQuantity: 1 };
        };

        if (version < 1) {
          if (Array.isArray(state.stockIngredients)) {
            state.stockIngredients = state.stockIngredients.map((item) => {
              const { defaultUnit, defaultQuantity } = getIngredientDefault(
                item.id,
                state.customIngredients
              );
              return {
                ...item,
                unit: item.unit ?? defaultUnit,
                quantity:
                  typeof item.quantity === 'number' && !Number.isNaN(item.quantity)
                    ? item.quantity
                    : defaultQuantity,
                defaultUnit: item.defaultUnit ?? defaultUnit,
                defaultQuantity: item.defaultQuantity ?? defaultQuantity,
              };
            });
          }

          if (Array.isArray(state.customIngredients)) {
            state.customIngredients = state.customIngredients.map((item) => ({
              ...item,
              defaultUnit: item.defaultUnit ?? 'piece',
              defaultQuantity:
                typeof item.defaultQuantity === 'number' && !Number.isNaN(item.defaultQuantity)
                  ? item.defaultQuantity
                  : 1,
            }));
          }
        }

        if (version < 2) {
          if (Array.isArray(state.stockIngredients)) {
            state.stockIngredients = state.stockIngredients.map((item) => {
              const { defaultUnit, defaultQuantity } = getIngredientDefault(
                item.id,
                state.customIngredients
              );
              const hasValidQuantity =
                typeof item.quantity === 'number' && !Number.isNaN(item.quantity) && item.quantity > 0;
              const hasValidUnit =
                item.unit === 'piece' || item.unit === 'gram' || item.unit === 'pack';
              return {
                ...item,
                unit: hasValidUnit ? item.unit : defaultUnit,
                quantity: hasValidQuantity ? item.quantity : defaultQuantity,
                defaultUnit: item.defaultUnit ?? defaultUnit,
                defaultQuantity: item.defaultQuantity ?? defaultQuantity,
              };
            });
          }

          if (Array.isArray(state.customIngredients)) {
            state.customIngredients = state.customIngredients.map((item) => {
              const hasValidQty =
                typeof item.defaultQuantity === 'number' &&
                !Number.isNaN(item.defaultQuantity) &&
                item.defaultQuantity > 0;
              const hasValidUnit =
                item.defaultUnit === 'piece' ||
                item.defaultUnit === 'gram' ||
                item.defaultUnit === 'pack';
              return {
                ...item,
                defaultUnit: hasValidUnit ? item.defaultUnit : 'piece',
                defaultQuantity: hasValidQty ? item.defaultQuantity : 1,
              };
            });
          }
        }

        if (version < 3) {
          if (Array.isArray(state.stockIngredients)) {
            state.stockIngredients = state.stockIngredients.map((item) => {
              const { defaultUnit, defaultQuantity } = getIngredientDefault(
                item.id,
                state.customIngredients
              );
              const hasValidQuantity =
                typeof item.quantity === 'number' && !Number.isNaN(item.quantity) && item.quantity > 0;
              const hasValidUnit =
                item.unit === 'piece' || item.unit === 'gram' || item.unit === 'pack';
              const hasValidDefaultUnit =
                item.defaultUnit === 'piece' || item.defaultUnit === 'gram' || item.defaultUnit === 'pack';
              const hasValidDefaultQty =
                typeof item.defaultQuantity === 'number' &&
                !Number.isNaN(item.defaultQuantity) &&
                item.defaultQuantity > 0;
              return {
                ...item,
                unit: hasValidUnit ? item.unit : defaultUnit,
                quantity: hasValidQuantity ? item.quantity : defaultQuantity,
                defaultUnit: hasValidDefaultUnit ? item.defaultUnit : defaultUnit,
                defaultQuantity: hasValidDefaultQty ? item.defaultQuantity : defaultQuantity,
              };
            });
          }

          if (Array.isArray(state.customIngredients)) {
            state.customIngredients = state.customIngredients.map((item) => {
              const hasValidQty =
                typeof item.defaultQuantity === 'number' &&
                !Number.isNaN(item.defaultQuantity) &&
                item.defaultQuantity > 0;
              const hasValidUnit =
                item.defaultUnit === 'piece' ||
                item.defaultUnit === 'gram' ||
                item.defaultUnit === 'pack';
              return {
                ...item,
                defaultUnit: hasValidUnit ? item.defaultUnit : 'piece',
                defaultQuantity: hasValidQty ? item.defaultQuantity : 1,
              };
            });
          }
        }

        return state as any;
      },
    }
  )
);

export { RECIPES as RECIPE_DATA };
export const getIngredientById = (id: string): Ingredient | undefined => {
  return INGREDIENT_MAP[id];
};

export const formatQuantity = (quantity: number, unit: string): string => {
  const safeQty =
    typeof quantity === 'number' && !Number.isNaN(quantity) ? Math.max(0, quantity) : 1;
  const safeUnit = unit || '个';
  if (safeUnit === 'gram' && safeQty >= 1000) {
    return `${(safeQty / 1000).toFixed(1)}kg`;
  }
  if (Number.isInteger(safeQty)) {
    return `${safeQty}${safeUnit}`;
  }
  return `${safeQty.toFixed(1)}${safeUnit}`;
};
