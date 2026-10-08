/**
 * FreshCart - Core API & State Utilities
 * Provides centralized fetch wrappers, toast notifications,
 * user session management, and cart badge updates.
 */

// Generate or retrieve persistent guest session ID if not logged in
function getSessionId() {
    let sid = localStorage.getItem('freshcart_session_id');
    if (!sid) {
        sid = 'guest_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('freshcart_session_id', sid);
    }
    return sid;
}

// Get current logged-in user if available, otherwise guest session ID
function getCurrentUserId() {
    const userStr = localStorage.getItem('freshcart_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.id) return user.id;
        } catch (e) {
            console.error('Error parsing user session', e);
        }
    }
    return getSessionId();
}

function getCurrentUser() {
    const userStr = localStorage.getItem('freshcart_user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Toast notification helper
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' 
        ? `<svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`
        : `<svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>`;

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Currency formatter
function formatCurrency(amount) {
    return '₹' + parseFloat(amount || 0).toFixed(2);
}

// Update Cart Badge in navigation bar
async function updateCartBadge() {
    const badge = document.getElementById('nav-cart-count');
    if (!badge) return;

    try {
        const userId = getCurrentUserId();
        const res = await fetch(`/api/cart?user_id=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data.success) {
            badge.textContent = data.item_count || 0;
            badge.style.display = data.item_count > 0 ? 'flex' : 'none';
        }
    } catch (err) {
        console.error('Failed to update cart badge:', err);
    }
}

// Quick Add to Cart action used across pages
async function handleAddToCart(productId, buttonElem = null) {
    if (buttonElem) {
        buttonElem.disabled = true;
        buttonElem.innerHTML = `<span class="spinner"></span> Adding...`;
    }

    try {
        const userId = getCurrentUserId();
        const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1,
                user_id: userId
            })
        });

        const data = await res.json();
        if (data.success) {
            showToast(data.message || 'Item added to cart!', 'success');
            await updateCartBadge();
        } else {
            showToast(data.message || 'Could not add item to cart', 'error');
        }
    } catch (err) {
        showToast('Network error while adding to cart.', 'error');
    } finally {
        if (buttonElem) {
            buttonElem.disabled = false;
            buttonElem.innerHTML = `
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
                Add to Cart
            `;
        }
    }
}

// Setup User state in Navigation bar
function setupNavUser() {
    const userContainer = document.getElementById('nav-user-container');
    if (!userContainer) return;

    const user = getCurrentUser();
    if (user) {
        userContainer.innerHTML = `
            <a href="/orders" class="user-btn" title="View Orders">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/></svg>
                <span>${user.name.split(' ')[0]}</span>
            </a>
            <button class="btn btn-sm btn-secondary" onclick="logoutUser()" title="Log Out">
                Logout
            </button>
        `;
    } else {
        userContainer.innerHTML = `
            <a href="/auth" class="user-btn">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/></svg>
                <span>Login</span>
            </a>
        `;
    }
}

function logoutUser() {
    localStorage.removeItem('freshcart_user');
    showToast('Logged out successfully.', 'success');
    setTimeout(() => {
        window.location.href = '/';
    }, 600);
}

// Global Nav Search Bar handler
function setupNavSearch() {
    const searchForm = document.getElementById('nav-search-form');
    const searchInput = document.getElementById('nav-search-input');
    if (!searchForm || !searchInput) return;

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const term = searchInput.value.trim();
        if (term) {
            window.location.href = `/products?search=${encodeURIComponent(term)}`;
        }
    });
}

// Initialize common navbar widgets on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    setupNavUser();
    setupNavSearch();
});
