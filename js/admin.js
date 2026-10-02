// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Admin Panel Logic (Supabase Integrated)
// ============================================

const DEFAULT_PASSWORD = 'shahgee2026';
const AUTH_KEY = 'shahgee_admin_auth';
const PASS_KEY = 'shahgee_admin_password';

let cachedOrders = [];
let cachedProducts = [];

// ---------- LOGIN ----------
document.addEventListener('DOMContentLoaded', function() {
    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
        loginScreen.style.display = 'none';
        adminApp.style.display = 'grid';
        initAdmin();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const entered = document.getElementById('loginPassword').value;
            const saved = localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD;

            if (entered === saved) {
                sessionStorage.setItem(AUTH_KEY, 'true');
                loginScreen.style.display = 'none';
                adminApp.style.display = 'grid';
                initAdmin();
            } else {
                loginError.textContent = 'Ghalat password. Dobara koshish karein.';
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Logout karna chahte hain?')) {
                sessionStorage.removeItem(AUTH_KEY);
                location.reload();
            }
        });
    }
});

// ---------- INIT ----------
async function initAdmin() {
    setupNavigation();
    setupSidebarToggle();
    setupProductModal();
    setupOrderModal();
    setupSettingsForms();

    // Supabase se data load karo
    await loadAdminData();

    renderDashboard();
    renderProducts();
    renderOrders();
    updateOrdersBadge();
}

async function loadAdminData() {
    // Orders load karo
    cachedOrders = await fetchOrdersFromSupabase();

    // Products load karo
    const supabaseProducts = await fetchProductsFromSupabase();

    if (supabaseProducts.length === 0 && typeof products !== 'undefined') {
        cachedProducts = products;
    } else {
        cachedProducts = supabaseProducts.map(p => ({
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
}

// ---------- NAVIGATION ----------
function setupNavigation() {
    const links = document.querySelectorAll('.sidebar-link[data-section]');
    const pageTitle = document.getElementById('pageTitle');

    links.forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            const section = this.dataset.section;

            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
            const target = document.getElementById('section-' + section);
            if (target) target.style.display = 'block';

            pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
            document.getElementById('adminSidebar').classList.remove('active');

            // Refresh data from Supabase
            if (section === 'dashboard' || section === 'orders') {
                cachedOrders = await fetchOrdersFromSupabase();
                renderDashboard();
                renderOrders();
                updateOrdersBadge();
            }
            if (section === 'products') {
                await loadAdminData();
                renderProducts();
            }
        });
    });

    document.querySelectorAll('.card-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            const targetLink = document.querySelector(`.sidebar-link[data-section="${section}"]`);
            if (targetLink) targetLink.click();
        });
    });
}

function setupSidebarToggle() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (toggle) {
        toggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
}

