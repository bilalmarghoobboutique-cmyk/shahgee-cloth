// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Shop Page Logic
// ============================================

let currentCategory = 'all';
let currentSubcategory = 'all';
let currentSearch = '';
let currentProductId = null;

// ---------- PAGE LOAD ----------
document.addEventListener('DOMContentLoaded', function() {
    // URL se category check karo
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
        currentCategory = catParam;
        // Sidebar mein active karo
        document.querySelectorAll('#categoryList a').forEach(a => {
            a.classList.remove('active');
            if (a.dataset.cat === catParam) a.classList.add('active');
        });
        updateSubcategories(catParam);
    }

    renderProducts();
    setupEventListeners();
});

// ---------- EVENT LISTENERS ----------
function setupEventListeners() {
    // Category click
    document.querySelectorAll('#categoryList a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            currentCategory = this.dataset.cat;
            currentSubcategory = 'all';

            document.querySelectorAll('#categoryList a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');

            updateSubcategories(currentCategory);
            renderProducts();
        });
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.toLowerCase();
            renderProducts();
        });
    }

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    // Quantity buttons
    document.getElementById('qtyMinus').addEventListener('click', function() {
        const input = document.getElementById('qtyInput');
        if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
    });

    document.getElementById('qtyPlus').addEventListener('click', function() {
        const input = document.getElementById('qtyInput');
        input.value = parseInt(input.value) + 1;
    });

    // Add to cart
    document.getElementById('addToCartBtn').addEventListener('click', function() {
        if (currentProductId) {
            const qty = parseInt(document.getElementById('qtyInput').value) || 1;
            addToCart(currentProductId, qty);
            closeModal();
        }
    });
}

// ---------- SUBCATEGORIES UPDATE ----------
function updateSubcategories(catSlug) {
    const widget = document.getElementById('subcategoryWidget');
    const list = document.getElementById('subcategoryList');

    if (catSlug === 'all' || !categories[catSlug] || categories[catSlug].subcategories.length === 0) {
        widget.style.display = 'none';
        return;
    }

    const subs = categories[catSlug].subcategories;
    let html = '<li><a href="#" data-sub="all" class="active">All</a></li>';
    subs.forEach(sub => {
        html += `<li><a href="#" data-sub="${sub}">${sub}</a></li>`;
    });
    list.innerHTML = html;
    widget.style.display = 'block';

    // Sub-category click handlers
    list.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            currentSubcategory = this.dataset.sub;
            list.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            renderProducts();
        });
    });
}

// ---------- RENDER PRODUCTS ----------
function renderProducts() {
    const container = document.getElementById('shopProducts');
    const noProducts = document.getElementById('noProducts');
    const resultCount = document.getElementById('resultCount');

    let filtered = products.slice();

    // Category filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Sub-category filter
    if (currentSubcategory !== 'all') {
        filtered = filtered.filter(p => p.subcategory === currentSubcategory);
    }

    // Search filter
    if (currentSearch) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(currentSearch) ||
            p.description.toLowerCase().includes(currentSearch)
        );
    }

    // Result count
    if (filtered.length === 0) {
        container.innerHTML = '';
        noProducts.style.display = 'block';
        resultCount.innerHTML = 'No products found';
    } else {
        noProducts.style.display = 'none';
        let html = '';
        filtered.forEach(product => {
            html += `
                <div class="product-card" onclick="openProductModal(${product.id})">
                    <div class="product-img" style="background-image: url('${product.image}');"></div>
                    <div class="product-info">
                        <p class="product-cat">${getCategoryName(product.category)}</p>
                        <h3>${product.name}</h3>
                        <p class="product-price">Rs. ${product.price.toLocaleString()}</p>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        resultCount.innerHTML = `Showing <strong>${filtered.length}</strong> product${filtered.length > 1 ? 's' : ''}`;
    }
}

// ---------- OPEN PRODUCT MODAL ----------
function openProductModal(productId) {
    const product = getProductById(productId);
    if (!product) return;

    currentProductId = productId;

    document.getElementById('modalImage').style.backgroundImage = `url('${product.image}')`;
    document.getElementById('modalCategory').textContent = getCategoryName(product.category);
    document.getElementById('modalName').textContent = product.name;
    document.getElementById('modalPrice').textContent = `Rs. ${product.price.toLocaleString()}`;
    document.getElementById('modalDesc').textContent = product.description || 'No description available.';
    document.getElementById('qtyInput').value = 1;

    // Sizes
    const sizesWrap = document.getElementById('modalSizesWrap');
    const sizesEl = document.getElementById('modalSizes');
    if (product.sizes && product.sizes.length > 0) {
        sizesEl.innerHTML = product.sizes.map(s => `<span>${s}</span>`).join('');
        sizesWrap.style.display = 'block';
    } else {
        sizesWrap.style.display = 'none';
    }

    // Colors
    const colorsWrap = document.getElementById('modalColorsWrap');
    const colorsEl = document.getElementById('modalColors');
    if (product.colors && product.colors.length > 0) {
        colorsEl.innerHTML = product.colors.map(c => `<span>${c}</span>`).join('');
        colorsWrap.style.display = 'block';
    } else {
        colorsWrap.style.display = 'none';
    }

    // Video
    const videoWrap = document.getElementById('modalVideoWrap');
    const videoEl = document.getElementById('modalVideo');
    if (product.video && product.video.length > 0) {
        videoEl.src = product.video;
        videoWrap.style.display = 'block';
    } else {
        videoWrap.style.display = 'none';
        videoEl.src = '';
    }

    // Stock
    document.getElementById('modalStock').textContent = `In Stock: ${product.stock} available`;

    // Show modal
    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ---------- CLOSE MODAL ----------
function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
    currentProductId = null;
}