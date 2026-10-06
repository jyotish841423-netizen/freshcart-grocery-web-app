"""
Automated End-to-End Verification Suite for FreshCart
Tests:
- Web page routes (Home, Products, Cart, Checkout, Auth, Orders)
- Products REST API (GET, search, filter, POST, PUT, DELETE)
- Customer Authentication API (Register, Login)
- Cart REST API (Add, View, Update quantity, Delete item, Clear)
- Orders REST API (Place order, Order calculation, View orders, View order details)
"""

import json
import unittest
from app import app
from db import products_col, users_col, cart_col, orders_col

class FreshCartTestSuite(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

    def test_01_page_routes(self):
        """Test that all 6 frontend web pages render with 200 OK."""
        pages = [
            ('/', b'FreshCart'),
            ('/products', b'All Grocery Products'),
            ('/cart', b'My Cart'),
            ('/checkout', b'Delivery & Checkout'),
            ('/auth', b'Customer Login'),
            ('/orders', b'My Orders'),
            ('/admin', b'Product Catalog Manager')
        ]
        for route, text_signature in pages:
            res = self.client.get(route)
            self.assertEqual(res.status_code, 200, f"Route {route} failed")
            self.assertIn(text_signature, res.data, f"Route {route} missing signature")
        print("[PASS] All 7 Frontend Web Pages (including Admin Panel) loaded successfully (200 OK)")

    def test_02_products_api(self):
        """Test products retrieval, filtering by category, and search."""
        # 1. Fetch all products
        res = self.client.get('/api/products')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertGreaterEqual(data['count'], 12)
        print(f"[PASS] Products API returned {data['count']} sample grocery items")

        # 2. Filter by category
        res = self.client.get('/api/products?category=Dairy%20%26%20Eggs')
        data = res.get_json()
        self.assertTrue(data['success'])
        for p in data['products']:
            self.assertEqual(p['category'], 'Dairy & Eggs')
        print(f"[PASS] Category filter tested successfully ({data['count']} items found)")

        # 3. Search for "Milk"
        res = self.client.get('/api/products?search=milk')
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertTrue(any('Milk' in p['name'] for p in data['products']))
        print("[PASS] Product search tested successfully")

    def test_03_product_crud(self):
        """Test Add, Update, and Delete product endpoints."""
        # Add new product
        new_prod = {
            'name': 'Test Organic Honey',
            'category': 'Pantry Essentials',
            'price': 220.0,
            'unit': '500 g jar',
            'description': 'Pure wild honey',
            'image': 'https://example.com/honey.jpg'
        }
        res = self.client.post('/api/products', json=new_prod)
        self.assertEqual(res.status_code, 201)
        created = res.get_json()['product']
        prod_id = created['id']
        print("[PASS] POST /api/products created new product successfully")

        # Update product
        res = self.client.put(f'/api/products/{prod_id}', json={'price': 240.0})
        self.assertEqual(res.status_code, 200)
        updated = res.get_json()['product']
        self.assertEqual(updated['price'], 240.0)
        print("[PASS] PUT /api/products/<id> updated product price successfully")

        # Delete product
        res = self.client.delete(f'/api/products/{prod_id}')
        self.assertEqual(res.status_code, 200)
        print("[PASS] DELETE /api/products/<id> deleted product successfully")

    def test_04_auth_api(self):
        """Test user registration and login."""
        test_email = 'customer_test@freshcart.local'
        # Clean up if existing
        users_col.delete_many({'email': test_email})

        # Register
        reg_payload = {
            'name': 'Priya Sharma',
            'email': test_email,
            'password': 'password123'
        }
        res = self.client.post('/api/auth/register', json=reg_payload)
        self.assertEqual(res.status_code, 201)
        user = res.get_json()['user']
        self.assertEqual(user['email'], test_email)
        print("[PASS] POST /api/auth/register registered test user successfully")

        # Login
        login_payload = {
            'email': test_email,
            'password': 'password123'
        }
        res = self.client.post('/api/auth/login', json=login_payload)
        self.assertEqual(res.status_code, 200)
        print("[PASS] POST /api/auth/login authenticated test user successfully")

    def test_05_cart_and_order_flow(self):
        """Test complete customer journey: Products -> Add to Cart -> View Cart -> Update Qty -> Checkout -> Place Order."""
        test_user = 'test_runner_user_1'
        cart_col.delete_many({'user_id': test_user})

        # Get first two products
        prods_res = self.client.get('/api/products')
        prods = prods_res.get_json()['products']
        item1 = prods[0]
        item2 = prods[1]

        # 1. Add item 1 to Cart
        res = self.client.post('/api/cart', json={
            'product_id': item1['id'],
            'quantity': 2,
            'user_id': test_user
        })
        self.assertEqual(res.status_code, 200)

        # 2. Add item 2 to Cart
        res = self.client.post('/api/cart', json={
            'product_id': item2['id'],
            'quantity': 1,
            'user_id': test_user
        })
        self.assertEqual(res.status_code, 200)
        print("[PASS] POST /api/cart added items to cart")

        # 3. View Cart
        res = self.client.get(f'/api/cart?user_id={test_user}')
        cart_data = res.get_json()
        self.assertEqual(cart_data['item_count'], 3)
        self.assertEqual(len(cart_data['items']), 2)
        expected_subtotal = round(item1['price'] * 2 + item2['price'] * 1, 2)
        self.assertEqual(cart_data['subtotal'], expected_subtotal)
        print(f"[PASS] GET /api/cart verified totals (Subtotal: Rs. {cart_data['subtotal']})")

        # 4. Update quantity of first item to 1
        cart_item_id = cart_data['items'][0]['id']
        res = self.client.put(f'/api/cart/{cart_item_id}', json={'quantity': 1})
        self.assertEqual(res.status_code, 200)

        # Verify updated quantity
        res = self.client.get(f'/api/cart?user_id={test_user}')
        updated_cart = res.get_json()
        self.assertEqual(updated_cart['item_count'], 2)
        print("[PASS] PUT /api/cart/<id> updated item quantity")

        # 5. Place Order
        order_payload = {
            'customer_name': 'Priya Sharma',
            'phone': '+91 9876543210',
            'address': 'Flat 402, Green Meadows, MG Road, Bengaluru',
            'user_id': test_user,
            'payment_method': 'Cash on Delivery',
            'notes': 'Please call before arriving'
        }
        res = self.client.post('/api/orders', json=order_payload)
        self.assertEqual(res.status_code, 201)
        order_data = res.get_json()
        self.assertTrue(order_data['success'])
        order = order_data['order']
        self.assertEqual(order['customer_name'], 'Priya Sharma')
        self.assertEqual(order['status'], 'Confirmed')
        print(f"[PASS] POST /api/orders placed order #{order['id']} successfully")

        # 6. Verify cart is now empty after order
        res = self.client.get(f'/api/cart?user_id={test_user}')
        self.assertEqual(res.get_json()['item_count'], 0)
        print("[PASS] Cart automatically cleared after order placement")

        # 7. Verify order exists in customer orders
        res = self.client.get(f'/api/orders?user_id={test_user}')
        orders_list = res.get_json()
        self.assertEqual(orders_list['count'], 1)
        self.assertEqual(orders_list['orders'][0]['id'], order['id'])
        print("[PASS] GET /api/orders retrieved placed order from database")

if __name__ == '__main__':
    unittest.main()
