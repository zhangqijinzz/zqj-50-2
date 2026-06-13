export type IngredientCategory = 'vegetable' | 'protein' | 'staple' | 'seasoning';

export type UnitType = 'piece' | 'gram' | 'pack';

export const UNIT_LABELS: Record<UnitType, string> = {
  piece: '个',
  gram: '克',
  pack: '包',
};

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  emoji: string;
  shelfLifeDays: number;
  defaultUnit: UnitType;
  defaultQuantity: number;
}

export interface StockIngredient extends Ingredient {
  purchaseDate: string;
  quantity: number;
  unit: UnitType;
}

export type ExpiryStatus = 'fresh' | 'warning' | 'urgent' | 'expired';

export interface StockIngredientWithStatus extends StockIngredient {
  remainingDays: number;
  status: ExpiryStatus;
}

export interface RecipeTags {
  onePot: boolean;
  quickMeal: boolean;
  lessDishes: boolean;
  vegetarian: boolean;
}

export interface RecipeIngredient {
  id: string;
  amount: number;
}

export interface Recipe {
  id: string;
  name: string;
  coverEmoji: string;
  requiredIngredients: RecipeIngredient[];
  steps: string[];
  cookTimeMinutes: number;
  potCount: number;
  dishCount: number;
  tags: RecipeTags;
  description?: string;
}

export type IngredientMatchStatus = 'sufficient' | 'insufficient' | 'missing';

export interface MatchedRecipe extends Recipe {
  matchPercentage: number;
  matchedIngredients: string[];
  insufficientIngredients: string[];
  missingIngredients: string[];
}

export interface UserPreferences {
  onePot: boolean;
  quickMeal: boolean;
  lessDishes: boolean;
  vegetarian: boolean;
}

export type FilterKey = 'onePot' | 'quickMeal' | 'lessDishes' | 'vegetarian';