// ---------- PRODUCTS ----------
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (cachedProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Koi products nahi</td></tr>';
        return;
    }

    let html = '';
    cachedProducts.forEach(p => {
        const balance = (p.stock || 0) - (p.sold || 0);
        let stockClass = 'stock-ok';
        if (balance <= 0) stockClass = 'stock-out';
        else if (balance <= 5) stockClass = 'stock-low';

        html += `
            <tr>
                <td><div class="admin-prod-img" style="background-image: url('${p.image}');"></div></td>
                <td><strong>${p.name}</strong></td>
                <td>${getCategoryName(p.category)}</td>
                <td>Rs. ${p.price.toLocaleString()}</td>
                <td>${p.stock || 0}</td>
                <td>${p.sold || 0}</td>
                <td><span class="stock-badge ${stockClass}">${balance}</span></td>
                <td>
                    <button class="action-btn action-btn-edit" onclick="editProduct(${p.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn action-btn-delete" onclick="deleteProduct(${p.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ---------- PRODUCT MODAL ----------
function setupProductModal() {
    const addBtn = document.getElementById('addProductBtn');
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('productModalClose');
    const cancelBtn = document.getElementById('productCancelBtn');
    const form = document.getElementById('productForm');
    const categorySelect = document.getElementById('pCategory');
    const subcategorySelect = document.getElementById('pSubcategory');

    if (addBtn) {
        addBtn.addEventListener('click', function() {
            document.getElementById('productModalTitle').textContent = 'Add New Product';
            form.reset();
            document.getElementById('productEditId').value = '';
            subcategorySelect.innerHTML = '<option value="">None</option>';
            modal.classList.add('active');
        });
    
        // ---------- IMAGE UPLOAD ----------
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', async function() {
            const file = await pickImageFile();
            if (!file) return;

            const statusEl = document.getElementById('uploadImageStatus');
            statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            uploadImageBtn.disabled = true;

            const result = await uploadImageToCloudinary(file);

            uploadImageBtn.disabled = false;

            if (result.success) {
                document.getElementById('pImage').value = result.url;
                statusEl.innerHTML = '<span style="color:#27ae60;"><i class="fas fa-check"></i> Upload ho gayi!</span>';

                // Preview
                const preview = document.getElementById('imagePreview');
                const previewImg = document.getElementById('imagePreviewImg');
                previewImg.src = result.url;
                preview.style.display = 'block';
            } else {
                statusEl.innerHTML = '<span style="color:#c0392b;">Error: ' + result.error + '</span>';
            }
        });
    }

    // ---------- VIDEO UPLOAD ----------
    const uploadVideoBtn = document.getElementById('uploadVideoBtn');
    if (uploadVideoBtn) {
        uploadVideoBtn.addEventListener('click', async function() {
            const file = await pickVideoFile();
            if (!file) return;

            const statusEl = document.getElementById('uploadVideoStatus');
            statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading (thoda waqt lagega)...';
            uploadVideoBtn.disabled = true;

            const result = await uploadVideoToCloudinary(file);

            uploadVideoBtn.disabled = false;

            if (result.success) {
                document.getElementById('pVideo').value = result.url;
                statusEl.innerHTML = '<span style="color:#27ae60;"><i class="fas fa-check"></i> Video upload ho gayi!</span>';
            } else {
                statusEl.innerHTML = '<span style="color:#c0392b;">Error: ' + result.error + '</span>';
            }
        });
    }
    
    
    }

    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) btn.addEventListener('click', () => modal.classList.remove('active'));
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.classList.remove('active');
    });

    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const cat = this.value;
            subcategorySelect.innerHTML = '<option value="">None</option>';
            if (cat && typeof categories !== 'undefined' && categories[cat]) {
                categories[cat].subcategories.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.textContent = sub;
                    subcategorySelect.appendChild(opt);
                });
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const editId = document.getElementById('productEditId').value;
            const productData = {
                name: document.getElementById('pName').value.trim(),
                category: document.getElementById('pCategory').value,
                subcategory: document.getElementById('pSubcategory').value,
                price: parseFloat(document.getElementById('pPrice').value),
                stock: parseInt(document.getElementById('pStock').value),
                sold: 0,
                image: document.getElementById('pImage').value.trim(),
                video: document.getElementById('pVideo').value.trim(),
                sizes: document.getElementById('pSizes').value.split(',').map(s => s.trim()).filter(Boolean).join(', '),
                colors: document.getElementById('pColors').value.split(',').map(c => c.trim()).filter(Boolean).join(', '),
                description: document.getElementById('pDescription').value.trim()
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            const origText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            let result;
            if (editId) {
                result = await updateProductInSupabase(parseInt(editId), productData);
            } else {
                result = await addProductToSupabase(productData);
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;

            if (result.success) {
                modal.classList.remove('active');
                await loadAdminData();
                renderProducts();
                renderDashboard();
                alert('Product save ho gaya!');
            } else {
                alert('Error: ' + (result.error || 'Save nahi hua'));
            }
        });
    }
}

// ---------- EDIT ----------
function editProduct(id) {
    const product = cachedProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productEditId').value = product.id;
    document.getElementById('pImage').value = product.image || '';
    document.getElementById('pVideo').value = product.video || '';
    document.getElementById('pName').value = product.name || '';
    document.getElementById('pCategory').value = product.category || '';
    document.getElementById('pCategory').dispatchEvent(new Event('change'));
    document.getElementById('pSubcategory').value = product.subcategory || '';
    document.getElementById('pPrice').value = product.price || '';
    document.getElementById('pStock').value = product.stock || '';
    document.getElementById('pSizes').value = (product.sizes || []).join(', ');
    document.getElementById('pColors').value = (product.colors || []).join(', ');
    document.getElementById('pDescription').value = product.description || '';

    document.getElementById('productModal').classList.add('active');
}

// ---------- DELETE ----------
async function deleteProduct(id) {
    if (!confirm('Ye product delete karna chahte hain?')) return;

    const result = await deleteProductFromSupabase(id);
    if (result.success) {
        await loadAdminData();
        renderProducts();
        renderDashboard();
        alert('Product delete ho gaya!');
    } else {
        alert('Delete nahi hua: ' + (result.error || ''));
    }
}

// ---------- ORDERS ----------
function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (cachedOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Koi orders nahi</td></tr>';
        return;
    }

    const activeTab = document.querySelector('.order-tab.active');
    const filterStatus = activeTab ? activeTab.dataset.status : 'all';
    const filtered = filterStatus === 'all' ? cachedOrders : cachedOrders.filter(o => o.status === filterStatus);

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Is status mein koi order nahi</td></tr>';
        return;
    }

    let html = '';
    filtered.forEach(o => {
        const d = new Date(o.created_at);
        const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

        html += `
            <tr>
                <td><strong>${o.order_id}</strong></td>
                <td>${o.customer_name}</td>
                <td>${o.customer_phone}</td>
                <td><strong>Rs. ${(o.grand_total || 0).toLocaleString()}</strong></td>
                <td>${o.payment_method === 'cod' ? 'COD' : 'Advance'}</td>
                <td>${dateStr}</td>
                <td>
                    <select class="order-status-select" onchange="changeOrderStatus('${o.order_id}', this.value)">
                        <option value="received" ${o.status === 'received' ? 'selected' : ''}>Received</option>
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="complete" ${o.status === 'complete' ? 'selected' : ''}>Complete</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn action-btn-view" onclick="viewOrder('${o.order_id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <a href="invoice.html?order=${o.order_id}" target="_blank" class="action-btn action-btn-view" title="Invoice">
                        <i class="fas fa-file-invoice"></i>
                    </a>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

async function changeOrderStatus(orderId, newStatus) {
    const result = await updateOrderStatusInSupabase(orderId, newStatus);
    if (result.success) {
        cachedOrders = await fetchOrdersFromSupabase();
        renderDashboard();
        updateOrdersBadge();
    } else {
        alert('Status update nahi hua: ' + (result.error || ''));
    }
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('order-tab')) {
        document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        renderOrders();
    }
});

// ---------- ORDER MODAL ----------
function setupOrderModal() {
    const modal = document.getElementById('orderModal');
    const closeBtn = document.getElementById('orderModalClose');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.classList.remove('active');
    });
}

