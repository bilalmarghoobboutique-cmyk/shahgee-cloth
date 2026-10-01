// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Cart Logic
// ============================================

const DC_PER_ITEM = 300;

// Cart load
function getCart() {
    return JSON.parse(localStorage.getItem('shahgee_cart') || '[]');
}

// Cart save
function saveCart(cart) {
    localStorage.setItem('shahgee_cart', JSON.stringify(cart));
    updateCartCount();
}

// Add to cart
function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        const product = getProductById(productId);
        if (product) {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
    }

    saveCart(cart);
    alert('Product cart mein add ho gaya!');
}

// Remove from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartPage();
}

// Update quantity
function updateQuantity(productId, newQty) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = Math.max(1, newQty);
        saveCart(cart);
        renderCartPage();
    }
}

// Clear cart
function clearCart() {
    localStorage.removeItem('shahgee_cart');
    updateCartCount();
    renderCartPage();
}

// Cart count update (header mein)
function updateCartCount() {
    const cartCountEls = document.querySelectorAll('.cart-count');
    if (cartCountEls.length === 0) return;

    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEls.forEach(el => el.textContent = totalItems);
}

// ---------- CART PAGE RENDER ----------
function renderCartPage() {
    const cartBody = document.getElementById('cartBody');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');

    if (!cartBody) return;

    const cart = getCart();

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartContent.style.display = 'grid';

    let html = '';
    let subtotal = 0;
    let totalQty = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        totalQty += item.quantity;

        html += `
            <tr>
                <td>
                    <div class="cart-product">
                        <div class="cart-product-img" style="background-image: url('${item.image}');"></div>
                        <div class="cart-product-info">
                            <h4>${item.name}</h4>
                            <p>Product ID: #${item.id}</p>
                        </div>
                    </div>
                </td>
                <td><span class="cart-price">Rs. ${item.price.toLocaleString()}</span></td>
                <td>
                    <div class="cart-qty">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td><span class="cart-total">Rs. ${itemTotal.toLocaleString()}</span></td>
                <td>
                    <button class="cart-remove" onclick="removeFromCart(${item.id})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    cartBody.innerHTML = html;

    const dc = totalQty * DC_PER_ITEM;
    const grandTotal = subtotal + dc;

    document.getElementById('subtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
    document.getElementById('totalItems').textContent = totalQty;
    document.getElementById('dcAmount').textContent = `Rs. ${dc.toLocaleString()}`;
    document.getElementById('grandTotal').textContent = `Rs. ${grandTotal.toLocaleString()}`;
}

// ============================================
// ORDER STORAGE (shared across all pages)
// ============================================

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('shahgee_orders') || '[]');
    orders.push(order);
    localStorage.setItem('shahgee_orders', JSON.stringify(orders));
}

function getOrders() {
    return JSON.parse(localStorage.getItem('shahgee_orders') || '[]');
}

function getOrderById(orderId) {
    return getOrders().find(o => o.orderId === orderId);
}

// ---------- PAGE LOAD ----------
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    renderCartPage();

    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Kya aap waqai cart khaali karna chahte hain?')) {
                clearCart();
            }
        });
    }
});