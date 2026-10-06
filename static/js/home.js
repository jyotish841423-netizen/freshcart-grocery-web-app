/**
 * FreshCart - Home Page Logic
 * Loads featured grocery items and category navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
});

async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products-grid');
    if (!container) return;

    try {
        const res = await fetch('/api/products?featured=true');
        const data = await res.json();

        if (data.success && data.products && data.products.length > 0) {
            container.innerHTML = data.products.map(product => `
                <div class="product-card">
                    <span class="product-badge">Featured</span>
                    <div class="product-img-container">
                        <img 
                            src="${product.image}" 
                            alt="${product.name}" 
                            class="product-img"
                            loading="lazy"
                            onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'"
                        />
                    </div>
                    <div class="product-content">
                        <span class="product-category-tag">${product.category}</span>
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-unit">${product.unit}</p>
                        <div class="product-rating">
                            <span>★</span> ${product.rating || '4.8'} 
                            <span style="color: var(--text-light); font-weight: normal;">(In Stock)</span>
                        </div>
                        <div class="product-footer">
                            <span class="product-price">${formatCurrency(product.price)}</span>
                            <button 
                                class="btn-add-cart" 
                                onclick="handleAddToCart('${product.id}', this)"
                                aria-label="Add ${product.name} to cart"
                            >
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
                    No featured products available at this moment.
                </div>
            `;
        }
    } catch (err) {
        console.error('Failed to load featured products:', err);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--danger);">
                Unable to load products. Please check server connection.
            </div>
        `;
    }
}
