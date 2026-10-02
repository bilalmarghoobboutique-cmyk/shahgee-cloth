// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Shop Page Logic (Supabase Integrated)
// ============================================

let currentCategory = 'all';
let currentSubcategory = 'all';
let currentSearch = '';
let currentProductId = null;
let allProducts = [];

// ---------- PAGE LOAD ----------
document.addEventListener('DOMContentLoaded', async function() {
    // URL se category check karo
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
        currentCategory = catParam;
        document.querySelectorAll('#categoryList a').forEach(a => {
            a.classList.remove('active');
            if (a.dataset.cat === catParam) a.classList.add('active');
        });
        updateSubcategories(catParam);
    }

    // Supabase se products load karo
    await loadProducts();

    setupEventListeners();
});

// ---------- LOAD PRODUCTS FROM SUPABASE ----------
async function loadProducts() {
    const container = document.getElementById('shopProducts');
    const noProducts = document.getElementById('noProducts');
    const resultCount = document.getElementById('resultCount');

    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:60px 0;">
                <i class="fas fa-spinner fa-spin" style="font-size:36px; color:#c9a961;"></i>
                <p style="margin-top:15px; color:#6b6b6b;">Products load ho rahe hain...</p>
            </div>
        `;
    }

    // Supabase se fetch karo
    const supabaseProducts = await fetchProductsFromSupabase();

    // Agar Supabase khaali hai, toh base products use karo
    if (supabaseProducts.length === 0 && typeof products !== 'undefined') {
        allProducts = products;
    } else {
        // Supabase data ko format karo (sizes/colors string se array)
        allProducts = supabaseProducts.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            subcategory: p.subcategory || '',
            price: p.price,
            stock: p.stock || 0,
            sold: p.sold || 0,
            image: p.image,
            video: p.video || '',
            sizes: p.sizes ? p.sizes.split(',').map(s => s.trim()) : [],
            colors: p.colors ? p.colors.split(',').map(c => c.trim()) : [],
            description: p.description || ''
        }));
    }

    renderProducts();
}

// ---------- EVENT LISTENERS ----------
function setupEventListeners() {
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

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.toLowerCase();
            renderProducts();
        });
    }

    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);

    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }

    const qtyMinus = document.getElementById('qtyMinus');
    if (qtyMinus) {
        qtyMinus.addEventListener('click', function() {
            const input = document.getElementById('qtyInput');
            if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
        });
    }

    const qtyPlus = document.getElementById('qtyPlus');
    if (qtyPlus) {
        qtyPlus.addEventListener('click', function() {
            const input = document.getElementById('qtyInput');
            input.value = parseInt(input.value) + 1;
        });
    }

    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            if (currentProductId) {
                const qty = parseInt(document.getElementById('qtyInput').value) || 1;
                addToCart(currentProductId, qty);
                closeModal();
            }
        });
    }
}

// ---------- SUBCATEGORIES ----------
function updateSubcategories(catSlug) {
    const widget = document.getElementById('subcategoryWidget');
    const list = document.getElementById('subcategoryList');
    if (!widget || !list) return;

    if (catSlug === 'all' || typeof categories === 'undefined' || !categories[catSlug] || categories[catSlug].subcategories.length === 0) {
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

    if (!container) return;

    let filtered = allProducts.slice();

    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (currentSubcategory !== 'all') {
        filtered = filtered.filter(p => p.subcategory === currentSubcategory);
    }

    if (currentSearch) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(currentSearch) ||
            (p.description && p.description.toLowerCase().includes(currentSearch))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = '';
        if (noProducts) noProducts.style.display = 'block';
        if (resultCount) resultCount.innerHTML = 'No products found';
    } else {
        if (noProducts) noProducts.style.display = 'none';
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
        if (resultCount) {
            resultCount.innerHTML = `Showing <strong>${filtered.length}</strong> product${filtered.length > 1 ? 's' : ''}`;
        }
    }
}

// ---------- OPEN MODAL ----------
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    currentProductId = productId;

    document.getElementById('modalImage').style.backgroundImage = `url('${product.image}')`;
    document.getElementById('modalCategory').textContent = getCategoryName(product.category);
    document.getElementById('modalName').textContent = product.name;
    document.getElementById('modalPrice').textContent = `Rs. ${product.price.toLocaleString()}`;
    document.getElementById('modalDesc').textContent = product.description || 'No description available.';
    document.getElementById('qtyInput').value = 1;

    const sizesWrap = document.getElementById('modalSizesWrap');
    const sizesEl = document.getElementById('modalSizes');
    if (product.sizes && product.sizes.length > 0) {
        sizesEl.innerHTML = product.sizes.map(s => `<span>${s}</span>`).join('');
        sizesWrap.style.display = 'block';
    } else {
        sizesWrap.style.display = 'none';
    }

    const colorsWrap = document.getElementById('modalColorsWrap');
    const colorsEl = document.getElementById('modalColors');
    if (product.colors && product.colors.length > 0) {
        colorsEl.innerHTML = product.colors.map(c => `<span>${c}</span>`).join('');
        colorsWrap.style.display = 'block';
    } else {
        colorsWrap.style.display = 'none';
    }

    const videoWrap = document.getElementById('modalVideoWrap');
    const videoEl = document.getElementById('modalVideo');
    if (product.video && product.video.length > 0) {
        videoEl.src = product.video;
        videoWrap.style.display = 'block';
    } else {
        videoWrap.style.display = 'none';
        videoEl.src = '';
    }

    document.getElementById('modalStock').textContent = `In Stock: ${product.stock} available`;

    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ---------- CLOSE MODAL ----------
function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
    currentProductId = null;
}

// ---------- HELPER ----------
function getCategoryName(slug) {
    if (typeof categories !== 'undefined' && categories[slug]) {
        return categories[slug].name;
    }
    return slug;
}