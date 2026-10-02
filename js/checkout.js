// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Checkout Page Logic (Supabase Integrated)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const cart = getCart();
    const emptyCheckout = document.getElementById('emptyCheckout');
    const checkoutForm = document.getElementById('checkoutForm');

    if (!checkoutForm) return;

    if (cart.length === 0) {
        emptyCheckout.style.display = 'block';
        checkoutForm.style.display = 'none';
        return;
    }

    emptyCheckout.style.display = 'none';
    checkoutForm.style.display = 'grid';

    renderCheckoutSummary(cart);
    setupPaymentToggle();
    setupAdvanceTabs();
    setupFormValidation();
    setupFormSubmit();
});

// ---------- SUMMARY ----------
function renderCheckoutSummary(cart) {
    const itemsEl = document.getElementById('checkoutItems');
    let html = '';
    let subtotal = 0;
    let totalQty = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        totalQty += item.quantity;

        html += `
            <div class="checkout-item">
                <div class="checkout-item-img" style="background-image: url('${item.image}');"></div>
                <div class="checkout-item-info">
                    <h5>${item.name}</h5>
                    <p>Qty: ${item.quantity} × Rs. ${item.price.toLocaleString()}</p>
                </div>
                <div class="checkout-item-price">Rs. ${itemTotal.toLocaleString()}</div>
            </div>
        `;
    });

    itemsEl.innerHTML = html;

    const dc = totalQty * DC_PER_ITEM;
    const grand = subtotal + dc;

    document.getElementById('coSubtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
    document.getElementById('coItems').textContent = totalQty;
    document.getElementById('coDC').textContent = `Rs. ${dc.toLocaleString()}`;
    document.getElementById('coGrand').textContent = `Rs. ${grand.toLocaleString()}`;
}

// ---------- PAYMENT TOGGLE ----------
function setupPaymentToggle() {
    const radios = document.querySelectorAll('input[name="payment"]');
    const advanceSection = document.getElementById('advanceSection');

    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'advance') {
                advanceSection.style.display = 'block';
            } else {
                advanceSection.style.display = 'none';
            }
        });
    });
}

// ---------- ADVANCE TABS ----------
function setupAdvanceTabs() {
    const tabs = document.querySelectorAll('.advance-tab');
    const accounts = {
        easypaisa: document.getElementById('accountEasypaisa'),
        jazzcash: document.getElementById('accountJazzcash'),
        bank: document.getElementById('accountBank')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            Object.values(accounts).forEach(a => a.style.display = 'none');
            accounts[this.dataset.tab].style.display = 'block';
        });
    });
}

// ---------- VALIDATION ----------
function setupFormValidation() {
    const phone = document.getElementById('custPhone');
    phone.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 11);
    });
}

function validateForm() {
    let valid = true;

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group input, .form-group textarea')
        .forEach(el => el.classList.remove('invalid'));

    if (name.length < 3) {
        showError('custName', 'errName', 'Poora naam likhein (kam az kam 3 letters)');
        valid = false;
    }
    if (!/^03\d{9}$/.test(phone)) {
        showError('custPhone', 'errPhone', 'Phone number 03XX-XXXXXXX format mein likhein');
        valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('custEmail', 'errEmail', 'Sahi email address likhein');
        valid = false;
    }
    if (city.length < 2) {
        showError('custCity', 'errCity', 'City ka naam likhein');
        valid = false;
    }
    if (address.length < 10) {
        showError('custAddress', 'errAddress', 'Poora address likhein (kam az kam 10 letters)');
        valid = false;
    }

    const advanceSelected = document.querySelector('input[name="payment"]:checked').value === 'advance';
    if (advanceSelected) {
        const trx = document.getElementById('trxId').value.trim();
        if (trx.length < 5) {
            showError('trxId', 'errTrx', 'Transaction ID likhna zaroori hai');
            valid = false;
        }
    }

    return valid;
}

function showError(inputId, errId, msg) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (input) input.classList.add('invalid');
    if (err) err.textContent = msg;
}

// ---------- SUBMIT (SUPABASE) ----------
function setupFormSubmit() {
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            alert('Baraye meharbani form sahi tareeqe se bharein.');
            return;
        }

        // Button disable karein
        const submitBtn = document.getElementById('placeOrderBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Order save ho raha hai...';

        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const cart = getCart();
        const totals = calculateTotals();

        const orderData = {
            order_id: 'SG-' + Date.now(),
            customer_name: document.getElementById('custName').value.trim(),
            customer_phone: document.getElementById('custPhone').value.trim(),
            customer_email: document.getElementById('custEmail').value.trim(),
            customer_city: document.getElementById('custCity').value.trim(),
            customer_address: document.getElementById('custAddress').value.trim(),
            items: cart,
            subtotal: totals.subtotal,
            total_items: totals.totalItems,
            dc: totals.dc,
            grand_total: totals.grand,
            payment_method: paymentMethod,
            payment_account: paymentMethod === 'advance'
                ? document.querySelector('.advance-tab.active').dataset.tab
                : 'cod',
            payment_trx: paymentMethod === 'advance' ? document.getElementById('trxId').value.trim() : '',
            notes: document.getElementById('orderNotes').value.trim(),
            status: 'received'
        };

        // Supabase mein save karo
        const result = await saveOrderToSupabase(orderData);

        if (!result.success) {
            alert('Order save nahi hua. Internet ya keys check karein.\n\nError: ' + result.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }

        // LocalStorage mein bhi backup save karo (old format ke saath)
        const localOrderData = {
            orderId: orderData.order_id,
            date: new Date().toISOString(),
            customer: {
                name: orderData.customer_name,
                phone: orderData.customer_phone,
                email: orderData.customer_email,
                city: orderData.customer_city,
                address: orderData.customer_address
            },
            payment: {
                method: orderData.payment_method,
                trxId: orderData.payment_trx,
                account: orderData.payment_account
            },
            notes: orderData.notes,
            items: cart,
            status: 'received',
            totals: totals
        };
        saveOrder(localOrderData);

        // Cart khaali karo
        localStorage.removeItem('shahgee_cart');

        // Invoice pe redirect
        window.location.href = 'invoice.html?order=' + orderData.order_id;
    });
}

function calculateTotals() {
    const cart = getCart();
    let subtotal = 0;
    let qty = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        qty += item.quantity;
    });
    const dc = qty * DC_PER_ITEM;
    return {
        subtotal: subtotal,
        totalItems: qty,
        dc: dc,
        grand: subtotal + dc
    };
}