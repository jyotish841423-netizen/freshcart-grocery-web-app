/**
 * FreshCart - Cart Page Logic
 * Manages item list, quantity changes, item removal, and order summary calculation.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadCartDetails();
});

async function loadCartDetails() {
    const layout = document.getElementById('cart-content-wrapper');
    if (!layout) return;

    try {
        const userId = getCurrentUserId();
        const res = await fetch(`/api/cart?user_id=${encodeURIComponent(userId)}`);
        const data = await res.json();

        if (data.success && data.items && data.items.length > 0) {
            renderCartPage(data);
        } else {
            renderEmptyCart();
        }
        updateCartBadge();
    } catch (err) {
        console.error('Failed to load cart:', err);
        layout.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Failed to load your cart</h3>
                <p>Could not reach the server. Please try refreshing.</p>
                <button class="btn btn-primary" onclick="loadCartDetails()">Retry</button>
            </div>
        `;
    }
}

function renderCartPage(data) {
    const layout = document.getElementById('cart-content-wrapper');
    const freeDeliveryLeft = Math.max(0, 300 - data.subtotal);

    layout.innerHTML = `
        <div class="cart-layout">
            <!-- Left: Cart Items List -->
            <div class="cart-items-card">
                <div class="cart-header-row">
                    <h2>Shopping Cart (${data.item_count} items)</h2>
                    <button class="btn btn-sm btn-danger" onclick="clearFullCart()">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                        Clear Cart
                    </button>
                </div>

                <div class="cart-items-list">
                    ${data.items.map(item => `
                        <div class="cart-item" id="cart-item-${item.id}">
                            <img 
                                src="${item.image}" 
                                alt="${item.name}" 
                                class="cart-item-img"
                                onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'"
                            />
                            <div class="cart-item-info">
                                <h4>${item.name}</h4>
                                <p class="cart-item-unit">${item.unit}</p>
                                <p class="cart-item-price">${formatCurrency(item.price)} each</p>
                            </div>
                            
                            <div class="qty-stepper">
                                <button 
                                    class="qty-btn" 
                                    onclick="updateQuantity('${item.id}', ${item.quantity - 1})"
                                    title="Decrease quantity"
                                >-</button>
                                <span class="qty-value">${item.quantity}</span>
                                <button 
                                    class="qty-btn" 
                                    onclick="updateQuantity('${item.id}', ${item.quantity + 1})"
                                    title="Increase quantity"
                                >+</button>
                            </div>

                            <div style="display:flex; align-items:center; gap: 1rem;">
                                <div class="cart-item-total">
                                    ${formatCurrency(item.item_total)}
                                </div>
                                <button 
                                    class="btn-remove-item" 
                                    onclick="removeItemFromCart('${item.id}')"
                                    title="Remove item"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Right: Order Summary -->
            <div class="summary-card">
                <h3>Order Summary</h3>
                
                ${freeDeliveryLeft > 0 ? `
                    <div class="free-delivery-badge">
                        🚚 Add <strong>${formatCurrency(freeDeliveryLeft)}</strong> more to get FREE Delivery!
                    </div>
                ` : `
                    <div class="free-delivery-badge" style="background:#dcfce7; color:#15803d; border-color:#86efac;">
                        🎉 You've unlocked FREE Home Delivery!
                    </div>
                `}

                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${formatCurrency(data.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Delivery Fee</span>
                    <span>${data.delivery_fee === 0 ? '<span style="color:var(--success); font-weight:700;">FREE</span>' : formatCurrency(data.delivery_fee)}</span>
                </div>
                <div class="summary-row total-row">
                    <span>Total Amount</span>
                    <span style="color:var(--primary-dark); font-size: 1.35rem;">${formatCurrency(data.total)}</span>
                </div>

                <a href="/checkout" class="btn btn-primary btn-block" style="margin-top: 1.25rem;">
                    Proceed to Checkout
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                </a>

                <a href="/products" class="btn btn-secondary btn-block" style="margin-top: 0.75rem;">
                    ← Continue Shopping
                </a>
            </div>
        </div>
    `;
}

function renderEmptyCart() {
    const layout = document.getElementById('cart-content-wrapper');
    layout.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🛒</div>
            <h3>Your Cart is Empty</h3>
            <p>Looks like you haven't added any fresh groceries yet. Explore our pantry, farm fresh fruits, and daily essentials!</p>
            <a href="/products" class="btn btn-primary" style="display:inline-flex;">
                Start Shopping Now
            </a>
        </div>
    `;
}

async function updateQuantity(itemId, newQty) {
    try {
        const res = await fetch(`/api/cart/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQty })
        });
        const data = await res.json();
        if (data.success) {
            loadCartDetails();
        } else {
            showToast(data.message || 'Could not update quantity', 'error');
        }
    } catch (err) {
        showToast('Network error while updating quantity', 'error');
    }
}

async function removeItemFromCart(itemId) {
    try {
        const res = await fetch(`/api/cart/${itemId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            showToast('Item removed from cart', 'success');
            loadCartDetails();
        } else {
            showToast(data.message || 'Could not remove item', 'error');
        }
    } catch (err) {
        showToast('Network error while removing item', 'error');
    }
}

async function clearFullCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
        const userId = getCurrentUserId();
        const res = await fetch(`/api/cart?user_id=${encodeURIComponent(userId)}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            showToast('Cart cleared', 'success');
            loadCartDetails();
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}
