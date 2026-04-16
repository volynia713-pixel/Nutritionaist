const NutritionStage = {
  WATER_START: 'water_start',
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  WATER_SUPPORT: 'water_support',
  DAY_COMPLETE: 'day_complete'
};

const WATER_MEAL_NAME = 'Приём воды';
const LEGACY_WATER_NAMES = new Set(['Вода', 'Прием воды', 'Приём воды']);

const state = {
  selectedDate: getTodayDate(),
  mealFormDate: getTodayDate(),
  currentScreen: 'screen-home',
  addRows: [],
  currentCategory: resolveInitialCategory(),
  preselectedMealType: '',
  preselectedCategory: '',
  mealTimeTouched: false
};

const SUGGESTION_TOKEN_VARIANTS = {
  breakfast: {
    'омлет': ['Омлет'],
    'яичница': ['Яичница'],
    'творог': ['Творог 5%', 'Творог 0%', 'Творог 9%'],
    'каша': ['Овсяная каша', 'Пшённая каша', 'Гречка отварная'],
    'яйцо': ['Яйцо варёное'],
    'ягоды': ['Клубника', 'Черника', 'Малина', 'Смородина чёрная'],
    'фрукт': ['Яблоко', 'Банан', 'Груша', 'Киви'],
    'салат': ['Салат овощной', 'Огурец', 'Помидор', 'Перец болгарский'],
    'овощи': ['Огурец', 'Помидор', 'Перец болгарский', 'Салат овощной']
  },
  lunch: {
    'рыба': ['Треска запечённая', 'Лосось на гриле', 'Тунец в собственном соку'],
    'курица': ['Куриное филе', 'Куриное бедро'],
    'мясо': ['Куриное филе', 'Индейка запечённая', 'Котлеты домашние', 'Говядина тушёная'],
    'овощи': ['Огурец', 'Помидор', 'Перец болгарский', 'Салат овощной'],
    'салат': ['Салат овощной', 'Огурец', 'Помидор'],
    'суп': ['Борщ', 'Щи', 'Куриный суп', 'Суп гороховый', 'Уха'],
    'белок': ['Куриное филе', 'Куриное бедро', 'Индейка запечённая', 'Треска запечённая', 'Яйцо варёное'],
    'гарнир': ['Гречка отварная', 'Рис отварной', 'Картофель отварной', 'Булгур отварной', 'Чечевица отварная']
  },
  dinner: {
    'рыба': ['Треска запечённая', 'Лосось на гриле', 'Скумбрия запечённая'],
    'курица': ['Куриное филе', 'Куриное бедро'],
    'мясо': ['Куриное филе', 'Индейка запечённая', 'Котлеты домашние'],
    'овощи': ['Огурец', 'Помидор', 'Перец болгарский', 'Салат овощной', 'Капуста брокколи'],
    'салат': ['Салат овощной', 'Огурец', 'Помидор'],
    'суп': ['Щи', 'Куриный суп', 'Уха'],
    'белок': ['Куриное филе', 'Треска запечённая', 'Омлет', 'Творог 5%'],
    'гарнир': ['Гречка отварная', 'Рис отварной', 'Картофель отварной']
  },
  snack: {
    'ягоды': ['Клубника', 'Черника', 'Малина', 'Смородина чёрная'],
    'фрукт': ['Яблоко', 'Банан', 'Груша', 'Киви'],
    'орехи': ['Грецкий орех', 'Миндаль', 'Кешью'],
    'йогурт': ['Йогурт натуральный', 'Творог 5%']
  },
  water: {
    'вода': ['Вода']
  }
};

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function getCurrentTimeStr() {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function toDateInputValue(date) {
  if (!date) return getTodayDate();
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return String(date);
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return getTodayDate();
  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
}

function formatDate(dateStr) {
  const safeValue = toDateInputValue(dateStr);
  const [year, month, day] = safeValue.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function normalizePhrase(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/ё/g, 'е');
}

function normalizeSearchValue(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/ё/g, 'е');
}

function getAvatarText(name) {
  return name ? String(name).trim().charAt(0).toUpperCase() : '?';
}

function getUnitLabel(unit) {
  return unit === 'гр' ? 'г' : unit;
}

function getAmountBase(unit) {
  if (unit === 'шт') return 1;
  if (unit === 'мл') return 100;
  return 100;
}

function defaultAmountByUnit(unit) {
  if (unit === 'шт') return 1;
  if (unit === 'мл') return 250;
  return 100;
}

function inferGoalCalories(profile) {
  if (!profile) return 2000;
  const weight = Number(profile.weight) || 70;
  const height = Number(profile.height) || 170;
  const age = Number(profile.age) || 30;
  const genderShift = profile.gender === 'male' ? 5 : -161;
  const bmr = Math.max(1200, 10 * weight + 6.25 * height - 5 * age + genderShift);
  let target = bmr * 1.35;
  if (profile.goal === 'lose') target -= 300;
  if (profile.goal === 'gain') target += 250;
  return Math.round(target);
}

function getWaterTarget(profile) {
  const weight = Number(profile?.weight) || 70;
  let multiplier = 30;
  if (profile?.goal === 'lose') multiplier = 33;
  if (profile?.goal === 'gain') multiplier = 28;
  return Math.max(1600, Math.round(weight * multiplier));
}

function resolveInitialCategory() {
  const categories = getCategories();
  if (categories.includes('Яйца и молочные продукты')) return 'Яйца и молочные продукты';
  if (categories.includes('Каши, крупы и гарниры')) return 'Каши, крупы и гарниры';
  return categories[0] || '';
}

function ensureValidCurrentCategory() {
  const categories = getCategories();
  if (!categories.length) {
    state.currentCategory = '';
    return '';
  }
  if (!categories.includes(state.currentCategory)) {
    state.currentCategory = categories[0];
  }
  return state.currentCategory;
}

function ensureMealTypeOptions() {
  const select = document.getElementById('meal-type');
  if (!select) return;
  const hasWaterOption = Array.from(select.options).some(option => option.value === WATER_MEAL_NAME);
  if (!hasWaterOption) {
    const option = document.createElement('option');
    option.value = WATER_MEAL_NAME;
    option.textContent = WATER_MEAL_NAME;
    select.appendChild(option);
  }
}

function normalizeMealTypeValue(value) {
  const raw = String(value || '').trim();
  if (LEGACY_WATER_NAMES.has(raw)) return WATER_MEAL_NAME;
  return raw || 'Приём пищи';
}

function normalizeMealTypeForBuilder(rawMealType) {
  const value = String(rawMealType || '').trim();
  if (LEGACY_WATER_NAMES.has(value)) return 'Вода';
  if (value === 'Завтрак' || value === 'Обед' || value === 'Ужин' || value === 'Перекус') return value;
  return 'Завтрак';
}

function getSafeMealTypeValue() {
  const mealTypeInput = document.getElementById('meal-type');
  const rawValue = String(mealTypeInput?.value || '').trim();
  if (!rawValue) return 'Завтрак';
  if (rawValue === 'Вода' || rawValue === 'Прием воды') return WATER_MEAL_NAME;
  return rawValue;
}

function isWaterProduct(product) {
  if (!product) return false;
  const name = String(product.name || '').trim().toLowerCase();
  const tags = Array.isArray(product.tags) ? product.tags : [];
  return name === 'вода' || tags.includes('water');
}

function isWaterMeal(meal) {
  if (!meal || !Array.isArray(meal.products) || !meal.products.length) return false;
  return meal.products.every(isWaterProduct);
}

function normalizeMealDisplayName(meal) {
  const rawName = String(meal?.name || '').trim();
  if (LEGACY_WATER_NAMES.has(rawName)) return WATER_MEAL_NAME;
  if ((rawName === 'Приём пищи' || rawName === 'Прием пищи') && isWaterMeal(meal)) return WATER_MEAL_NAME;
  return rawName || 'Приём пищи';
}

function getMealSignature(meal) {
  const safeProducts = Array.isArray(meal?.products)
    ? meal.products.map(product => ({
        name: String(product.name || '').trim(),
        amount: Number(product.amount) || 0,
        unit: String(product.unit || '').trim(),
        tags: Array.isArray(product.tags) ? [...product.tags].sort() : []
      }))
    : [];
  return JSON.stringify({
    time: String(meal?.time || '').trim(),
    name: normalizeMealDisplayName(meal),
    comment: String(meal?.comment || '').trim(),
    calories: Number(meal?.calories) || 0,
    protein: Number(meal?.protein) || 0,
    fats: Number(meal?.fats) || 0,
    carbs: Number(meal?.carbs) || 0,
    products: safeProducts
  });
}

function getExactOrClosestProductName(searchValue, category) {
  const normalizedQuery = normalizeSearchValue(searchValue);
  if (!normalizedQuery) return '';
  const allowedProducts = getCategoryProducts(category);
  const exactMatch = allowedProducts.find(name => normalizeSearchValue(name) === normalizedQuery);
  if (exactMatch) return exactMatch;
  const startsWithMatch = allowedProducts.find(name => normalizeSearchValue(name).startsWith(normalizedQuery));
  if (startsWithMatch) return startsWithMatch;
  return allowedProducts.find(name => normalizeSearchValue(name).includes(normalizedQuery)) || '';
}

function getMealOrder(name) {
  const normalized = normalizeMealTypeValue(name);
  return ({
    [WATER_MEAL_NAME]: 0,
    'Завтрак': 1,
    'Обед': 2,
    'Ужин': 3,
    'Перекус': 4
  })[normalized] || 99;
}

function getSortedMeals(date) {
  return [...Storage.getMealsByDate(date)].sort((a, b) => {
    const aTime = String(a?.time || '').trim();
    const bTime = String(b?.time || '').trim();
    if (aTime && bTime && aTime !== bTime) {
      return aTime.localeCompare(bTime);
    }
    return getMealOrder(normalizeMealDisplayName(a)) - getMealOrder(normalizeMealDisplayName(b));
  });
}

function computeRowNutrition(row) {
  const product = getProduct(row.productName);
  if (!product) return null;
  const amount = Number(row.amount) || 0;
  const ratio = amount / getAmountBase(product.unit);
  return {
    calories: product.calories * ratio,
    protein: product.protein * ratio,
    fats: product.fats * ratio,
    carbs: product.carbs * ratio,
    amount,
    unit: product.unit,
    category: product.category,
    tags: product.tags || [],
    name: row.productName
  };
}

function createRowId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyRow(defaultProduct = '', category = state.currentCategory) {
  const product = getProduct(defaultProduct);
  return {
    id: createRowId(),
    productName: defaultProduct,
    amount: product ? defaultAmountByUnit(product.unit) : '',
    unit: product?.unit || 'гр',
    category: product?.category || category || ensureValidCurrentCategory()
  };
}

function resetMealFormInputs({ keepDate = true } = {}) {
  const mealDateInput = document.getElementById('meal-date');
  const mealTimeInput = document.getElementById('meal-time');
  const mealTypeInput = document.getElementById('meal-type');
  const commentInput = document.getElementById('meal-comment');
  const searchInput = document.getElementById('product-search');
  if (mealDateInput && !keepDate) mealDateInput.value = getTodayDate();
  if (mealTimeInput) {
    const now = new Date();
    mealTimeInput.value = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  }
  if (mealTypeInput) mealTypeInput.value = 'Завтрак';
  if (commentInput) commentInput.value = '';
  if (searchInput) searchInput.value = '';
  state.mealTimeTouched = false;
  updateMealTimeReminder();
  updateMealDetailsStatus();
  updateSaveTimeHint();
}

function syncCategoryControls() {
  const category = ensureValidCurrentCategory();
  const categorySelect = document.getElementById('product-category');
  if (categorySelect) categorySelect.value = category;
  renderCategoryFilterChips();
  fillProductsDataList(category);
}


function hasMeaningfulMealTypeSelected() {
  const mealTypeInput = document.getElementById('meal-type');
  return Boolean(String(mealTypeInput?.value || '').trim());
}

function getMealTimeValue() {
  const mealTimeInput = document.getElementById('meal-time');
  return String(mealTimeInput?.value || '').trim();
}

function updateMealDetailsStatus() {
  const status = document.getElementById('meal-details-status');
  if (!status) return;

  const time = getMealTimeValue();
  if (state.mealTimeTouched && time) {
    status.textContent = `Время: ${time}`;
    return;
  }

  status.textContent = hasMeaningfulMealTypeSelected()
    ? 'Время не указано'
    : 'Дата, время, комментарий';
}

function updateMealTimeReminder() {
  const wrap = document.getElementById('meal-time-reminder');
  const title = document.getElementById('meal-time-reminder-title');
  const text = document.getElementById('meal-time-reminder-text');
  const button = document.getElementById('open-meal-details-btn');
  if (!wrap || !title || !text || !button) return;

  if (!hasMeaningfulMealTypeSelected()) {
    wrap.style.display = 'none';
    return;
  }

  const time = getMealTimeValue();
  wrap.style.display = 'block';

  if (state.mealTimeTouched && time) {
    title.textContent = `Время: ${time}`;
    text.textContent = 'Оно попадёт в дневник и поможет выстроить записи по порядку.';
    button.textContent = 'Изменить';
    return;
  }

  title.textContent = 'Укажи время приёма';
  text.textContent = 'Оно попадёт в дневник и поможет выстроить день по порядку.';
  button.textContent = 'Открыть детали';
}

function updateSaveTimeHint() {
  const hint = document.getElementById('save-time-hint');
  if (!hint) return;

  const hasProducts = Array.isArray(state.addRows) && state.addRows.some(row => getProduct(row.productName) && Number(row.amount) > 0);
  const mealType = getSafeMealTypeValue();
  const hasDraftContent = hasProducts || mealType === WATER_MEAL_NAME;
  const time = getMealTimeValue();
  const shouldShow = hasDraftContent && (!state.mealTimeTouched || !time);

  hint.style.display = shouldShow ? 'block' : 'none';
}

function setMealDetailsExpanded(expanded) {
  const content = document.getElementById('meal-details-content');
  const toggle = document.getElementById('meal-details-toggle');
  const icon = document.getElementById('meal-details-toggle-icon');
  if (!content || !toggle || !icon) return;

  content.style.display = expanded ? 'block' : 'none';
  toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  icon.textContent = expanded ? '⌃' : '⌄';
}

function getDraftRowsNutrition() {
  const rows = Array.isArray(state.addRows) ? state.addRows : [];
  return rows.reduce((acc, row) => {
    if (!getProduct(row.productName) || Number(row.amount) <= 0) return acc;
    const nutrition = computeRowNutrition(row);
    if (!nutrition) return acc;
    acc.calories += Number(nutrition.calories) || 0;
    acc.protein += Number(nutrition.protein) || 0;
    acc.fats += Number(nutrition.fats) || 0;
    acc.carbs += Number(nutrition.carbs) || 0;
    acc.productsCount += 1;
    return acc;
  }, {
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    productsCount: 0
  });
}

function getSavedDayNutrition(dateStr) {
  const safeDate = toDateInputValue(dateStr || state.mealFormDate || state.selectedDate || getTodayDate());
  const stats = Storage.getDayStats(safeDate);
  const meals = Storage.getMealsByDate(safeDate);
  return {
    calories: Number(stats.calories) || 0,
    protein: Number(stats.protein) || 0,
    fats: Number(stats.fats) || 0,
    carbs: Number(stats.carbs) || 0,
    mealsCount: Array.isArray(meals) ? meals.length : 0
  };
}

function getDraftMealTotals() {
  const draft = getDraftRowsNutrition();
  return {
    calories: Math.round(draft.calories),
    protein: round1(draft.protein),
    fats: round1(draft.fats),
    carbs: round1(draft.carbs),
    productsCount: draft.productsCount
  };
}

function countMealsWithTag(meals, tag) {
  return meals.filter(meal => (meal.products || []).some(product => (product.tags || []).includes(tag))).length;
}

function sumAmountByTag(products, tag, allowedUnits = []) {
  return products.reduce((sum, product) => {
    const tags = product.tags || [];
    if (!tags.includes(tag)) return sum;
    if (allowedUnits.length && !allowedUnits.includes(product.unit)) return sum;
    return sum + (Number(product.amount) || 0);
  }, 0);
}

function getMealTags(meal) {
  return Array.from(new Set((meal?.products || []).flatMap(product => product.tags || getProductTags(product.name))));
}

function getGoalMealProfile(goal, mealType) {
  const safeGoal = goal || 'maintain';
  const profiles = {
    lose: {
      breakfast: { density: 'light', proteinRequired: true, vegetablesPreferred: true, baseRequired: false, baseModerate: true, avoidHeavyRepeat: true, breadOptional: false, extraEnergyPreferred: false },
      lunch: { density: 'medium', proteinRequired: true, vegetablesPreferred: true, baseRequired: false, baseModerate: true, avoidHeavyRepeat: true, breadOptional: false, extraEnergyPreferred: false },
      dinner: { density: 'light', proteinRequired: true, vegetablesPreferred: true, baseRequired: false, baseModerate: false, avoidHeavyRepeat: true, breadOptional: false, extraEnergyPreferred: false }
    },
    maintain: {
      breakfast: { density: 'medium', proteinRequired: true, vegetablesPreferred: true, baseRequired: true, baseModerate: false, avoidHeavyRepeat: false, breadOptional: true, extraEnergyPreferred: false },
      lunch: { density: 'medium', proteinRequired: true, vegetablesPreferred: true, baseRequired: false, baseModerate: false, avoidHeavyRepeat: false, breadOptional: true, extraEnergyPreferred: false },
      dinner: { density: 'medium', proteinRequired: true, vegetablesPreferred: true, baseRequired: false, baseModerate: true, avoidHeavyRepeat: true, breadOptional: true, extraEnergyPreferred: false }
    },
    gain: {
      breakfast: { density: 'dense', proteinRequired: true, vegetablesPreferred: false, baseRequired: true, baseModerate: false, avoidHeavyRepeat: false, breadOptional: true, extraEnergyPreferred: true },
      lunch: { density: 'dense', proteinRequired: true, vegetablesPreferred: true, baseRequired: true, baseModerate: false, avoidHeavyRepeat: false, breadOptional: true, extraEnergyPreferred: true },
      dinner: { density: 'medium_dense', proteinRequired: true, vegetablesPreferred: true, baseRequired: true, baseModerate: true, avoidHeavyRepeat: true, breadOptional: true, extraEnergyPreferred: true }
    }
  };
  const goalMap = profiles[safeGoal] || profiles.maintain;
  const key = mealType === 'Завтрак' ? 'breakfast' : mealType === 'Обед' ? 'lunch' : 'dinner';
  return goalMap[key];
}

function getStageCategories(stage) {
  const stageMap = {
    [NutritionStage.WATER_START]: ['Напитки'],
    [NutritionStage.WATER_SUPPORT]: ['Напитки'],
    [NutritionStage.BREAKFAST]: ['Яйца и молочные продукты', 'Каши, крупы и гарниры', 'Овощи и салаты', 'Фрукты и ягоды', 'Тесто, выпечка и десерты', 'Напитки'],
    [NutritionStage.LUNCH]: ['Птица и мясо', 'Рыба и морепродукты', 'Супы и первые блюда', 'Овощи и салаты', 'Каши, крупы и гарниры', 'Холодные блюда и закуски'],
    [NutritionStage.DINNER]: ['Рыба и морепродукты', 'Птица и мясо', 'Яйца и молочные продукты', 'Овощи и салаты', 'Супы и первые блюда']
  };
  return (stageMap[stage] || []).filter(category => getCategories().includes(category));
}

function getStageExamples(stage, profile) {
  if (stage === NutritionStage.WATER_START || stage === NutritionStage.WATER_SUPPORT) {
    return ['Вода 250–300 мл'];
  }
  if (stage === NutritionStage.BREAKFAST) {
    if (profile?.goal === 'lose') return ['Омлет + овощи', 'Яичница + салат', 'Творог + ягоды', 'Каша + яйцо'];
    if (profile?.goal === 'gain') return ['Омлет + каша', 'Яичница + хлеб + салат', 'Творог + фрукт + каша'];
    return ['Омлет + овощи', 'Яичница + салат', 'Творог + ягоды', 'Каша + яйцо'];
  }
  if (stage === NutritionStage.LUNCH) {
    if (profile?.goal === 'lose') return ['Курица + салат', 'Рыба + овощи', 'Суп + белок', 'Котлеты + овощи'];
    if (profile?.goal === 'gain') return ['Курица + гречка + салат', 'Рыба + рис + овощи', 'Суп + хлеб + белок', 'Котлеты + картофель + салат'];
    return ['Курица + гречка + салат', 'Рыба + рис + овощи', 'Суп + белок', 'Котлеты + гарнир + овощи'];
  }
  if (stage === NutritionStage.DINNER) {
    if (profile?.goal === 'lose') return ['Рыба + овощи', 'Омлет + салат', 'Курица + овощи', 'Суп + белок'];
    if (profile?.goal === 'gain') return ['Рыба + гарнир + овощи', 'Курица + картофель + салат', 'Омлет + хлеб + овощи', 'Суп + хлеб + белок'];
    return ['Рыба + овощи', 'Омлет + салат', 'Курица + овощи', 'Суп + белок'];
  }
  return [];
}

