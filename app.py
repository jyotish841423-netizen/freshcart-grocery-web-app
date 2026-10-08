"""
FreshCart Grocery Store Web Application
Main Flask application serving frontend templates and REST API endpoints.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Flask, render_template, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from db import users_col, products_col, cart_col, orders_col, doc_to_dict
from seed_data import CATEGORIES, SAMPLE_PRODUCTS

import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)
app.config.from_object(Config)


# ==============================================================================
# FRONTEND TEMPLATE ROUTES
# ==============================================================================

@app.route('/')
@app.route('/api/index')
@app.route('/api/index.py')
def home():
    """Renders the Home page."""
    return render_template('index.html', categories=CATEGORIES)


@app.route('/products')
def products():
    """Renders the Products Catalog page."""
    return render_template('products.html', categories=CATEGORIES)


@app.route('/cart')
def cart():
    """Renders the Cart page."""
    return render_template('cart.html')


@app.route('/checkout')
def checkout():
    """Renders the Checkout page."""
    return render_template('checkout.html')


@app.route('/auth')
def auth():
    """Renders the Login / Register page."""
    return render_template('auth.html')


@app.route('/orders')
def orders():
    """Renders the Customer Orders page."""
    return render_template('orders.html')


@app.route('/admin')
def admin():
    """Renders the Admin Product Management Dashboard."""
    return render_template('admin.html', categories=CATEGORIES)


# ==============================================================================
# REST API: AUTHENTICATION
# ==============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new customer account."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters.'}), 400

    existing_user = users_col.find_one({'email': email})
    if existing_user:
        return jsonify({'success': False, 'message': 'An account with this email already exists.'}), 400

    hashed_password = generate_password_hash(password)
    new_user = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'created_at': datetime.now(timezone.utc)
    }
    result = users_col.insert_one(new_user)

    user_data = {
        'id': str(result.inserted_id),
        'name': name,
        'email': email
    }
    return jsonify({
        'success': True,
        'message': 'Registration successful! Welcome to FreshCart.',
        'user': user_data
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Log in an existing customer."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    user = users_col.find_one({'email': email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    user_data = {
        'id': str(user['_id']),
        'name': user['name'],
        'email': user['email']
    }
    return jsonify({
        'success': True,
        'message': f"Welcome back, {user['name']}!",
        'user': user_data
    }), 200


# ==============================================================================
# REST API: PRODUCTS (GET, ADD, UPDATE, DELETE)
# ==============================================================================

@app.route('/api/products', methods=['GET'])
def get_products():
    """
    Fetch all products with optional filters:
    - ?category=Fruits%20%26%20Vegetables
    - ?search=apple
    - ?featured=true
    """
    category = request.args.get('category')
    search = request.args.get('search')
    featured = request.args.get('featured')

    query = {}
    if category and category.lower() != 'all':
        query['category'] = category

    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'category': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]

    if featured and featured.lower() in ('true', '1'):
        query['featured'] = True

    products = list(products_col.find(query))
    return jsonify({
        'success': True,
        'count': len(products),
        'products': [doc_to_dict(p) for p in products]
    }), 200


@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Fetch a single product by its MongoDB ObjectId."""
    try:
        product = products_col.find_one({'_id': ObjectId(product_id)})
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid product ID format.'}), 400

    if not product:
        return jsonify({'success': False, 'message': 'Product not found.'}), 404

    return jsonify({'success': True, 'product': doc_to_dict(product)}), 200


@app.route('/api/products', methods=['POST'])
def add_product():
    """Add a new product to MongoDB."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category = data.get('category', '').strip()
    price = data.get('price')

    if not name or not category or price is None:
        return jsonify({'success': False, 'message': 'Name, category, and price are required.'}), 400

    try:
        price = float(price)
    except ValueError:
        return jsonify({'success': False, 'message': 'Price must be a valid number.'}), 400

    new_prod = {
        'name': name,
        'category': category,
        'price': price,
        'unit': data.get('unit', '1 unit'),
        'description': data.get('description', ''),
        'image': data.get('image', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'),
        'rating': float(data.get('rating', 4.5)),
        'stock': int(data.get('stock', 20)),
        'featured': bool(data.get('featured', False)),
        'created_at': datetime.now(timezone.utc)
    }

    result = products_col.insert_one(new_prod)
    new_prod['id'] = str(result.inserted_id)
    if '_id' in new_prod:
        del new_prod['_id']

    return jsonify({
        'success': True,
        'message': 'Product added successfully!',
        'product': new_prod
    }), 201


@app.route('/api/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update an existing product."""
    try:
        oid = ObjectId(product_id)
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid product ID.'}), 400

    data = request.get_json() or {}
    update_fields = {}
    for key in ['name', 'category', 'description', 'unit', 'image']:
        if key in data:
            update_fields[key] = str(data[key]).strip()

    if 'price' in data:
        try:
            update_fields['price'] = float(data['price'])
        except ValueError:
            pass

    if 'stock' in data:
        try:
            update_fields['stock'] = int(data['stock'])
        except ValueError:
            pass

    if 'rating' in data:
        try:
            update_fields['rating'] = float(data['rating'])
        except ValueError:
            pass

    if 'featured' in data:
        update_fields['featured'] = bool(data['featured'])

    if not update_fields:
        return jsonify({'success': False, 'message': 'No fields provided to update.'}), 400

    res = products_col.update_one({'_id': oid}, {'$set': update_fields})
    if res.matched_count == 0:
        return jsonify({'success': False, 'message': 'Product not found.'}), 404

    updated = products_col.find_one({'_id': oid})
    return jsonify({
        'success': True,
        'message': 'Product updated successfully!',
        'product': doc_to_dict(updated)
    }), 200