function viewOrder(orderId) {
    const order = cachedOrders.find(o => o.order_id === orderId);
    if (!order) return;

    const d = new Date(order.created_at);
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    let itemsHtml = '';
    items.forEach(item => {
        itemsHtml += `
            <p>
                <strong>${item.name}</strong><br>
                Qty: ${item.quantity} × Rs. ${item.price.toLocaleString()} = Rs. ${(item.quantity * item.price).toLocaleString()}
            </p>
        `;
    });

    const body = document.getElementById('orderModalBody');
    body.innerHTML = `
        <div class="order-detail-section">
            <h3>Order Info</h3>
            <p><strong>Order ID:</strong> ${order.order_id}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
            <p><strong>Status:</strong> <span class="status-badge-admin status-${order.status}">${order.status}</span></p>
        </div>
        <div class="order-detail-section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>City:</strong> ${order.customer_city}</p>
            <p><strong>Address:</strong> ${order.customer_address}</p>
        </div>
        <div class="order-detail-section">
            <h3>Payment Method</h3>
            <p><strong>Method:</strong> ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Advance Payment'}</p>
            ${order.payment_trx ? `<p><strong>TRX ID:</strong> ${order.payment_trx}</p>` : ''}
            ${order.payment_account && order.payment_method === 'advance' ? `<p><strong>Account:</strong> ${order.payment_account}</p>` : ''}
        </div>
        <div class="order-detail-section">
            <h3>Items (${items.length})</h3>
            ${itemsHtml}
        </div>
        <div class="order-detail-section">
            <h3>Totals</h3>
            <p><strong>Subtotal:</strong> Rs. ${(order.subtotal || 0).toLocaleString()}</p>
            <p><strong>Delivery Charges:</strong> Rs. ${(order.dc || 0).toLocaleString()}</p>
            <p style="font-size:16px; margin-top:10px;"><strong>Grand Total:</strong> <span style="color:var(--admin-gold); font-weight:700;">Rs. ${(order.grand_total || 0).toLocaleString()}</span></p>
        </div>
    `;

    document.getElementById('orderModal').classList.add('active');
}