function getGoalText(goal, positiveText, neutralText, gainText) {
  if (goal === 'lose') return positiveText;
  if (goal === 'gain') return gainText;
  return neutralText;
}

function evaluateMealByType(mealType, meal, goalProfile) {
  const profile = Storage.getProfile();
  const goal = profile?.goal || 'maintain';

  if (!meal) {
    return {
      mealType,
      isBalanced: false,
      hasProtein: false,
      hasVegetables: false,
      hasBase: false,
      hasWater: false,
      hasSoup: false,
      isHeavy: false,
      nextAction: mealType === 'Завтрак' ? 'build_breakfast' : mealType === 'Обед' ? 'build_lunch' : 'build_dinner',
      categories: getStageCategories(mealType === 'Завтрак' ? NutritionStage.BREAKFAST : mealType === 'Обед' ? NutritionStage.LUNCH : NutritionStage.DINNER),
      examples: getStageExamples(mealType === 'Завтрак' ? NutritionStage.BREAKFAST : mealType === 'Обед' ? NutritionStage.LUNCH : NutritionStage.DINNER, profile),
      message: ''
    };
  }

  const tags = getMealTags(meal);
  const hasProtein = tags.includes('protein');
  const hasVegetables = tags.includes('vegetable') || tags.includes('veg');
  const hasBase = tags.includes('grain') || tags.includes('garnish') || tags.includes('fruit') || tags.includes('berry') || tags.includes('bread');
  const hasWater = tags.includes('water') || tags.includes('drink');
  const hasSoup = tags.includes('soup');
  const isHeavy = tags.includes('heavy') || tags.includes('fried');

  const result = { mealType, isBalanced: false, hasProtein, hasVegetables, hasBase, hasWater, hasSoup, isHeavy, nextAction: '', categories: [], examples: [], message: '' };

  if (mealType === 'Завтрак') {
    if (!hasProtein) {
      result.nextAction = 'add_protein';
      result.categories = ['Яйца и молочные продукты'].filter(category => getCategories().includes(category));
      result.examples = goal === 'gain' ? ['Омлет', 'Яичница', 'Творог 5%', 'Яйцо варёное'] : ['Яичница', 'Омлет', 'Творог 5%', 'Яйцо варёное'];
      result.message = getGoalText(goal, 'Для твоей цели завтрак лучше сделать сытным, но не тяжёлым. Начни с белковой опоры.', 'Для полноценного завтрака нужна белковая опора.', 'Для твоей цели завтрак пока слишком лёгкий. Добавь белковую опору.');
      return result;
    }
    if (goalProfile.baseRequired && !hasBase && !hasVegetables) {
      result.nextAction = 'add_breakfast_support';
      result.categories = ['Каши, крупы и гарниры', 'Фрукты и ягоды', 'Овощи и салаты'].filter(category => getCategories().includes(category));
      result.examples = goal === 'gain' ? ['Овсяная каша', 'Хлеб чёрный', 'Банан', 'Салат овощной'] : ['Овсяная каша', 'Яблоко', 'Салат овощной', 'Ягоды'];
      result.message = goal === 'gain' ? 'Белковая база уже есть, теперь к завтраку нужна более плотная основа.' : 'Белковая база уже есть. Теперь хорошо бы добавить лёгкое дополнение: кашу, овощи, фрукт или ягоды.';
      return result;
    }
    if (!goalProfile.baseRequired && !hasBase && !hasVegetables && goal !== 'lose') {
      result.nextAction = 'add_breakfast_support';
      result.categories = ['Каши, крупы и гарниры', 'Овощи и салаты', 'Фрукты и ягоды'].filter(category => getCategories().includes(category));
      result.examples = ['Овсяная каша', 'Салат овощной', 'Яблоко', 'Ягоды'];
      result.message = 'Белковая база уже есть. Чтобы завтрак был более собранным, добавь основу или лёгкое дополнение.';
      return result;
    }
    if (goal === 'lose' && hasProtein && (hasVegetables || hasBase)) {
      result.isBalanced = true;
      result.nextAction = 'breakfast_balanced';
      result.categories = ['Напитки'].filter(category => getCategories().includes(category));
      result.examples = ['Вода 250 мл'];
      result.message = 'Для твоей цели это уже хороший завтрак. Можно не утяжелять его лишним хлебом или второй плотной базой.';
      return result;
    }
    if (goal === 'gain' && hasProtein && hasBase) {
      result.isBalanced = true;
      result.nextAction = 'breakfast_balanced';
      result.categories = ['Напитки'].filter(category => getCategories().includes(category));
      result.examples = ['Вода 250 мл'];
      result.message = 'Для твоей цели завтрак уже выглядит достаточно плотным и собранным.';
      return result;
    }
    if (hasProtein && (hasBase || hasVegetables)) {
      result.isBalanced = true;
      result.nextAction = 'breakfast_balanced';
      result.categories = ['Напитки'].filter(category => getCategories().includes(category));
      result.examples = ['Вода 250 мл'];
      result.message = 'Завтрак уже выглядит собранно и даёт хорошую базу на первую половину дня.';
      return result;
    }
  }

  if (mealType === 'Обед') {
    if (!hasProtein) {
      result.nextAction = 'add_protein';
      result.categories = ['Птица и мясо', 'Рыба и морепродукты', 'Яйца и молочные продукты'].filter(category => getCategories().includes(category));
      result.examples = ['Куриное филе', 'Треска запечённая', 'Котлеты домашние', 'Яйцо варёное'];
      result.message = getGoalText(goal, 'Для твоей цели обед лучше собирать на белковой базе.', 'Для полноценного обеда нужна основная белковая опора.', 'Для твоей цели обед не должен быть слишком лёгким. Добавь белковую основу.');
      return result;
    }
    if (!hasVegetables && !hasSoup) {
      result.nextAction = 'add_vegetables_or_soup';
      result.categories = ['Овощи и салаты', 'Супы и первые блюда'].filter(category => getCategories().includes(category));
      result.examples = ['Салат овощной', 'Огурец', 'Помидор', 'Борщ', 'Щи'];
      result.message = getGoalText(goal, 'Белок уже есть. Теперь к обеду лучше добавить овощи или суп.', 'Белок уже есть. Теперь хорошо бы добавить овощной акцент или суп.', 'Белок уже есть. Теперь к нему нужен более собранный каркас: овощи, суп и основа.');
      return result;
    }
    if (goalProfile.baseRequired && !hasBase && !hasSoup) {
      result.nextAction = 'add_base';
      result.categories = ['Каши, крупы и гарниры'].filter(category => getCategories().includes(category));
      result.examples = ['Гречка отварная', 'Рис отварной', 'Картофель отварной'];
      result.message = 'Для твоей цели этот обед пока лёгкий. К белку и овощам стоит добавить основную базу.';
      return result;
    }
    result.isBalanced = true;
    result.nextAction = 'lunch_balanced';
    result.categories = ['Напитки'].filter(category => getCategories().includes(category));
    result.examples = ['Вода 250 мл'];
    result.message = getGoalText(goal, 'Для твоей цели обед уже собран хорошо.', 'Обед уже выглядит полноценным и собранным.', 'Для твоей цели это уже достойный опорный обед.');
    return result;
  }

  if (mealType === 'Ужин') {
    if (!hasProtein) {
      result.nextAction = 'add_protein';
      result.categories = ['Рыба и морепродукты', 'Птица и мясо', 'Яйца и молочные продукты'].filter(category => getCategories().includes(category));
      result.examples = ['Треска запечённая', 'Куриное филе', 'Омлет', 'Творог 5%'];
      result.message = getGoalText(goal, 'Для твоей цели ужин лучше не собирать только на гарнире. Нужна белковая база.', 'Для ужина нужна белковая опора.', 'Для твоей цели ужин пока слишком лёгкий. Добавь белковую основу.');
      return result;
    }
    if (!hasVegetables && !hasSoup) {
      result.nextAction = 'add_vegetables';
      result.categories = ['Овощи и салаты', 'Супы и первые блюда'].filter(category => getCategories().includes(category));
      result.examples = ['Салат овощной', 'Огурец', 'Помидор', 'Щи'];
      result.message = getGoalText(goal, 'Белковая база уже есть. Теперь ужин лучше сделать легче через овощи или суп.', 'Белок уже есть. Теперь к ужину хорошо бы добавить овощной акцент.', 'Белковая база уже есть. Теперь добавь овощи или суп.');
      return result;
    }
    if (goalProfile.baseRequired && !hasBase && !hasSoup && goal === 'gain') {
      result.nextAction = 'add_base';
      result.categories = ['Каши, крупы и гарниры'].filter(category => getCategories().includes(category));
      result.examples = ['Гречка отварная', 'Рис отварной', 'Картофель отварной'];
      result.message = 'Для твоей цели этот ужин пока лёгкий. Можно добавить умеренную основу.';
      return result;
    }
    if (goalProfile.avoidHeavyRepeat && isHeavy && !hasVegetables) {
      result.nextAction = 'lighten_dinner';
      result.categories = ['Овощи и салаты', 'Напитки'].filter(category => getCategories().includes(category));
      result.examples = ['Салат овощной', 'Вода'];
      result.message = 'Этот ужин лучше облегчить и не утяжелять второй плотной добавкой.';
      return result;
    }
    result.isBalanced = true;
    result.nextAction = 'dinner_balanced';
    result.categories = ['Напитки'].filter(category => getCategories().includes(category));
    result.examples = ['Вода 250 мл'];
    result.message = getGoalText(goal, 'Для твоей цели это уже хороший ужин.', 'Ужин уже выглядит собранно.', 'Для твоей цели ужин уже выглядит собранно.');
    return result;
  }

  return result;
}

function evaluateWaterTrack(todayAnalysis) {
  const waterStartDone = todayAnalysis.waterMl >= 200;
  const needsWaterNow = todayAnalysis.waterMl < todayAnalysis.waterTarget * 0.45;
  if (!waterStartDone) {
    return {
      waterStartDone,
      needsWaterNow: true,
      waterStatus: 'start',
      title: 'Начни день со стакана воды',
      text: 'Первый акцент дня — вода. Это помогает мягко войти в ритм.',
      action: 'add_water',
      categories: ['Напитки'].filter(category => getCategories().includes(category)),
      examples: ['Вода 250–300 мл']
    };
  }
  if (needsWaterNow) {
    return {
      waterStartDone,
      needsWaterNow,
      waterStatus: 'low',
      title: 'По воде день пока проседает',
      text: `Сейчас отмечено около ${todayAnalysis.waterMl} мл воды. Хорошо бы спокойно добрать воду.`,
      action: 'add_water',
      categories: ['Напитки'].filter(category => getCategories().includes(category)),
      examples: ['Вода 250–300 мл']
    };
  }
  return {
    waterStartDone,
    needsWaterNow: false,
    waterStatus: 'ok',
    title: 'По воде день идёт нормально',
    text: 'Вода уже встроена в день. Дальше просто удерживай этот ритм.',
    action: 'keep_water',
    categories: ['Напитки'].filter(category => getCategories().includes(category)),
    examples: ['Вода рядом с приёмами пищи']
  };
}

function getCurrentNutritionStage(todayAnalysis) {
  if (!todayAnalysis.waterStartDone) return NutritionStage.WATER_START;
  if (!todayAnalysis.breakfastBalanced) return NutritionStage.BREAKFAST;
  if (!todayAnalysis.lunchBalanced) return NutritionStage.LUNCH;
  if (!todayAnalysis.dinnerBalanced) return NutritionStage.DINNER;
  if (todayAnalysis.waterMl < todayAnalysis.waterTarget * 0.7) return NutritionStage.WATER_SUPPORT;
  return NutritionStage.DAY_COMPLETE;
}

function buildTip(label, title, text, score = 1, type = 'today', extra = {}) {
  return { label, title, text, score, type, ...extra };
}

function buildStageTip(stage, profile, todayAnalysis) {
  const waterTrack = evaluateWaterTrack(todayAnalysis);
  if (stage === NutritionStage.WATER_START) {
    return buildTip('сейчас в фокусе', waterTrack.title, waterTrack.text, 99, 'today', {
      stage, action: waterTrack.action, categories: waterTrack.categories, examples: waterTrack.examples, cta: 'Добавить воду', mealType: 'Вода', defaultCategory: 'Напитки'
    });
  }
  if (stage === NutritionStage.BREAKFAST) {
    if (!todayAnalysis.breakfastMeal) {
      return buildTip('сейчас в фокусе', 'Собери завтрак', getGoalText(profile?.goal, 'Для твоей цели завтрак лучше собрать сытно.', 'Для завтрака лучше включить белковую основу.', 'Для твоей цели завтрак не должен быть пустым.'), 98, 'today', {
        stage, action: 'build_breakfast', categories: getStageCategories(stage), examples: getStageExamples(stage, profile), cta: 'Собрать завтрак', mealType: 'Завтрак', defaultCategory: 'Яйца и молочные продукты'
      });
    }
    const evaluation = evaluateMealByType('Завтрак', todayAnalysis.breakfastMeal, getGoalMealProfile(profile?.goal, 'Завтрак'));
    return buildTip('сейчас в фокусе', evaluation.isBalanced ? 'Завтрак выглядит сбалансированно' : 'Дособери завтрак', evaluation.message, 96, 'today', {
      stage, action: evaluation.nextAction, categories: evaluation.categories, examples: evaluation.examples, cta: evaluation.isBalanced ? 'Собрать обед' : 'Дособрать завтрак', mealType: evaluation.isBalanced ? 'Обед' : 'Завтрак', defaultCategory: evaluation.isBalanced ? 'Супы и первые блюда' : evaluation.categories[0] || 'Яйца и молочные продукты'
    });
  }
  if (stage === NutritionStage.LUNCH) {
    if (!todayAnalysis.lunchMeal) {
      return buildTip('сейчас в фокусе', 'Собери обед', getGoalText(profile?.goal, 'Для твоей цели обед лучше собирать плотно.', 'На обед лучше взять основной белок, овощи или суп.', 'Для твоей цели обед должен быть опорным.'), 97, 'today', {
        stage, action: 'build_lunch', categories: getStageCategories(stage), examples: getStageExamples(stage, profile), cta: 'Собрать обед', mealType: 'Обед', defaultCategory: 'Супы и первые блюда'
      });
    }
    const evaluation = evaluateMealByType('Обед', todayAnalysis.lunchMeal, getGoalMealProfile(profile?.goal, 'Обед'));
    return buildTip('сейчас в фокусе', evaluation.isBalanced ? 'Обед выглядит собранно' : 'Дособери обед', evaluation.message, 95, 'today', {
      stage, action: evaluation.nextAction, categories: evaluation.categories, examples: evaluation.examples, cta: evaluation.isBalanced ? 'Собрать ужин' : 'Дособрать обед', mealType: evaluation.isBalanced ? 'Ужин' : 'Обед', defaultCategory: evaluation.isBalanced ? 'Рыба и морепродукты' : evaluation.categories[0] || 'Птица и мясо'
    });
  }
  if (stage === NutritionStage.DINNER) {
    if (!todayAnalysis.dinnerMeal) {
      return buildTip('сейчас в фокусе', 'Собери ужин', getGoalText(profile?.goal, 'Для твоей цели ужин лучше сделать легче.', 'На ужин лучше сделать акцент на белке и овощах.', 'Для твоей цели ужин не должен быть слишком лёгким.'), 96, 'today', {
        stage, action: 'build_dinner', categories: getStageCategories(stage), examples: getStageExamples(stage, profile), cta: 'Собрать ужин', mealType: 'Ужин', defaultCategory: 'Рыба и морепродукты'
      });
    }
    const evaluation = evaluateMealByType('Ужин', todayAnalysis.dinnerMeal, getGoalMealProfile(profile?.goal, 'Ужин'));
    return buildTip('сейчас в фокусе', evaluation.isBalanced ? 'Ужин выглядит сбалансированно' : 'Дособери ужин', evaluation.message, 94, 'today', {
      stage, action: evaluation.nextAction, categories: evaluation.categories, examples: evaluation.examples, cta: evaluation.isBalanced ? 'Добавить воду' : 'Дособрать ужин', mealType: evaluation.isBalanced ? 'Вода' : 'Ужин', defaultCategory: evaluation.isBalanced ? 'Напитки' : evaluation.categories[0] || 'Овощи и салаты'
    });
  }
  if (stage === NutritionStage.WATER_SUPPORT) {
    return buildTip('сейчас в фокусе', waterTrack.title, waterTrack.text, 90, 'today', {
      stage, action: waterTrack.action, categories: waterTrack.categories, examples: waterTrack.examples, cta: 'Добавить воду', mealType: 'Вода', defaultCategory: 'Напитки'
    });
  }
  return buildTip('сейчас в фокусе', 'Основные этапы дня уже закрыты', getGoalText(profile?.goal, 'Основные этапы дня уже закрыты.', 'Завтрак, обед и ужин выглядят собранно.', 'Основные этапы дня уже собраны.'), 70, 'today', {
    stage, action: 'day_complete', categories: ['Напитки', 'Овощи и салаты'].filter(category => getCategories().includes(category)), examples: ['Вода', 'Лёгкий овощной акцент']
  });
}

function getSuggestionMealContext() {
  const rawMealType = String(document.getElementById('meal-type')?.value || '').trim();
  if (rawMealType === 'Обед') return 'lunch';
  if (rawMealType === 'Ужин') return 'dinner';
  if (rawMealType === 'Перекус') return 'snack';
  if (LEGACY_WATER_NAMES.has(rawMealType)) return 'water';
  return 'breakfast';
}

