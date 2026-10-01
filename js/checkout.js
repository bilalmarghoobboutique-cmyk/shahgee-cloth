// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Checkout Page Logic
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

// ---------- SUMMARY RENDER ----------
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

// ---------- FORM VALIDATION ----------
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

// ---------- SUBMIT ----------
function setupFormSubmit() {
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!validateForm()) {
            alert('Baraye meharbani form sahi tareeqe se bharein.');
            return;
        }

        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        const orderData = {
            orderId: 'SG-' + Date.now(),
            date: new Date().toISOString(),
            customer: {
                name: document.getElementById('custName').value.trim(),
                phone: document.getElementById('custPhone').value.trim(),
                email: document.getElementById('custEmail').value.trim(),
                city: document.getElementById('custCity').value.trim(),
                address: document.getElementById('custAddress').value.trim()
            },
            payment: {
                method: paymentMethod,
                trxId: paymentMethod === 'advance' ? document.getElementById('trxId').value.trim() : '',
                account: paymentMethod === 'advance'
                    ? document.querySelector('.advance-tab.active').dataset.tab
                    : 'cod'
            },
            notes: document.getElementById('orderNotes').value.trim(),
            items: getCart(),
            status: 'received',
            totals: calculateTotals()
        };

        saveOrder(orderData);
        localStorage.removeItem('shahgee_cart');

        window.location.href = 'invoice.html?order=' + orderData.orderId;
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