// ---------- DASHBOARD ----------
function renderDashboard() {
    const orders = cachedOrders;
    const now = new Date();

    let today = 0, week = 0, month = 0, year = 0;

    orders.forEach(o => {
        const d = new Date(o.created_at);
        const total = o.grand_total || 0;

        if (d.toDateString() === now.toDateString()) today += total;

        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (d >= weekAgo) week += total;

        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) month += total;
        if (d.getFullYear() === now.getFullYear()) year += total;
    });

    document.getElementById('statToday').textContent = 'Rs. ' + today.toLocaleString();
    document.getElementById('statWeek').textContent = 'Rs. ' + week.toLocaleString();
    document.getElementById('statMonth').textContent = 'Rs. ' + month.toLocaleString();
    document.getElementById('statYear').textContent = 'Rs. ' + year.toLocaleString();

    const counts = { received: 0, pending: 0, delivered: 0, complete: 0 };
    orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

    document.getElementById('statReceived').textContent = counts.received;
    document.getElementById('statPending').textContent = counts.pending;
    document.getElementById('statDelivered').textContent = counts.delivered;
    document.getElementById('statComplete').textContent = counts.complete;

    let totalStock = 0, totalSold = 0;
    cachedProducts.forEach(p => {
        totalStock += (p.stock || 0);
        totalSold += (p.sold || 0);
    });

    document.getElementById('statTotalProducts').textContent = cachedProducts.length;
    document.getElementById('statTotalStock').textContent = totalStock;
    document.getElementById('statTotalSold').textContent = totalSold;
    document.getElementById('statTotalOrders').textContent = orders.length;

    const recent = orders.slice(0, 5);
    const tbody = document.getElementById('recentOrdersBody');

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-row">Koi orders nahi</td></tr>';
    } else {
        let html = '';
        recent.forEach(o => {
            const d = new Date(o.created_at);
            html += `
                <tr>
                    <td><strong>${o.order_id}</strong></td>
                    <td>${o.customer_name}</td>
                    <td>Rs. ${(o.grand_total || 0).toLocaleString()}</td>
                    <td>${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span class="status-badge-admin status-${o.status}">${o.status}</span></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }
}

function updateOrdersBadge() {
    const received = cachedOrders.filter(o => o.status === 'received').length;
    const badge = document.getElementById('ordersBadge');
    if (badge) {
        badge.textContent = received;
        badge.style.display = received > 0 ? 'inline-block' : 'none';
    }
}

// ---------- SETTINGS ----------
function setupSettingsForms() {
    const passForm = document.getElementById('passwordForm');
    if (passForm) {
        passForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const current = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            const saved = localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD;

            if (current !== saved) { alert('Current password ghalat hai.'); return; }
            if (newPass.length < 6) { alert('Naya password kam az kam 6 characters.'); return; }
            if (newPass !== confirm) { alert('Naya password match nahi karta.'); return; }

            localStorage.setItem(PASS_KEY, newPass);
            alert('Password update ho gaya!');
            passForm.reset();
        });
    }

    const payForm = document.getElementById('paymentForm');
    if (payForm) {
        loadPaymentSettings();
        payForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const data = {
                easypaisaTitle: document.getElementById('easypaisaTitle').value,
                easypaisaNumber: document.getElementById('easypaisaNumber').value,
                jazzcashTitle: document.getElementById('jazzcashTitle').value,
                jazzcashNumber: document.getElementById('jazzcashNumber').value,
                bankName: document.getElementById('bankName').value,
                bankTitle: document.getElementById('bankTitle').value,
                bankAccount: document.getElementById('bankAccount').value,
                bankIban: document.getElementById('bankIban').value
            };
            localStorage.setItem('shahgee_payment_settings', JSON.stringify(data));
            alert('Payment accounts save ho gaye!');
        });
    }

    const emailForm = document.getElementById('emailsForm');
    if (emailForm) {
        loadEmailSettings();
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const data = {
                email1: document.getElementById('adminEmail1').value,
                email2: document.getElementById('adminEmail2').value,
                email3: document.getElementById('adminEmail3').value
            };
            localStorage.setItem('shahgee_admin_emails', JSON.stringify(data));
            alert('Admin emails save ho gayin!');
        });
    }
}

function loadPaymentSettings() {
    const data = JSON.parse(localStorage.getItem('shahgee_payment_settings') || '{}');
    if (data.easypaisaTitle) document.getElementById('easypaisaTitle').value = data.easypaisaTitle;
    if (data.easypaisaNumber) document.getElementById('easypaisaNumber').value = data.easypaisaNumber;
    if (data.jazzcashTitle) document.getElementById('jazzcashTitle').value = data.jazzcashTitle;
    if (data.jazzcashNumber) document.getElementById('jazzcashNumber').value = data.jazzcashNumber;
    if (data.bankName) document.getElementById('bankName').value = data.bankName;
    if (data.bankTitle) document.getElementById('bankTitle').value = data.bankTitle;
    if (data.bankAccount) document.getElementById('bankAccount').value = data.bankAccount;
    if (data.bankIban) document.getElementById('bankIban').value = data.bankIban;
}

function loadEmailSettings() {
    const data = JSON.parse(localStorage.getItem('shahgee_admin_emails') || '{}');
    if (data.email1) document.getElementById('adminEmail1').value = data.email1;
    if (data.email2) document.getElementById('adminEmail2').value = data.email2;
    if (data.email3) document.getElementById('adminEmail3').value = data.email3;
}

function getCategoryName(slug) {
    if (typeof categories !== 'undefined' && categories[slug]) {
        return categories[slug].name;
    }
    return slug;
}