function uniqueProducts(list) {
  const seen = new Set();
  return list.filter(name => {
    const key = String(name || '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueExistingProducts(names) {
  const seen = new Set();
  const result = [];
  names.forEach(name => {
    const product = getProduct(name);
    const resolvedName = product?.name || '';
    if (!resolvedName || seen.has(resolvedName)) return;
    seen.add(resolvedName);
    result.push(resolvedName);
  });
  return result;
}

function firstExistingProduct(candidates = []) {
  for (const name of candidates) {
    const product = getProduct(name);
    if (product?.name) return product.name;
  }
  return '';
}

function getProductsByCategoryKeywords(keywords) {
  const normalizedKeywords = keywords.map(keyword => normalizePhrase(keyword));
  const matches = [];
  getCategories().forEach(category => {
    const categoryName = normalizePhrase(category);
    const categoryMatched = normalizedKeywords.some(keyword => categoryName.includes(keyword));
    if (!categoryMatched) return;
    getCategoryProducts(category).forEach(name => matches.push(name));
  });
  return uniqueExistingProducts(matches);
}

function resolveGenericSuggestionToken(token, mealType = '') {
  const normalizedToken = normalizePhrase(token);
  const normalizedMealType = normalizePhrase(mealType);
  if (!normalizedToken) return [];

  if (normalizedToken === 'овощи' || normalizedToken === 'салат') {
    return uniqueProducts(['Огурец', 'Помидор', 'Салат овощной', 'Капуста'].map(name => firstExistingProduct([name])).filter(Boolean));
  }
  if (normalizedToken === 'ягоды') return uniqueProducts(['Клубника', 'Черника', 'Малина', 'Смородина чёрная'].map(name => firstExistingProduct([name])).filter(Boolean));
  if (normalizedToken === 'фрукт') return uniqueProducts(['Яблоко', 'Банан'].map(name => firstExistingProduct([name])).filter(Boolean));
  if (normalizedToken === 'каша') return uniqueProducts(['Овсяная каша'].map(name => firstExistingProduct([name])).filter(Boolean));
  if (normalizedToken === 'хлеб') return uniqueProducts(['Хлеб белый', 'Хлеб чёрный', 'Хлеб бородинский', 'Хлеб цельнозерновой'].map(name => firstExistingProduct([name])).filter(Boolean));
  if (normalizedToken === 'гарнир' || normalizedToken === 'гарниры') {
    return uniqueProducts(['Гречка отварная', 'Рис отварной', 'Картофель отварной', 'Булгур отварной'].map(name => firstExistingProduct([name])).filter(Boolean));
  }
  if (normalizedToken === 'белковая опора' || normalizedToken === 'белок') {
    if (normalizedMealType === 'завтрак') return uniqueProducts(['Омлет', 'Яичница', 'Творог 5%', 'Яйцо варёное'].map(name => firstExistingProduct([name])).filter(Boolean));
    if (normalizedMealType === 'ужин' || normalizedMealType === 'обед') return uniqueProducts(['Куриное филе', 'Треска запечённая', 'Индейка запечённая'].map(name => firstExistingProduct([name])).filter(Boolean));
  }
  if (normalizedToken.includes('вода')) return uniqueProducts(['Вода'].map(name => firstExistingProduct([name])).filter(Boolean));
  if (normalizedToken === 'рыба') return uniqueProducts(['Треска запечённая', 'Лосось на гриле'].map(name => firstExistingProduct([name])).filter(Boolean));
  if (normalizedToken === 'курица') return uniqueProducts(['Куриное филе', 'Куриное бедро'].map(name => firstExistingProduct([name])).filter(Boolean));
  
  return [];
}

function resolveSuggestionProducts(example, mealType = '') {
  const safe = String(example || '').trim();
  if (!safe) return [];

  if (safe.includes('+')) {
    const parts = safe.split('+').map(p => p.trim());
    const allProducts = [];
    for (const part of parts) {
      if (part === 'гарнир') {
        allProducts.push(...['Гречка отварная', 'Рис отварной', 'Картофель отварной']);
      } else if (part === 'хлеб') {
        allProducts.push(...['Хлеб белый', 'Хлеб чёрный', 'Хлеб бородинский', 'Хлеб цельнозерновой']);
      } else if (part === 'овощи' || part === 'салат') {
        allProducts.push(...['Огурец', 'Помидор', 'Салат овощной']);
      } else if (part === 'рыба') {
        allProducts.push(...['Треска запечённая', 'Лосось на гриле']);
      } else if (part === 'курица') {
        allProducts.push('Куриное филе');
      } else if (part === 'омлет') {
        allProducts.push('Омлет');
      } else if (part === 'суп') {
        allProducts.push(...['Борщ', 'Щи', 'Куриный суп']);
      } else if (part === 'белок') {
        allProducts.push(...['Куриное филе', 'Треска запечённая', 'Яйцо варёное']);
      } else if (part === 'яйцо') {
        allProducts.push('Яйцо варёное');
      } else if (part === 'каша') {
        allProducts.push('Овсяная каша');
      } else {
        const product = getProduct(part);
        if (product) allProducts.push(product.name);
      }
    }
    return uniqueExistingProducts(allProducts);
  }

  const normalizedExample = normalizePhrase(safe);
  if (normalizedExample.includes('вода')) {
    const water = firstExistingProduct(['Вода']);
    return water ? [water] : [];
  }

  const directProduct = getProduct(safe);
  if (directProduct?.name) return [directProduct.name];

  const resolved = resolveGenericSuggestionToken(safe, mealType);
  if (resolved.length) return resolved;

  for (const category of getCategories()) {
    const categoryProducts = getCategoryProducts(category);
    const match = categoryProducts.find(name => normalizePhrase(name).includes(normalizedExample));
    if (match) return [match];
  }

  return [];
}

function resolveVariantPool(token, contextKey) {
  const normalizedToken = normalizePhrase(token);
  const contextMap = SUGGESTION_TOKEN_VARIANTS[contextKey] || {};
  const breakfastMap = SUGGESTION_TOKEN_VARIANTS.breakfast;
  if (contextMap[normalizedToken]) return uniqueExistingProducts(contextMap[normalizedToken]);
  if (breakfastMap[normalizedToken]) return uniqueExistingProducts(breakfastMap[normalizedToken]);
  const directProduct = getProduct(token);
  if (directProduct?.name) return [directProduct.name];
  for (const category of getCategories()) {
    const categoryProducts = getCategoryProducts(category);
    const exact = categoryProducts.find(name => normalizePhrase(name) === normalizedToken);
    if (exact) return [exact];
    const included = categoryProducts.find(name => normalizePhrase(name).includes(normalizedToken));
    if (included) return [included];
  }
  if (normalizedToken.includes('суп')) return getProductsByCategoryKeywords(['суп']);
  if (normalizedToken.includes('рыба')) return uniqueExistingProducts(['Треска запечённая', 'Лосось на гриле']);
  if (normalizedToken.includes('куриц')) return uniqueExistingProducts(['Куриное филе', 'Куриное бедро']);
  if (normalizedToken.includes('овощ') || normalizedToken.includes('салат')) return uniqueExistingProducts(['Салат овощной', 'Огурец', 'Помидор', 'Капуста']);
  if (normalizedToken.includes('ягод')) return uniqueExistingProducts(['Клубника', 'Черника', 'Малина', 'Смородина чёрная']);
  if (normalizedToken.includes('хлеб')) return uniqueExistingProducts(['Хлеб белый', 'Хлеб чёрный', 'Хлеб бородинский', 'Хлеб цельнозерновой']);
  if (normalizedToken.includes('гарнир')) return uniqueExistingProducts(['Гречка отварная', 'Рис отварной', 'Картофель отварной']);
  if (normalizedToken === 'белок') {
    return contextKey === 'dinner' || contextKey === 'lunch'
      ? uniqueExistingProducts(['Куриное филе', 'Индейка запечённая', 'Треска запечённая', 'Яйцо варёное'])
      : uniqueExistingProducts(['Омлет', 'Яичница', 'Творог 5%', 'Яйцо варёное']);
  }
  return [];
}

function buildSuggestionSelectionModel(example) {
  const safe = String(example || '').trim();
  const contextKey = getSuggestionMealContext();
  if (!safe) return { groups: [], contextKey };
  const parts = safe.split('+').map(part => part.trim()).filter(Boolean);
  const groups = parts.map((part, index) => {
    const options = resolveVariantPool(part, contextKey);
    const uniqueOptions = uniqueExistingProducts(options);
    return {
      id: `group_${index}_${Date.now()}`,
      label: part,
      options: uniqueOptions,
      selected: uniqueOptions[0] || ''
    };
  });
  return { groups, contextKey };
}

function getMealBuilderSuggestion(mealType, selectedProducts) {
  const normalizedMealType = normalizeMealTypeForBuilder(mealType);
  const profile = Storage.getProfile();
  const goal = profile?.goal || 'maintain';
  const goalProfile = getGoalMealProfile(goal, normalizedMealType);
  const hasSelectedWater = selectedProducts.some(product => product?.name === 'Вода' || (product?.tags || []).includes('water'));

  if (normalizedMealType === 'Вода') {
    if (hasSelectedWater) {
      return buildTip('сочетание', 'Вода уже выбрана', 'Этого достаточно для водного шага. Просто сохрани запись.', 95, 'builder', {
        categories: ['Напитки'].filter(category => getCategories().includes(category)), examples: ['Вода 250–300 мл']
      });
    }
    return buildTip('сочетание', 'Добавь воду без лишних шагов', 'Для водного шага достаточно выбрать воду.', 95, 'builder', {
      categories: ['Напитки'].filter(category => getCategories().includes(category)), examples: ['Вода 250–300 мл']
    });
  }

  if (!selectedProducts.length) {
    const stage = normalizedMealType === 'Обед' ? NutritionStage.LUNCH : normalizedMealType === 'Ужин' ? NutritionStage.DINNER : NutritionStage.BREAKFAST;
    return buildTip('сочетание', normalizedMealType === 'Завтрак' ? 'Собери завтрак по базе' : normalizedMealType === 'Обед' ? 'Собери обед по базе' : 'Собери ужин по базе', getGoalText(goal, 'Хороший приём для твоей цели — это белковая опора, затем овощи и вода.', 'Хороший приём обычно собирается из опоры, дополнения и воды.', 'Для твоей цели приём лучше собирать плотнее.'), 90, 'builder', {
      categories: getStageCategories(stage), examples: getStageExamples(stage, profile)
    });
  }

  const syntheticMeal = {
    name: normalizedMealType,
    products: selectedProducts.map(product => ({ name: product.name, tags: product.tags || [] }))
  };
  const evaluation = evaluateMealByType(normalizedMealType, syntheticMeal, goalProfile);

  if (normalizedMealType === 'Завтрак' && !evaluation.isBalanced && evaluation.hasProtein && !evaluation.hasVegetables && !evaluation.hasBase) {
    return buildTip('сочетание', 'Дособери завтрак', 'Белковая база уже есть. Теперь добавь овощи, ягоды, фрукт или кашу.', 92, 'builder', {
      categories: ['Овощи и салаты', 'Фрукты и ягоды', 'Каши, крупы и гарниры'].filter(category => getCategories().includes(category)),
      examples: ['Омлет + овощи', 'Творог + ягоды', 'Каша + яйцо']
    });
  }

  if (evaluation.isBalanced) {
    return buildTip('сочетание', `${normalizedMealType} уже выглядит собранно`, evaluation.message, 82, 'builder', {
      categories: ['Напитки'].filter(category => getCategories().includes(category)), examples: ['Вода 250 мл']
    });
  }

  return buildTip('сочетание', normalizedMealType === 'Завтрак' ? 'Дособери завтрак' : normalizedMealType === 'Обед' ? 'Дособери обед' : 'Дособери ужин', evaluation.message, 92, 'builder', {
    categories: evaluation.categories, examples: evaluation.examples
  });
}

function formatDateChip(dateStr) {
  const safe = toDateInputValue(dateStr);
  const [year, month, day] = safe.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const monthName = date.toLocaleDateString('ru-RU', { month: 'long' });
  return { month: monthName, day: date.getDate() };
}

function renderDateChip(id, dateStr) {
  const el = document.getElementById(id);
  if (!el) return;
  const { month, day } = formatDateChip(dateStr);
  el.innerHTML = `<span class="date-month">${escapeHtml(month)}</span><span class="date-day">${day}</span>`;
}

function renderHome() {
  renderDateChip('home-date-chip', getTodayDate());
  const profile = Storage.getProfile();
  const today = getTodayDate();
  const stats = Storage.getDayStats(today);
  const todayAnalysis = getDayAnalysis(today);
  const goalCalories = inferGoalCalories(profile);
  const waterTarget = getWaterTarget(profile);

  document.getElementById('home-greeting').textContent =
    profile?.name ? `Привет, ${profile.name}!` : 'Привет!';

  const sublineEl = document.getElementById('home-subline');
  if (sublineEl) {
    if (!stats.mealsCount) {
      sublineEl.textContent = 'Сегодня можно начать спокойно';
    } else if (todayAnalysis.waterMl < waterTarget * 0.5 && stats.mealsCount >= 2) {
      sublineEl.textContent = 'По еде день идёт хорошо — добавь воды';
    } else if (todayAnalysis.breakfastBalanced && todayAnalysis.lunchBalanced && todayAnalysis.dinnerBalanced) {
      sublineEl.textContent = 'День выглядит собранно, так держать';
    } else {
      sublineEl.textContent = 'Сегодня можно двигаться спокойно и по шагам';
    }
  }

  const eaten = stats.calories;
  const goal = goalCalories;
  const pct = goal > 0 ? Math.min(100, Math.round(eaten / goal * 100)) : 0;
  const kcalMainEl = document.getElementById('home-kcal-main');
  if (kcalMainEl) kcalMainEl.textContent = `${eaten} / ${goal} ккал`;
  const fillEl = document.getElementById('home-progress-fill');
  if (fillEl) fillEl.style.width = `${pct}%`;
  const mealsEl = document.getElementById('today-meals');
  if (mealsEl) mealsEl.textContent = stats.mealsCount;
  const waterEl = document.getElementById('home-water-ml');
  if (waterEl) waterEl.textContent = todayAnalysis.waterMl;
  const remEl = document.getElementById('today-remaining');
  if (remEl) remEl.textContent = Math.max(0, goal - eaten);

  const nextCard = document.getElementById('home-next-card');
  if (nextCard) {
    const primary = getPrimarySuggestionForDate(today);
    const waterLow = todayAnalysis.waterMl < Math.max(250, waterTarget * 0.4);
    const showWater = waterLow && primary.mealType !== WATER_MEAL_NAME;

    let nextHtml = `<div class="next-step-label">Следующий шаг</div>`;
    nextHtml += `<div class="next-step-text">${escapeHtml(primary.text)}</div>`;
    nextHtml += `<div class="next-step-actions">`;
    nextHtml += `<button class="btn btn-primary next-step-btn" id="home-next-btn" type="button">${escapeHtml(primary.button)}</button>`;
    if (showWater) {
      nextHtml += `<button class="btn btn-secondary next-step-btn" id="home-water-btn" type="button">+ Добавить воду</button>`;
    }
    nextHtml += `</div>`;
    nextCard.innerHTML = nextHtml;

    document.getElementById('home-next-btn')?.addEventListener('click', () => {
      if (primary.mealType === 'Перекус') {
        openSnackModal();
      } else if (primary.mealType === WATER_MEAL_NAME) {
        addWaterForDate(today);
      } else {
        state.preselectedMealType = primary.mealType;
        openAddScreenForDate(today);
      }
    });
    document.getElementById('home-water-btn')?.addEventListener('click', () => addWaterForDate(today));
  }

  const meals = getSortedMeals(today).slice(-3);
  const homeMeals = document.getElementById('home-meals');
  if (!meals.length) {
    homeMeals.innerHTML = '<div class="card empty-state">Пока нет записей за сегодня.</div>';
  } else {
    homeMeals.innerHTML = meals.map((meal, index) => {
      const allMeals = getSortedMeals(today);
      const realIndex = allMeals.findIndex(m => getMealSignature(m) === getMealSignature(meal));
      return renderMealCard(meal, today, realIndex >= 0 ? realIndex : index);
    }).join('');
  }

  const tips = generateTips();
  const tipEl = document.getElementById('home-tip');
  if (tipEl) {
    tipEl.innerHTML = tips.length ? renderTipCard(tips[0]) : '';
  }
}

function addWaterForDate(dateStr, customTime = '') {
  const now = new Date();
  const time = String(customTime || `${pad2(now.getHours())}:${pad2(now.getMinutes())}`).trim();
  const waterProduct = getProduct('Вода');
  if (!waterProduct) return;
  const meal = {
    time,
    name: WATER_MEAL_NAME,
    comment: '',
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    products: [{ name: 'Вода', amount: 250, unit: 'мл', tags: waterProduct.tags || ['water', 'drink', 'hydration', 'light'] }]
  };
  Storage.saveMeal(dateStr, meal);
  renderHome();
  renderDiary();
  renderTips();
  if (state.currentScreen === 'screen-add') {
    renderAddScreenContext();
    renderDayTotalsCard();
  }
}

function openSnackModal() {
  const SNACK_CATEGORIES = ['Фрукты и ягоды', 'Орехи, масла и добавки', 'Напитки'];
  let activeCategory = SNACK_CATEGORIES[0];
  
  const selected = {};

  const overlay = document.createElement('div');
  overlay.id = 'snack-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,20,20,.35);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:16px;';

  function getBaseAmount(unit) {
    if (unit === 'шт') return 1;
    if (unit === 'мл') return 100;
    return 100;
  }

  function getDefaultAmount(unit) {
    if (unit === 'шт') return 1;
    if (unit === 'мл') return 250;
    return 100;
  }

  function addProduct(name, category) {
    const product = getProduct(name);
    if (!product) return;
    const unit = product.unit;
    const baseAmount = getBaseAmount(unit);
    const defaultAmount = getDefaultAmount(unit);
    const ratio = defaultAmount / baseAmount;
    
    selected[name] = {
      name: name,
      category: category,
      amount: defaultAmount,
      unit: unit,
      caloriesPerUnit: product.calories / baseAmount,
      proteinPerUnit: product.protein / baseAmount,
      fatsPerUnit: product.fats / baseAmount,
      carbsPerUnit: product.carbs / baseAmount,
      calories: Math.round(product.calories * ratio),
      protein: product.protein * ratio,
      fats: product.fats * ratio,
      carbs: product.carbs * ratio
    };
  }

  function removeProduct(name) {
    delete selected[name];
  }

  function updateProductAmount(name, newAmount) {
    const item = selected[name];
    if (!item) return;
    const amount = parseFloat(newAmount) || 0;
    item.amount = amount;
    const ratio = amount / getBaseAmount(item.unit);
    item.calories = Math.round(item.caloriesPerUnit * amount);
    item.protein = item.proteinPerUnit * amount;
    item.fats = item.fatsPerUnit * amount;
    item.carbs = item.carbsPerUnit * amount;
  }

  function calculateTotals() {
    let totalCalories = 0, totalProtein = 0, totalFats = 0, totalCarbs = 0;
    Object.values(selected).forEach(item => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalFats += item.fats;
      totalCarbs += item.carbs;
    });
    return { calories: Math.round(totalCalories), protein: totalProtein, fats: totalFats, carbs: totalCarbs };
  }

  function buildTabsHtml(current) {
    return SNACK_CATEGORIES.map(cat => {
      const hasSelected = Object.values(selected).some(s => s.category === cat);
      const isActive = cat === current;
      return `<button data-snack-tab="${escapeHtml(cat)}"
        style="flex:1;background:transparent;border:none;
        border-bottom:2px solid ${isActive ? '#657b58' : '#e2e6dc'};
        padding:10px 4px;font-size:11px;font-weight:700;
        color:${isActive ? '#44563a' : '#7a866f'};cursor:pointer;line-height:1.3;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        ${escapeHtml(cat)}${hasSelected ? ' ✓' : ''}
      </button>`;
    }).join('');
  }

  function buildProductsHtml(category) {
    return getCategoryProducts(category).map(name => {
      const p = getProduct(name);
      const cal = p ? `${Math.round(p.calories)} ккал/${p.unit === 'шт' ? 'шт' : '100 ' + p.unit}` : '';
      const isChosen = Boolean(selected[name]);
      return `<button data-snack-product="${escapeHtml(name)}" data-snack-category="${escapeHtml(category)}"
        style="display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;
        padding:12px 14px;margin-bottom:6px;border-radius:12px;cursor:pointer;gap:8px;
        border:2px solid ${isChosen ? '#657b58' : 'rgba(68,86,58,.12)'};
        background:${isChosen ? '#eef3ea' : '#faf8f4'};
        color:${isChosen ? '#44563a' : '#1f231d'};font-size:14px;font-weight:600;">
        <span>${escapeHtml(name)}</span>
        <span style="font-size:11px;color:#7a866f;white-space:nowrap;">${escapeHtml(cal)}</span>
      </button>`;
    }).join('');
  }

  function buildSelectedHtml() {
    const items = Object.values(selected);
    if (!items.length) return '<div style="padding:20px;text-align:center;color:#7a866f;">Ничего не выбрано</div>';
    
    return items.map(item => {
      const unitLabel = getUnitLabel(item.unit);
      return `<div data-selected-item="${escapeHtml(item.name)}" style="display:flex;align-items:center;justify-content:space-between;
        padding:10px 12px;border-radius:12px;background:#eef3ea;border:1px solid rgba(68,86,58,.18);margin-bottom:8px;gap:10px;">
        <div style="flex:2; font-size:13px; font-weight:700; color:#44563a;">${escapeHtml(item.name)}</div>
        <div style="flex:1; display:flex; align-items:center; gap:6px;">
          <input type="number" data-amount-input="${escapeHtml(item.name)}" value="${item.amount}" 
            step="${item.unit === 'шт' ? 1 : 10}" min="0"
            style="width:70px; padding:8px 4px; border-radius:8px; border:1px solid rgba(68,86,58,.3); text-align:center; font-size:13px;">
          <span style="font-size:12px; color:#7a866f; min-width:30px;">${unitLabel}</span>
        </div>
        <div style="flex:1; font-size:13px; font-weight:700; color:#44563a; text-align:right;">${item.calories} ккал</div>
        <button data-remove-item="${escapeHtml(item.name)}"
          style="width:28px;height:28px;border-radius:50%;border:1px solid rgba(169,77,73,.3);
          background:#f8e7e6;color:#a94d49;font-size:16px;font-weight:800;
          cursor:pointer;display:grid;place-items:center;">×</button>
      </div>`;
    }).join('');
  }

  function render() {
    const totals = calculateTotals();
    overlay.innerHTML = `
      <div style="width:min(520px,100%);max-height:86vh;display:flex;flex-direction:column;
        background:#fff;border-radius:24px;padding:20px;box-shadow:0 20px 40px rgba(0,0,0,.14);">

        <div style="font-size:13px;font-weight:700;color:#7a866f;margin-bottom:4px;">добавить перекус</div>
        <div style="font-size:20px;font-weight:800;color:#23311f;margin-bottom:14px;">Выбери продукты</div>

        <div style="display:flex;gap:4px;margin-bottom:14px;">${buildTabsHtml(activeCategory)}</div>

        <div style="display:flex;gap:12px;margin-bottom:12px;">
          <div style="flex:1; overflow-y:auto; max-height:300px;">
            <div style="font-size:11px;font-weight:800;color:#7a866f;margin-bottom:8px;">${escapeHtml(activeCategory)}</div>
            ${buildProductsHtml(activeCategory)}
          </div>
          <div style="flex:1; overflow-y:auto; max-height:300px;">
            <div style="font-size:11px;font-weight:800;color:#7a866f;margin-bottom:8px;">Выбрано</div>
            <div id="selected-products-list">${buildSelectedHtml()}</div>
          </div>
        </div>

        <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;padding:12px;background:#f3efe7;border-radius:12px;">
            <span style="font-weight:800;">Итого:</span>
            <span style="font-weight:800;">${totals.calories} ккал</span>
          </div>
          <button id="snack-confirm-btn"
            style="width:100%;padding:14px;border-radius:14px;border:none;
            background:linear-gradient(135deg,#657b58,#44563a);color:#fff;
            font-size:15px;font-weight:800;cursor:pointer;">
            Добавить перекус${totals.calories ? ` • ${totals.calories} ккал` : ''}
          </button>
          <button id="snack-close-btn"
            style="width:100%;padding:13px;border-radius:14px;
            border:1px solid #d7dccf;background:#fff;color:#23311f;
            font-size:15px;font-weight:700;cursor:pointer;">Отмена</button>
        </div>
      </div>`;

    overlay.querySelectorAll('[data-snack-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        activeCategory = tab.getAttribute('data-snack-tab');
        render();
      });
    });

    overlay.querySelectorAll('[data-snack-product]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-snack-product');
        const category = btn.getAttribute('data-snack-category');
        if (selected[name]) {
          removeProduct(name);
        } else {
          addProduct(name, category);
        }
        render();
      });
    });

    overlay.querySelectorAll('[data-amount-input]').forEach(input => {
      const productName = input.getAttribute('data-amount-input');
      input.addEventListener('input', (e) => {
        updateProductAmount(productName, e.target.value);
        render();
      });
    });

    overlay.querySelectorAll('[data-remove-item]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.getAttribute('data-remove-item');
        removeProduct(name);
        render();
      });
    });

    overlay.querySelector('#snack-confirm-btn')?.addEventListener('click', () => {
      const items = Object.values(selected);
      if (items.length) {
        saveSnackDirectly(items);
      }
      overlay.remove();
    });

    overlay.querySelector('#snack-close-btn').addEventListener('click', () => overlay.remove());
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  render();
  
}

