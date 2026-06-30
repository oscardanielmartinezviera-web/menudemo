// ============================================
// CONTENIDO DEL MENÚ
// Modifica este archivo para cambiar los platos
// ============================================

const menuConfig = {
    restaurant: {
        name: "La Mesa",
        slogan: "Sabores que cuentan historias",
        logo: "🍽️",
        year: "2024",
        phone: "+34 123 456 789",
        email: "info@lamesa.com",
        address: "Calle Principal 123, Madrid",
        schedule: "Lun-Dom: 13:00-23:00"
    },
    
    categories: [
        {
            id: "entrantes",
            name: "Entrantes",
            icon: "🥗",
            active: true,
            items: [
                {
                    id: 1,
                    name: "Ensalada César",
                    description: "Lechuga romana, crutones, parmesano y nuestra salsa especial",
                    price: 12.50,
                    icon: "🥗",
                    featured: false,
                    allergens: ["🥛 Lácteos", "🌾 Gluten"]
                },
                {
                    id: 2,
                    name: "Croquetas de Boletus",
                    description: "Cremosas croquetas caseras con boletus y bechamel trufada",
                    price: 9.80,
                    icon: "🍄",
                    featured: true,
                    allergens: ["🌾 Gluten", "🥛 Lácteos"]
                },
                {
                    id: 3,
                    name: "Pulpo a la Gallega",
                    description: "Pulpo cocido con pimentón de la Vera, aceite de oliva y sal maldon",
                    price: 16.00,
                    icon: "🐙",
                    featured: false,
                    allergens: []
                }
            ]
        },
        {
            id: "principales",
            name: "Platos Principales",
            icon: "🍖",
            active: true,
            items: [
                {
                    id: 4,
                    name: "Solomillo al Vino Tinto",
                    description: "Solomillo de ternera con reducción de vino tinto y patatas trufadas",
                    price: 24.90,
                    icon: "🥩",
                    featured: false,
                    allergens: []
                },
                {
                    id: 5,
                    name: "Salmón a la Parrilla",
                    description: "Lomo de salmón salvaje con verduras salteadas y salsa de eneldo",
                    price: 19.50,
                    icon: "🐟",
                    featured: true,
                    allergens: ["🐟 Pescado"]
                },
                {
                    id: 6,
                    name: "Risotto de Setas",
                    description: "Risotto cremoso con variedad de setas silvestres y parmesano",
                    price: 15.90,
                    icon: "🍝",
                    featured: false,
                    allergens: ["🥛 Lácteos"]
                }
            ]
        },
        {
            id: "postres",
            name: "Postres",
            icon: "🍰",
            active: true,
            items: [
                {
                    id: 7,
                    name: "Tarta de Queso",
                    description: "Tarta de queso cremosa al horno con frutos rojos",
                    price: 7.50,
                    icon: "🍰",
                    featured: false,
                    allergens: ["🥛 Lácteos", "🌾 Gluten"]
                },
                {
                    id: 8,
                    name: "Brownie con Helado",
                    description: "Brownie casero de chocolate belga con helado de vainilla",
                    price: 8.90,
                    icon: "🍫",
                    featured: false,
                    allergens: ["🥜 Frutos secos", "🥛 Lácteos"]
                }
            ]
        }
    ],
    
    settings: {
        currency: "€",
        currencyPosition: "after",
        showPrices: true,
        showAllergens: true,
        showFeaturedBadge: true,
        showDescriptions: true
    }
};

function getMenuConfig() {
    return menuConfig;
}

function updateMenuConfig(newConfig) {
    Object.assign(menuConfig, newConfig);
    document.dispatchEvent(new CustomEvent('menuConfigUpdated', { detail: menuConfig }));
}

function getActiveCategories() {
    return menuConfig.categories.filter(function(cat) {
        return cat.active;
    });
}

function getCategoryById(categoryId) {
    return menuConfig.categories.find(function(cat) {
        return cat.id === categoryId;
    });
}

function getItemById(itemId) {
    var found = null;
    menuConfig.categories.forEach(function(cat) {
        var item = cat.items.find(function(i) {
            return i.id === itemId;
        });
        if (item) found = item;
    });
    return found;
}