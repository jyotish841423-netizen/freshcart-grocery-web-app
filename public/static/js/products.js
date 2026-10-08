/**
 * FreshCart - Products Catalog Logic
 * Handles filtering by category, real-time search, and product grid rendering.
 */

let currentCategory = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    // Read URL search params
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');

    if (categoryParam) {
        currentCategory = categoryParam;
    }
    if (searchParam) {
        currentSearch = searchParam;
        const searchInput = document.getElementById('catalog-search-input');
        if (searchInput) searchInput.value = searchParam;
    }

    setupCategoryPills();
    setupCatalogSearch();
    loadCatalogProducts();
});

function setupCategoryPills() {
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        const cat = pill.getAttribute('data-category');
        if (cat === currentCategory) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }

        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = cat;
            loadCatalogProducts();
        });
    });
}

function setupCatalogSearch() {
    const searchInput = document.getElementById('catalog-search-input');
    const searchBtn = document.getElementById('catalog-search-btn');

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearch = e.target.value.trim();
                loadCatalogProducts();
            }, 300);
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value.trim();
            loadCatalogProducts();
        });
    }
}

async function loadCatalogProducts() {
    const container = document.getElementById('catalog-products-grid');
    const statusText = document.getElementById('catalog-status-text');
    if (!container) return;

    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
            <div class="spinner" style="display:inline-block; margin-bottom: 0.5rem;"></div>
            <p>Loading fresh groceries...</p>
        </div>
    `;

    try {
        let url = `/api/products?`;
        if (currentCategory && currentCategory !== 'all') {
            url += `category=${encodeURIComponent(currentCategory)}&`;
        }
        if (currentSearch) {
            url += `search=${encodeURIComponent(currentSearch)}&`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (statusText) {
            let label = currentCategory === 'all' ? 'All Products' : currentCategory;
            if (currentSearch) label += ` matching "${currentSearch}"`;
            statusText.textContent = `Showing ${data.count || 0} items for ${label}`;
        }

        if (data.success && data.products && data.products.length > 0) {
            container.innerHTML = data.products.map(product => `
                <div class="product-card" id="product-${product.id}">
                    ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
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
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; line-height: 1.3;">
                            ${product.description ? product.description.substring(0, 65) + '...' : ''}
                        </p>
                        <div class="product-rating">
                            <span>★</span> ${product.rating || '4.8'} 
                            <span style="color: var(--text-light); font-weight: normal;">(${product.stock || 20} in stock)</span>
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
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">🔍</div>
                    <h3>No products found</h3>
                    <p>We couldn't find any grocery items matching your criteria. Try adjusting your search or filters.</p>
                    <button class="btn btn-secondary" onclick="resetFilters()">View All Products</button>
                </div>
            `;
        }
    } catch (err) {
        console.error('Error loading products:', err);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--danger);">
                Failed to load products. Please check if backend is running.
            </div>
        `;
    }
}

function resetFilters() {
    currentCategory = 'all';
    currentSearch = '';
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = '';
    setupCategoryPills();
    loadCatalogProducts();
}
