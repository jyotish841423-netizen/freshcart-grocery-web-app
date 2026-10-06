/**
 * FreshCart - Admin Product Management Dashboard
 * Handles loading, searching, sorting, adding, editing, and deleting products.
 */

let allProducts = [];
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAdminProducts();
    setupAdminToolbar();
    setupModalEvents();
    setupResetButton();
});

// Load all products from API
async function loadAdminProducts() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    try {
        const res = await fetch('/api/products');
        const data = await res.json();

        if (data.success && Array.isArray(data.products)) {
            allProducts = data.products;
            applyFiltersAndRender();
            updateStats(allProducts);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">
                        No products available in the database.
                    </td>
                </tr>
            `;
        }
    } catch (err) {
        console.error('Error fetching admin products:', err);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:2rem; color:var(--danger);">
                    Failed to connect to backend server.
                </td>
            </tr>
        `;
    }
}

// Update Dashboard Statistics Cards
function updateStats(products) {
    const totalEl = document.getElementById('stat-total-products');
    const categoriesEl = document.getElementById('stat-total-categories');
    const featuredEl = document.getElementById('stat-featured-count');
    const lowStockEl = document.getElementById('stat-low-stock');

    if (totalEl) totalEl.textContent = products.length;

    if (categoriesEl) {
        const uniqueCategories = new Set(products.map(p => p.category));
        categoriesEl.textContent = uniqueCategories.size;
    }

    if (featuredEl) {
        const featured = products.filter(p => p.featured);
        featuredEl.textContent = featured.length;
    }

    if (lowStockEl) {
        const lowStock = products.filter(p => (p.stock || 0) <= 15);
        lowStockEl.textContent = lowStock.length;
    }
}

// Setup search, category filter, and sorting
function setupAdminToolbar() {
    const searchInput = document.getElementById('admin-search-input');
    const categorySelect = document.getElementById('admin-category-filter');
    const sortSelect = document.getElementById('admin-sort-select');

    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(applyFiltersAndRender, 200);
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', applyFiltersAndRender);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applyFiltersAndRender);
    }
}

// Apply filtering and sorting to products list
function applyFiltersAndRender() {
    const searchTerm = (document.getElementById('admin-search-input')?.value || '').toLowerCase().trim();
    const category = document.getElementById('admin-category-filter')?.value || 'all';
    const sortMode = document.getElementById('admin-sort-select')?.value || 'name-asc';

    filteredProducts = allProducts.filter(p => {
        const matchesCat = category === 'all' || p.category === category;
        const matchesSearch = !searchTerm || 
            (p.name && p.name.toLowerCase().includes(searchTerm)) ||
            (p.category && p.category.toLowerCase().includes(searchTerm)) ||
            (p.unit && p.unit.toLowerCase().includes(searchTerm)) ||
            (p.description && p.description.toLowerCase().includes(searchTerm));
        return matchesCat && matchesSearch;
    });

    // Sort
    filteredProducts.sort((a, b) => {
        switch (sortMode) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return (a.price || 0) - (b.price || 0);
            case 'price-desc':
                return (b.price || 0) - (a.price || 0);
            case 'stock-asc':
                return (a.stock || 0) - (b.stock || 0);
            default:
                return 0;
        }
    });

    renderAdminTable(filteredProducts);
}

