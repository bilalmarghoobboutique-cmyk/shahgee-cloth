// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Invoice Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');

    const loading = document.getElementById('invoiceLoading');
    const notFound = document.getElementById('invoiceNotFound');
    const content = document.getElementById('invoiceContent');

    if (!orderId) {
        loading.style.display = 'none';
        notFound.style.display = 'block';
        return;
    }

    const order = getOrderById(orderId);

    if (!order) {
        loading.style.display = 'none';
        notFound.style.display = 'block';
        return;
    }

    loading.style.display = 'none';
    content.style.display = 'block';
    renderInvoice(order);
});

function renderInvoice(order) {
    document.getElementById('invOrderId').textContent = order.orderId;

    const d = new Date(order.date);
    const dateStr = d.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('invDate').textContent = dateStr;

    const statusEl = document.getElementById('invStatus');
    statusEl.textContent = capitalize(order.status);
    statusEl.className = 'status-badge status-' + order.status;

    document.getElementById('invCustName').textContent = order.customer.name;
    document.getElementById('invCustPhone').textContent = '📞 ' + order.customer.phone;
    document.getElementById('invCustEmail').textContent = '✉ ' + order.customer.email;
    document.getElementById('invCustAddress').textContent = order.customer.address;
    document.getElementById('invCustCity').textContent = order.customer.city;

    const methodEl = document.getElementById('invPaymentMethod');
    if (order.payment.method === 'cod') {
        methodEl.textContent = 'Cash on Delivery (COD)';
        document.getElementById('invPaymentAccount').style.display = 'none';
        document.getElementById('invPaymentTrx').style.display = 'none';
    } else {
        const accountNames = {
            easypaisa: 'EasyPaisa',
            jazzcash: 'JazzCash',
            bank: 'Bank Transfer'
        };
        methodEl.textContent = 'Advance Payment';
        const accEl = document.getElementById('invPaymentAccount');
        accEl.textContent = 'Account: ' + (accountNames[order.payment.account] || order.payment.account);
        accEl.style.display = 'block';

        const trxEl = document.getElementById('invPaymentTrx');
        trxEl.textContent = 'TRX ID: ' + order.payment.trxId;
        trxEl.style.display = 'block';
    }

    const tbody = document.getElementById('invProducts');
    let html = '';
    order.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><div class="inv-product-name">${item.name}</div></td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">Rs. ${item.price.toLocaleString()}</td>
                <td style="text-align:right; font-weight:600;">Rs. ${itemTotal.toLocaleString()}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;

    document.getElementById('invSubtotal').textContent = `Rs. ${order.totals.subtotal.toLocaleString()}`;
    document.getElementById('invItems').textContent = order.totals.totalItems;
    document.getElementById('invDC').textContent = `Rs. ${order.totals.dc.toLocaleString()}`;
    document.getElementById('invGrand').textContent = `Rs. ${order.totals.grand.toLocaleString()}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}