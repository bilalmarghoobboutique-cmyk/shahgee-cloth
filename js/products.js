// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Product Data File
// ============================================

// ---------- CATEGORIES ----------
const categories = {
    "ladies-fabrics": {
        name: "Ladies Fabrics",
        subcategories: ["Summer Ladies Fabrics", "Winter Ladies Fabrics"]
    },
    "gents-fabrics": {
        name: "Gents Fabrics",
        subcategories: ["Summer Gents Fabrics", "Winter Gents Fabrics"]
    },
    "ladies-shawls": { name: "Ladies Shawls", subcategories: [] },
    "gents-shawls": { name: "Gents Shawls", subcategories: [] },
    "dhooti-lacha": { name: "Dhooti Lacha & Romals", subcategories: [] },
    "readymade-kafan": {
        name: "Readymade Kafan",
        subcategories: [
            "Ladies Readymade Kafan with Accessories",
            "Gents Readymade Kafan with Accessories"
        ],
        specialNote: "Kafan wo aakhri libas hai. Iski tayyari mein ikhlas aur ehtram ka khaas khayal rakhein."
    },
    "loose-kafan": {
        name: "Loose Kafan Fabric",
        subcategories: [],
        specialNote: "Kafan wo aakhri libas hai. Iski tayyari mein ikhlas aur ehtram ka khaas khayal rakhein."
    }
};

// ---------- PRODUCTS ----------
const products = [
    {
        id: 1,
        name: "Premium Embroidered Ladies Fabric",
        category: "ladies-fabrics",
        subcategory: "Summer Ladies Fabrics",
        price: 3500,
        stock: 15,
        sold: 0,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
        video: "",
        sizes: ["2.5 Meter", "3 Meter"],
        colors: ["Blue", "Pink", "Green"],
        description: "High quality embroidered fabric for summer season."
    },
    {
        id: 2,
        name: "Classic Gents Kurta Fabric",
        category: "gents-fabrics",
        subcategory: "Summer Gents Fabrics",
        price: 2800,
        stock: 20,
        sold: 0,
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600",
        video: "",
        sizes: ["4 Meter", "4.5 Meter"],
        colors: ["White", "Beige", "Grey"],
        description: "Premium cotton fabric for gents kurta."
    },
    {
        id: 3,
        name: "Winter Ladies Shawl - Pashmina",
        category: "ladies-shawls",
        subcategory: "",
        price: 4500,
        stock: 10,
        sold: 0,
        image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600",
        video: "",
        sizes: ["Standard"],
        colors: ["Maroon", "Black", "Navy"],
        description: "Soft pashmina shawl for winter season."
    },
    {
        id: 4,
        name: "Gents Woolen Shawl",
        category: "gents-shawls",
        subcategory: "",
        price: 3800,
        stock: 12,
        sold: 0,
        image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600",
        video: "",
        sizes: ["Standard"],
        colors: ["Brown", "Grey"],
        description: "Warm woolen shawl for gents."
    },
    {
        id: 5,
        name: "Dhooti Lacha Premium",
        category: "dhooti-lacha",
        subcategory: "",
        price: 2200,
        stock: 25,
        sold: 0,
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600",
        video: "",
        sizes: ["Standard"],
        colors: ["White", "Cream"],
        description: "Premium quality dhooti lacha."
    },
    {
        id: 6,
        name: "Ladies Readymade Kafan with Accessories",
        category: "readymade-kafan",
        subcategory: "Ladies Readymade Kafan with Accessories",
        price: 3000,
        stock: 30,
        sold: 0,
        image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600",
        video: "",
        sizes: ["Standard"],
        colors: ["White"],
        description: "Complete readymade kafan for ladies with accessories."
    },
    {
        id: 7,
        name: "Gents Readymade Kafan with Accessories",
        category: "readymade-kafan",
        subcategory: "Gents Readymade Kafan with Accessories",
        price: 3500,
        stock: 30,
        sold: 0,
        image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600",
        video: "",
        sizes: ["Standard"],
        colors: ["White"],
        description: "Complete readymade kafan for gents with accessories."
    },
    {
        id: 8,
        name: "Loose Kafan Fabric - Premium Cotton",
        category: "loose-kafan",
        subcategory: "",
        price: 1500,
        stock: 50,
        sold: 0,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        video: "",
        sizes: ["Per Meter"],
        colors: ["White"],
        description: "Pure cotton loose kafan fabric. Sold per meter."
    }
];

// ---------- HELPER FUNCTIONS ----------
function getAllProducts() { return products; }
function getProductsByCategory(slug) { return products.filter(p => p.category === slug); }
function getProductsBySubcategory(name) { return products.filter(p => p.subcategory === name); }
function getProductById(id) { return products.find(p => p.id === id); }
function getFeaturedProducts() { return products.slice(0, 4); }
function getCategoryName(slug) { return categories[slug] ? categories[slug].name : slug; }

// ---------- HOMEPAGE PE FEATURED PRODUCTS LOAD KARO ----------
document.addEventListener('DOMContentLoaded', function() {
    const featuredContainer = document.getElementById('featuredProducts');
    if (!featuredContainer) return;

    const featured = getFeaturedProducts();
    let html = '';

    featured.forEach(product => {
        html += `
            <div class="product-card">
                <div class="product-img" style="background-image: url('${product.image}');"></div>
                <div class="product-info">
                    <p class="product-cat">${getCategoryName(product.category)}</p>
                    <h3>${product.name}</h3>
                    <p class="product-price">Rs. ${product.price.toLocaleString()}</p>
                </div>
            </div>
        `;
    });

    featuredContainer.innerHTML = html;
});