function renderDiary() {
  renderDateChip('diary-date-chip', getTodayDate());
  renderCalendar();
  const analysis = getDayAnalysis(state.selectedDate);

  document.getElementById('selected-date-title').textContent = formatDate(state.selectedDate);
  document.getElementById('diary-stats').textContent =
    `Приёмы: ${analysis.mealsCount} • Вода: ${analysis.waterMl} мл • ` +
    `Завтрак: ${analysis.breakfastBalanced ? 'ок' : 'нет'} • ` +
    `Обед: ${analysis.lunchBalanced ? 'ок' : 'нет'} • ` +
    `Ужин: ${analysis.dinnerBalanced ? 'ок' : 'нет'}`;

  const meals = getSortedMeals(state.selectedDate);
  const container = document.getElementById('diary-meals');
  container.innerHTML = meals.length
    ? meals.map((meal, index) => renderMealCard(meal, state.selectedDate, index)).join('')
    : '<div class="empty-state">Нет записей на выбранную дату.</div>';

  const primary = getPrimarySuggestionForDate(state.selectedDate);
  const primarySlot = document.getElementById('diary-primary-slot');
  if (primarySlot) {
    if (primary.mealType !== WATER_MEAL_NAME) {
      primarySlot.innerHTML =
        `<button class="btn btn-primary full-width" id="diary-primary-btn" type="button"
          style="min-height:52px;">${escapeHtml(primary.button)}</button>`;
      document.getElementById('diary-primary-btn').addEventListener('click', () => {
        if (primary.mealType === 'Перекус') {
          openSnackModal();
        } else {
          state.preselectedMealType = primary.mealType;
          state.preselectedCategory = primary.category || '';
          openAddScreenForDate(state.selectedDate);
        }
      });
    } else {
      primarySlot.innerHTML = '';
    }
  }

  const waterSlot = document.getElementById('diary-water-slot');
  if (waterSlot) {
    const waterLogged = analysis.waterMl >= 250;
    const wClass = waterLogged ? 'btn btn-primary full-width' : 'btn btn-secondary full-width';
    const wText  = waterLogged
      ? `Ещё воды (+250 мл) • уже ${analysis.waterMl} мл`
      : 'Добавить приём воды (+250 мл)';
    waterSlot.innerHTML =
      `<button class="${wClass}" id="diary-water-btn" type="button"
        style="min-height:52px;">${escapeHtml(wText)}</button>`;
    document.getElementById('diary-water-btn').addEventListener('click', () =>
      addWaterForDate(state.selectedDate));
  }

  const snackSlot = document.getElementById('diary-snack-slot');
  if (snackSlot) {
    const allDone = analysis.breakfastBalanced && analysis.lunchBalanced && analysis.dinnerBalanced;
    if (allDone) {
      snackSlot.innerHTML =
        `<button class="btn btn-secondary full-width" id="diary-snack-btn" type="button"
          style="min-height:52px;">Добавить перекус</button>`;
      document.getElementById('diary-snack-btn').addEventListener('click', () => openSnackModal());
    } else {
      snackSlot.innerHTML = '';
    }
  }
}

function saveSnackDirectly(items) {
  if (!items || !items.length) return;
  let totalCalories = 0, totalProtein = 0, totalFats = 0, totalCarbs = 0;
  const products = [];

  items.forEach(({ name, amount: customAmount }) => {
    const p = getProduct(name);
    if (!p) return;
    const amount = customAmount != null ? customAmount : defaultAmountByUnit(p.unit);
    const ratio = amount / getAmountBase(p.unit);
    totalCalories += p.calories * ratio;
    totalProtein  += p.protein  * ratio;
    totalFats     += p.fats     * ratio;
    totalCarbs    += p.carbs    * ratio;
    products.push({ name, amount, unit: p.unit, tags: p.tags || [] });
  });

  if (!products.length) return;

  const now = new Date();
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  Storage.saveMeal(state.selectedDate, {
    time,
    name: 'Перекус',
    comment: '',
    calories: Math.round(totalCalories),
    protein: round1(totalProtein),
    fats:    round1(totalFats),
    carbs:   round1(totalCarbs),
    products
  });
  renderHome();
  renderDiary();
  renderTips();
}

function renderCalendar() {
  const calendar = document.getElementById('calendar-strip');
  const today = new Date();
  const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
  let html = '';
  for (let i = -30; i <= 14; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = toDateInputValue(date);
    const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const isActive = dateStr === state.selectedDate;
    const hasMeals = Storage.getMealsByDate(dateStr).length > 0;
    html += `<button class="day-pill ${isActive ? 'active' : ''} ${hasMeals ? 'has-meals' : ''}" onclick="selectDate('${dateStr}')" type="button"><div class="day-name">${dayName}</div><div class="day-date">${date.getDate()}</div></button>`;
  }
  calendar.innerHTML = html;
  const activeDay = calendar.querySelector('.day-pill.active');
  if (activeDay) activeDay.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}

function selectDate(dateStr) {
  state.selectedDate = toDateInputValue(dateStr);
  renderDiary();
}

function renderMealCard(meal, date, index) {
  const today = getTodayDate();
  let isPast = false;
  if (date === today && meal.time) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [mealH, mealM] = meal.time.split(':').map(Number);
    const mealMinutes = mealH * 60 + mealM;
    isPast = mealMinutes < currentMinutes - 15;
  } else if (date < today) {
    isPast = true;
  }

  const displayName = normalizeMealDisplayName(meal);
  const isWater = displayName === WATER_MEAL_NAME || isWaterMeal(meal);
  const isSnack = displayName === 'Перекус';

  let cardClass = 'meal-card';
  if (isWater) cardClass += ' meal-card--water';
  else if (isSnack) cardClass += ' meal-card--snack';
  if (isPast) cardClass += ' meal-card--past';

  const productsHtml = (meal.products || [])
    .map(product => {
      const amount = product.amount || 0;
      const unit = getUnitLabel(product.unit || 'гр');
      const name = escapeHtml(product.name);
      return `<div style="font-size:12px; line-height:1.4; margin-bottom:2px;">${name} ${amount} ${unit}</div>`;
    })
    .join('');
  
  const commentText = meal.comment ? `<div style="font-size:11px; color:#7a866f; margin-top:4px;">💬 ${escapeHtml(meal.comment)}</div>` : '';
  
  return `<div class="${cardClass}">
    <button class="delete-round" onclick="deleteMeal('${date}', ${index})" type="button">×</button>
    <button class="edit-time-btn" onclick="editMealTime('${date}', ${index})" type="button">⏱</button>
    
    <div class="time-badge">${escapeHtml(meal.time || '--:--')}</div>
    
    <div class="meal-info">
      <div class="meal-name">${escapeHtml(displayName)}</div>
      <div class="meal-products" style="margin-top:6px;">
        ${productsHtml || '<span style="font-size:12px; color:#999;">Без состава</span>'}
      </div>
      ${commentText}
    </div>
    
    <div class="meal-calories">${Math.round(meal.calories || 0)} ккал</div>
  </div>`;
}

function deleteMeal(date, index) {
  if (!confirm('Удалить этот приём пищи?')) return;
  const safeDate = toDateInputValue(date);
  const diary = Storage.getDiary();
  const rawMeals = Array.isArray(diary[safeDate]) ? [...diary[safeDate]] : [];
  const sortedMeals = getSortedMeals(safeDate);
  const targetMeal = sortedMeals[index];
  if (!targetMeal) return;
  const targetSignature = getMealSignature(targetMeal);
  const rawIndex = rawMeals.findIndex(meal => getMealSignature(meal) === targetSignature);
  if (rawIndex === -1) return;
  rawMeals.splice(rawIndex, 1);
  if (rawMeals.length) {
    diary[safeDate] = rawMeals;
  } else {
    delete diary[safeDate];
  }
  Storage.saveDiary(diary);
  renderHome();
  renderDiary();
  renderTips();
  if (state.currentScreen === 'screen-add') {
    renderAddScreenContext();
    renderAddMealSuggestion();
    renderDayTotalsCard();
  }
}