// Render Products Table
function renderAdminTable(products) {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:3rem; color:var(--text-muted);">
                    <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
                    <p style="font-weight:700;">No products match your search or filter.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(p => {
        // Stock badge styling
        let stockBadge = '';
        const stock = p.stock !== undefined ? p.stock : 20;
        if (stock === 0) {
            stockBadge = `<span class="badge-stock badge-stock-out">● Out of Stock (0)</span>`;
        } else if (stock <= 15) {
            stockBadge = `<span class="badge-stock badge-stock-low">● Low (${stock})</span>`;
        } else {
            stockBadge = `<span class="badge-stock badge-stock-high">● In Stock (${stock})</span>`;
        }

        const featuredBadge = p.featured 
            ? `<span class="badge-featured">⭐ Yes</span>` 
            : `<span style="color:var(--text-light); font-size:0.8rem;">No</span>`;

        const descSnippet = p.description 
            ? (p.description.length > 50 ? p.description.substring(0, 50) + '...' : p.description) 
            : 'No description';

        return `
            <tr id="admin-row-${p.id}">
                <td>
                    <img 
                        src="${p.image || ''}" 
                        alt="${p.name}" 
                        class="admin-table-img" 
                        onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'"
                    />
                </td>
                <td>
                    <strong style="font-size:0.95rem; color:var(--text-main);">${p.name}</strong>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">${descSnippet}</div>
                </td>
                <td>
                    <span style="background:var(--bg-surface); padding:0.25rem 0.6rem; border-radius:var(--radius-sm); font-size:0.8rem; font-weight:600; color:var(--text-main);">
                        ${p.category}
                    </span>
                </td>
                <td>
                    <strong style="color:var(--primary-dark); font-size:1rem;">${formatCurrency(p.price)}</strong>
                </td>
                <td style="color:var(--text-muted); font-size:0.85rem;">
                    ${p.unit || '1 unit'}
                </td>
                <td>
                    ${stockBadge}
                </td>
                <td>
                    ${featuredBadge}
                </td>
                <td style="text-align: right;">
                    <div class="action-btn-group">
                        <button 
                            class="btn-action-edit" 
                            onclick="openEditModal('${p.id}')"
                            title="Edit product details"
                        >
                            ✏️ Edit
                        </button>
                        <button 
                            class="btn-action-delete" 
                            onclick="handleDeleteProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}')"
                            title="Delete product"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Modal handling
function setupModalEvents() {
    const modal = document.getElementById('product-modal-overlay');
    const openAddBtn = document.getElementById('btn-open-add-modal');
    const closeBtn = document.getElementById('btn-close-modal');
    const cancelBtn = document.getElementById('btn-cancel-modal');
    const form = document.getElementById('product-form');
    const imageInput = document.getElementById('form-image');
    const previewImg = document.getElementById('form-image-preview');
    const previewWrapper = document.getElementById('image-preview-wrapper');

    // Open Add Modal
    if (openAddBtn) {
        openAddBtn.addEventListener('click', () => {
            openAddModal();
        });
    }

    // Close Modal
    const closeModal = () => {
        if (modal) modal.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Close on overlay click outside card
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Live image preview
    if (imageInput && previewImg && previewWrapper) {
        imageInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val) {
                previewImg.src = val;
                previewWrapper.style.display = 'flex';
                previewImg.onerror = () => {
                    previewImg.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';
                };
            } else {
                previewWrapper.style.display = 'none';
            }
        });
    }

    // Submit form (Add or Edit)
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// Open Add Product Modal
function openAddModal() {
    const modal = document.getElementById('product-modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const saveBtnText = document.getElementById('btn-save-text');
    const form = document.getElementById('product-form');
    const previewWrapper = document.getElementById('image-preview-wrapper');

    if (!modal) return;

    // Reset form
    form.reset();
    document.getElementById('form-product-id').value = '';
    document.getElementById('form-stock').value = '30';
    document.getElementById('form-rating').value = '4.8';
    document.getElementById('form-featured').checked = false;
    if (previewWrapper) previewWrapper.style.display = 'none';

    if (modalTitle) modalTitle.textContent = 'Add New Grocery Product';
    if (saveBtnText) saveBtnText.textContent = 'Add Product';

    modal.classList.add('active');
    document.getElementById('form-name').focus();
}

// Open Edit Product Modal
function openEditModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('product-modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const saveBtnText = document.getElementById('btn-save-text');
    const previewImg = document.getElementById('form-image-preview');
    const previewWrapper = document.getElementById('image-preview-wrapper');

    if (!modal) return;

    document.getElementById('form-product-id').value = product.id;
    document.getElementById('form-name').value = product.name || '';
    document.getElementById('form-category').value = product.category || '';
    document.getElementById('form-price').value = product.price || '';
    document.getElementById('form-unit').value = product.unit || '';
    document.getElementById('form-stock').value = product.stock !== undefined ? product.stock : 20;
    document.getElementById('form-rating').value = product.rating || 4.5;
    document.getElementById('form-image').value = product.image || '';
    document.getElementById('form-description').value = product.description || '';
    document.getElementById('form-featured').checked = !!product.featured;

    if (product.image && previewImg && previewWrapper) {
        previewImg.src = product.image;
        previewWrapper.style.display = 'flex';
    } else if (previewWrapper) {
        previewWrapper.style.display = 'none';
    }

    if (modalTitle) modalTitle.textContent = `Edit Product: ${product.name}`;
    if (saveBtnText) saveBtnText.textContent = 'Update Product';

    modal.classList.add('active');
}

// Form Submit Handler (Add vs Edit)
async function handleFormSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('form-product-id').value;
    const isEdit = !!productId;

    const name = document.getElementById('form-name').value.trim();
    const category = document.getElementById('form-category').value;
    const price = parseFloat(document.getElementById('form-price').value);
    const unit = document.getElementById('form-unit').value.trim();
    const stock = parseInt(document.getElementById('form-stock').value, 10);
    const rating = parseFloat(document.getElementById('form-rating').value) || 4.5;
    let image = document.getElementById('form-image').value.trim();
    const description = document.getElementById('form-description').value.trim();
    const featured = document.getElementById('form-featured').checked;

    if (!image) {
        image = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    }

    if (!name || !category || isNaN(price)) {
        showToast('Please fill in name, category, and valid price.', 'error');
        return;
    }

    const payload = {
        name,
        category,
        price,
        unit,
        stock,
        rating,
        image,
        description,
        featured
    };

    const saveBtn = document.getElementById('btn-save-product');
    const saveBtnText = document.getElementById('btn-save-text');
    if (saveBtn) saveBtn.disabled = true;
    if (saveBtnText) saveBtnText.textContent = 'Saving...';

    try {
        const url = isEdit ? `/api/products/${productId}` : '/api/products';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            showToast(data.message || (isEdit ? 'Product updated successfully!' : 'Product added successfully!'), 'success');
            document.getElementById('product-modal-overlay').classList.remove('active');
            await loadAdminProducts();
        } else {
            showToast(data.message || 'Operation failed', 'error');
        }
    } catch (err) {
        console.error('Error saving product:', err);
        showToast('Network error while saving product.', 'error');
    } finally {
        if (saveBtn) saveBtn.disabled = false;
        if (saveBtnText) saveBtnText.textContent = isEdit ? 'Update Product' : 'Add Product';
    }
}

// Delete Product
async function handleDeleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}" from the store catalog?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (data.success) {
            showToast(`"${productName}" was deleted.`, 'success');
            await loadAdminProducts();
        } else {
            showToast(data.message || 'Failed to delete product', 'error');
        }
    } catch (err) {
        console.error('Error deleting product:', err);
        showToast('Network error while deleting product.', 'error');
    }
}

// Reset sample data helper
function setupResetButton() {
    const resetBtn = document.getElementById('btn-reset-sample-data');
    if (!resetBtn) return;

    resetBtn.addEventListener('click', async () => {
        if (!confirm('This will restore all default 12 grocery products. Proceed?')) {
            return;
        }

        resetBtn.disabled = true;
        resetBtn.textContent = 'Resetting...';

        try {
            const res = await fetch('/api/admin/reset-products', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast(data.message || 'Default products restored!', 'success');
                await loadAdminProducts();
            } else {
                showToast('Failed to reset products', 'error');
            }
        } catch (err) {
            showToast('Network error while resetting', 'error');
        } finally {
            resetBtn.disabled = false;
            resetBtn.textContent = '↺ Reset Sample Data';
        }
    });
}
