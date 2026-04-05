const rawProductsDatabase = {
    "Каши, крупы и гарниры": {
        items: {
            "Гречка отварная":      { calories: 110, protein: 4.2, fats: 1.1, carbs: 21.0, unit: "гр", tags: ["grain", "garnish", "homemade", "satiety"] },
            "Рис отварной":         { calories: 130, protein: 2.7, fats: 0.3, carbs: 28.0, unit: "гр", tags: ["grain", "garnish", "homemade"] },
            "Булгур отварной":      { calories: 83,  protein: 3.1, fats: 0.2, carbs: 18.6, unit: "гр", tags: ["grain", "garnish", "homemade"] },
            "Овсяная каша":         { calories: 88,  protein: 3.0, fats: 2.0, carbs: 15.0, unit: "гр", tags: ["grain", "porridge", "breakfast", "homemade", "satiety"] },
            "Пшённая каша":         { calories: 90,  protein: 3.0, fats: 1.1, carbs: 17.0, unit: "гр", tags: ["grain", "porridge", "breakfast", "homemade"] },
            "Перловая каша":        { calories: 109, protein: 3.1, fats: 0.4, carbs: 22.2, unit: "гр", tags: ["grain", "garnish", "homemade", "satiety"] },
            "Кускус отварной":      { calories: 112, protein: 3.8, fats: 0.2, carbs: 23.2, unit: "гр", tags: ["grain", "garnish", "homemade"] },
            "Картофель отварной":   { calories: 82,  protein: 2.0, fats: 0.4, carbs: 16.7, unit: "гр", tags: ["garnish", "potatoes", "vegetable"] },
            "Картофель печёный":    { calories: 93,  protein: 2.5, fats: 0.1, carbs: 21.0, unit: "гр", tags: ["garnish", "potatoes", "vegetable"] },
            "Картофель жареный":    { calories: 192, protein: 2.8, fats: 9.5, carbs: 24.0, unit: "гр", tags: ["garnish", "potatoes", "fried", "heavy"] },
            "Пюре картофельное":    { calories: 88,  protein: 1.9, fats: 3.3, carbs: 13.8, unit: "гр", tags: ["garnish", "potatoes", "homemade"] },
            "Макароны отварные":    { calories: 138, protein: 5.0, fats: 0.9, carbs: 27.4, unit: "гр", tags: ["grain", "garnish", "homemade"] },
            "Чечевица отварная":    { calories: 116, protein: 9.0, fats: 0.4, carbs: 20.0, unit: "гр", tags: ["legume", "protein", "grain", "garnish", "satiety"] },
            "Нут отварной":         { calories: 164, protein: 8.9, fats: 2.6, carbs: 27.4, unit: "гр", tags: ["legume", "protein", "grain", "garnish", "satiety"] }
        },
        featured: ["Гречка отварная", "Рис отварной", "Овсяная каша", "Картофель отварной", "Картофель жареный"]
    },

    "Овощи и салаты": {
        items: {
            "Огурец":               { calories: 15,  protein: 0.8, fats: 0.1, carbs: 3.0,  unit: "гр", tags: ["vegetable", "fresh", "light"] },
            "Помидор":              { calories: 18,  protein: 1.1, fats: 0.2, carbs: 3.8,  unit: "гр", tags: ["vegetable", "fresh", "light"] },
            "Капуста белокочанная": { calories: 25,  protein: 1.8, fats: 0.1, carbs: 4.7,  unit: "гр", tags: ["vegetable", "fresh", "light"] },
            "Капуста брокколи":     { calories: 34,  protein: 2.8, fats: 0.4, carbs: 6.6,  unit: "гр", tags: ["vegetable", "fresh", "light", "protein"] },
            "Капуста цветная":      { calories: 30,  protein: 2.5, fats: 0.3, carbs: 5.4,  unit: "гр", tags: ["vegetable", "fresh", "light"] },
            "Морковь":              { calories: 41,  protein: 0.9, fats: 0.2, carbs: 9.6,  unit: "гр", tags: ["vegetable", "fresh"] },
            "Свёкла":               { calories: 43,  protein: 1.6, fats: 0.2, carbs: 9.6,  unit: "гр", tags: ["vegetable"] },
            "Перец болгарский":     { calories: 27,  protein: 1.0, fats: 0.3, carbs: 5.7,  unit: "гр", tags: ["vegetable", "fresh", "light"] },
            "Кабачок":              { calories: 24,  protein: 1.2, fats: 0.3, carbs: 4.6,  unit: "гр", tags: ["vegetable", "light"] },
            "Баклажан":             { calories: 25,  protein: 1.2, fats: 0.2, carbs: 5.9,  unit: "гр", tags: ["vegetable"] },
            "Шпинат":               { calories: 22,  protein: 2.9, fats: 0.4, carbs: 3.6,  unit: "гр", tags: ["vegetable", "fresh", "light", "protein"] },
            "Салат листовой":       { calories: 15,  protein: 1.3, fats: 0.2, carbs: 2.9,  unit: "гр", tags: ["vegetable", "fresh", "light"] },
            "Салат овощной":        { calories: 42,  protein: 1.2, fats: 2.5, carbs: 4.1,  unit: "гр", tags: ["vegetable", "salad", "fresh", "light"] },
            "Салат морковный":      { calories: 89,  protein: 1.0, fats: 5.5, carbs: 9.0,  unit: "гр", tags: ["vegetable", "salad"] },
            "Салат свекольный":     { calories: 83,  protein: 1.5, fats: 4.5, carbs: 10.0, unit: "гр", tags: ["vegetable", "salad"] },
            "Квашеная капуста":     { calories: 19,  protein: 1.8, fats: 0.1, carbs: 4.4,  unit: "гр", tags: ["vegetable", "fermented", "light"] },
            "Огурцы солёные":       { calories: 11,  protein: 0.8, fats: 0.1, carbs: 1.7,  unit: "гр", tags: ["vegetable", "fermented", "light"] },
            "Помидоры солёные":     { calories: 15,  protein: 0.9, fats: 0.1, carbs: 2.8,  unit: "гр", tags: ["vegetable", "fermented", "light"] },
            "Авокадо":              { calories: 160, protein: 2.0, fats: 14.7, carbs: 8.5, unit: "гр", tags: ["vegetable", "fat_source"] }
        },
        featured: ["Огурец", "Помидор", "Салат овощной", "Перец болгарский", "Квашеная капуста"]
    },

    "Рыба и морепродукты": {
        items: {
            "Треска запечённая":        { calories: 82,  protein: 18.0, fats: 0.7,  carbs: 0.0, unit: "гр", tags: ["fish", "protein", "lean"] },
            "Лосось на гриле":          { calories: 208, protein: 20.0, fats: 13.0, carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty"] },
            "Лосось солёный":           { calories: 202, protein: 21.5, fats: 12.5, carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty"] },
            "Минтай":                   { calories: 79,  protein: 16.0, fats: 1.0,  carbs: 0.0, unit: "гр", tags: ["fish", "protein", "lean"] },
            "Тунец в собственном соку": { calories: 96,  protein: 22.0, fats: 1.0,  carbs: 0.0, unit: "гр", tags: ["fish", "protein", "lean"] },
            "Скумбрия запечённая":      { calories: 191, protein: 18.5, fats: 13.2, carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty"] },
            "Скумбрия копчёная":        { calories: 221, protein: 20.7, fats: 15.5, carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty"] },
            "Скумбрия горячего копчения": { calories: 211, protein: 21.0, fats: 14.0, carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty"] },
            "Горбуша солёная":          { calories: 169, protein: 22.1, fats: 9.0,  carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty"] },
            "Горбуша жареная":          { calories: 184, protein: 21.3, fats: 10.7, carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty", "fried"] },
            "Форель на гриле":          { calories: 185, protein: 20.5, fats: 11.0, carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty"] },
            "Сёмга слабосолёная":       { calories: 202, protein: 22.0, fats: 12.5, carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty"] },
            "Сёмга жареная":            { calories: 218, protein: 21.0, fats: 14.5, carbs: 0.0, unit: "гр", tags: ["fish", "protein", "fatty", "fried"] },
            "Хек запечённый":           { calories: 88,  protein: 16.6, fats: 2.2,  carbs: 0.0, unit: "гр", tags: ["fish", "protein", "lean"] },
            "Тилапия":                  { calories: 96,  protein: 20.1, fats: 1.7,  carbs: 0.0, unit: "гр", tags: ["fish", "protein", "lean"] },
            "Креветки":                 { calories: 95,  protein: 20.0, fats: 1.8,  carbs: 0.0, unit: "гр", tags: ["seafood", "protein", "lean"] },
            "Кальмар":                  { calories: 92,  protein: 18.0, fats: 1.4,  carbs: 2.0, unit: "гр", tags: ["seafood", "protein", "lean"] },
            "Мидии":                    { calories: 77,  protein: 11.5, fats: 2.0,  carbs: 3.3, unit: "гр", tags: ["seafood", "protein"] }
        },
        featured: ["Треска запечённая", "Лосось на гриле", "Минтай", "Тунец в собственном соку", "Скумбрия запечённая"]
    },

    "Птица и мясо": {
        items: {
            "Куриное филе":         { calories: 110, protein: 23.0, fats: 1.2,  carbs: 0.0, unit: "гр", tags: ["meat", "protein", "lean"] },
            "Индейка запечённая":   { calories: 125, protein: 22.0, fats: 3.0,  carbs: 0.0, unit: "гр", tags: ["meat", "protein", "lean"] },
            "Куриное бедро":        { calories: 209, protein: 26.0, fats: 11.0, carbs: 0.0, unit: "гр", tags: ["meat", "protein"] },
            "Куриное крыло":        { calories: 197, protein: 17.4, fats: 14.0, carbs: 0.0, unit: "гр", tags: ["meat", "protein"] },
            "Котлеты домашние":     { calories: 240, protein: 14.0, fats: 16.0, carbs: 8.0, unit: "гр", tags: ["meat", "protein", "homemade"] },
            "Говядина тушёная":     { calories: 180, protein: 25.0, fats: 8.0,  carbs: 0.0, unit: "гр", tags: ["meat", "protein"] },
            "Свинина запечённая":   { calories: 220, protein: 22.0, fats: 14.0, carbs: 0.0, unit: "гр", tags: ["meat", "protein", "heavy"] },
            "Свинина тушёная":      { calories: 235, protein: 20.5, fats: 16.5, carbs: 0.0, unit: "гр", tags: ["meat", "protein", "heavy"] },
            "Баранина запечённая":  { calories: 292, protein: 16.0, fats: 25.0, carbs: 0.0, unit: "гр", tags: ["meat", "protein", "heavy"] },
            "Печень куриная":       { calories: 140, protein: 20.4, fats: 5.9,  carbs: 1.4, unit: "гр", tags: ["meat", "protein"] },
            "Сосиски куриные":      { calories: 160, protein: 12.0, fats: 11.0, carbs: 3.0, unit: "гр", tags: ["meat", "protein", "processed"] },
            "Сосиски свиные":       { calories: 324, protein: 11.4, fats: 30.0, carbs: 1.5, unit: "гр", tags: ["meat", "protein", "processed", "heavy"] },
            "Сосиски говяжьи":      { calories: 215, protein: 13.5, fats: 18.0, carbs: 1.0, unit: "гр", tags: ["meat", "protein", "processed"] }
        },
        featured: ["Куриное филе", "Индейка запечённая", "Куриное бедро", "Котлеты домашние", "Говядина тушёная"]
    },

    "Яйца и молочные продукты": {
        items: {
            "Яйцо варёное":         { calories: 155, protein: 13.0, fats: 11.0, carbs: 1.1, unit: "шт", tags: ["eggs", "breakfast", "protein"] },
            "Омлет":                { calories: 154, protein: 11.0, fats: 12.0, carbs: 0.6, unit: "гр", tags: ["eggs", "breakfast", "protein"] },
            "Омлет с овощами":      { calories: 118, protein: 9.5,  fats: 8.5,  carbs: 2.5, unit: "гр", tags: ["eggs", "breakfast", "protein", "vegetable"] },
            "Яичница":              { calories: 180, protein: 12.0, fats: 14.0, carbs: 0.8, unit: "гр", tags: ["eggs", "breakfast", "protein"] },
            "Творог 5%":            { calories: 121, protein: 17.0, fats: 5.0,  carbs: 3.0, unit: "гр", tags: ["dairy", "protein"] },
            "Творог 0%":            { calories: 71,  protein: 18.0, fats: 0.0,  carbs: 3.0, unit: "гр", tags: ["dairy", "protein", "light"] },
            "Творог 9%":            { calories: 159, protein: 16.7, fats: 9.0,  carbs: 2.0, unit: "гр", tags: ["dairy", "protein", "satiety"] },
            "Кефир 1%":             { calories: 40,  protein: 3.0,  fats: 1.0,  carbs: 4.0, unit: "мл", tags: ["dairy", "drink", "light"] },
            "Кефир 2.5%":           { calories: 53,  protein: 3.0,  fats: 2.5,  carbs: 4.0, unit: "мл", tags: ["dairy", "drink"] },
            "Молоко 2.5%":          { calories: 52,  protein: 2.8,  fats: 2.5,  carbs: 4.7, unit: "мл", tags: ["dairy", "drink"] },
            "Йогурт натуральный":   { calories: 68,  protein: 5.0,  fats: 3.2,  carbs: 3.5, unit: "гр", tags: ["dairy", "protein"] },
            "Ряженка 4%":           { calories: 67,  protein: 3.0,  fats: 4.0,  carbs: 4.1, unit: "мл", tags: ["dairy", "drink"] },
            "Сметана 15%":          { calories: 158, protein: 2.6,  fats: 15.0, carbs: 3.0, unit: "гр", tags: ["dairy", "fat_source"] },
            "Сыр твёрдый":          { calories: 350, protein: 25.0, fats: 27.0, carbs: 0.0, unit: "гр", tags: ["dairy", "protein", "fat_source"] },
            "Сыр мягкий (брынза)":  { calories: 260, protein: 17.9, fats: 20.1, carbs: 0.0, unit: "гр", tags: ["dairy", "protein"] }
        },
        featured: ["Яйцо варёное", "Творог 5%", "Омлет", "Кефир 2.5%", "Йогурт натуральный"]
    },

    "Хлеб и хлебцы": {
        items: {
            "Хлеб белый":           { calories: 265, protein: 9.0,  fats: 3.2, carbs: 49.0, unit: "гр", tags: ["bread", "fast_carb"] },
            "Хлеб бородинский":     { calories: 208, protein: 6.8,  fats: 1.3, carbs: 40.0, unit: "гр", tags: ["bread"] },
            "Хлеб чёрный":          { calories: 208, protein: 6.8,  fats: 1.3, carbs: 40.0, unit: "гр", tags: ["bread"] },
            "Хлеб цельнозерновой":  { calories: 230, protein: 10.0, fats: 4.0, carbs: 37.0, unit: "гр", tags: ["bread", "satiety"] },
            "Хлеб ржаной":          { calories: 214, protein: 6.6,  fats: 1.2, carbs: 44.0, unit: "гр", tags: ["bread"] },
            "Лаваш":                { calories: 275, protein: 9.0,  fats: 1.2, carbs: 56.0, unit: "гр", tags: ["bread", "fast_carb"] },
            "Хлебцы ржаные":        { calories: 295, protein: 10.0, fats: 2.0, carbs: 62.0, unit: "гр", tags: ["bread", "satiety"] },
            "Хлебцы цельнозерновые":{ calories: 302, protein: 9.5,  fats: 2.5, carbs: 58.0, unit: "гр", tags: ["bread", "satiety"] }
        },
        featured: ["Хлеб цельнозерновой", "Хлеб бородинский", "Хлеб чёрный", "Хлеб белый", "Хлебцы ржаные"]
    },

    "Фрукты и ягоды": {
        items: {
            "Яблоко":               { calories: 52,  protein: 0.3, fats: 0.2, carbs: 14.0, unit: "шт", tags: ["fruit", "snack", "light"] },
            "Банан":                { calories: 89,  protein: 1.1, fats: 0.3, carbs: 23.0, unit: "шт", tags: ["fruit", "snack", "satiety"] },
            "Груша":                { calories: 57,  protein: 0.4, fats: 0.3, carbs: 15.0, unit: "шт", tags: ["fruit", "snack"] },
            "Апельсин":             { calories: 47,  protein: 0.9, fats: 0.1, carbs: 11.0, unit: "шт", tags: ["fruit", "snack", "light"] },
            "Мандарин":             { calories: 38,  protein: 0.6, fats: 0.2, carbs: 8.6,  unit: "шт", tags: ["fruit", "snack", "light"] },
            "Киви":                 { calories: 61,  protein: 1.1, fats: 0.5, carbs: 14.7, unit: "шт", tags: ["fruit", "snack", "light"] },
            "Персик":               { calories: 39,  protein: 0.9, fats: 0.1, carbs: 9.5,  unit: "шт", tags: ["fruit", "snack", "light"] },
            "Слива":                { calories: 49,  protein: 0.8, fats: 0.3, carbs: 11.4, unit: "шт", tags: ["fruit", "snack"] },
            "Виноград":             { calories: 69,  protein: 0.6, fats: 0.2, carbs: 17.2, unit: "гр", tags: ["fruit", "snack"] },
            "Клубника":             { calories: 32,  protein: 0.7, fats: 0.3, carbs: 7.7,  unit: "гр", tags: ["berry", "snack", "light"] },
            "Черника":              { calories: 44,  protein: 0.7, fats: 0.3, carbs: 9.7,  unit: "гр", tags: ["berry", "snack", "light"] },
            "Малина":               { calories: 46,  protein: 0.8, fats: 0.5, carbs: 11.9, unit: "гр", tags: ["berry", "snack", "light"] },
            "Смородина чёрная":     { calories: 44,  protein: 1.0, fats: 0.4, carbs: 11.5, unit: "гр", tags: ["berry", "snack", "light"] },
            "Вишня":                { calories: 52,  protein: 0.8, fats: 0.5, carbs: 12.2, unit: "гр", tags: ["berry", "snack"] },
            "Черешня":              { calories: 52,  protein: 1.1, fats: 0.4, carbs: 11.3, unit: "гр", tags: ["berry", "snack"] },
            "Арбуз":                { calories: 30,  protein: 0.6, fats: 0.1, carbs: 7.6,  unit: "гр", tags: ["fruit", "snack", "light"] },
            "Дыня":                 { calories: 33,  protein: 0.6, fats: 0.3, carbs: 7.4,  unit: "гр", tags: ["fruit", "snack", "light"] }
        },
        featured: ["Яблоко", "Банан", "Клубника", "Черника", "Малина"]
    },

    "Орехи, масла и добавки": {
        items: {
            "Грецкий орех":         { calories: 654, protein: 15.2, fats: 65.2, carbs: 7.0,  unit: "гр", tags: ["nuts", "snack", "fat_source"] },
            "Миндаль":              { calories: 579, protein: 21.0, fats: 50.0, carbs: 22.0, unit: "гр", tags: ["nuts", "snack", "fat_source"] },
            "Арахис":               { calories: 567, protein: 26.0, fats: 49.0, carbs: 16.0, unit: "гр", tags: ["nuts", "snack", "protein"] },
            "Кешью":                { calories: 553, protein: 18.2, fats: 43.8, carbs: 30.2, unit: "гр", tags: ["nuts", "snack", "fat_source"] },
            "Фундук":               { calories: 628, protein: 15.0, fats: 61.5, carbs: 16.7, unit: "гр", tags: ["nuts", "snack", "fat_source"] },
            "Семена тыквы":         { calories: 559, protein: 30.2, fats: 49.1, carbs: 10.7, unit: "гр", tags: ["nuts", "snack", "protein"] },
            "Семена подсолнечника": { calories: 584, protein: 20.7, fats: 51.5, carbs: 20.0, unit: "гр", tags: ["nuts", "snack", "fat_source"] },
            "Арахисовая паста":     { calories: 588, protein: 25.0, fats: 50.0, carbs: 20.0, unit: "гр", tags: ["nuts", "snack", "protein", "fat_source"] },
            "Масло оливковое":      { calories: 884, protein: 0.0,  fats: 99.9, carbs: 0.0,  unit: "мл", tags: ["oil", "fat_source"] },
            "Масло сливочное":      { calories: 748, protein: 0.5,  fats: 82.5, carbs: 0.8,  unit: "гр", tags: ["oil", "fat_source"] },
            "Масло подсолнечное":   { calories: 899, protein: 0.0,  fats: 99.9, carbs: 0.0,  unit: "мл", tags: ["oil", "fat_source"] }
        },
        featured: ["Грецкий орех", "Миндаль", "Арахис", "Масло оливковое"]
    },

    "Напитки": {
        items: {
            "Вода":                 { calories: 0,   protein: 0.0, fats: 0.0, carbs: 0.0,  unit: "мл", tags: ["water", "drink", "hydration", "light"] },
            "Чай чёрный":           { calories: 1,   protein: 0.0, fats: 0.0, carbs: 0.2,  unit: "мл", tags: ["drink", "light"] },
            "Чай зелёный":          { calories: 1,   protein: 0.0, fats: 0.0, carbs: 0.2,  unit: "мл", tags: ["drink", "light"] },
            "Чай травяной":         { calories: 1,   protein: 0.0, fats: 0.0, carbs: 0.1,  unit: "мл", tags: ["drink", "light"] },
            "Кофе без сахара":      { calories: 2,   protein: 0.2, fats: 0.1, carbs: 0.3,  unit: "мл", tags: ["drink", "light"] },
            "Американо":            { calories: 3,   protein: 0.2, fats: 0.0, carbs: 0.4,  unit: "мл", tags: ["drink", "light"] },
            "Капучино":             { calories: 45,  protein: 2.5, fats: 2.0, carbs: 4.0,  unit: "мл", tags: ["drink", "dairy"] },
            "Латте":                { calories: 54,  protein: 3.0, fats: 2.5, carbs: 5.5,  unit: "мл", tags: ["drink", "dairy"] },
            "Компот":               { calories: 48,  protein: 0.2, fats: 0.0, carbs: 12.0, unit: "мл", tags: ["drink", "sweet_drink"] },
            "Морс":                 { calories: 41,  protein: 0.1, fats: 0.0, carbs: 10.0, unit: "мл", tags: ["drink", "sweet_drink"] },
            "Кисель":               { calories: 53,  protein: 0.1, fats: 0.0, carbs: 13.0, unit: "мл", tags: ["drink", "sweet_drink"] },
            "Сок апельсиновый":     { calories: 45,  protein: 0.7, fats: 0.2, carbs: 10.4, unit: "мл", tags: ["drink", "sweet_drink"] },
            "Сок томатный":         { calories: 21,  protein: 1.1, fats: 0.2, carbs: 4.1,  unit: "мл", tags: ["drink", "light"] }
        },
        featured: ["Вода", "Чай чёрный", "Кофе без сахара", "Капучино", "Чай зелёный"]
    },

    "Супы и первые блюда": {
        items: {
            "Борщ":                 { calories: 49,  protein: 1.9, fats: 2.2, carbs: 5.3, unit: "гр", tags: ["soup", "vegetable", "homemade", "liquid_food"] },
            "Щи":                   { calories: 31,  protein: 1.5, fats: 1.8, carbs: 2.5, unit: "гр", tags: ["soup", "vegetable", "homemade", "liquid_food"] },
            "Куриный суп":          { calories: 51,  protein: 3.2, fats: 2.0, carbs: 4.8, unit: "гр", tags: ["soup", "protein", "homemade", "liquid_food"] },
            "Суп гороховый":        { calories: 66,  protein: 4.4, fats: 2.0, carbs: 8.0, unit: "гр", tags: ["soup", "legume", "protein", "homemade", "liquid_food"] },
            "Суп-пюре тыквенный":   { calories: 38,  protein: 1.2, fats: 1.5, carbs: 6.2, unit: "гр", tags: ["soup", "vegetable", "homemade", "liquid_food", "light"] },
            "Суп гречневый":        { calories: 47,  protein: 2.1, fats: 1.8, carbs: 6.5, unit: "гр", tags: ["soup", "grain", "homemade", "liquid_food"] },
            "Суп рисовый":          { calories: 44,  protein: 1.8, fats: 1.5, carbs: 7.0, unit: "гр", tags: ["soup", "grain", "homemade", "liquid_food"] },
            "Суп грибной":          { calories: 35,  protein: 1.5, fats: 1.2, carbs: 5.0, unit: "гр", tags: ["soup", "vegetable", "homemade", "liquid_food", "light"] },
            "Суп овощной":          { calories: 28,  protein: 1.0, fats: 0.8, carbs: 5.2, unit: "гр", tags: ["soup", "vegetable", "homemade", "liquid_food", "light"] },
            "Суп харчо":            { calories: 72,  protein: 4.5, fats: 3.8, carbs: 6.8, unit: "гр", tags: ["soup", "protein", "homemade", "liquid_food"] },
            "Уха":                  { calories: 45,  protein: 5.0, fats: 1.5, carbs: 3.5, unit: "гр", tags: ["soup", "fish", "protein", "homemade", "liquid_food"] },
            "Солянка":              { calories: 72,  protein: 5.5, fats: 4.0, carbs: 4.8, unit: "гр", tags: ["soup", "protein", "homemade", "liquid_food"] },
            "Рассольник":           { calories: 42,  protein: 2.3, fats: 1.6, carbs: 5.4, unit: "гр", tags: ["soup", "vegetable", "homemade", "liquid_food"] },
            "Окрошка":              { calories: 37,  protein: 2.5, fats: 1.5, carbs: 4.0, unit: "гр", tags: ["soup", "vegetable", "light", "homemade", "liquid_food"] }
        },
        featured: ["Борщ", "Щи", "Куриный суп", "Суп гороховый", "Уха"]
    },

    "Тесто, выпечка и десерты": {
        items: {
            "Блины":                { calories: 233, protein: 6.1, fats: 12.3, carbs: 26.2, unit: "гр", tags: ["bakery", "breakfast", "fast_carb", "heavy"] },
            "Оладьи":               { calories: 238, protein: 6.0, fats: 11.0, carbs: 29.0, unit: "гр", tags: ["bakery", "breakfast", "fast_carb"] },
            "Сырники":              { calories: 207, protein: 15.0, fats: 9.0, carbs: 18.0, unit: "гр", tags: ["bakery", "breakfast", "protein"] },
            "Шарлотка":             { calories: 230, protein: 5.5, fats: 7.5,  carbs: 36.0, unit: "гр", tags: ["bakery", "fast_carb"] },
            "Пирог домашний":       { calories: 260, protein: 5.5, fats: 10.0, carbs: 38.0, unit: "гр", tags: ["bakery", "fast_carb", "heavy"] },
            "Печенье овсяное":      { calories: 437, protein: 7.0, fats: 16.0, carbs: 68.0, unit: "гр", tags: ["bakery", "snack", "fast_carb"] },
            "Творожная запеканка":  { calories: 165, protein: 13.0, fats: 6.0, carbs: 15.0, unit: "гр", tags: ["bakery", "protein", "breakfast"] },
            "Тёмный шоколад":       { calories: 546, protein: 5.0, fats: 31.0, carbs: 61.0, unit: "гр", tags: ["snack", "fast_carb"] }
        },
        featured: ["Сырники", "Творожная запеканка", "Блины", "Оладьи"]
    },

    "Холодные блюда и закуски": {
        items: {
            "Салат Оливье":         { calories: 198, protein: 6.0, fats: 14.5, carbs: 12.0, unit: "гр", tags: ["salad", "homemade"] },
            "Салат Цезарь":         { calories: 130, protein: 9.5, fats: 8.5,  carbs: 4.0,  unit: "гр", tags: ["salad", "protein"] },
            "Винегрет":             { calories: 72,  protein: 1.8, fats: 3.8,  carbs: 8.5,  unit: "гр", tags: ["salad", "vegetable", "homemade", "light"] },
            "Окрошка холодная":     { calories: 37,  protein: 2.5, fats: 1.5,  carbs: 4.0,  unit: "гр", tags: ["salad", "vegetable", "light"] },
            "Сельдь под шубой":     { calories: 206, protein: 8.5, fats: 13.5, carbs: 13.0, unit: "гр", tags: ["salad", "fish", "heavy"] },
            "Паштет куриный":       { calories: 193, protein: 14.0, fats: 13.0, carbs: 4.0, unit: "гр", tags: ["meat", "protein"] },
            "Бутерброд с сёмгой":   { calories: 185, protein: 12.5, fats: 9.0, carbs: 14.0, unit: "гр", tags: ["fish", "bread", "protein"] }
        },
        featured: ["Салат Цезарь", "Винегрет", "Паштет куриный"]
    }
};

const productAliases = {
    "гречка": "Гречка отварная",
    "рис": "Рис отварной",
    "овсянка": "Овсяная каша",
    "картошка": "Картофель отварной",
    "картофель": "Картофель отварной",
    "картошка жареная": "Картофель жареный",
    "картошка печеная": "Картофель печёный",
    "хлеб черный": "Хлеб чёрный",
    "хлеб белый": "Хлеб белый",
    "творог": "Творог 5%",
    "яйцо": "Яйцо варёное",
    "курица": "Куриное филе",
    "треска": "Треска запечённая",
    "лосось": "Лосось на гриле",
    "лосось соленый": "Лосось солёный",
    "семга": "Сёмга слабосолёная",
    "семга соленая": "Сёмга слабосолёная",
    "семга жареная": "Сёмга жареная",
    "тунец": "Тунец в собственном соку",
    "скумбрия": "Скумбрия запечённая",
    "скумбрия копченая": "Скумбрия копчёная",
    "горбуша": "Горбуша солёная",
    "горбуша жареная": "Горбуша жареная",
    "форель": "Форель на гриле",
    "смородина": "Смородина чёрная",
    "черника": "Черника",
    "малина": "Малина",
    "винегрет": "Винегрет",
    "шарлотка": "Шарлотка"
};

function normalizeUnit(unit) {
    if (unit === 'г' || unit === 'гр') return 'гр';
    if (unit === 'ml' || unit === 'мл') return 'мл';
    if (unit === 'шт' || unit === 'ш') return 'шт';
    return 'гр';
}

function sanitizeProduct(product) {
    return {
        calories: Number(product?.calories) || 0,
        protein: Number(product?.protein) || 0,
        fats: Number(product?.fats) || 0,
        carbs: Number(product?.carbs) || 0,
        unit: normalizeUnit(product?.unit),
        tags: Array.isArray(product?.tags) ? [...product.tags] : []
    };
}

function buildDatabase(rawDatabase) {
    const database = {};
    Object.entries(rawDatabase).forEach(([category, categoryData]) => {
        const items = {};
        Object.entries(categoryData?.items || {}).forEach(([name, product]) => {
            const cleanName = String(name || '').trim();
            if (!cleanName) return;
            items[cleanName] = sanitizeProduct(product);
        });
        database[category] = {
            items,
            featured: Array.from(new Set((categoryData?.featured || []).filter(name => items[name])))
        };
    });
    return database;
}

const productsDatabase = buildDatabase(rawProductsDatabase);

function getCategories() {
    return Object.keys(productsDatabase);
}

function getCategoryProducts(category) {
    const cat = productsDatabase[category];
    return cat ? Object.keys(cat.items).sort((a, b) => a.localeCompare(b, 'ru')) : [];
}

function getFeaturedProducts(category) {
    const cat = productsDatabase[category];
    return cat ? [...cat.featured] : [];
}

function getProduct(productName) {
    const directName = String(productName || '').trim();
    const normalizedName = directName.toLowerCase();
    const aliasResolvedName = productAliases[normalizedName] || directName;

    for (const category of getCategories()) {
        const directProduct = productsDatabase[category].items[directName];
        if (directProduct) return { ...directProduct, category, name: directName };

        const aliasProduct = productsDatabase[category].items[aliasResolvedName];
        if (aliasProduct) return { ...aliasProduct, category, name: aliasResolvedName };
    }
    return null;
}

function getProductTags(productName) {
    return getProduct(productName)?.tags || [];
}

function getAllProductsList() {
    return getCategories()
        .flatMap(category => getCategoryProducts(category))
        .sort((a, b) => a.localeCompare(b, 'ru'));
}