function openTimePicker(currentTime, onConfirm) {
  const [initH, initM] = (currentTime || getCurrentTimeStr()).split(':').map(Number);

  let selH = initH;
  let selM = initM;

  const overlay = document.createElement('div');
  overlay.id = 'time-picker-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,20,20,.45);z-index:10002;display:flex;align-items:flex-end;justify-content:center;padding:16px;';

  function buildDrumHtml(values, selected, dataAttr) {
    return values.map(v => {
      const str = pad2(v);
      const isActive = v === selected;
      return `<button data-${dataAttr}="${v}"
        style="display:block;width:100%;padding:10px 0;border:none;border-radius:10px;cursor:pointer;
        font-size:${isActive ? '28px' : '20px'};font-weight:${isActive ? '800' : '500'};
        color:${isActive ? '#44563a' : '#b0b8ab'};
        background:${isActive ? '#eef3ea' : 'transparent'};
        transition:all .12s ease;">${str}</button>`;
    }).join('');
  }

  function render() {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const mins  = Array.from({ length: 12 }, (_, i) => i * 5);

    overlay.innerHTML = `
      <div style="width:min(360px,100%);background:#fff;border-radius:24px;padding:20px;
        box-shadow:0 20px 40px rgba(0,0,0,.18);">
        <div style="font-size:13px;font-weight:700;color:#7a866f;margin-bottom:4px;">установить время</div>
        <div style="font-size:20px;font-weight:800;color:#1f231d;margin-bottom:16px;">
          ${pad2(selH)} : ${pad2(selM)}
        </div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:start;">
          <div style="max-height:220px;overflow-y:auto;border-radius:12px;border:1px solid rgba(68,86,58,.12);
            padding:4px;" id="tp-hours-scroll">
            ${buildDrumHtml(hours, selH, 'tp-h')}
          </div>
          <div style="font-size:28px;font-weight:800;color:#44563a;padding-top:8px;">:</div>
          <div style="max-height:220px;overflow-y:auto;border-radius:12px;border:1px solid rgba(68,86,58,.12);
            padding:4px;" id="tp-mins-scroll">
            ${buildDrumHtml(mins, selM, 'tp-m')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
          <button id="tp-cancel" style="padding:14px;border-radius:14px;border:1px solid #d7dccf;
            background:#fff;color:#1f231d;font-size:15px;font-weight:700;cursor:pointer;">Отмена</button>
          <button id="tp-confirm" style="padding:14px;border-radius:14px;border:none;
            background:linear-gradient(135deg,#657b58,#44563a);color:#fff;
            font-size:15px;font-weight:800;cursor:pointer;">Готово</button>
        </div>
      </div>`;

    requestAnimationFrame(() => {
      const hScroll = overlay.querySelector('#tp-hours-scroll');
      const mScroll = overlay.querySelector('#tp-mins-scroll');
      const hActive = hScroll?.querySelector(`[data-tp-h="${selH}"]`);
      const mActive = mScroll?.querySelector(`[data-tp-m="${selM}"]`);
      hActive?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      mActive?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });

    overlay.querySelectorAll('[data-tp-h]').forEach(btn => {
      btn.addEventListener('click', () => {
        selH = Number(btn.getAttribute('data-tp-h'));
        render();
      });
    });
    overlay.querySelectorAll('[data-tp-m]').forEach(btn => {
      btn.addEventListener('click', () => {
        selM = Number(btn.getAttribute('data-tp-m'));
        render();
      });
    });

    overlay.querySelector('#tp-confirm').addEventListener('click', () => {
      overlay.remove();
      onConfirm(`${pad2(selH)}:${pad2(selM)}`);
    });
    overlay.querySelector('#tp-cancel').addEventListener('click', () => overlay.remove());
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  render();
}

function editMealTime(date, index) {
  const safeDate = toDateInputValue(date);
  const meals = getSortedMeals(safeDate);
  const meal = meals[index];
  if (!meal) return;

  openTimePicker(meal.time, newTime => {
    updateMealTime(safeDate, meal, newTime);
  });
}

function updateMealTime(date, oldMeal, newTime) {
  const diary = Storage.getDiary();
  const meals = diary[date];
  if (!Array.isArray(meals)) return;

  const oldSignature = getMealSignature(oldMeal);
  const mealIndex = meals.findIndex(m => getMealSignature(m) === oldSignature);
  if (mealIndex === -1) return;

  const updatedMeal = { ...oldMeal, time: newTime };
  meals[mealIndex] = updatedMeal;
  diary[date] = meals;
  Storage.saveDiary(diary);

  renderHome();
  renderDiary();
  renderTips();
  
  if (state.currentScreen === 'screen-add') {
    renderAddScreenContext();
  }
}

function renderClickableChip(text, category) {
  if (!category) return `<span class="chip">${escapeHtml(text)}</span>`;
  return `<button class="chip" type="button" onclick="openCategoryModalFromTip('${escapeHtml(category)}')">${escapeHtml(text)}</button>`;
}

function openCategoryModalFromTip(category) {
  const today = getTodayDate();
  
  if (category === 'Напитки') {
    addWaterForDate(today);
    return;
  }
  
  if (state.currentScreen === 'screen-add') {
    openCategoryModal(category, { saveDirectly: false });
    return;
  }
  
  const mealSlot = getCurrentMealSlot(today);
  openCategoryModal(category, {
    saveDirectly: true,
    mealType: mealSlot || 'Перекус',
    useSlot: true
  });
}

function openCategoryModal(category, options = {}) {
  const isWaterCat = category === 'Напитки';

  const saveDirectly = options.saveDirectly != null
    ? options.saveDirectly
    : (state.currentScreen !== 'screen-add');

  const mealTypeName = options.mealType || (isWaterCat ? WATER_MEAL_NAME : 'Перекус');

  const selected = {};

  const overlay = document.createElement('div');
  overlay.id = 'cat-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,20,20,.35);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:16px;';

  function getStep(unit) {
    if (unit === 'шт') return 1;
    if (unit === 'мл') return 50;
    return 25;
  }

  function calcTotal() {
    return Math.round(Object.values(selected).reduce((sum, s) => {
      const p = getProduct(s.name);
      if (!p) return sum;
      return sum + p.calories / getAmountBase(p.unit) * s.amount;
    }, 0));
  }

  function buildProductsHtml() {
    return getCategoryProducts(category).map(name => {
      const p = getProduct(name);
      const unit = p ? getUnitLabel(p.unit) : 'г';
      const calPer = p
        ? `${Math.round(p.calories)} ккал/${p.unit === 'шт' ? 'шт' : '100 ' + unit}`
        : '';
      const isChosen = Boolean(selected[name]);
      return `<button data-cm-product="${escapeHtml(name)}"
        style="display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;
        padding:12px 14px;margin-bottom:6px;border-radius:12px;cursor:pointer;gap:8px;
        border:2px solid ${isChosen ? '#657b58' : 'rgba(68,86,58,.12)'};
        background:${isChosen ? '#eef3ea' : '#faf8f4'};
        color:${isChosen ? '#44563a' : '#1f231d'};font-size:14px;font-weight:600;">
        <span style="display:flex;align-items:center;gap:8px;min-width:0;">
          ${isChosen
            ? `<span style="width:18px;height:18px;border-radius:50%;background:#657b58;color:#fff;font-size:11px;display:grid;place-items:center;flex-shrink:0;padding:0;box-sizing:border-box;">✓</span>`
            : `<span style="width:18px;height:18px;border-radius:50%;border:2px solid #d0d5cc;flex-shrink:0;"></span>`}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(name)}</span>
        </span>
        <span style="font-size:11px;color:#7a866f;white-space:nowrap;flex-shrink:0;">${escapeHtml(calPer)}</span>
      </button>`;
    }).join('');
  }

  function buildSelectedSummary() {
    const items = Object.values(selected);
    if (!items.length) return '';
    return `<div style="margin-bottom:12px;">
      <div style="font-size:11px;font-weight:800;color:#7a866f;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Выбрано</div>
      ${items.map(s => {
        const p = getProduct(s.name);
        const unit = p ? getUnitLabel(p.unit) : 'г';
        const cal = p ? Math.round(p.calories / getAmountBase(p.unit) * s.amount) : 0;
        const step = getStep(p?.unit);
        const min = p?.unit === 'шт' ? 1 : step;
        return `<div style="display:flex;align-items:center;justify-content:space-between;
          padding:8px 12px;border-radius:10px;background:#eef3ea;border:1px solid rgba(68,86,58,.18);margin-bottom:6px;">
          <span style="font-size:13px;font-weight:700;color:#44563a;flex:1;min-width:0;
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(s.name)}</span>
          <span style="display:flex;align-items:center;gap:5px;flex-shrink:0;margin-left:8px;">
            <button data-cm-dec="${escapeHtml(s.name)}"
              style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(68,86,58,.25);
              background:#fff;color:#44563a;font-size:15px;font-weight:800;cursor:pointer;
              display:grid;place-items:center;line-height:1;padding:0;box-sizing:border-box;">−</button>
            <span style="font-size:12px;font-weight:700;color:#44563a;min-width:54px;text-align:center;">
              ${s.amount} ${unit}</span>
            <button data-cm-inc="${escapeHtml(s.name)}"
              style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(68,86,58,.25);
              background:#fff;color:#44563a;font-size:15px;font-weight:800;cursor:pointer;
              display:grid;place-items:center;line-height:1;padding:0;box-sizing:border-box;">+</button>
            <span style="font-size:11px;color:#7a866f;min-width:38px;text-align:right;">${cal} кк</span>
            <button data-cm-remove="${escapeHtml(s.name)}"
              style="width:22px;height:22px;border-radius:50%;border:1px solid rgba(169,77,73,.3);
              background:#f8e7e6;color:#a94d49;font-size:14px;font-weight:800;
              cursor:pointer;display:grid;place-items:center;line-height:1;padding:0;box-sizing:border-box;">×</button>
          </span>
        </div>`;
      }).join('')}
    </div>`;
  }

  function render() {
    const hasAny = Object.keys(selected).length > 0;
    const total = calcTotal();
    const confirmLabel = saveDirectly
      ? `Сохранить${total ? ` • ${total} ккал` : ''}`
      : `Добавить в приём${total ? ` • ${total} ккал` : ''}`;

    overlay.innerHTML = `
      <div style="width:min(520px,100%);max-height:86vh;display:flex;flex-direction:column;
        background:#fff;border-radius:24px;padding:20px;box-shadow:0 20px 40px rgba(0,0,0,.14);">
        <div style="font-size:13px;font-weight:700;color:#7a866f;margin-bottom:4px;">${escapeHtml(category)}</div>
        <div style="font-size:20px;font-weight:800;color:#23311f;margin-bottom:14px;">Выбери продукты</div>
        <div style="overflow-y:auto;flex:1;min-height:0;">
          ${buildSelectedSummary()}
          <div style="font-size:11px;font-weight:800;color:#7a866f;text-transform:uppercase;
            letter-spacing:.5px;margin-bottom:8px;">${escapeHtml(category)}</div>
          ${buildProductsHtml()}
        </div>
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;">
          ${hasAny ? `<button id="cm-confirm-btn"
            style="width:100%;padding:14px;border-radius:14px;border:none;
            background:linear-gradient(135deg,#657b58,#44563a);color:#fff;
            font-size:15px;font-weight:800;cursor:pointer;">${escapeHtml(confirmLabel)}</button>` : ''}
          <button id="cm-cancel-btn"
            style="width:100%;padding:13px;border-radius:14px;border:1px solid #d7dccf;
            background:#fff;color:#23311f;font-size:15px;font-weight:700;cursor:pointer;">Отмена</button>
        </div>
      </div>`;

    overlay.querySelectorAll('[data-cm-product]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-cm-product');
        if (selected[name]) {
          delete selected[name];
        } else {
          const p = getProduct(name);
          selected[name] = { name, amount: p ? defaultAmountByUnit(p.unit) : 100 };
        }
        render();
      });
    });

    overlay.querySelectorAll('[data-cm-dec]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const name = btn.getAttribute('data-cm-dec');
        if (!selected[name]) return;
        const p = getProduct(name);
        const step = getStep(p?.unit);
        const min = p?.unit === 'шт' ? 1 : step;
        selected[name].amount = Math.max(min, selected[name].amount - step);
        render();
      });
    });

    overlay.querySelectorAll('[data-cm-inc]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const name = btn.getAttribute('data-cm-inc');
        if (!selected[name]) return;
        const p = getProduct(name);
        const step = getStep(p?.unit);
        selected[name].amount += step;
        render();
      });
    });

    overlay.querySelectorAll('[data-cm-remove]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        delete selected[btn.getAttribute('data-cm-remove')];
        render();
      });
    });

    overlay.querySelector('#cm-confirm-btn')?.addEventListener('click', () => {
      const items = Object.values(selected);
      if (!items.length) return;

      if (saveDirectly) {
        if (options.useSlot && mealTypeName !== WATER_MEAL_NAME) {
          saveItemsToMealSlot(mealTypeName, items, state.selectedDate || getTodayDate());
        } else {
          let totalCal = 0, totalProt = 0, totalFat = 0, totalCarb = 0;
          const products = [];
          items.forEach(({ name, amount }) => {
            const p = getProduct(name);
            if (!p) return;
            const ratio = amount / getAmountBase(p.unit);
            totalCal  += p.calories * ratio;
            totalProt += p.protein  * ratio;
            totalFat  += p.fats     * ratio;
            totalCarb += p.carbs    * ratio;
            products.push({ name, amount, unit: p.unit, tags: p.tags || [] });
          });
          if (!products.length) return;
          Storage.saveMeal(state.selectedDate || getTodayDate(), {
            time: getCurrentTimeStr(),
            name: mealTypeName,
            comment: '',
            calories: Math.round(totalCal),
            protein: round1(totalProt),
            fats:    round1(totalFat),
            carbs:   round1(totalCarb),
            products
          });
          renderHome(); renderDiary(); renderTips();
        }
      } else {
        items.forEach(({ name, amount }) => {
          const product = getProduct(name);
          if (!product) return;
          const row = createEmptyRow(name, product.category);
          row.amount = amount;
          state.addRows.push(row);
        });
        renderAddRows();
        renderDayTotalsCard();
        renderAddMealSuggestion();
      }
      overlay.remove();
    });

    overlay.querySelector('#cm-cancel-btn').addEventListener('click', () => overlay.remove());
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  render();
}

function openDrinksModal() {
  openCategoryModal('Напитки');
}

function normalizeSuggestedExample(example) {
  const mealTypeInput = document.getElementById('meal-type');
  const mealType = normalizeMealTypeForBuilder(mealTypeInput?.value || 'Завтрак');
  return resolveSuggestionProducts(example, mealType);
}

function closeSuggestionModal() {
  const overlay = document.getElementById('suggestion-overlay');
  if (overlay) overlay.remove();
}

function updateSuggestionApplyState() {
  const overlay = document.getElementById('suggestion-overlay');
  if (!overlay) return;
  const groupNodes = Array.from(overlay.querySelectorAll('[data-suggestion-group]'));
  const isComplete = groupNodes.every(node => Boolean(node.getAttribute('data-selected-product')));
  const applyButton = document.getElementById('suggestion-apply-btn');
  if (!applyButton) return;
  applyButton.disabled = !isComplete;
  applyButton.style.opacity = isComplete ? '1' : '.55';
  applyButton.style.cursor = isComplete ? 'pointer' : 'not-allowed';
}

function collectSelectedSuggestionProducts() {
  const overlay = document.getElementById('suggestion-overlay');
  if (!overlay) return [];
  const groupNodes = Array.from(overlay.querySelectorAll('[data-suggestion-group]'));
  const selected = groupNodes.map(node => node.getAttribute('data-selected-product') || '').filter(Boolean);
  return uniqueExistingProducts(selected);
}

function bindSuggestionChoiceButtons() {
  const overlay = document.getElementById('suggestion-overlay');
  if (!overlay) return;
  overlay.querySelectorAll('[data-suggestion-choice]').forEach(button => {
    button.addEventListener('click', () => {
      const groupId = button.getAttribute('data-group-id');
      const productName = button.getAttribute('data-product-name') || '';
      const groupNode = overlay.querySelector(`[data-suggestion-group="${groupId}"]`);
      if (!groupNode) return;
      groupNode.setAttribute('data-selected-product', productName);
      overlay.querySelectorAll(`[data-group-id="${groupId}"]`).forEach(item => {
        const isActive = item === button;
        item.style.background = isActive ? 'linear-gradient(135deg, #657b58, #44563a)' : '#eef3ea';
        item.style.color = isActive ? '#fff' : '#44563a';
        item.style.borderColor = isActive ? 'rgba(68,86,58,.45)' : 'rgba(68,86,58,.16)';
        item.style.boxShadow = isActive ? '0 6px 12px rgba(68,86,58,.12)' : 'none';
      });
      updateSuggestionApplyState();
    });
  });
}

function applySuggestionProducts(productNames) {
  if (!productNames || !productNames.length) return;
  state.addRows = productNames.map(name => {
    const product = getProduct(name);
    return createEmptyRow(product?.name || name, product?.category || state.currentCategory);
  });
  const firstProduct = getProduct(productNames[0]);
  if (firstProduct?.category) state.currentCategory = firstProduct.category;
  const allWater = productNames.every(name => normalizePhrase(name) === 'вода');
  const mealTypeInput = document.getElementById('meal-type');
  if (mealTypeInput && allWater) mealTypeInput.value = WATER_MEAL_NAME;
  syncCategoryControls();
  renderAddRows();
  renderDayTotalsCard();
  renderAddMealSuggestion();
}

function applySuggestionSelection() {
  applySuggestionProducts(collectSelectedSuggestionProducts().filter(name => getProduct(name)));
  closeSuggestionModal();
}

function applySuggestionExample(example) {
  const mealTypeInput = document.getElementById('meal-type');
  const currentMealType = normalizeMealTypeForBuilder(mealTypeInput?.value || 'Завтрак');
  const productNames = resolveSuggestionProducts(example, currentMealType);
  if (!productNames.length) {
    closeSuggestionModal();
    alert('Не удалось собрать набор из этой подсказки. Попробуй выбрать продукты вручную.');
    return;
  }
  state.addRows = productNames.map(name => {
    const product = getProduct(name);
    return createEmptyRow(product?.name || name, product?.category || state.currentCategory);
  });
  const firstProduct = getProduct(productNames[0]);
  if (firstProduct?.category) state.currentCategory = firstProduct.category;
  if (productNames.every(name => normalizePhrase(name) === 'вода') && mealTypeInput) {
    mealTypeInput.value = WATER_MEAL_NAME;
  }
  syncCategoryControls();
  renderAddRows();
  renderDayTotalsCard();
  renderAddMealSuggestion();
  closeSuggestionModal();
}

function resolveTokenCategories(token) {
  const t = normalizePhrase(token);

  if (t.includes('хлеб') || t === 'хлебцы')
    return [{ label: 'Хлеб и хлебцы', products: getCategoryProducts('Хлеб и хлебцы') }];

  if (t === 'салат' || t === 'овощи' || t.includes('овощ'))
    return [{ label: 'Овощи и салаты', products: getCategoryProducts('Овощи и салаты') }];

  if (t === 'гарнир' || t === 'гарниры' || t.includes('гарнир'))
    return [{ label: 'Каши, крупы и гарниры', products: getCategoryProducts('Каши, крупы и гарниры') }];

  if (t === 'каша' || t.includes('каш'))
    return [{ label: 'Каши', products: getCategoryProducts('Каши, крупы и гарниры').filter(n => {
      const p = getProduct(n);
      return p && (p.tags.includes('porridge') || normalizePhrase(n).includes('каш'));
    }) }];

  if (t === 'рыба' || t.includes('рыб') || t.includes('морепродукт'))
    return [{ label: 'Рыба и морепродукты', products: getCategoryProducts('Рыба и морепродукты') }];

  if (t === 'курица' || t === 'мясо' || t.includes('курц') || t.includes('птиц') || t.includes('мяс'))
    return [{ label: 'Птица и мясо', products: getCategoryProducts('Птица и мясо') }];

  if (t === 'белок' || t.includes('белков')) {
    const contextKey = getSuggestionMealContext();
    if (contextKey === 'breakfast') {
      return [{ label: 'Яйца и молочные', products: getCategoryProducts('Яйца и молочные продукты') }];
    }
    return [
      { label: 'Птица и мясо', products: getCategoryProducts('Птица и мясо') },
      { label: 'Рыба', products: getCategoryProducts('Рыба и морепродукты') }
    ];
  }

  if (t === 'суп' || t.includes('суп') || t.includes('первое'))
    return [{ label: 'Супы и первые блюда', products: getCategoryProducts('Супы и первые блюда') }];

  if (t === 'ягоды' || t.includes('ягод'))
    return [{ label: 'Ягоды', products: getCategoryProducts('Фрукты и ягоды').filter(n => {
      const p = getProduct(n);
      return p && (p.tags.includes('berry') || ['Клубника','Черника','Малина','Смородина чёрная','Вишня','Черешня'].includes(n));
    }) }];

  if (t === 'фрукт' || t.includes('фрукт'))
    return [{ label: 'Фрукты', products: getCategoryProducts('Фрукты и ягоды').filter(n => {
      const p = getProduct(n);
      return p && p.tags.includes('fruit') && !p.tags.includes('berry');
    }) }];

  if (t === 'орехи' || t.includes('орех'))
    return [{ label: 'Орехи', products: getCategoryProducts('Орехи, масла и добавки').filter(n => {
      const p = getProduct(n);
      return p && (p.tags.includes('nuts'));
    }) }];

  if (t.includes('йогурт') || t.includes('творог') || t.includes('молочн') || t.includes('кефир'))
    return [{ label: 'Молочные продукты', products: getCategoryProducts('Яйца и молочные продукты') }];

  if (t.includes('вода') || t.includes('напит'))
    return [{ label: 'Напитки', products: getCategoryProducts('Напитки') }];

  if (t.includes('яйц') || t.includes('омлет') || t.includes('яичниц'))
    return [{ label: 'Яйца и молочные', products: getCategoryProducts('Яйца и молочные продукты') }];

  if (t.includes('выпечк') || t.includes('десерт') || t.includes('сладк'))
    return [{ label: 'Выпечка и десерты', products: getCategoryProducts('Тесто, выпечка и десерты') }];

  if (t.includes('готов') || t.includes('закуск'))
    return [{ label: 'Готовые блюда', products: getCategoryProducts('Готовые блюда и закуски') }];

  const direct = getProduct(token);
  if (direct) {
    return [{ label: direct.category, products: getCategoryProducts(direct.category) }];
  }

  for (const cat of getCategories()) {
    const prods = getCategoryProducts(cat).filter(n => normalizePhrase(n).includes(t));
    if (prods.length) return [{ label: cat, products: getCategoryProducts(cat) }];
  }

  return [];
}

function showSuggestionModal(example) {
  closeSuggestionModal();

  const parts = String(example || '').split('+').map(p => p.trim()).filter(Boolean);
  if (!parts.length) return;

  const tabs = parts.map((part, i) => {
    const groups = resolveTokenCategories(part);
    const allProducts = uniqueExistingProducts(groups.flatMap(g => g.products));
    return {
      id: `tab_${i}`,
      label: part,
      groups,
      allProducts,
    };
  });

  const selected = {};
  let activeTabId = tabs[0]?.id || '';

  const overlay = document.createElement('div');
  overlay.id = 'suggestion-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,20,20,.35);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:16px;';

  function getAmount(name) {
    if (selected[name]) return selected[name].amount;
    const p = getProduct(name);
    return p ? defaultAmountByUnit(p.unit) : 100;
  }

  function calcTotalCal() {
    return Math.round(Object.values(selected).reduce((sum, s) => {
      const p = getProduct(s.name);
      if (!p) return sum;
      const ratio = s.amount / getAmountBase(p.unit);
      return sum + p.calories * ratio;
    }, 0));
  }

  function buildTabsHtml() {
    if (tabs.length <= 1) return '';
    return `<div style="display:flex;gap:4px;margin-bottom:14px;">` +
      tabs.map(tab => {
        const hasSelected = Object.values(selected).some(s => s.tabLabel === tab.label);
        const isActive = tab.id === activeTabId;
        const dot = hasSelected
          ? `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${isActive ? '#fff' : '#657b58'};margin-left:5px;vertical-align:middle;"></span>`
          : '';
        return `<button data-sg-tab="${escapeHtml(tab.id)}"
          style="flex:1;background:transparent;border:none;
          border-bottom:2px solid ${isActive ? '#657b58' : '#e2e6dc'};
          padding:10px 4px;font-size:11px;font-weight:700;
          color:${isActive ? '#44563a' : '#7a866f'};cursor:pointer;line-height:1.3;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${escapeHtml(tab.label)}${dot}</button>`;
      }).join('') +
    `</div>`;
  }

  function buildSelectedSummary() {
    const items = Object.values(selected);
    if (!items.length) return '';
    return `<div style="margin-bottom:12px;">
      <div style="font-size:11px;font-weight:800;color:#7a866f;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Выбрано</div>
      ${items.map(s => {
        const p = getProduct(s.name);
        const unit = p ? getUnitLabel(p.unit) : 'г';
        const calPerUnit = p ? Math.round(p.calories / getAmountBase(p.unit) * s.amount) : 0;
        return `<div style="display:flex;align-items:center;justify-content:space-between;
          padding:8px 12px;border-radius:10px;background:#eef3ea;border:1px solid rgba(68,86,58,.18);margin-bottom:6px;">
          <span style="font-size:13px;font-weight:700;color:#44563a;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(s.name)}</span>
          <span style="display:flex;align-items:center;gap:6px;flex-shrink:0;margin-left:8px;">
            <button data-sg-amount-dec="${escapeHtml(s.name)}"
              style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(68,86,58,.25);
              background:#fff;color:#44563a;font-size:15px;font-weight:800;cursor:pointer;
              display:grid;place-items:center;line-height:1;padding:0;box-sizing:border-box;">−</button>
            <span style="font-size:12px;font-weight:700;color:#44563a;min-width:48px;text-align:center;">${s.amount} ${unit}</span>
            <button data-sg-amount-inc="${escapeHtml(s.name)}"
              style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(68,86,58,.25);
              background:#fff;color:#44563a;font-size:15px;font-weight:800;cursor:pointer;
              display:grid;place-items:center;line-height:1;padding:0;box-sizing:border-box;">+</button>
            <span style="font-size:11px;color:#7a866f;min-width:40px;text-align:right;">${calPerUnit} кк</span>
            <button data-sg-remove="${escapeHtml(s.name)}"
              style="width:22px;height:22px;border-radius:50%;border:1px solid rgba(169,77,73,.3);
              background:#f8e7e6;color:#a94d49;font-size:14px;font-weight:800;
              cursor:pointer;display:grid;place-items:center;line-height:1;padding:0;box-sizing:border-box;">×</button>
          </span>
        </div>`;
      }).join('')}
    </div>`;
  }

  function buildProductsHtml() {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return '';
    let html = '';
    activeTab.groups.forEach(group => {
      if (activeTab.groups.length > 1) {
        html += `<div style="font-size:11px;font-weight:800;color:#7a866f;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;margin-top:10px;">${escapeHtml(group.label)}</div>`;
      }
      group.products.forEach(name => {
        const p = getProduct(name);
        const cal = p ? `${Math.round(p.calories)} ккал/${p.unit === 'шт' ? 'шт' : '100 ' + getUnitLabel(p.unit)}` : '';
        const isChosen = Boolean(selected[name]);
        html += `<button data-sg-product="${escapeHtml(name)}" data-sg-tab-label="${escapeHtml(activeTab.label)}"
          style="display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;
          padding:12px 14px;margin-bottom:6px;border-radius:12px;cursor:pointer;gap:8px;
          border:2px solid ${isChosen ? '#657b58' : 'rgba(68,86,58,.12)'};
          background:${isChosen ? '#eef3ea' : '#faf8f4'};
          color:${isChosen ? '#44563a' : '#1f231d'};font-size:14px;font-weight:600;">
          <span style="display:flex;align-items:center;gap:8px;">
            ${isChosen
              ? `<span style="width:18px;height:18px;border-radius:50%;background:#657b58;color:#fff;font-size:11px;display:grid;place-items:center;flex-shrink:0;">✓</span>`
              : `<span style="width:18px;height:18px;border-radius:50%;border:2px solid #d0d5cc;flex-shrink:0;"></span>`}
            ${escapeHtml(name)}
          </span>
          <span style="font-size:11px;color:#7a866f;white-space:nowrap;flex-shrink:0;">${escapeHtml(cal)}</span>
        </button>`;
      });
    });
    return html || '<div style="color:#7a866f;font-size:13px;padding:10px 0;">Нет продуктов в этой категории.</div>';
  }

  function getStep(unit) {
    if (unit === 'шт') return 1;
    if (unit === 'мл') return 50;
    return 25;
  }

  function render() {
    const hasAny = Object.keys(selected).length > 0;
    const totalCal = calcTotalCal();
    overlay.innerHTML = `
      <div style="width:min(560px,100%);max-height:86vh;display:flex;flex-direction:column;
        background:#fff;border-radius:24px;padding:20px;box-shadow:0 20px 40px rgba(0,0,0,.14);">
        <div style="font-size:13px;font-weight:700;color:#7a866f;margin-bottom:4px;">подсказка по выбору</div>
        <div style="font-size:20px;font-weight:800;color:#23311f;margin-bottom:14px;">Собери по базе</div>
        ${buildTabsHtml()}
        <div style="overflow-y:auto;flex:1;min-height:0;">
          ${buildSelectedSummary()}
          <div style="font-size:11px;font-weight:800;color:#7a866f;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">
            ${escapeHtml(tabs.find(t => t.id === activeTabId)?.label || '')}
          </div>
          ${buildProductsHtml()}
        </div>
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;">
          ${hasAny ? `<button id="sg-apply-btn"
            style="width:100%;padding:14px;border-radius:14px;border:none;
            background:linear-gradient(135deg,#657b58,#44563a);color:#fff;
            font-size:15px;font-weight:800;cursor:pointer;">
            Добавить набор${totalCal ? ` • ${totalCal} ккал` : ''}</button>` : ''}
          <button id="sg-cancel-btn"
            style="width:100%;padding:13px;border-radius:14px;
            border:1px solid #d7dccf;background:#fff;color:#23311f;
            font-size:15px;font-weight:700;cursor:pointer;">Отмена</button>
        </div>
      </div>`;

    overlay.querySelectorAll('[data-sg-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTabId = btn.getAttribute('data-sg-tab');
        render();
      });
    });

    overlay.querySelectorAll('[data-sg-product]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-sg-product');
        const tabLabel = btn.getAttribute('data-sg-tab-label');
        if (selected[name]) {
          delete selected[name];
        } else {
          const p = getProduct(name);
          selected[name] = { name, tabLabel, amount: p ? defaultAmountByUnit(p.unit) : 100 };
        }
        render();
      });
    });

    overlay.querySelectorAll('[data-sg-amount-dec]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const name = btn.getAttribute('data-sg-amount-dec');
        if (!selected[name]) return;
        const p = getProduct(name);
        const step = getStep(p?.unit);
        const min = p?.unit === 'шт' ? 1 : step;
        selected[name].amount = Math.max(min, (selected[name].amount || step) - step);
        render();
      });
    });

    overlay.querySelectorAll('[data-sg-amount-inc]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const name = btn.getAttribute('data-sg-amount-inc');
        if (!selected[name]) return;
        const p = getProduct(name);
        selected[name].amount = (selected[name].amount || getStep(p?.unit)) + getStep(p?.unit);
        render();
      });
    });

    overlay.querySelectorAll('[data-sg-remove]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        delete selected[btn.getAttribute('data-sg-remove')];
        render();
      });
    });

    overlay.querySelector('#sg-apply-btn')?.addEventListener('click', () => {
      const productNames = Object.keys(selected);
      if (!productNames.length) return;
      state.addRows = productNames.map(name => {
        const product = getProduct(name);
        const row = createEmptyRow(product?.name || name, product?.category || state.currentCategory);
        row.amount = selected[name].amount;
        return row;
      });
      const firstProduct = getProduct(productNames[0]);
      if (firstProduct?.category) state.currentCategory = firstProduct.category;
      syncCategoryControls();
      renderAddRows();
      renderDayTotalsCard();
      renderAddMealSuggestion();
      closeSuggestionModal();
    });

    overlay.querySelector('#sg-cancel-btn').addEventListener('click', closeSuggestionModal);
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) closeSuggestionModal(); });
  document.body.appendChild(overlay);
  render();
}

