const Storage = {
  KEYS: {
    USER_PROFILE: 'nutritionaist_profile_merged',
    FOOD_DIARY: 'nutritionaist_diary_merged',
    FIRST_RUN: 'nutritionaist_first_run_merged'
  },

  // Inline helper so Storage is self-contained and doesn't depend on app.js load order
  _round1(value) {
    return Math.round((Number(value) || 0) * 10) / 10;
  },

  safeParse(json, fallback) {
    if (!json) return fallback;
    try {
      const parsed = JSON.parse(json);
      return parsed ?? fallback;
    } catch (error) {
      console.warn('Storage parse error:', error);
      return fallback;
    }
  },

  safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage write error:', error);
      return false;
    }
  },

  isFirstRun() {
    return localStorage.getItem(this.KEYS.FIRST_RUN) !== 'true';
  },

  completeFirstRun() {
    localStorage.setItem(this.KEYS.FIRST_RUN, 'true');
  },

  saveProfile(profile) {
    const normalizedProfile = this.normalizeProfile(profile);
    this.safeSet(this.KEYS.USER_PROFILE, normalizedProfile);
  },

  getProfile() {
    const data = localStorage.getItem(this.KEYS.USER_PROFILE);
    const parsed = this.safeParse(data, null);
    return parsed ? this.normalizeProfile(parsed) : null;
  },

  normalizeProfile(profile) {
    if (!profile || typeof profile !== 'object') return null;

    return {
      name: String(profile.name || '').trim(),
      age: profile.age ?? '',
      gender: profile.gender ?? '',
      weight: profile.weight ?? '',
      height: profile.height ?? '',
      goal: profile.goal ?? ''
    };
  },

  saveMeal(date, meal) {
    const normalizedDate = this.normalizeDateKey(date);
    if (!normalizedDate) return false;

    const diary = this.getDiary();
    if (!diary[normalizedDate]) {
      diary[normalizedDate] = [];
    }

    diary[normalizedDate].push(this.normalizeMeal(meal));
    return this.saveDiary(diary);
  },

  saveDiary(diary) {
    const normalizedDiary = this.normalizeDiary(diary);
    return this.safeSet(this.KEYS.FOOD_DIARY, normalizedDiary);
  },

  getDiary() {
    const data = localStorage.getItem(this.KEYS.FOOD_DIARY);
    const parsed = this.safeParse(data, {});
    return this.normalizeDiary(parsed);
  },

  getMealsByDate(date) {
    const diary = this.getDiary();
    const normalizedDate = this.normalizeDateKey(date);
    return normalizedDate ? (diary[normalizedDate] || []) : [];
  },

  deleteMeal(date, mealIndex) {
    const normalizedDate = this.normalizeDateKey(date);
    if (!normalizedDate) return;

    const diary = this.getDiary();
    if (!Array.isArray(diary[normalizedDate])) return;

    diary[normalizedDate].splice(mealIndex, 1);

    if (!diary[normalizedDate].length) {
      delete diary[normalizedDate];
    }

    this.saveDiary(diary);
  },

  getDayStats(date) {
    const meals = this.getMealsByDate(date);
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFats = 0;
    let totalCarbs = 0;

    meals.forEach(meal => {
      totalCalories += Number(meal.calories) || 0;
      totalProtein += Number(meal.protein) || 0;
      totalFats += Number(meal.fats) || 0;
      totalCarbs += Number(meal.carbs) || 0;
    });

    return {
      calories: Math.round(totalCalories),
      protein: this._round1(totalProtein),
      fats: this._round1(totalFats),
      carbs: this._round1(totalCarbs),
      mealsCount: meals.length
    };
  },

  normalizeDiary(diary) {
    if (!diary || typeof diary !== 'object' || Array.isArray(diary)) return {};

    const normalizedDiary = {};

    Object.entries(diary).forEach(([date, meals]) => {
      const normalizedDate = this.normalizeDateKey(date);
      if (!normalizedDate || !Array.isArray(meals)) return;

      const normalizedMeals = meals
        .map(meal => this.normalizeMeal(meal))
        .filter(Boolean);

      if (normalizedMeals.length) {
        normalizedDiary[normalizedDate] = normalizedMeals;
      }
    });

    return normalizedDiary;
  },

  normalizeMeal(meal) {
    if (!meal || typeof meal !== 'object') return null;

    const products = Array.isArray(meal.products)
      ? meal.products
          .map(product => this.normalizeMealProduct(product))
          .filter(Boolean)
      : [];

    return {
      time: this.normalizeTime(meal.time),
      name: String(meal.name || 'Приём пищи').trim() || 'Приём пищи',
      comment: String(meal.comment || '').trim(),
      calories: Number(meal.calories) || 0,
      protein: Number(meal.protein) || 0,
      fats: Number(meal.fats) || 0,
      carbs: Number(meal.carbs) || 0,
      products
    };
  },

  normalizeMealProduct(product) {
    if (!product || typeof product !== 'object') return null;

    const name = String(product.name || '').trim();
    if (!name) return null;

    const resolvedProduct = typeof getProduct === 'function' ? getProduct(name) : null;
    const fallbackTags = Array.isArray(product.tags) ? product.tags : [];
    const tags = Array.from(new Set(((resolvedProduct?.tags || []).length ? resolvedProduct.tags : fallbackTags)
      .map(tag => String(tag || '').trim().toLowerCase())
      .filter(Boolean)));

    const fallbackUnit = String(product.unit || resolvedProduct?.unit || 'гр').trim();
    const unit = fallbackUnit === 'г' ? 'гр' : fallbackUnit;

    return {
      name,
      amount: Number(product.amount) || 0,
      unit,
      tags
    };
  },

  normalizeDateKey(date) {
    if (!date) return '';
    const value = String(date).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  normalizeTime(time) {
    const value = String(time || '').trim();
    if (!value) return '';
    if (/^\d{2}:\d{2}$/.test(value)) return value;

    const parts = value.split(':');
    if (parts.length < 2) return '';

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  },

  migrateLegacyData() {
    const diary = this.getDiary();
    this.saveDiary(diary);

    const profile = this.getProfile();
    if (profile) {
      this.saveProfile(profile);
    }
  },

  clearAll() {
    localStorage.removeItem(this.KEYS.USER_PROFILE);
    localStorage.removeItem(this.KEYS.FOOD_DIARY);
    localStorage.removeItem(this.KEYS.FIRST_RUN);
  }
};

Storage.migrateLegacyData();
