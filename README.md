# 🛒 FreshCart - Beginner-Friendly Full-Stack Grocery Store Web Application

**FreshCart** is a modern, clean, and beginner-friendly full-stack grocery web application built with **HTML/CSS/JavaScript**, **Python Flask**, and **MongoDB**.

Customers can browse farm-fresh grocery items, filter by categories, search for products, add items to a dynamic shopping cart, manage quantities, and place orders with delivery details.

---

## 🌟 Features

* **Home Page (`/`)**: Fresh green-and-white grocery store hero banner, grocery categories, value highlights, and featured picks.
* **Products Catalog (`/products`)**:
  * Real-time search bar (by product name/description).
  * Category filter pills (Fruits & Veggies, Dairy & Eggs, Bakery & Snacks, Grains & Flour, Pantry & Oils).
  * Product cards with prices, units, ratings, and instant "Add to Cart" action.
* **Shopping Cart (`/cart`)**:
  * View added grocery items with thumbnails, unit prices, and subtotal.
  * Increase (`+`) and decrease (`-`) quantity stepper.
  * Remove individual items or clear entire cart.
  * Free delivery progress indicator (Free delivery for orders above ₹300).
* **Checkout Page (`/checkout`)**:
  * Customer contact information (Name, Phone Number, Delivery Address, Delivery Notes).
  * Real-time order review and summary breakdown.
  * Payment options (Cash on Delivery / UPI on Delivery).
  * Order confirmation with confirmation summary.
* **Customer Authentication (`/auth`)**:
  * User registration with password hashing (`werkzeug.security`).
  * Customer login with saved user session.
* **Order History (`/orders`)**:
  * View placed orders, order timestamps, status, ordered item list, and total amount.
* **Admin Dashboard (`/admin`)**:
  * Real-time metrics overview (Total Products, Active Categories, Low Stock warnings, Featured Items).
  * **Add New Products**: Modal form with Name, Category, Price, Packaging Unit, Stock, Rating, Image URL (with live preview), and Description.
  * **Modify / Edit Products**: Update pricing, stock levels, featured flag, or details with live table refresh.
  * **Delete Products**: Remove discontinued products with confirmation.
  * **Restore Defaults**: Reset button to quickly restore the initial 12 sample grocery products.
  * Instant search, category filters, and sorting (by name, price, stock).

---

## 🏗️ Architecture & Data Flow

```
+------------------------------------+
|  Frontend (HTML5 / CSS3 / JS)      |
|  - index.html, products.html       |
|  - cart.html, checkout.html        |
|  - auth.html, orders.html          |
+-----------------+------------------+
                  |
         fetch() JSON REST API
                  |
                  v
+-----------------+------------------+
|  Flask Backend (Python 3)          |
|  - app.py (Routes & APIs)          |
|  - db.py  (PyMongo / Fallback)     |
+-----------------+------------------+
                  |
             PyMongo Driver
                  |
                  v
+-----------------+------------------+
|  MongoDB Database                  |
|  - users collection                |
|  - products collection             |
|  - cart collection                 |
|  - orders collection               |
+------------------------------------+
```

---

## 📁 Project Structure

```
grocery store web application/
├── app.py                 # Main Flask server & REST API endpoints
├── config.py              # Application settings & MongoDB URI
├── db.py                  # Database connection, collections & auto-seed
├── seed_data.py           # 12 initial grocery products & categories
├── requirements.txt       # Python dependencies
├── test_app.py            # Automated test suite
├── verify_live.py         # End-to-end live server test script
├── README.md              # Project documentation
├── static/
│   ├── css/
│   │   └── style.css      # Modern green & white grocery aesthetic
│   └── js/
│       ├── api.js         # Centralized API fetch, notifications & session
│       ├── home.js        # Home page featured products logic
│       ├── products.js    # Catalog search, filter pills & rendering
│       ├── cart.js        # Cart items, qty stepper & totals calculation
│       ├── checkout.js    # Delivery address validation & order placement
│       ├── auth.js        # Login & registration logic
│       ├── orders.js      # Customer order history rendering
│       └── admin.js       # Admin panel product CRUD & table logic
└── templates/
    ├── base.html          # Shared layout, navbar, cart badge & footer
    ├── index.html         # 1. Home page
    ├── products.html      # 2. Products catalog page
    ├── cart.html          # 3. Cart page
    ├── checkout.html      # 4. Checkout page
    ├── auth.html          # 5. Login / Register page
    ├── orders.html        # 6. Orders history page
    └── admin.html         # 7. Admin product management dashboard
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.10+ installed
* (Optional) MongoDB installed and running locally on port 27017.
  > **Note**: If you don't have MongoDB installed or running, FreshCart automatically falls back to an in-memory MongoDB mock (`mongomock`) so you can run and test the complete application immediately without errors!

### 2. Install Dependencies
Open your terminal in the project directory and run:
```bash
pip install -r requirements.txt
```

### 3. Run the Application
Start the Flask development server:
```bash
python app.py
```

You will see:
```text
============================================================
 [FreshCart] Grocery Store Server Starting...
 [FreshCart] Access at: http://127.0.0.1:5000
============================================================
```

Open your browser and visit: **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🥬 Sample Seed Products

FreshCart automatically seeds 12 staple grocery products into MongoDB on first launch:
1. **Basmati Rice** (Grains & Flour)
2. **Whole Wheat Flour** (Grains & Flour)
3. **Refined White Sugar** (Pantry Essentials)
4. **Fresh Whole Milk** (Dairy & Eggs)
5. **Artisan White Bread** (Bakery & Snacks)
6. **Farm Fresh Brown Eggs** (Dairy & Eggs)
7. **Crisp Royal Gala Apples** (Fruits & Vegetables)
8. **Ripe Robusta Bananas** (Fruits & Vegetables)
9. **Fresh Farm Potatoes** (Fruits & Vegetables)
10. **Vine Ripe Tomatoes** (Fruits & Vegetables)
11. **Crunchy Butter Biscuits** (Bakery & Snacks)
12. **Pure Sunflower Cooking Oil** (Pantry Essentials)

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new customer (`name`, `email`, `password`) |
| `/api/auth/login` | `POST` | Login customer (`email`, `password`) |
| `/api/products` | `GET` | Get all products (query: `category`, `search`, `featured`) |
| `/api/products/<id>` | `GET` | Get single product by MongoDB ObjectId |
| `/api/products` | `POST` | Add a new product to MongoDB |
| `/api/products/<id>` | `PUT` | Update product details |
| `/api/products/<id>` | `DELETE`| Remove a product |
| `/api/cart` | `GET` | Get cart items, item count, subtotal, delivery fee, total |
| `/api/cart` | `POST` | Add product to cart or increment quantity |
| `/api/cart/<item_id>` | `PUT` | Update item quantity in cart |
| `/api/cart/<item_id>` | `DELETE`| Remove item from cart |
| `/api/cart` | `DELETE`| Clear all items in user's cart |
| `/api/orders` | `POST` | Place order with customer details, clears cart |
| `/api/orders` | `GET` | Get orders for user (`?user_id=...`) |
| `/api/admin/reset-products` | `POST` | Restore initial 12 sample grocery products |

---

## 🧪 Testing

Run the automated test suite:
```bash
python test_app.py
```

Run the live HTTP end-to-end verification script:
```bash
python verify_live.py
```
