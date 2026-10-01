// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Admin Panel Logic
// ============================================

const DEFAULT_PASSWORD = 'shahgee2026';
const AUTH_KEY = 'shahgee_admin_auth';
const PASS_KEY = 'shahgee_admin_password';
const PRODUCTS_KEY = 'shahgee_custom_products';

// ---------- LOGIN ----------
document.addEventListener('DOMContentLoaded', function() {
    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    // Check if already logged in
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
        loginScreen.style.display = 'none';
        adminApp.style.display = 'grid';
        initAdmin();
    }

    // Login submit
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

    // Logout
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

// ---------- INIT ADMIN ----------
function initAdmin() {
    setupNavigation();
    setupSidebarToggle();
    setupProductModal();
    setupOrderModal();
    setupSettingsForms();
    renderDashboard();
    renderProducts();
    renderOrders();
    updateOrdersBadge();
}

// ---------- NAVIGATION ----------
function setupNavigation() {
    const links = document.querySelectorAll('.sidebar-link[data-section]');
    const pageTitle = document.getElementById('pageTitle');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;

            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
            const target = document.getElementById('section-' + section);
            if (target) target.style.display = 'block';

            pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);

            // Close sidebar on mobile
            document.getElementById('adminSidebar').classList.remove('active');

            // Refresh data
            if (section === 'dashboard') renderDashboard();
            if (section === 'products') renderProducts();
            if (section === 'orders') renderOrders();
        });
    });

    // View all orders link on dashboard
    document.querySelectorAll('.card-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            const targetLink = document.querySelector(`.sidebar-link[data-section="${section}"]`);
            if (targetLink) targetLink.click();
        });
    });
}

// ---------- SIDEBAR TOGGLE ----------
function setupSidebarToggle() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (toggle) {
        toggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
}

// ---------- PRODUCTS MANAGEMENT ----------
function getCustomProducts() {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
}

function saveCustomProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function getAllAdminProducts() {
    const base = typeof products !== 'undefined' ? products : [];
    const custom = getCustomProducts();
    return [...custom, ...base];
}

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const allProducts = getAllAdminProducts();

    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Koi products nahi</td></tr>';
        return;
    }

    let html = '';
    allProducts.forEach(p => {
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

    // Open modal
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            document.getElementById('productModalTitle').textContent = 'Add New Product';
            form.reset();
            document.getElementById('productEditId').value = '';
            subcategorySelect.innerHTML = '<option value="">None</option>';
            modal.classList.add('active');
        });
    }

    // Close modal
    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                modal.classList.remove('active');
            });
        }
    });

    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Category change → update subcategories
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

    // Form submit
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const editId = document.getElementById('productEditId').value;
            const productData = {
                id: editId ? parseInt(editId) : Date.now(),
                name: document.getElementById('pName').value.trim(),
                category: document.getElementById('pCategory').value,
                subcategory: document.getElementById('pSubcategory').value,
                price: parseFloat(document.getElementById('pPrice').value),
                stock: parseInt(document.getElementById('pStock').value),
                sold: 0,
                image: document.getElementById('pImage').value.trim(),
                video: document.getElementById('pVideo').value.trim(),
                sizes: document.getElementById('pSizes').value.split(',').map(s => s.trim()).filter(Boolean),
                colors: document.getElementById('pColors').value.split(',').map(c => c.trim()).filter(Boolean),
                description: document.getElementById('pDescription').value.trim()
            };

            const customProducts = getCustomProducts();

            if (editId) {
                // Edit existing
                const index = customProducts.findIndex(p => p.id === parseInt(editId));
                if (index !== -1) {
                    productData.sold = customProducts[index].sold || 0;
                    customProducts[index] = productData;
                } else {
                    // Was a base product — add as override
                    customProducts.push(productData);
                }
            } else {
                // New
                customProducts.unshift(productData);
            }

            saveCustomProducts(customProducts);
            modal.classList.remove('active');
            renderProducts();
            alert('Product save ho gaya!');
        });
    }
}

