import type { Ingredient } from '@/types';

export const INGREDIENTS: Ingredient[] = [
  { id: 'v-tomato', name: '番茄', category: 'vegetable', emoji: '🍅', shelfLifeDays: 7, defaultUnit: 'piece', defaultQuantity: 2 },
  { id: 'v-potato', name: '土豆', category: 'vegetable', emoji: '🥔', shelfLifeDays: 30, defaultUnit: 'piece', defaultQuantity: 2 },
  { id: 'v-carrot', name: '胡萝卜', category: 'vegetable', emoji: '🥕', shelfLifeDays: 14, defaultUnit: 'piece', defaultQuantity: 2 },
  { id: 'v-cucumber', name: '黄瓜', category: 'vegetable', emoji: '🥒', shelfLifeDays: 5, defaultUnit: 'piece', defaultQuantity: 1 },
  { id: 'v-eggplant', name: '茄子', category: 'vegetable', emoji: '🍆', shelfLifeDays: 5, defaultUnit: 'piece', defaultQuantity: 1 },
  { id: 'v-pepper', name: '青椒', category: 'vegetable', emoji: '🫑', shelfLifeDays: 7, defaultUnit: 'piece', defaultQuantity: 2 },
  { id: 'v-cabbage', name: '白菜', category: 'vegetable', emoji: '🥬', shelfLifeDays: 10, defaultUnit: 'piece', defaultQuantity: 1 },
  { id: 'v-broccoli', name: '西兰花', category: 'vegetable', emoji: '🥦', shelfLifeDays: 5, defaultUnit: 'piece', defaultQuantity: 1 },
  { id: 'v-mushroom', name: '蘑菇', category: 'vegetable', emoji: '🍄', shelfLifeDays: 4, defaultUnit: 'gram', defaultQuantity: 200 },
  { id: 'v-corn', name: '玉米', category: 'vegetable', emoji: '🌽', shelfLifeDays: 7, defaultUnit: 'piece', defaultQuantity: 1 },
  { id: 'v-onion', name: '洋葱', category: 'vegetable', emoji: '🧅', shelfLifeDays: 30, defaultUnit: 'piece', defaultQuantity: 1 },
  { id: 'v-garlic', name: '大蒜', category: 'vegetable', emoji: '🧄', shelfLifeDays: 45, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'v-spinach', name: '菠菜', category: 'vegetable', emoji: '🥬', shelfLifeDays: 3, defaultUnit: 'gram', defaultQuantity: 250 },
  { id: 'v-lettuce', name: '生菜', category: 'vegetable', emoji: '🥗', shelfLifeDays: 3, defaultUnit: 'piece', defaultQuantity: 1 },
  { id: 'v-avocado', name: '牛油果', category: 'vegetable', emoji: '🥑', shelfLifeDays: 5, defaultUnit: 'piece', defaultQuantity: 1 },
  { id: 'v-chili', name: '辣椒', category: 'vegetable', emoji: '🌶️', shelfLifeDays: 10, defaultUnit: 'piece', defaultQuantity: 3 },
  { id: 'v-green-onion', name: '葱', category: 'vegetable', emoji: '🥬', shelfLifeDays: 5, defaultUnit: 'piece', defaultQuantity: 3 },
  { id: 'v-celery', name: '芹菜', category: 'vegetable', emoji: '🥬', shelfLifeDays: 7, defaultUnit: 'piece', defaultQuantity: 1 },
  { id: 'v-fungus', name: '木耳', category: 'vegetable', emoji: '🍄', shelfLifeDays: 180, defaultUnit: 'pack', defaultQuantity: 1 },

  { id: 'p-egg', name: '鸡蛋', category: 'protein', emoji: '🥚', shelfLifeDays: 30, defaultUnit: 'piece', defaultQuantity: 4 },
  { id: 'p-tofu', name: '豆腐', category: 'protein', emoji: '🍮', shelfLifeDays: 3, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'p-chicken', name: '鸡肉', category: 'protein', emoji: '🍗', shelfLifeDays: 2, defaultUnit: 'gram', defaultQuantity: 300 },
  { id: 'p-beef', name: '牛肉', category: 'protein', emoji: '🥩', shelfLifeDays: 2, defaultUnit: 'gram', defaultQuantity: 250 },
  { id: 'p-pork', name: '猪肉', category: 'protein', emoji: '🥓', shelfLifeDays: 2, defaultUnit: 'gram', defaultQuantity: 250 },
  { id: 'p-fish', name: '鱼肉', category: 'protein', emoji: '🐟', shelfLifeDays: 1, defaultUnit: 'gram', defaultQuantity: 300 },
  { id: 'p-shrimp', name: '虾仁', category: 'protein', emoji: '🦐', shelfLifeDays: 2, defaultUnit: 'gram', defaultQuantity: 200 },
  { id: 'p-sausage', name: '火腿肠', category: 'protein', emoji: '🌭', shelfLifeDays: 90, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'p-bacon', name: '培根', category: 'protein', emoji: '🥓', shelfLifeDays: 7, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'p-milk', name: '牛奶', category: 'protein', emoji: '🥛', shelfLifeDays: 7, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'p-cheese', name: '奶酪', category: 'protein', emoji: '🧀', shelfLifeDays: 180, defaultUnit: 'pack', defaultQuantity: 1 },

  { id: 's-rice', name: '米饭', category: 'staple', emoji: '🍚', shelfLifeDays: 2, defaultUnit: 'gram', defaultQuantity: 300 },
  { id: 's-noodle', name: '面条', category: 'staple', emoji: '🍜', shelfLifeDays: 180, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 's-bread', name: '面包', category: 'staple', emoji: '🍞', shelfLifeDays: 5, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 's-bun', name: '馒头', category: 'staple', emoji: '🍞', shelfLifeDays: 3, defaultUnit: 'piece', defaultQuantity: 2 },
  { id: 's-sweet-potato', name: '红薯', category: 'staple', emoji: '🍠', shelfLifeDays: 21, defaultUnit: 'piece', defaultQuantity: 2 },
  { id: 's-dumpling', name: '速冻饺子', category: 'staple', emoji: '🥟', shelfLifeDays: 180, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 's-instant-noodle', name: '方便面', category: 'staple', emoji: '🍜', shelfLifeDays: 180, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 's-oat', name: '燕麦', category: 'staple', emoji: '🥣', shelfLifeDays: 90, defaultUnit: 'pack', defaultQuantity: 1 },

  { id: 'se-salt', name: '盐', category: 'seasoning', emoji: '🧂', shelfLifeDays: 365, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-soy', name: '生抽', category: 'seasoning', emoji: '🧴', shelfLifeDays: 365, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-vinegar', name: '醋', category: 'seasoning', emoji: '🧴', shelfLifeDays: 365, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-oil', name: '食用油', category: 'seasoning', emoji: '🫙', shelfLifeDays: 365, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-sugar', name: '白糖', category: 'seasoning', emoji: '🍬', shelfLifeDays: 365, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-oyster', name: '蚝油', category: 'seasoning', emoji: '🧴', shelfLifeDays: 180, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-sauce', name: '豆瓣酱', category: 'seasoning', emoji: '🫙', shelfLifeDays: 180, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-pepper', name: '胡椒粉', category: 'seasoning', emoji: '🧂', shelfLifeDays: 365, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-sesame', name: '香油', category: 'seasoning', emoji: '🫙', shelfLifeDays: 180, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-starch', name: '淀粉', category: 'seasoning', emoji: '🧂', shelfLifeDays: 365, defaultUnit: 'pack', defaultQuantity: 1 },
  { id: 'se-ginger', name: '生姜', category: 'seasoning', emoji: '🫚', shelfLifeDays: 14, defaultUnit: 'piece', defaultQuantity: 1 },
];

export const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  vegetable: { label: '蔬菜', emoji: '🥬', color: 'from-green-400 to-emerald-500' },
  protein: { label: '蛋白质', emoji: '🍳', color: 'from-amber-400 to-orange-500' },
  staple: { label: '主食', emoji: '🍚', color: 'from-yellow-400 to-amber-500' },
  seasoning: { label: '调味料', emoji: '🧂', color: 'from-purple-400 to-pink-500' },
};

export const INGREDIENT_MAP: Record<string, Ingredient> = INGREDIENTS.reduce(
  (acc, ing) => ({ ...acc, [ing.id]: ing }),
  {}
);
