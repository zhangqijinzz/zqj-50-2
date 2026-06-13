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

        const existing = get().stockIngredients.find(s => s.id === ingredientId);
        if (existing) {
          const newQty = (quantity ?? base.defaultQuantity) + existing.quantity;
          set({
            stockIngredients: get().stockIngredients.map(s =>
              s.id === ingredientId ? { ...s, quantity: newQty } : s
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
        return stock ? stock.quantity > 0 : false;
      },

      getStockQuantity: (ingredientId) => {
        const stock = get().stockIngredients.find(s => s.id === ingredientId);
        return stock ? stock.quantity : 0;
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

        for (const ri of recipe.requiredIngredients) {
          if (ri.amount <= 0) continue;

          const idx = newStock.findIndex(s => s.id === ri.id);
          if (idx === -1) {
            insufficient.push(ri.id);
            continue;
          }

          const stockItem = newStock[idx];
          if (stockItem.quantity < ri.amount) {
            insufficient.push(ri.id);
            if (stockItem.quantity > 0) {
              consumed.push(ri.id);
            }
            newStock[idx] = { ...stockItem, quantity: 0 };
          } else {
            const newQty = stockItem.quantity - ri.amount;
            consumed.push(ri.id);
            if (newQty <= 0) {
              newStock.splice(idx, 1);
            } else {
              newStock[idx] = { ...stockItem, quantity: newQty };
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
        return get().stockIngredients
          .map((s) => {
            const expiryDate = new Date(s.purchaseDate);
            expiryDate.setDate(expiryDate.getDate() + s.shelfLifeDays);
            const expiryStr = expiryDate.toISOString().split('T')[0];
            const remainingDays = daysBetween(now, expiryStr);
            return {
              ...s,
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
        return get().stockIngredients.filter(s => s.quantity > 0).map((s) => s.id);
      },

      getMatchedRecipes: () => {
        const stockMap: Record<string, number> = {};
        for (const s of get().stockIngredients) {
          stockMap[s.id] = s.quantity;
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
      partialize: (state) => ({
        stockIngredients: state.stockIngredients,
        preferences: state.preferences,
        customIngredients: state.customIngredients,
      }),
    }
  )
);

export { RECIPES as RECIPE_DATA };
export const getIngredientById = (id: string): Ingredient | undefined => {
  return INGREDIENT_MAP[id];
};

export const formatQuantity = (quantity: number, unit: string): string => {
  if (unit === 'gram' && quantity >= 1000) {
    return `${(quantity / 1000).toFixed(1)}kg`;
  }
  if (Number.isInteger(quantity)) {
    return `${quantity}${unit}`;
  }
  return `${quantity.toFixed(1)}${unit}`;
};