// ---------- EDIT PRODUCT ----------
function editProduct(id) {
    const allProducts = getAllAdminProducts();
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productEditId').value = product.id;
    document.getElementById('pImage').value = product.image || '';
    document.getElementById('pVideo').value = product.video || '';
    document.getElementById('pName').value = product.name || '';
    document.getElementById('pCategory').value = product.category || '';

    // Trigger category change to populate subcategories
    document.getElementById('pCategory').dispatchEvent(new Event('change'));
    document.getElementById('pSubcategory').value = product.subcategory || '';

    document.getElementById('pPrice').value = product.price || '';
    document.getElementById('pStock').value = product.stock || '';
    document.getElementById('pSizes').value = (product.sizes || []).join(', ');
    document.getElementById('pColors').value = (product.colors || []).join(', ');
    document.getElementById('pDescription').value = product.description || '';

    document.getElementById('productModal').classList.add('active');
}

// ---------- DELETE PRODUCT ----------
function deleteProduct(id) {
    if (!confirm('Ye product delete karna chahte hain?')) return;

    let customProducts = getCustomProducts();
    customProducts = customProducts.filter(p => p.id !== id);
    saveCustomProducts(customProducts);

    // If it was a base product, hide it via a "deleted" flag — simple approach: just skip base
    // For simplicity, we only delete custom ones
    renderProducts();
    alert('Product delete ho gaya!');
}

