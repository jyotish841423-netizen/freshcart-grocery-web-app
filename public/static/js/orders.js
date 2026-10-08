/**
 * FreshCart - Customer Orders History Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    loadCustomerOrders();
});

async function loadCustomerOrders() {
    const container = document.getElementById('orders-list-container');
    if (!container) return;

    try {
        const userId = getCurrentUserId();
        // Also allow passing user id from user object
        const user = getCurrentUser();
        let queryUrl = '/api/orders';
        if (user && user.id) {
            queryUrl += `?user_id=${encodeURIComponent(user.id)}`;
        } else if (userId) {
            queryUrl += `?user_id=${encodeURIComponent(userId)}`;
        }

        const res = await fetch(queryUrl);
        const data = await res.json();

        if (data.success && data.orders && data.orders.length > 0) {
            container.innerHTML = data.orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <span class="order-id">Order #${order.id ? order.id.substring(order.id.length - 8).toUpperCase() : 'N/A'}</span>
                            <span class="order-date" style="margin-left: 0.75rem;">📅 ${order.created_at || 'Recently'}</span>
                        </div>
                        <span class="order-status">● ${order.status || 'Confirmed'}</span>
                    </div>

                    <div class="order-body">
                        <div style="margin-bottom: 1rem;">
                            <strong style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">Items Ordered:</strong>
                            <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap;">
                                ${order.items ? order.items.map(item => `
                                    <div class="order-item-chip">
                                        <span>🛒</span>
                                        <strong>${item.name}</strong>
                                        <span style="color:var(--text-muted);">(${item.quantity} × ${formatCurrency(item.price)})</span>
                                    </div>
                                `).join('') : 'No items listed'}
                            </div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--border); padding-top:0.75rem; flex-wrap:wrap; gap:1rem;">
                            <div style="font-size:0.85rem; color:var(--text-muted);">
                                📍 Delivered to: <strong style="color:var(--text-main);">${order.address}</strong> (${order.phone})
                            </div>
                            <div style="font-size:1.15rem; font-weight:800; color:var(--primary-dark);">
                                Total: ${formatCurrency(order.total_amount)}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>No Orders Placed Yet</h3>
                    <p>You haven't placed any grocery orders yet. Discover our fresh groceries and enjoy quick delivery to your doorstep!</p>
                    <a href="/products" class="btn btn-primary" style="display:inline-flex;">
                        Browse Groceries
                    </a>
                </div>
            `;
        }
    } catch (err) {
        console.error('Failed to load orders:', err);
        container.innerHTML = `
            <div style="text-align:center; padding:3rem; color:var(--danger);">
                Unable to load orders. Please check your connection.
            </div>
        `;
    }
}