function addProductsToMealSlot(mealType, productNames, dateStr) {
  const safeDate = toDateInputValue(dateStr || state.selectedDate || getTodayDate());
  const diary = Storage.getDiary();
  const meals = diary[safeDate] || [];

  const existingIndex = meals.findIndex(m => normalizeMealDisplayName(m) === mealType);

  const newProducts = productNames.map(name => {
    const p = getProduct(name);
    return { name, amount: p ? defaultAmountByUnit(p.unit) : 100, unit: p?.unit || 'гр', tags: p?.tags || [] };
  }).filter(Boolean);

  if (!newProducts.length) return;

  if (existingIndex >= 0) {
    const existing = meals[existingIndex];
    const merged = [...(existing.products || []), ...newProducts];

    let cal = 0, prot = 0, fat = 0, carb = 0;
    merged.forEach(prod => {
      const p = getProduct(prod.name);
      if (!p) return;
      const ratio = prod.amount / getAmountBase(p.unit);
      cal  += p.calories * ratio;
      prot += p.protein  * ratio;
      fat  += p.fats     * ratio;
      carb += p.carbs    * ratio;
    });

    meals[existingIndex] = {
      ...existing,
      products: merged,
      calories: Math.round(cal),
      protein: round1(prot),
      fats: round1(fat),
      carbs: round1(carb)
    };
    diary[safeDate] = meals;
    Storage.saveDiary(diary);
  } else {
    let cal = 0, prot = 0, fat = 0, carb = 0;
    newProducts.forEach(prod => {
      const p = getProduct(prod.name);
      if (!p) return;
      const ratio = prod.amount / getAmountBase(p.unit);
      cal  += p.calories * ratio;
      prot += p.protein  * ratio;
      fat  += p.fats     * ratio;
      carb += p.carbs    * ratio;
    });
    Storage.saveMeal(safeDate, {
      time: getCurrentTimeStr(),
      name: mealType,
      comment: '',
      calories: Math.round(cal),
      protein: round1(prot),
      fats: round1(fat),
      carbs: round1(carb),
      products: newProducts
    });
  }

  renderHome();
  renderDiary();
  renderTips();
}

function getCurrentMealSlot(dateStr) {
  const date = dateStr || state.selectedDate || getTodayDate();
  const analysis = getDayAnalysis(date);
  const stage = getCurrentNutritionStage(analysis);
  if (stage === NutritionStage.BREAKFAST) return 'Завтрак';
  if (stage === NutritionStage.LUNCH) return 'Обед';
  if (stage === NutritionStage.DINNER) return 'Ужин';
  return null;
}

function saveItemsToMealSlot(mealType, items, dateStr) {
  const safeDate = toDateInputValue(dateStr || state.selectedDate || getTodayDate());

  const newProducts = items.map(({ name, amount }) => {
    const p = getProduct(name);
    if (!p) return null;
    return { name, amount, unit: p.unit, tags: p.tags || [] };
  }).filter(Boolean);

  if (!newProducts.length) return;

  function calcNutrition(products) {
    let cal = 0, prot = 0, fat = 0, carb = 0;
    products.forEach(prod => {
      const p = getProduct(prod.name);
      if (!p) return;
      const ratio = prod.amount / getAmountBase(p.unit);
      cal  += p.calories * ratio;
      prot += p.protein  * ratio;
      fat  += p.fats     * ratio;
      carb += p.carbs    * ratio;
    });
    return { cal: Math.round(cal), prot: round1(prot), fat: round1(fat), carb: round1(carb) };
  }

  const diary = Storage.getDiary();
  const meals = diary[safeDate] || [];
  const existingIndex = meals.findIndex(m => normalizeMealDisplayName(m) === mealType);

  if (existingIndex >= 0) {
    const existing = meals[existingIndex];
    const merged = [...(existing.products || []), ...newProducts];
    const n = calcNutrition(merged);
    meals[existingIndex] = { ...existing, products: merged, calories: n.cal, protein: n.prot, fats: n.fat, carbs: n.carb };
    diary[safeDate] = meals;
    Storage.saveDiary(diary);
  } else {
    const n = calcNutrition(newProducts);
    Storage.saveMeal(safeDate, {
      time: getCurrentTimeStr(), name: mealType, comment: '',
      calories: n.cal, protein: n.prot, fats: n.fat, carbs: n.carb,
      products: newProducts
    });
  }

  renderHome(); renderDiary(); renderTips();
}

function openSuggestionExample(example) {
  const today = getTodayDate();
  const mealSlot = getCurrentMealSlot(today);

  if (example.includes('Вода') || normalizePhrase(example).includes('вода')) {
    addWaterForDate(today);
    return;
  }

  closeSuggestionModal();

  const parts = String(example || '').split('+').map(p => p.trim()).filter(Boolean);
  if (!parts.length) return;

  const tabs = parts.map((part, i) => {
    const groups = resolveTokenCategories(part);
    const allProducts = uniqueExistingProducts(groups.flatMap(g => g.products));
    return { id: `tab_${i}`, label: part, groups, allProducts };
  });

  const selected = {};
  let activeTabId = tabs[0]?.id || '';
  const overlay = document.createElement('div');
  overlay.id = 'suggestion-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,20,20,.35);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:16px;';

  function getStep(unit) { return unit === 'шт' ? 1 : unit === 'мл' ? 50 : 25; }
  function calcTotal() {
    return Math.round(Object.values(selected).reduce((sum, s) => {
      const p = getProduct(s.name);
      if (!p) return sum;
      return sum + p.calories / getAmountBase(p.unit) * s.amount;
    }, 0));
  }

  function buildTabsHtml() {
    if (tabs.length <= 1) return '';
    return `<div style="display:flex;gap:4px;margin-bottom:14px;">` +
      tabs.map(tab => {
        const has = Object.values(selected).some(s => s.tabLabel === tab.label);
        const active = tab.id === activeTabId;
        const dot = has ? `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${active ? '#fff' : '#657b58'};margin-left:5px;vertical-align:middle;"></span>` : '';
        return `<button data-sg-tab="${escapeHtml(tab.id)}"
          style="flex:1;background:transparent;border:none;border-bottom:2px solid ${active ? '#657b58' : '#e2e6dc'};
          padding:10px 4px;font-size:11px;font-weight:700;color:${active ? '#44563a' : '#7a866f'};cursor:pointer;">
          ${escapeHtml(tab.label)}${dot}</button>`;
      }).join('') + `</div>`;
  }

  function buildSelectedSummary() {
    const items = Object.values(selected);
    if (!items.length) return '';
    return `<div style="margin-bottom:12px;">
      <div style="font-size:11px;font-weight:800;color:#7a866f;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Выбрано</div>
      ${items.map(s => {
        const p = getProduct(s.name); const unit = p ? getUnitLabel(p.unit) : 'г';
        const cal = p ? Math.round(p.calories / getAmountBase(p.unit) * s.amount) : 0;
        const step = getStep(p?.unit); const min = p?.unit === 'шт' ? 1 : step;
        return `<div style="display:flex;align-items:center;justify-content:space-between;
          padding:8px 12px;border-radius:10px;background:#eef3ea;border:1px solid rgba(68,86,58,.18);margin-bottom:6px;">
          <span style="font-size:13px;font-weight:700;color:#44563a;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(s.name)}</span>
          <span style="display:flex;align-items:center;gap:5px;flex-shrink:0;margin-left:8px;">
            <button data-sg-dec="${escapeHtml(s.name)}" style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(68,86,58,.25);background:#fff;color:#44563a;font-size:15px;font-weight:800;cursor:pointer;display:grid;place-items:center;padding:0;box-sizing:border-box;">−</button>
            <span style="font-size:12px;font-weight:700;color:#44563a;min-width:54px;text-align:center;">${s.amount} ${unit}</span>
            <button data-sg-inc="${escapeHtml(s.name)}" style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(68,86,58,.25);background:#fff;color:#44563a;font-size:15px;font-weight:800;cursor:pointer;display:grid;place-items:center;padding:0;box-sizing:border-box;">+</button>
            <span style="font-size:11px;color:#7a866f;min-width:38px;text-align:right;">${cal} кк</span>
            <button data-sg-remove="${escapeHtml(s.name)}" style="width:22px;height:22px;border-radius:50%;border:1px solid rgba(169,77,73,.3);background:#f8e7e6;color:#a94d49;font-size:14px;font-weight:800;cursor:pointer;display:grid;place-items:center;padding:0;box-sizing:border-box;">×</button>
          </span>
        </div>`;
      }).join('')}
    </div>`;
  }

  function buildProductsHtml() {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return '';
    let html = '';
    activeTab.groups.forEach(group => {
      if (activeTab.groups.length > 1) html += `<div style="font-size:11px;font-weight:800;color:#7a866f;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;margin-top:10px;">${escapeHtml(group.label)}</div>`;
      group.products.forEach(name => {
        const p = getProduct(name);
        const cal = p ? `${Math.round(p.calories)} ккал/${p.unit === 'шт' ? 'шт' : '100 ' + getUnitLabel(p.unit)}` : '';
        const isChosen = Boolean(selected[name]);
        html += `<button data-sg-product="${escapeHtml(name)}" data-sg-tab-label="${escapeHtml(activeTab.label)}"
          style="display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;
          padding:12px 14px;margin-bottom:6px;border-radius:12px;cursor:pointer;gap:8px;
          border:2px solid ${isChosen ? '#657b58' : 'rgba(68,86,58,.12)'};
          background:${isChosen ? '#eef3ea' : '#faf8f4'};color:${isChosen ? '#44563a' : '#1f231d'};font-size:14px;font-weight:600;">
          <span style="display:flex;align-items:center;gap:8px;min-width:0;">
            ${isChosen ? `<span style="width:18px;height:18px;border-radius:50%;background:#657b58;color:#fff;font-size:11px;display:grid;place-items:center;flex-shrink:0;padding:0;box-sizing:border-box;">✓</span>` : `<span style="width:18px;height:18px;border-radius:50%;border:2px solid #d0d5cc;flex-shrink:0;"></span>`}
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(name)}</span>
          </span>
          <span style="font-size:11px;color:#7a866f;white-space:nowrap;flex-shrink:0;">${escapeHtml(cal)}</span>
        </button>`;
      });
    });
    return html || '<div style="color:#7a866f;font-size:13px;padding:10px 0;">Нет продуктов.</div>';
  }

  const slotLabel = mealSlot ? ` в ${mealSlot.toLowerCase()}` : '';
  const confirmLabel = mealSlot ? `Добавить${slotLabel}` : 'Добавить в форму';

  function render() {
    const hasAny = Object.keys(selected).length > 0;
    const total = calcTotal();
    overlay.innerHTML = `
      <div style="width:min(560px,100%);max-height:86vh;display:flex;flex-direction:column;
        background:#fff;border-radius:24px;padding:20px;box-shadow:0 20px 40px rgba(0,0,0,.14);">
        <div style="font-size:13px;font-weight:700;color:#7a866f;margin-bottom:4px;">подсказка по выбору</div>
        <div style="font-size:20px;font-weight:800;color:#23311f;margin-bottom:14px;">Собери по базе</div>
        ${buildTabsHtml()}
        <div style="overflow-y:auto;flex:1;min-height:0;">
          ${buildSelectedSummary()}
          <div style="font-size:11px;font-weight:800;color:#7a866f;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">
            ${escapeHtml(tabs.find(t => t.id === activeTabId)?.label || '')}
          </div>
          ${buildProductsHtml()}
        </div>
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;">
          ${hasAny ? `<button id="sg-apply-btn" style="width:100%;padding:14px;border-radius:14px;border:none;
            background:linear-gradient(135deg,#657b58,#44563a);color:#fff;font-size:15px;font-weight:800;cursor:pointer;">
            ${escapeHtml(confirmLabel)}${total ? ` • ${total} ккал` : ''}</button>` : ''}
          <button id="sg-cancel-btn" style="width:100%;padding:13px;border-radius:14px;
            border:1px solid #d7dccf;background:#fff;color:#23311f;font-size:15px;font-weight:700;cursor:pointer;">Отмена</button>
        </div>
      </div>`;

    overlay.querySelectorAll('[data-sg-tab]').forEach(btn => {
      btn.addEventListener('click', () => { activeTabId = btn.getAttribute('data-sg-tab'); render(); });
    });
    overlay.querySelectorAll('[data-sg-product]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-sg-product');
        const tabLabel = btn.getAttribute('data-sg-tab-label');
        if (selected[name]) { delete selected[name]; }
        else { const p = getProduct(name); selected[name] = { name, tabLabel, amount: p ? defaultAmountByUnit(p.unit) : 100 }; }
        render();
      });
    });
    overlay.querySelectorAll('[data-sg-dec]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation(); const name = btn.getAttribute('data-sg-dec'); if (!selected[name]) return;
        const p = getProduct(name); const step = getStep(p?.unit); const min = p?.unit === 'шт' ? 1 : step;
        selected[name].amount = Math.max(min, selected[name].amount - step); render();
      });
    });
    overlay.querySelectorAll('[data-sg-inc]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation(); const name = btn.getAttribute('data-sg-inc'); if (!selected[name]) return;
        const p = getProduct(name); selected[name].amount += getStep(p?.unit); render();
      });
    });
    overlay.querySelectorAll('[data-sg-remove]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation(); delete selected[btn.getAttribute('data-sg-remove')]; render();
      });
    });
    overlay.querySelector('#sg-apply-btn')?.addEventListener('click', () => {
      const items = Object.values(selected);
      if (!items.length) return;
      if (mealSlot && state.currentScreen !== 'screen-add') {
        saveItemsToMealSlot(mealSlot, items, today);
      } else if (state.currentScreen === 'screen-add') {
        items.forEach(({ name, amount }) => {
          const product = getProduct(name);
          const row = createEmptyRow(name, product?.category || state.currentCategory);
          row.amount = amount;
          state.addRows.push(row);
        });
        renderAddRows(); renderDayTotalsCard(); renderAddMealSuggestion();
      } else {
        saveItemsToMealSlot('Перекус', items, today);
      }
      overlay.remove();
    });
    overlay.querySelector('#sg-cancel-btn').addEventListener('click', () => overlay.remove());
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  render();
}

function renderExampleChip(example) {
  return `<button class="chip" type="button" onclick="openSuggestionExample('${escapeHtml(example)}')">${escapeHtml(example)}</button>`;
}

function renderTipCard(tip) {
  const categoriesHtml = Array.isArray(tip.categories) && tip.categories.length
    ? `<div class="top-space"><div class="helper-text">Подходящие категории</div><div class="category-chip-list">${tip.categories.map(category => renderClickableChip(category, category)).join('')}</div></div>`
    : '';
  const examplesHtml = Array.isArray(tip.examples) && tip.examples.length
    ? `<div class="top-space"><div class="helper-text">Подсказки по выбору</div><div class="category-chip-list">${tip.examples.map(example => renderExampleChip(example)).join('')}</div></div>`
    : '';
  return `<div class="tip-card"><div class="tip-label">${escapeHtml(tip.label)}</div><div class="tip-title">${escapeHtml(tip.title)}</div><div class="tip-text">${escapeHtml(tip.text)}</div>${categoriesHtml}${examplesHtml}</div>`;
}

function getDateOffset(baseDateStr, offsetDays) {
  const safeBase = toDateInputValue(baseDateStr);
  const [year, month, day] = safeBase.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offsetDays);
  return toDateInputValue(date);
}

function getRecentDates(daysCount = 7, endDateStr = getTodayDate()) {
  const dates = [];
  for (let i = daysCount - 1; i >= 0; i -= 1) {
    dates.push(getDateOffset(endDateStr, -i));
  }
  return dates;
}

function getFirstMealByType(meals, mealType) {
  return meals.find(meal => normalizeMealDisplayName(meal) === mealType) || null;
}

function getDominantPattern(day) {
  if (!day.mealsCount) return 'empty';
  if (day.waterMl >= day.waterTarget * 0.8 && day.breakfastBalanced && day.lunchBalanced) return 'structured';
  if (!day.breakfastBalanced) return 'weak_breakfast';
  if (!day.lunchBalanced) return 'weak_lunch';
  if (!day.dinnerBalanced) return 'weak_dinner';
  return 'mixed';
}

function getDayAnalysis(dateStr) {
  const meals = getSortedMeals(dateStr);
  const stats = Storage.getDayStats(dateStr);
  const profile = Storage.getProfile();
  const waterTarget = getWaterTarget(profile);
  const allProducts = meals.flatMap(meal => (meal.products || []).map(product => ({ ...product, tags: product.tags || getProductTags(product.name) })));
  const waterMl = sumAmountByTag(allProducts, 'water', ['мл']);
  const drinkMl = sumAmountByTag(allProducts, 'drink', ['мл']);
  const sweetDrinkMl = sumAmountByTag(allProducts, 'sweet_drink', ['мл']);
  const breakfastMeal = getFirstMealByType(meals, 'Завтрак');
  const lunchMeal = getFirstMealByType(meals, 'Обед');
  const dinnerMeal = getFirstMealByType(meals, 'Ужин');
  const breakfastEvaluation = evaluateMealByType('Завтрак', breakfastMeal, getGoalMealProfile(profile?.goal, 'Завтрак'));
  const lunchEvaluation = evaluateMealByType('Обед', lunchMeal, getGoalMealProfile(profile?.goal, 'Обед'));
  const dinnerEvaluation = evaluateMealByType('Ужин', dinnerMeal, getGoalMealProfile(profile?.goal, 'Ужин'));
  const waterTrack = evaluateWaterTrack({ waterMl, waterTarget });
  return {
    date: dateStr, meals, mealsCount: meals.length, calories: Number(stats.calories) || 0,
    protein: Number(stats.protein) || 0, fats: Number(stats.fats) || 0, carbs: Number(stats.carbs) || 0,
    waterMl, drinkMl, sweetDrinkMl, waterTarget, waterStartDone: waterTrack.waterStartDone,
    breakfastMeal, lunchMeal, dinnerMeal, breakfastBalanced: breakfastEvaluation.isBalanced,
    lunchBalanced: lunchEvaluation.isBalanced, dinnerBalanced: dinnerEvaluation.isBalanced,
    dominantPattern: getDominantPattern({ mealsCount: meals.length, waterMl, waterTarget, breakfastBalanced: breakfastEvaluation.isBalanced, lunchBalanced: lunchEvaluation.isBalanced, dinnerBalanced: dinnerEvaluation.isBalanced })
  };
}

