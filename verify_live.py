import requests

BASE = 'http://127.0.0.1:5000'
session_user = 'customer_live_test_42'

# 1. Home page check
r_home = requests.get(f'{BASE}/')
assert r_home.status_code == 200
print('[1] Home Page: OK (Status 200)')

# 2. Products page & API
r_prods = requests.get(f'{BASE}/api/products')
products = r_prods.json()['products']
assert len(products) >= 12
print(f'[2] Products Catalog: Loaded {len(products)} grocery products from database')

# 3. Add to cart
first_item = products[0]
r_cart_add = requests.post(f'{BASE}/api/cart', json={
    'product_id': first_item['id'],
    'quantity': 2,
    'user_id': session_user
})
assert r_cart_add.status_code == 200
print(f'[3] Add to Cart: Successfully added 2x {first_item["name"]}')

# 4. View Cart
r_cart = requests.get(f'{BASE}/api/cart?user_id={session_user}')
cart_json = r_cart.json()
assert cart_json['item_count'] == 2
print(f'[4] Cart Verified: Subtotal = Rs. {cart_json["subtotal"]}, Total = Rs. {cart_json["total"]}')

# 5. Place Order
r_order = requests.post(f'{BASE}/api/orders', json={
    'customer_name': 'Aarav Patel',
    'phone': '+91 9988776655',
    'address': '22 Lotus Boulevard, Indiranagar, Bengaluru',
    'user_id': session_user,
    'payment_method': 'Cash on Delivery'
})
assert r_order.status_code == 201
order = r_order.json()['order']
print(f'[5] Place Order: Placed Order #{order["id"]} (Total: Rs. {order["total_amount"]})')

# 6. Verify Cart is Empty
r_cart_after = requests.get(f'{BASE}/api/cart?user_id={session_user}')
assert r_cart_after.json()['item_count'] == 0
print('[6] Cart Empty: Cart was emptied after checkout')

# 7. Customer Orders List
r_orders = requests.get(f'{BASE}/api/orders?user_id={session_user}')
orders_data = r_orders.json()
assert orders_data['count'] == 1
assert orders_data['orders'][0]['id'] == order['id']
print(f'[7] Orders History: Order #{order["id"]} stored and retrieved from orders collection')
print('\n>>> ALL LIVE FLOW STEPS PASSED SUCCESSFULLY! <<<')