@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product from MongoDB."""
    try:
        oid = ObjectId(product_id)
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid product ID.'}), 400

    res = products_col.delete_one({'_id': oid})
    if res.deleted_count == 0:
        return jsonify({'success': False, 'message': 'Product not found.'}), 404

    return jsonify({'success': True, 'message': 'Product deleted successfully.'}), 200


@app.route('/api/admin/reset-products', methods=['POST'])
def reset_products():
    """Admin helper: Restore sample products."""
    products_col.delete_many({})
    items_to_insert = [dict(item) for item in SAMPLE_PRODUCTS]
    products_col.insert_many(items_to_insert)
    return jsonify({
        'success': True,
        'message': f'Successfully restored {len(items_to_insert)} default grocery products!'
    }), 200


# ==============================================================================
# REST API: CART
# ==============================================================================

@app.route('/api/cart', methods=['GET'])
def get_cart():
    """
    Get all items in cart.
    Accepts ?user_id=... (defaults to 'guest' if unauthenticated).
    """
    user_id = request.args.get('user_id', 'guest')
    cart_items = list(cart_col.find({'user_id': user_id}))

    items = []
    subtotal = 0.0
    total_qty = 0

    for item in cart_items:
        item_dict = doc_to_dict(item)
        item_total = round(item_dict.get('price', 0) * item_dict.get('quantity', 1), 2)
        item_dict['item_total'] = item_total
        subtotal += item_total
        total_qty += item_dict.get('quantity', 1)
        items.append(item_dict)

    subtotal = round(subtotal, 2)
    # Free delivery over ₹300, else ₹40 standard delivery
    delivery_fee = 0.0 if subtotal >= 300.0 or subtotal == 0 else 40.0
    total = round(subtotal + delivery_fee, 2)

    return jsonify({
        'success': True,
        'items': items,
        'item_count': total_qty,
        'subtotal': subtotal,
        'delivery_fee': delivery_fee,
        'total': total
    }), 200


@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    """
    Add a product to cart or increment quantity if already present.
    Body: { product_id: str, quantity: int (optional, default 1), user_id: str (optional) }
    """
    data = request.get_json() or {}
    product_id = data.get('product_id')
    user_id = data.get('user_id', 'guest')
    qty = int(data.get('quantity', 1))

    if not product_id:
        return jsonify({'success': False, 'message': 'product_id is required.'}), 400

    try:
        product = products_col.find_one({'_id': ObjectId(product_id)})
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid product ID.'}), 400

    if not product:
        return jsonify({'success': False, 'message': 'Product not found.'}), 404

    # Check if this product is already in user's cart
    existing_item = cart_col.find_one({'user_id': user_id, 'product_id': str(product['_id'])})

    if existing_item:
        new_qty = existing_item['quantity'] + qty
        cart_col.update_one({'_id': existing_item['_id']}, {'$set': {'quantity': new_qty}})
        item_id = str(existing_item['_id'])
    else:
        new_cart_item = {
            'user_id': user_id,
            'product_id': str(product['_id']),
            'name': product['name'],
            'price': product['price'],
            'unit': product.get('unit', '1 unit'),
            'image': product.get('image', ''),
            'category': product.get('category', ''),
            'quantity': max(1, qty),
            'added_at': datetime.now(timezone.utc)
        }
        res = cart_col.insert_one(new_cart_item)
        item_id = str(res.inserted_id)

    return jsonify({
        'success': True,
        'message': f"Added '{product['name']}' to cart!",
        'item_id': item_id
    }), 200


@app.route('/api/cart/<cart_item_id>', methods=['PUT'])
def update_cart_quantity(cart_item_id):
    """
    Update quantity of an item in the cart.
    Body: { quantity: int }
    """
    data = request.get_json() or {}
    quantity = data.get('quantity')

    if quantity is None:
        return jsonify({'success': False, 'message': 'Quantity is required.'}), 400

    try:
        qty = int(quantity)
        oid = ObjectId(cart_item_id)
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid input data.'}), 400

    if qty <= 0:
        cart_col.delete_one({'_id': oid})
        return jsonify({'success': True, 'message': 'Item removed from cart.'}), 200

    res = cart_col.update_one({'_id': oid}, {'$set': {'quantity': qty}})
    if res.matched_count == 0:
        return jsonify({'success': False, 'message': 'Cart item not found.'}), 404

    return jsonify({'success': True, 'message': 'Cart updated successfully.'}), 200


@app.route('/api/cart/<cart_item_id>', methods=['DELETE'])
def remove_from_cart(cart_item_id):
    """Remove a specific item from the cart."""
    try:
        oid = ObjectId(cart_item_id)
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid item ID.'}), 400

    res = cart_col.delete_one({'_id': oid})
    if res.deleted_count == 0:
        return jsonify({'success': False, 'message': 'Cart item not found.'}), 404

    return jsonify({'success': True, 'message': 'Item removed from cart.'}), 200


@app.route('/api/cart', methods=['DELETE'])
def clear_cart():
    """Clear all items in cart for a specific user."""
    user_id = request.args.get('user_id', 'guest')
    cart_col.delete_many({'user_id': user_id})
    return jsonify({'success': True, 'message': 'Cart cleared successfully.'}), 200


# ==============================================================================
# REST API: ORDERS
# ==============================================================================

@app.route('/api/orders', methods=['POST'])
def place_order():
    """
    Place a new grocery order.
    Body:
    - customer_name
    - phone
    - address
    - user_id (optional, default 'guest')
    - payment_method (optional, default 'Cash on Delivery')
    - notes (optional)
    """
    data = request.get_json() or {}
    customer_name = data.get('customer_name', '').strip()
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()
    user_id = data.get('user_id', 'guest')
    payment_method = data.get('payment_method', 'Cash on Delivery')
    notes = data.get('notes', '')

    if not customer_name or not phone or not address:
        return jsonify({'success': False, 'message': 'Name, phone number, and delivery address are required.'}), 400

    # Retrieve current cart items
    cart_items = list(cart_col.find({'user_id': user_id}))
    if not cart_items:
        return jsonify({'success': False, 'message': 'Your cart is empty. Add products before checking out.'}), 400

    order_items = []
    subtotal = 0.0
    for item in cart_items:
        item_total = round(item.get('price', 0) * item.get('quantity', 1), 2)
        subtotal += item_total
        order_items.append({
            'product_id': item.get('product_id'),
            'name': item.get('name'),
            'price': item.get('price'),
            'unit': item.get('unit'),
            'quantity': item.get('quantity'),
            'total': item_total,
            'image': item.get('image', '')
        })

    subtotal = round(subtotal, 2)
    delivery_fee = 0.0 if subtotal >= 300.0 else 40.0
    total_amount = round(subtotal + delivery_fee, 2)

    order_doc = {
        'user_id': user_id,
        'customer_name': customer_name,
        'phone': phone,
        'address': address,
        'payment_method': payment_method,
        'notes': notes,
        'items': order_items,
        'subtotal': subtotal,
        'delivery_fee': delivery_fee,
        'total_amount': total_amount,
        'status': 'Confirmed',
        'created_at': datetime.now(timezone.utc)
    }

    result = orders_col.insert_one(order_doc)
    order_id = str(result.inserted_id)

    # Empty user's cart after successful order placement
    cart_col.delete_many({'user_id': user_id})

    order_doc['id'] = order_id
    if '_id' in order_doc:
        del order_doc['_id']
    if 'created_at' in order_doc:
        order_doc['created_at'] = order_doc['created_at'].strftime("%Y-%m-%d %H:%M:%S")

    return jsonify({
        'success': True,
        'message': 'Order placed successfully! Fresh groceries are on the way.',
        'order': order_doc
    }), 201


@app.route('/api/orders', methods=['GET'])
def get_orders():
    """
    Get customer orders.
    Optional query: ?user_id=...
    """
    user_id = request.args.get('user_id')
    query = {}
    if user_id:
        query['user_id'] = user_id

    orders = list(orders_col.find(query).sort('created_at', -1))
    formatted_orders = []
    for o in orders:
        od = doc_to_dict(o)
        if 'created_at' in od and isinstance(od['created_at'], datetime):
            od['created_at'] = od['created_at'].strftime("%b %d, %Y - %I:%M %p")
        formatted_orders.append(od)

    return jsonify({
        'success': True,
        'count': len(formatted_orders),
        'orders': formatted_orders
    }), 200


@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order_by_id(order_id):
    """Get single order details by order_id."""
    try:
        oid = ObjectId(order_id)
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid order ID.'}), 400

    order = orders_col.find_one({'_id': oid})
    if not order:
        return jsonify({'success': False, 'message': 'Order not found.'}), 404

    od = doc_to_dict(order)
    if 'created_at' in od and isinstance(od['created_at'], datetime):
        od['created_at'] = od['created_at'].strftime("%b %d, %Y - %I:%M %p")

    return jsonify({'success': True, 'order': od}), 200


# ==============================================================================
# MAIN ENTRY POINT
# ==============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print(" [FreshCart] Grocery Store Server Starting...")
    print(f" [FreshCart] Access at: http://127.0.0.1:{Config.PORT}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