function generateTips() {
  const profile = Storage.getProfile();
  const todayStr = getTodayDate();
  const today = getDayAnalysis(todayStr);
  const recent = getRecentDates(7, todayStr).map(getDayAnalysis);
  const activeDays = recent.filter(day => day.mealsCount > 0);
  const stage = getCurrentNutritionStage(today);
  const tips = [];
  if (!profile?.name) tips.push(buildTip('старт', 'Заполни профиль', 'Так советы по этапам дня и цели будут точнее.', 100, 'system'));
  tips.push(buildStageTip(stage, profile, today));
  if (activeDays.length >= 3) {
    const lowWaterDays = activeDays.filter(day => day.waterMl < day.waterTarget * 0.5).length;
    const weakBreakfastDays = activeDays.filter(day => !day.breakfastBalanced).length;
    const weakLunchDays = activeDays.filter(day => !day.lunchBalanced).length;
    const weakDinnerDays = activeDays.filter(day => !day.dinnerBalanced).length;
    if (lowWaterDays >= 3) tips.push(buildTip('паттерн', 'Вода в течение недели проседает', 'Похоже, вода выпадает не случайно. Лучше встроить её в понятные точки дня.', 86, 'pattern', { categories: ['Напитки'].filter(c => getCategories().includes(c)), examples: ['Вода утром', 'Вода до обеда', 'Вода днём'] }));
    if (weakBreakfastDays >= 3) tips.push(buildTip('паттерн', 'Завтрак часто остаётся без опоры', 'Похоже, утром не хватает устойчивой базы.', 84, 'pattern', { categories: getStageCategories(NutritionStage.BREAKFAST), examples: getStageExamples(NutritionStage.BREAKFAST, profile) }));
    if (weakLunchDays >= 3) tips.push(buildTip('паттерн', 'Обед часто собирается не до конца', 'Когда в обеде нет белка, овощей или супа, день становится более рваным.', 82, 'pattern', { categories: getStageCategories(NutritionStage.LUNCH), examples: getStageExamples(NutritionStage.LUNCH, profile) }));
    if (weakDinnerDays >= 3) tips.push(buildTip('паттерн', 'Ужин регулярно собирается с перекосом', 'Здесь лучше сработает мягкий сценарий: белок + овощи или суп.', 80, 'pattern', { categories: getStageCategories(NutritionStage.DINNER), examples: getStageExamples(NutritionStage.DINNER, profile) }));
  }
  if (today.breakfastBalanced && today.lunchBalanced && today.dinnerBalanced && today.waterMl >= today.waterTarget * 0.7) {
    tips.push(buildTip('похвала', 'Сегодня день собран очень достойно', 'У тебя собраны все основные этапы дня и вода идёт нормально.', 65, 'positive'));
  } else {
    tips.push(buildTip('поддержка', 'Лучше идти по этапам, чем гнаться за идеалом', 'Сначала собираем воду, потом завтрак, затем обед и ужин.', 52, 'positive'));
  }
  const uniqueTips = [];
  const seenTitles = new Set();
  tips.sort((a, b) => b.score - a.score).forEach(tip => { if (!seenTitles.has(tip.title)) { seenTitles.add(tip.title); uniqueTips.push(tip); } });
  const finalTips = [];
  ['system', 'today', 'pattern', 'positive'].forEach(type => { const found = uniqueTips.find(tip => tip.type === type); if (found && !finalTips.some(item => item.title === found.title)) finalTips.push(found); });
  for (const tip of uniqueTips) { if (finalTips.length >= 4) break; if (!finalTips.some(item => item.title === tip.title)) finalTips.push(tip); }
  return finalTips.slice(0, 4);
}

function renderTips() {
  const tips = generateTips();
  document.getElementById('tips-list').innerHTML = tips.map(renderTipCard).join('');
}

function renderProfile() {
  const profile = Storage.getProfile() || {};
  document.getElementById('profile-name').value = profile.name || '';
  document.getElementById('profile-age').value = profile.age || '';
  document.getElementById('profile-gender').value = profile.gender || '';
  document.getElementById('profile-weight').value = profile.weight || '';
  document.getElementById('profile-height').value = profile.height || '';
  document.getElementById('profile-goal').value = profile.goal || '';
  document.getElementById('profile-card-name').textContent = profile.name || 'Новый профиль';
  renderPhotoEverywhere();
}

function saveProfile() {
  const profile = {
    name: document.getElementById('profile-name').value.trim(),
    age: document.getElementById('profile-age').value,
    gender: document.getElementById('profile-gender').value,
    weight: document.getElementById('profile-weight').value,
    height: document.getElementById('profile-height').value,
    goal: document.getElementById('profile-goal').value
  };
  if (!profile.name || !profile.goal) {
    alert('Заполни минимум имя и цель.');
    return;
  }
  Storage.saveProfile(profile);
  Storage.completeFirstRun();
  renderProfile();
  renderHome();
  renderTips();
  openScreen('screen-home');
}

function resetProfile() {
  if (!confirm('Сбросить профиль и дневник?')) return;
  Storage.clearAll();
  PhotoManager.clear();
  state.selectedDate = getTodayDate();
  state.mealFormDate = getTodayDate();
  state.addRows = [];
  state.currentCategory = resolveInitialCategory();
  state.preselectedMealType = '';
  state.preselectedCategory = '';
  resetMealFormInputs({ keepDate: false });
  renderProfile();
  renderHome();
  renderDiary();
  renderTips();
  openScreen('screen-profile');
}

function fillProductsDataList(category = state.currentCategory) {
  const dataList = document.getElementById('products-list');
  if (!dataList) return;
  const products = getCategoryProducts(category);
  dataList.innerHTML = products.map(name => `<option value="${escapeHtml(name)}"></option>`).join('');
}

function fillCategories() {
  const select = document.getElementById('product-category');
  if (!select) return;
  const categories = getCategories();
  select.innerHTML = categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  select.value = ensureValidCurrentCategory();
}

function renderCategoryFilterChips() {
  const wrap = document.getElementById('category-filter-chips');
  if (!wrap) return;
  const categories = getCategories();
  wrap.innerHTML = categories.map(category =>
    `<button class="category-chip" data-category="${escapeHtml(category)}" type="button"
      onclick="openCategoryModal('${escapeHtml(category)}', {saveDirectly: false})"
    >${escapeHtml(category)}</button>`
  ).join('');
}

function getPrimarySuggestionForDate(dateStr) {
  const analysis = getDayAnalysis(dateStr);
  if (!analysis.breakfastMeal) {
    return { mealType: 'Завтрак', category: 'Яйца и молочные продукты', title: 'Следующий шаг — завтрак', text: 'На этой дате ещё нет завтрака. Логично начать с него.', button: 'Добавить завтрак' };
  }
  if (!analysis.lunchMeal) {
    return { mealType: 'Обед', category: 'Супы и первые блюда', title: 'Следующий шаг — обед', text: 'Завтрак уже есть. Теперь лучше перейти к обеду.', button: 'Добавить обед' };
  }
  if (!analysis.dinnerMeal) {
    return { mealType: 'Ужин', category: 'Рыба и морепродукты', title: 'Следующий шаг — ужин', text: 'Завтрак и обед уже сохранены. Дальше логично собрать ужин.', button: 'Добавить ужин' };
  }
  return { mealType: 'Перекус', category: 'Фрукты и ягоды', title: 'Основные приёмы уже есть', text: 'Теперь можно добавить лёгкий перекус.', button: 'Добавить перекус' };
}

function getSecondarySuggestionForDate(dateStr) {
  const analysis = getDayAnalysis(dateStr);
  const waterLow = analysis.waterMl < Math.max(250, Math.round(analysis.waterTarget * 0.35));
  if (waterLow) {
    return { mealType: WATER_MEAL_NAME, category: 'Напитки', title: 'Мягкий параллельный шаг — вода', text: `По воде пока отмечено около ${analysis.waterMl} мл. Можно добавить приём воды.`, button: 'Добавить приём воды' };
  }
  return null;
}

function renderAddScreenContext() {
  const sheet = document.querySelector('#screen-add .sheet');
  if (!sheet) return;
  let block = document.getElementById('add-screen-context');
  if (!block) {
    block = document.createElement('div');
    block.id = 'add-screen-context';
    block.className = 'card';
    block.style.marginBottom = '14px';
    sheet.prepend(block);
  }
  const dateStr = toDateInputValue(state.mealFormDate || state.selectedDate || getTodayDate());
  const meals = getSortedMeals(dateStr);
  const primary = getPrimarySuggestionForDate(dateStr);
  const secondary = getSecondarySuggestionForDate(dateStr);
  const mealsHtml = meals.length ? meals.map(meal => `<span class="chip">${escapeHtml(normalizeMealDisplayName(meal))} • ${escapeHtml(meal.time || '--:--')}</span>`).join('') : '<span class="helper-text">На эту дату пока нет записей.</span>';
  const secondaryHtml = secondary ? `<div class="top-space"><div class="helper-text">${escapeHtml(secondary.title)}</div><div class="card-subtitle no-margin">${escapeHtml(secondary.text)}</div></div>` : '';
  block.innerHTML = `<div class="card-title">Контекст дня</div><div class="card-subtitle">Дата: ${escapeHtml(formatDate(dateStr))}</div><div class="helper-text">Уже сохранено</div><div class="category-chip-list top-space">${mealsHtml}</div><div class="top-space"><div class="card-title" style="font-size:16px;">${escapeHtml(primary.title)}</div><div class="card-subtitle no-margin">${escapeHtml(primary.text)}</div></div>${secondaryHtml}`;
}

function buildDraftMealForEvaluation() {
  const totals = getDraftMealTotals();
  const products = (state.addRows || [])
    .filter(row => getProduct(row.productName) && Number(row.amount) > 0)
    .map(row => {
      const product = getProduct(row.productName);
      return {
        name: row.productName,
        amount: Number(row.amount) || 0,
        unit: row.unit || product?.unit || 'гр',
        tags: Array.isArray(product?.tags) ? product.tags : []
      };
    });
  return {
    name: normalizeMealTypeValue(getSafeMealTypeValue()),
    time: document.getElementById('meal-time')?.value || '',
    comment: document.getElementById('meal-comment')?.value || '',
    calories: totals.calories,
    protein: totals.protein,
    fats: totals.fats,
    carbs: totals.carbs,
    products
  };
}

function getSoftScenarioHint(evaluation) {
  if (!evaluation) return 'Для баланса хорошо бы добавить ещё один элемент';
  const categories = Array.isArray(evaluation.categories) ? evaluation.categories : [];
  const message = String(evaluation.message || '').trim();
  if (
    categories.includes('Яйца и молочные продукты') ||
    categories.includes('Птица и мясо') ||
    categories.includes('Рыба и морепродукты')
  ) return 'Для баланса хорошо бы добавить белковую основу';
  if (categories.includes('Овощи и салаты')) return 'Можно добавить овощи для более собранного приёма';
  if (categories.includes('Каши, крупы и гарниры')) return 'Можно усилить приём ещё одним продуктом';
  if (message) return message;
  return 'Для баланса хорошо бы добавить ещё один элемент';
}

function renderMealBuilderScenarioCard() {
  const container = document.getElementById('meal-builder-suggestion');
  if (!container) return;

  const mealType = normalizeMealTypeValue(getSafeMealTypeValue());

  const validRows = (state.addRows || []).filter(row =>
    getProduct(row.productName) && Number(row.amount) > 0
  );

  if (!validRows.length) {
    container.innerHTML = `
      <div class="scenario-hint-card scenario-hint--empty">
        <div class="scenario-hint-title">Начни с одного продукта или выбери категорию</div>
        <div class="scenario-hint-sub">Так будет проще собрать сбалансированный приём</div>
      </div>`;
    return;
  }

  if (mealType === WATER_MEAL_NAME) {
    container.innerHTML = `
      <div class="scenario-hint-card scenario-hint--ok">
        <div class="scenario-hint-title">Приём воды добавлен</div>
        <div class="scenario-hint-sub">Можно сохранить запись</div>
      </div>`;
    return;
  }

  const draftMeal = buildDraftMealForEvaluation();
  const profile = Storage.getProfile();
  const goalProfile = getGoalMealProfile(profile?.goal || 'maintain', mealType);
  const evaluation = evaluateMealByType(mealType, draftMeal, goalProfile);

  if (evaluation?.isBalanced) {
    container.innerHTML = `
      <div class="scenario-hint-card scenario-hint--ok">
        <div class="scenario-hint-title">${escapeHtml(mealType)} отвечает цели</div>
        <div class="scenario-hint-sub">Приём собран сбалансированно</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="scenario-hint-card scenario-hint--partial">
      <div class="scenario-hint-title">Можно добавить ещё продукт</div>
      <div class="scenario-hint-sub">${escapeHtml(getSoftScenarioHint(evaluation))}</div>
    </div>`;
}

function renderAddMealSuggestion() {
  renderMealBuilderScenarioCard();
}

function getTotalsCardElements() {
  return {
    title: document.querySelector('#add-totals-card .card-title'),
    subtitle: document.getElementById('calc-summary'),
    kcal: document.getElementById('total-kcal'),
    protein: document.getElementById('total-protein'),
    fats: document.getElementById('total-fats'),
    carbs: document.getElementById('total-carbs')
  };
}

function renderDayTotalsCard() {
  const safeDate = toDateInputValue(state.mealFormDate || state.selectedDate || getTodayDate());
  const saved = getSavedDayNutrition(safeDate);
  const draft = getDraftRowsNutrition();
  const els = getTotalsCardElements();
  if (!els.kcal || !els.protein || !els.fats || !els.carbs || !els.subtitle) return;

  const draftCal = Math.round(draft.calories);
  const totalCalories = Math.round(saved.calories + draft.calories);
  const totalProtein = round1(saved.protein + draft.protein);
  const totalFats = round1(saved.fats + draft.fats);
  const totalCarbs = round1(saved.carbs + draft.carbs);

  els.kcal.textContent = draftCal;
  els.protein.textContent = round1(draft.protein);
  els.fats.textContent = round1(draft.fats);
  els.carbs.textContent = round1(draft.carbs);

  if (els.subtitle) {
    els.subtitle.textContent = draft.productsCount
      ? `${draft.productsCount} продукт(а) в текущем приёме`
      : 'Добавь хотя бы один продукт.';
  }

  const impactBlock = document.getElementById('day-impact-block');
  const impactText = document.getElementById('day-impact-text');
  if (impactBlock && impactText && draft.productsCount > 0) {
    const profile = Storage.getProfile();
    const goalCal = inferGoalCalories(profile);
    const afterSave = totalCalories;
    const remaining = Math.max(0, goalCal - afterSave);
    impactText.textContent = `${afterSave} ккал за день • до цели останется ${remaining} ккал`;
    impactBlock.style.display = 'block';
  } else if (impactBlock) {
    impactBlock.style.display = 'none';
  }
}

function openAddScreenForDate(dateStr = getTodayDate()) {
  const safeDate = toDateInputValue(dateStr);
  state.selectedDate = safeDate;
  state.mealFormDate = safeDate;
  state.addRows = [];
  state.preselectedMealType = '';
  state.preselectedCategory = '';
  openScreen('screen-add');
}

function openAddScreenWithCategory(category, dateStr = state.selectedDate || getTodayDate()) {
  if (category && getCategories().includes(category)) {
    state.currentCategory = category;
  }
  openAddScreenForDate(dateStr);
}

function openAddScreenForStage(config = {}) {
  const safeDate = toDateInputValue(config.date || state.selectedDate || getTodayDate());
  state.selectedDate = safeDate;
  state.mealFormDate = safeDate;
  state.addRows = [];
  state.preselectedMealType = normalizeMealTypeValue(config.mealType);
  state.preselectedCategory = config.category && getCategories().includes(config.category) ? config.category : '';
  if (state.preselectedCategory) state.currentCategory = state.preselectedCategory;
  openScreen('screen-add');
}

function openScreen(id) {
  state.currentScreen = id;
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.toggle('active', screen.id === id);
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.open === id);
  });
  if (id === 'screen-home') renderHome();
  if (id === 'screen-diary') renderDiary();
  if (id === 'screen-add') setupAddScreen();
  if (id === 'screen-tips') renderTips();
  if (id === 'screen-profile') renderProfile();
}

function adjustRowAmount(id, delta, min = 1) {
  state.addRows = state.addRows.map(row => {
    if (row.id !== id) return row;
    const newAmt = Math.max(min, (Number(row.amount) || 0) + delta);
    return { ...row, amount: newAmt };
  });
  renderAddRows();
  renderDayTotalsCard();
  renderMealBuilderScenarioCard();
}

function renderMealTypeChips() {
  const wrap = document.getElementById('meal-type-chips');
  const select = document.getElementById('meal-type');
  if (!wrap || !select) return;
  const types = ['Завтрак', 'Обед', 'Ужин', 'Перекус', WATER_MEAL_NAME];
  const current = select.value || 'Завтрак';
  wrap.innerHTML = types.map(type => {
    const label = type === WATER_MEAL_NAME ? 'Вода' : type;
    const isActive = type === current;
    return `<button class="meal-type-chip ${isActive ? 'meal-type-chip--active' : ''}"
      data-meal-type="${escapeHtml(type)}" type="button">${escapeHtml(label)}</button>`;
  }).join('');
  wrap.querySelectorAll('[data-meal-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-meal-type');
      if (select) {
        let opt = Array.from(select.options).find(o => o.value === type);
        if (!opt) {
          opt = document.createElement('option');
          opt.value = type;
          opt.textContent = type;
          select.appendChild(opt);
        }
        select.value = type;
      }
      // Если выбран тип Вода — очищаем список продуктов и блокируем добавление
      if (type === WATER_MEAL_NAME) {
        state.addRows = [];
        renderAddRows();
        renderDayTotalsCard();
      }
      renderMealTypeChips();
      updateMealTimeReminder();
      updateMealDetailsStatus();
      updateSaveTimeHint();
      renderAddMealSuggestion();
      renderDayTotalsCard();
      renderMealBuilderScenarioCard();
    });
  });
}

function initDetailsAccordion() {
  const toggle = document.getElementById('meal-details-toggle');
  if (!toggle) return;
  setMealDetailsExpanded(toggle.getAttribute('aria-expanded') === 'true');
}

function setupAddScreen() {
  renderDateChip('add-date-chip', getTodayDate());
  ensureMealTypeOptions();

  const safeDate = toDateInputValue(state.mealFormDate || state.selectedDate || getTodayDate());
  state.mealFormDate = safeDate;

  const dateLabel = document.getElementById('add-screen-date-label');
  if (dateLabel) dateLabel.textContent = `На ${formatDate(safeDate)}`;

  const mealDate = document.getElementById('meal-date');
  const mealTime = document.getElementById('meal-time');
  if (mealDate) mealDate.value = safeDate;
  if (mealTime && !mealTime.value) {
    const now = new Date();
    mealTime.value = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  }

  const mealType = document.getElementById('meal-type');
  if (mealType && !state.addRows.length) {
    if (state.preselectedMealType) {
      ensureMealTypeOptions();
      mealType.value = state.preselectedMealType;
    } else {
      const primary = getPrimarySuggestionForDate(safeDate);
      ensureMealTypeOptions();
      mealType.value = normalizeMealTypeValue(primary.mealType);
    }
  }
  if (mealType) mealType.value = getSafeMealTypeValue();

  renderMealTypeChips();
  updateMealTimeReminder();
  updateMealDetailsStatus();
  updateSaveTimeHint();
  setMealDetailsExpanded(false);

  if (!document.getElementById('meal-details-toggle')?._bound) {
    initDetailsAccordion();
    const t = document.getElementById('meal-details-toggle');
    if (t) t._bound = true;
  }

  fillCategories();
  renderAddRows();
  renderAddScreenContext();
  renderDayTotalsCard();
  renderAddMealSuggestion();
  renderMealBuilderScenarioCard();
  requestAnimationFrame(() => {
    renderDayTotalsCard();
    renderMealBuilderScenarioCard();
  });
  state.preselectedMealType = '';
  state.preselectedCategory = '';
}

function renderAddRows() {
  const container = document.getElementById('meal-products');
  if (!container) return;
  
  const mealType = getSafeMealTypeValue();
  // Если тип Вода — скрываем список продуктов и показываем сообщение
  if (mealType === WATER_MEAL_NAME) {
    container.innerHTML = '<div class="card empty-state">Для добавления воды просто нажми «Сохранить запись»</div>';
    updateSaveTimeHint();
    return;
  }
  
  if (!state.addRows.length) {
    container.innerHTML = '<div class="card empty-state">Начни с одного продукта или выбери категорию</div>';
    updateSaveTimeHint();
    return;
  }
  
  container.innerHTML = state.addRows.map(row => {
    const nutrition = computeRowNutrition(row);
    const cal = nutrition ? Math.round(nutrition.calories) : 0;
    const unit = getUnitLabel(row.unit || 'гр');
    const p = getProduct(row.productName);
    const step = p?.unit === 'шт' ? 1 : p?.unit === 'мл' ? 50 : 25;
    const min = p?.unit === 'шт' ? 1 : step;
    return `
      <div class="add-product-item">
        <div class="add-product-item-main">
          <div class="add-product-item-name">${escapeHtml(row.productName || '—')}</div>
          <div class="add-product-item-cal">${cal} ккал</div>
        </div>
        <div class="add-product-item-controls">
          <button class="add-product-amt-btn" onclick="adjustRowAmount('${row.id}', ${-step}, ${min})" type="button">−</button>
          <span class="add-product-amt-val">${escapeHtml(String(row.amount))} ${unit}</span>
          <button class="add-product-amt-btn" onclick="adjustRowAmount('${row.id}', ${step}, ${min})" type="button">+</button>
          <button class="add-product-del-btn" onclick="removeProductRow('${row.id}')" type="button">удалить</button>
        </div>
      </div>`;
  }).join('');
  requestAnimationFrame(renderMealBuilderScenarioCard);
}

