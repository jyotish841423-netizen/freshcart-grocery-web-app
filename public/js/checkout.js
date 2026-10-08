/**
 * FreshCart - Checkout Page Logic
 * Prepares customer order, verifies cart contents, and places order via Flask REST API.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutReview();
    setupCheckoutForm();
});

let currentCartData = null;

async function loadCheckoutReview() {
    const itemsContainer = document.getElementById('checkout-items-list');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const deliveryEl = document.getElementById('checkout-delivery');
    const totalEl = document.getElementById('checkout-total');
    const placeOrderBtn = document.getElementById('btn-place-order');

    try {
        const userId = getCurrentUserId();
        const res = await fetch(`/api/cart?user_id=${encodeURIComponent(userId)}`);
        const data = await res.json();
        currentCartData = data;

        if (!data.success || !data.items || data.items.length === 0) {
            window.location.href = '/cart';
            return;
        }

        if (itemsContainer) {
            itemsContainer.innerHTML = data.items.map(item => `
                <div class="checkout-item-row">
                    <div>
                        <div style="font-weight:700;">${item.name}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">${item.quantity} × ${formatCurrency(item.price)} (${item.unit})</div>
                    </div>
                    <div style="font-weight:700; color:var(--primary-dark);">
                        ${formatCurrency(item.item_total)}
                    </div>
                </div>
            `).join('');
        }

        if (subtotalEl) subtotalEl.textContent = formatCurrency(data.subtotal);
        if (deliveryEl) {
            deliveryEl.innerHTML = data.delivery_fee === 0 
                ? '<span style="color:var(--success); font-weight:700;">FREE</span>' 
                : formatCurrency(data.delivery_fee);
        }
        if (totalEl) totalEl.textContent = formatCurrency(data.total);

        // Autofill name if logged in
        const user = getCurrentUser();
        if (user) {
            const nameInput = document.getElementById('customer-name');
            if (nameInput && !nameInput.value) nameInput.value = user.name;
        }
    } catch (err) {
        console.error('Error loading checkout review:', err);
    }
}

function setupCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('customer-name');
        const phoneInput = document.getElementById('customer-phone');
        const addressInput = document.getElementById('customer-address');
        const notesInput = document.getElementById('order-notes');
        const paymentMethodEl = document.querySelector('input[name="payment_method"]:checked');
        const placeOrderBtn = document.getElementById('btn-place-order');

        const customerName = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const address = addressInput ? addressInput.value.trim() : '';
        const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'Cash on Delivery';
        const notes = notesInput ? notesInput.value.trim() : '';

        if (!customerName || !phone || !address) {
            showToast('Please fill in your name, phone number, and delivery address.', 'error');
            return;
        }

        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.innerHTML = `Placing Order...`;
        }

        try {
            const userId = getCurrentUserId();
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: customerName,
                    phone: phone,
                    address: address,
                    user_id: userId,
                    payment_method: paymentMethod,
                    notes: notes
                })
            });

            const data = await res.json();
            if (data.success && data.order) {
                showToast('Order placed successfully!', 'success');
                await updateCartBadge();
                renderOrderSuccessModal(data.order);
            } else {
                showToast(data.message || 'Failed to place order.', 'error');
                if (placeOrderBtn) {
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.innerHTML = 'Place Order';
                }
            }
        } catch (err) {
            showToast('Network error while placing order.', 'error');
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
                placeOrderBtn.innerHTML = 'Place Order';
            }
        }
    });
}

function renderOrderSuccessModal(order) {
    const container = document.getElementById('checkout-page-container');
    if (!container) return;

    container.innerHTML = `
        <div style="max-width: 600px; margin: 2rem auto; text-align: center; background: #fff; border-radius: var(--radius-lg); padding: 3rem 2rem; border: 1px solid var(--border); box-shadow: var(--shadow-card);">
            <div style="width: 72px; height: 72px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1.5rem auto;">
                ✓
            </div>
            <span style="background: var(--primary-light); color: var(--primary-dark); font-size: 0.85rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: var(--radius-full); text-transform: uppercase;">
                Order Confirmed
            </span>
            <h2 style="font-size: 2rem; font-weight: 800; margin: 1rem 0 0.5rem 0; color: var(--text-main);">
                Thank You, ${order.customer_name}!
            </h2>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">
                Your order <strong>#${order.id.substring(order.id.length - 8).toUpperCase()}</strong> has been placed and is being packed fresh!
            </p>

            <div style="background: var(--bg-surface); border-radius: var(--radius-md); padding: 1.5rem; text-align: left; margin-bottom: 2rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <span style="color:var(--text-muted);">Delivery To:</span>
                    <span style="font-weight:700;">${order.address}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <span style="color:var(--text-muted);">Contact Phone:</span>
                    <span style="font-weight:700;">${order.phone}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <span style="color:var(--text-muted);">Payment Method:</span>
                    <span style="font-weight:700;">${order.payment_method}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding-top: 0.75rem; border-top: 1px dashed var(--border); font-size: 1.1rem; font-weight:800;">
                    <span>Total Paid:</span>
                    <span style="color:var(--primary-dark);">${formatCurrency(order.total_amount)}</span>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="/orders" class="btn btn-secondary">
                    View My Orders
                </a>
                <a href="/products" class="btn btn-primary">
                    Shop More Groceries
                </a>
            </div>
        </div>
    `;
}