// ---------- ORDERS MANAGEMENT ----------
function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const orders = getOrders();

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Koi orders nahi</td></tr>';
        return;
    }

    const activeTab = document.querySelector('.order-tab.active');
    const filterStatus = activeTab ? activeTab.dataset.status : 'all';
    const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Is status mein koi order nahi</td></tr>';
        return;
    }

    let html = '';
    filtered.slice().reverse().forEach(o => {
        const d = new Date(o.date);
        const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

        html += `
            <tr>
                <td><strong>${o.orderId}</strong></td>
                <td>${o.customer.name}</td>
                <td>${o.customer.phone}</td>
                <td><strong>Rs. ${o.totals.grand.toLocaleString()}</strong></td>
                <td>${o.payment.method === 'cod' ? 'COD' : 'Advance'}</td>
                <td>${dateStr}</td>
                <td>
                    <select class="order-status-select status-${o.status}" onchange="changeOrderStatus('${o.orderId}', this.value)">
                        <option value="received" ${o.status === 'received' ? 'selected' : ''}>Received</option>
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="complete" ${o.status === 'complete' ? 'selected' : ''}>Complete</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn action-btn-view" onclick="viewOrder('${o.orderId}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <a href="invoice.html?order=${o.orderId}" target="_blank" class="action-btn action-btn-view" title="Invoice">
                        <i class="fas fa-file-invoice"></i>
                    </a>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function changeOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('shahgee_orders', JSON.stringify(orders));
        updateOrdersBadge();
        renderDashboard();
    }
}

// Order tabs
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('order-tab')) {
        document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        renderOrders();
    }
});

// ---------- ORDER DETAIL MODAL ----------
function setupOrderModal() {
    const modal = document.getElementById('orderModal');
    const closeBtn = document.getElementById('orderModalClose');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.classList.remove('active');
    });
}

function viewOrder(orderId) {
    const order = getOrderById(orderId);
    if (!order) return;

    const d = new Date(order.date);
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    let itemsHtml = '';
    order.items.forEach(item => {
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
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
            <p><strong>Status:</strong> <span class="status-badge-admin status-${order.status}">${order.status}</span></p>
        </div>

        <div class="order-detail-section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>City:</strong> ${order.customer.city}</p>
            <p><strong>Address:</strong> ${order.customer.address}</p>
        </div>

        <div class="order-detail-section">
            <h3>Payment Method</h3>
            <p><strong>Method:</strong> ${order.payment.method === 'cod' ? 'Cash on Delivery' : 'Advance Payment'}</p>
            ${order.payment.trxId ? `<p><strong>TRX ID:</strong> ${order.payment.trxId}</p>` : ''}
            ${order.payment.account && order.payment.method === 'advance' ? `<p><strong>Account:</strong> ${order.payment.account}</p>` : ''}
        </div>

        <div class="order-detail-section">
            <h3>Items (${order.items.length})</h3>
            ${itemsHtml}
        </div>

        <div class="order-detail-section">
            <h3>Totals</h3>
            <p><strong>Subtotal:</strong> Rs. ${order.totals.subtotal.toLocaleString()}</p>
            <p><strong>Delivery Charges:</strong> Rs. ${order.totals.dc.toLocaleString()}</p>
            <p style="font-size:16px; margin-top:10px;"><strong>Grand Total:</strong> <span style="color:var(--admin-gold); font-weight:700;">Rs. ${order.totals.grand.toLocaleString()}</span></p>
        </div>
    `;

    document.getElementById('orderModal').classList.add('active');
}

// ---------- DASHBOARD STATS ----------
function renderDashboard() {
    const orders = getOrders();
    const now = new Date();

    // Sales stats
    let today = 0, week = 0, month = 0, year = 0;

    orders.forEach(o => {
        const d = new Date(o.date);
        const total = o.totals.grand;

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

    // Order status counts
    const counts = { received: 0, pending: 0, delivered: 0, complete: 0 };
    orders.forEach(o => {
        if (counts[o.status] !== undefined) counts[o.status]++;
    });

    document.getElementById('statReceived').textContent = counts.received;
    document.getElementById('statPending').textContent = counts.pending;
    document.getElementById('statDelivered').textContent = counts.delivered;
    document.getElementById('statComplete').textContent = counts.complete;

    // Product stats
    const allProducts = getAllAdminProducts();
    let totalStock = 0, totalSold = 0;
    allProducts.forEach(p => {
        totalStock += (p.stock || 0);
        totalSold += (p.sold || 0);
    });

    document.getElementById('statTotalProducts').textContent = allProducts.length;
    document.getElementById('statTotalStock').textContent = totalStock;
    document.getElementById('statTotalSold').textContent = totalSold;
    document.getElementById('statTotalOrders').textContent = orders.length;

    // Recent orders
    const recent = orders.slice().reverse().slice(0, 5);
    const tbody = document.getElementById('recentOrdersBody');

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-row">Koi orders nahi</td></tr>';
    } else {
        let html = '';
        recent.forEach(o => {
            const d = new Date(o.date);
            html += `
                <tr>
                    <td><strong>${o.orderId}</strong></td>
                    <td>${o.customer.name}</td>
                    <td>Rs. ${o.totals.grand.toLocaleString()}</td>
                    <td>${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span class="status-badge-admin status-${o.status}">${o.status}</span></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }
}

// ---------- ORDERS BADGE ----------
function updateOrdersBadge() {
    const orders = getOrders();
    const received = orders.filter(o => o.status === 'received').length;
    const badge = document.getElementById('ordersBadge');
    if (badge) {
        badge.textContent = received;
        badge.style.display = received > 0 ? 'inline-block' : 'none';
    }
}

// ---------- SETTINGS FORMS ----------
function setupSettingsForms() {
    // Password change
    const passForm = document.getElementById('passwordForm');
    if (passForm) {
        passForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const current = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            const saved = localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD;

            if (current !== saved) {
                alert('Current password ghalat hai.');
                return;
            }
            if (newPass.length < 6) {
                alert('Naya password kam az kam 6 characters ka hona chahiye.');
                return;
            }
            if (newPass !== confirm) {
                alert('Naya password aur confirm password match nahi karte.');
                return;
            }

            localStorage.setItem(PASS_KEY, newPass);
            alert('Password update ho gaya!');
            passForm.reset();
        });
    }

    // Payment accounts
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

    // Emails
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