function addProductRow(productName = '', category = state.currentCategory) {
  state.addRows.push(createEmptyRow(productName, category));
  renderAddRows();
  renderDayTotalsCard();
  renderAddMealSuggestion();
}

function removeProductRow(id) {
  state.addRows = state.addRows.filter(row => row.id !== id);
  renderAddRows();
  renderDayTotalsCard();
  renderAddMealSuggestion();
}

function updateRowProduct(id, value) {
  state.addRows = state.addRows.map(row => {
    if (row.id !== id) return row;
    const product = getProduct(value);
    return { ...row, productName: value, amount: product ? defaultAmountByUnit(product.unit) : '', unit: product?.unit || 'гр', category: product?.category || row.category || state.currentCategory };
  });
  renderAddRows();
  renderDayTotalsCard();
  renderAddMealSuggestion();
}

function updateRowAmount(id, value) {
  state.addRows = state.addRows.map(row => {
    if (row.id !== id) return row;
    return { ...row, amount: value === '' ? '' : Math.max(0, Number(value) || 0) };
  });
  renderDayTotalsCard();
  renderAddMealSuggestion();
}

function searchAllProducts(query) {
  if (!query) return [];
  const q = normalizeSearchValue(query);
  const results = [];
  for (const category of getCategories()) {
    for (const name of getCategoryProducts(category)) {
      if (normalizeSearchValue(name).includes(q)) {
        results.push({ name, category });
      }
    }
  }
  results.sort((a, b) => {
    const an = normalizeSearchValue(a.name);
    const bn = normalizeSearchValue(b.name);
    const aStarts = an.startsWith(q) ? 0 : 1;
    const bStarts = bn.startsWith(q) ? 0 : 1;
    return aStarts - bStarts || an.localeCompare(bn, 'ru');
  });
  return results.slice(0, 20);
}

function renderGlobalSearchDropdown() {
  document.getElementById('global-search-dropdown')?.remove();

  const searchInput = document.getElementById('product-search');
  if (!searchInput) return;
  const query = searchInput.value.trim();
  if (!query) return;

  const results = searchAllProducts(query);
  if (!results.length) return;

  const rect = searchInput.getBoundingClientRect();
  const dd = document.createElement('div');
  dd.id = 'global-search-dropdown';
  dd.style.cssText = `
    position:fixed;
    left:${rect.left}px;
    top:${rect.bottom + 4}px;
    width:${rect.width}px;
    max-height:240px;
    overflow-y:auto;
    background:#fff;
    border-radius:12px;
    border:1px solid rgba(31,35,29,.14);
    box-shadow:0 8px 24px rgba(31,35,29,.12);
    z-index:10001;
  `;

  dd.innerHTML = results.map(({ name, category }) => `
    <button data-gs-name="${escapeHtml(name)}"
      style="display:flex;justify-content:space-between;align-items:center;
      width:100%;text-align:left;padding:11px 14px;border:none;border-bottom:1px solid rgba(31,35,29,.06);
      background:transparent;cursor:pointer;gap:8px;">
      <span style="font-size:14px;font-weight:600;color:#1f231d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${escapeHtml(name)}</span>
      <span style="font-size:11px;color:#7a866f;white-space:nowrap;flex-shrink:0;">${escapeHtml(category)}</span>
    </button>`).join('');

  dd.querySelectorAll('[data-gs-name]').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      const name = btn.getAttribute('data-gs-name');
      searchInput.value = name;
      dd.remove();
      addFromSearch();
    });
  });

  document.body.appendChild(dd);
}

function addFromSearch() {
  const searchInput = document.getElementById('product-search');
  const searchValue = searchInput ? searchInput.value.trim() : '';
  if (!searchValue) return;

  document.getElementById('global-search-dropdown')?.remove();

  const q = normalizeSearchValue(searchValue);
  let matchedName = '';
  for (const category of getCategories()) {
    const products = getCategoryProducts(category);
    const exact = products.find(n => normalizeSearchValue(n) === q);
    if (exact) { matchedName = exact; break; }
    const starts = products.find(n => normalizeSearchValue(n).startsWith(q));
    if (starts && !matchedName) matchedName = starts;
  }
  if (!matchedName) {
    for (const category of getCategories()) {
      const inc = getCategoryProducts(category).find(n => normalizeSearchValue(n).includes(q));
      if (inc) { matchedName = inc; break; }
    }
  }

  if (!matchedName) {
    alert('Продукт не найден. Попробуй другое название.');
    return;
  }

  const product = getProduct(matchedName);
  const row = createEmptyRow(matchedName, product?.category || state.currentCategory);
  state.addRows.push(row);
  renderAddRows();
  renderDayTotalsCard();
  renderAddMealSuggestion();
  searchInput.value = '';
}

function clearAllProducts() {
  if (!confirm('Очистить все выбранные продукты?')) return;
  state.addRows = [];
  const searchInput = document.getElementById('product-search');
  if (searchInput) searchInput.value = '';
  renderAddRows();
  renderDayTotalsCard();
  renderAddMealSuggestion();
}

function calculateMealTotals() {
  renderDayTotalsCard();
}

function saveMeal() {
  const mealType = getSafeMealTypeValue();
  const time = getMealTimeValue();
  if (!state.mealTimeTouched || !time) {
    updateSaveTimeHint();
  }
  
  // Если тип Вода — сохраняем воду напрямую
  if (mealType === WATER_MEAL_NAME) {
    addWaterForDate(state.mealFormDate || getTodayDate(), time || getCurrentTimeStr());
    state.mealTimeTouched = false;
    updateMealTimeReminder();
    updateMealDetailsStatus();
    updateSaveTimeHint();
    openScreen('screen-diary');
    return;
  }
  
  const activeRows = state.addRows.filter(row => getProduct(row.productName) && Number(row.amount) > 0);
  if (!activeRows.length) {
    alert('Добавь хотя бы один продукт.');
    return;
  }
  const saveDate = toDateInputValue(document.getElementById('meal-date').value || state.mealFormDate || getTodayDate());
  state.selectedDate = saveDate;
  state.mealFormDate = saveDate;
  const products = activeRows.map(row => {
    const product = getProduct(row.productName);
    return { name: row.productName, amount: Number(row.amount), unit: row.unit, tags: product?.tags || [] };
  });
  const draftTotals = getDraftMealTotals();

  const meal = {
    time: document.getElementById('meal-time').value || getCurrentTimeStr(),
    name: mealType,
    comment: document.getElementById('meal-comment').value.trim(),
    calories: draftTotals.calories,
    protein: draftTotals.protein,
    fats: draftTotals.fats,
    carbs: draftTotals.carbs,
    products
  };

  const mergeable = ['Завтрак', 'Обед', 'Ужин'];
  if (mergeable.includes(mealType)) {
    const diary = Storage.getDiary();
    const dayMeals = diary[saveDate] || [];
    const existingIndex = dayMeals.findIndex(m => normalizeMealDisplayName(m) === mealType);
    if (existingIndex >= 0) {
      const existing = dayMeals[existingIndex];
      const merged = [...(existing.products || []), ...products];
      let cal = 0, prot = 0, fat = 0, carb = 0;
      merged.forEach(prod => {
        const p = getProduct(prod.name);
        if (!p) return;
        const ratio = prod.amount / getAmountBase(p.unit);
        cal  += p.calories * ratio;
        prot += p.protein  * ratio;
        fat  += p.fats     * ratio;
        carb += p.carbs    * ratio;
      });
      dayMeals[existingIndex] = {
        ...existing,
        products: merged,
        calories: Math.round(cal),
        protein: round1(prot),
        fats: round1(fat),
        carbs: round1(carb)
      };
      diary[saveDate] = dayMeals;
      Storage.saveDiary(diary);
      state.addRows = [];
      state.preselectedMealType = '';
      state.preselectedCategory = '';
      resetMealFormInputs({ keepDate: true });
      state.mealTimeTouched = false;
      updateMealTimeReminder();
      updateMealDetailsStatus();
      updateSaveTimeHint();
      renderHome();
      renderDiary();
      renderTips();
      openScreen('screen-diary');
      return;
    }
  }

  Storage.saveMeal(saveDate, meal);
  state.addRows = [];
  state.preselectedMealType = '';
  state.preselectedCategory = '';
  state.mealTimeTouched = false;
  resetMealFormInputs({ keepDate: true });
  updateMealTimeReminder();
  updateMealDetailsStatus();
  updateSaveTimeHint();
  renderHome();
  renderDiary();
  renderTips();
  openScreen('screen-diary');
}

function cancelMeal() {
  if (state.addRows.length && !confirm('Отменить добавление? Все выбранные продукты будут потеряны.')) return;
  state.addRows = [];
  state.mealFormDate = getTodayDate();
  state.preselectedMealType = '';
  state.preselectedCategory = '';
  resetMealFormInputs({ keepDate: false });
  openScreen('screen-home');
}

function bindEvents() {
  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => openScreen(button.dataset.open));
  });
  document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
  document.getElementById('reset-profile-btn').addEventListener('click', resetProfile);
  document.getElementById('save-meal-btn').addEventListener('click', saveMeal);
  document.getElementById('cancel-meal-btn').addEventListener('click', cancelMeal);
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addFromSearch();
      }
    });
    searchInput.addEventListener('input', () => renderGlobalSearchDropdown());
    searchInput.addEventListener('focus', () => renderGlobalSearchDropdown());
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        const dd = document.getElementById('global-search-dropdown');
        if (dd) dd.remove();
      }, 180);
    });
  }
  const mealDateInput = document.getElementById('meal-date');
  if (mealDateInput) {
    mealDateInput.addEventListener('change', event => {
      state.mealFormDate = toDateInputValue(event.target.value || getTodayDate());
      renderAddScreenContext();
      renderDayTotalsCard();
    });
  }
  const mealTimeInput = document.getElementById('meal-time');
  if (mealTimeInput) {
    const syncMealTimeUi = () => {
      state.mealTimeTouched = true;
      updateMealTimeReminder();
      updateMealDetailsStatus();
      updateSaveTimeHint();
    };

    mealTimeInput.addEventListener('input', syncMealTimeUi);
    mealTimeInput.addEventListener('change', syncMealTimeUi);
    mealTimeInput.addEventListener('click', e => {
      e.preventDefault();
      const rect = mealTimeInput.getBoundingClientRect();
      const scrollTarget = window.scrollY + rect.top - 60;
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      setTimeout(() => {
        openTimePicker(mealTimeInput.value || getCurrentTimeStr(), newTime => {
          mealTimeInput.value = newTime;
          syncMealTimeUi();
        });
      }, 150);
    });
    mealTimeInput.addEventListener('keydown', e => e.preventDefault());
  }

  document.getElementById('meal-details-toggle')?.addEventListener('click', () => {
    const expanded = document.getElementById('meal-details-toggle')?.getAttribute('aria-expanded') === 'true';
    setMealDetailsExpanded(!expanded);
  });

  document.getElementById('open-meal-details-btn')?.addEventListener('click', () => {
    setMealDetailsExpanded(true);
    document.getElementById('meal-time')?.focus();
  });
}

const PhotoManager = {
  STORAGE_KEY: 'nutritionaist_profile_photo',

  save(dataUrl) {
    try { localStorage.setItem(this.STORAGE_KEY, dataUrl); } catch(e) { console.warn('Photo save error', e); }
  },

  load() {
    try { return localStorage.getItem(this.STORAGE_KEY) || null; } catch(e) { return null; }
  },

  clear() {
    try { localStorage.removeItem(this.STORAGE_KEY); } catch(e) {}
  }
};

function renderPhotoEverywhere() {
  const dataUrl = PhotoManager.load();
  const avatarText = getAvatarText(Storage.getProfile()?.name);

  const placeholders = [
    document.getElementById('home-photo-placeholder'),
    document.getElementById('profile-hero-photo-placeholder'),
    document.getElementById('profile-photo-placeholder'),
  ];

  placeholders.forEach(ph => {
    if (!ph) return;
    if (dataUrl) {
      ph.innerHTML = `<img src="${dataUrl}" alt="фото" />`;
      ph.style.fontSize = '0';
    } else {
      ph.innerHTML = avatarText;
      ph.style.fontSize = '';
    }
  });
}

function openPhotoCropper(srcDataUrl) {
  document.getElementById('photo-cropper-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'photo-cropper-overlay';
  overlay.className = 'photo-cropper-overlay';

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let naturalW = 0;
  let naturalH = 0;
  let viewportSize = 0;

  let dragging = false;
  let dragStartX = 0, dragStartY = 0;
  let dragOffsetStartX = 0, dragOffsetStartY = 0;

  let lastPinchDist = 0;

  overlay.innerHTML = `
    <div class="photo-cropper-sheet">
      <div class="photo-cropper-label">редактирование фото</div>
      <div class="photo-cropper-title">Кадрирование</div>
      <p class="photo-cropper-hint">Перетащи фото, чтобы выровнять. Колесо мыши или слайдер — масштаб.</p>
      <div class="photo-cropper-viewport" id="cropper-viewport">
        <img id="cropper-img" src="${srcDataUrl}" alt="" />
        <div class="photo-cropper-grid"></div>
      </div>
      <input type="range" class="photo-cropper-zoom" id="cropper-zoom"
        min="0.1" max="4" step="0.01" value="1" />
      <div class="photo-cropper-actions">
        <button class="btn btn-danger" id="cropper-cancel">Отмена</button>
        <button class="btn btn-primary" id="cropper-save">Сохранить</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const viewport = overlay.querySelector('#cropper-viewport');
  const img      = overlay.querySelector('#cropper-img');
  const zoomInput = overlay.querySelector('#cropper-zoom');

  function clampOffsets() {
    const displayW = naturalW * scale;
    const displayH = naturalH * scale;
    const minX = Math.min(0, viewportSize - displayW);
    const minY = Math.min(0, viewportSize - displayH);
    offsetX = Math.max(minX, Math.min(0, offsetX));
    offsetY = Math.max(minY, Math.min(0, offsetY));
  }

  function applyTransform() {
    img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    img.style.transformOrigin = '0 0';
    img.style.width  = naturalW + 'px';
    img.style.height = naturalH + 'px';
    zoomInput.value = scale;
  }

  function fitToViewport() {
    viewportSize = viewport.getBoundingClientRect().width;
    const minScale = Math.max(viewportSize / naturalW, viewportSize / naturalH);
    scale = minScale;
    zoomInput.min  = minScale.toFixed(3);
    zoomInput.max  = (minScale * 4).toFixed(3);
    zoomInput.step = (minScale * 0.01).toFixed(4);
    zoomInput.value = scale;
    offsetX = (viewportSize - naturalW * scale) / 2;
    offsetY = (viewportSize - naturalH * scale) / 2;
    clampOffsets();
    applyTransform();
  }

  img.onload = () => {
    naturalW = img.naturalWidth;
    naturalH = img.naturalHeight;
    fitToViewport();
  };
  if (img.complete && img.naturalWidth) {
    naturalW = img.naturalWidth;
    naturalH = img.naturalHeight;
    requestAnimationFrame(fitToViewport);
  }

  viewport.addEventListener('pointerdown', e => {
    if (e.touches) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOffsetStartX = offsetX;
    dragOffsetStartY = offsetY;
    viewport.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  viewport.addEventListener('pointermove', e => {
    if (!dragging) return;
    offsetX = dragOffsetStartX + (e.clientX - dragStartX);
    offsetY = dragOffsetStartY + (e.clientY - dragStartY);
    clampOffsets();
    applyTransform();
  });

  viewport.addEventListener('pointerup', () => { dragging = false; });
  viewport.addEventListener('pointercancel', () => { dragging = false; });

  let touchStartDist = 0, touchScaleStart = 1;
  let touchStartMidX = 0, touchStartMidY = 0;
  let touchOffsetStartX = 0, touchOffsetStartY = 0;

  viewport.addEventListener('touchstart', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      dragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      dragOffsetStartX = offsetX;
      dragOffsetStartY = offsetY;
    } else if (e.touches.length === 2) {
      dragging = false;
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      touchStartDist = Math.hypot(dx, dy);
      touchScaleStart = scale;
      touchStartMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      touchStartMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchOffsetStartX = offsetX;
      touchOffsetStartY = offsetY;
    }
  }, { passive: false });

  viewport.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging) {
      offsetX = dragOffsetStartX + (e.touches[0].clientX - dragStartX);
      offsetY = dragOffsetStartY + (e.touches[0].clientY - dragStartY);
      clampOffsets();
      applyTransform();
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      const minScale = parseFloat(zoomInput.min) || 0.1;
      const maxScale = parseFloat(zoomInput.max) || 4;
      const newScale = Math.max(minScale, Math.min(maxScale, touchScaleStart * (dist / touchStartDist)));

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = viewport.getBoundingClientRect();
      const pivotX = midX - rect.left;
      const pivotY = midY - rect.top;

      offsetX = pivotX - (pivotX - touchOffsetStartX) * (newScale / touchScaleStart);
      offsetY = pivotY - (pivotY - touchOffsetStartY) * (newScale / touchScaleStart);
      scale = newScale;
      clampOffsets();
      applyTransform();
    }
  }, { passive: false });

  viewport.addEventListener('touchend', () => { dragging = false; });

  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const minScale = parseFloat(zoomInput.min) || 0.1;
    const maxScale = parseFloat(zoomInput.max) || 4;
    const newScale = Math.max(minScale, Math.min(maxScale, scale + delta * scale));

    const rect = viewport.getBoundingClientRect();
    const pivotX = e.clientX - rect.left;
    const pivotY = e.clientY - rect.top;
    offsetX = pivotX - (pivotX - offsetX) * (newScale / scale);
    offsetY = pivotY - (pivotY - offsetY) * (newScale / scale);
    scale = newScale;
    clampOffsets();
    applyTransform();
  }, { passive: false });

  zoomInput.addEventListener('input', () => {
    const newScale = parseFloat(zoomInput.value);
    const cx = viewportSize / 2;
    const cy = viewportSize / 2;
    offsetX = cx - (cx - offsetX) * (newScale / scale);
    offsetY = cy - (cy - offsetY) * (newScale / scale);
    scale = newScale;
    clampOffsets();
    applyTransform();
  });

  overlay.querySelector('#cropper-save').addEventListener('click', () => {
    const size = viewportSize || viewport.getBoundingClientRect().width;
    const canvas = document.createElement('canvas');
    const out = Math.min(size * 2, 600);
    canvas.width  = out;
    canvas.height = out;
    const ctx = canvas.getContext('2d');
    const ratio = out / size;
    ctx.drawImage(
      img,
      -offsetX / scale,
      -offsetY / scale,
      size / scale,
      size / scale,
      0, 0, out, out
    );
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    PhotoManager.save(dataUrl);
    renderPhotoEverywhere();
    overlay.remove();
  });

  overlay.querySelector('#cropper-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

function initPhotoHandlers() {
  const fileInput = document.getElementById('photo-file-input');
  if (!fileInput) return;

  function triggerFilePick() { fileInput.click(); }

  ['home-photo-btn', 'profile-hero-photo-btn', 'profile-photo-btn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', triggerFilePick);
  });

  fileInput.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => openPhotoCropper(ev.target.result);
    reader.readAsDataURL(file);
    fileInput.value = '';
  });
}

function ensureFirstRunFlow() {
  if (Storage.isFirstRun()) openScreen('screen-profile');
}

function init() {
  fillCategories();
  renderCategoryFilterChips();
  bindEvents();
  initPhotoHandlers();
  renderPhotoEverywhere();
  renderProfile();
  renderHome();
  renderDiary();
  renderTips();
  ensureFirstRunFlow();
}

window.selectDate = selectDate;
window.deleteMeal = deleteMeal;
window.removeProductRow = removeProductRow;
window.adjustRowAmount = adjustRowAmount;
window.updateRowProduct = updateRowProduct;
window.updateRowAmount = updateRowAmount;
window.openAddScreenWithCategory = openAddScreenWithCategory;
window.openAddScreenForStage = openAddScreenForStage;
window.openSuggestionExample = openSuggestionExample;
window.closeSuggestionModal = closeSuggestionModal;
window.showSuggestionModal = showSuggestionModal;
window.openDrinksModal = openDrinksModal;
window.openCategoryModal = openCategoryModal;
window.openCategoryModalFromTip = openCategoryModalFromTip;
window.editMealTime = editMealTime;

init();
