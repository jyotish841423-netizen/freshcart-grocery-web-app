"""
Sample product seed data for FreshCart grocery store application.
Contains categories, descriptions, prices, units, and images.
"""

SAMPLE_PRODUCTS = [
    {
        "name": "Basmati Rice",
        "category": "Grains & Flour",
        "price": 140.0,
        "unit": "1 kg pack",
        "description": "Premium long-grain aged fragrant Basmati rice, ideal for biryani and daily meals.",
        "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
        "rating": 4.8,
        "stock": 45,
        "featured": True
    },
    {
        "name": "Whole Wheat Flour",
        "category": "Grains & Flour",
        "price": 65.0,
        "unit": "1 kg pack",
        "description": "100% stone-ground whole wheat chakki atta for soft and wholesome rotis.",
        "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
        "rating": 4.7,
        "stock": 50,
        "featured": False
    },
    {
        "name": "Refined White Sugar",
        "category": "Pantry Essentials",
        "price": 45.0,
        "unit": "1 kg pack",
        "description": "Sparkling crystal pure cane sugar for baking, tea, coffee, and sweets.",
        "image": "https://images.unsplash.com/photo-1622484212850-cab596d63c4d?auto=format&fit=crop&w=600&q=80",
        "rating": 4.6,
        "stock": 60,
        "featured": False
    },
    {
        "name": "Fresh Whole Milk",
        "category": "Dairy & Eggs",
        "price": 32.0,
        "unit": "500 ml pouch",
        "description": "Pasteurized whole milk rich in calcium and vitamin D, delivered fresh every morning.",
        "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
        "rating": 4.9,
        "stock": 30,
        "featured": True
    },
    {
        "name": "Artisan White Bread",
        "category": "Bakery & Snacks",
        "price": 40.0,
        "unit": "400 g loaf",
        "description": "Soft, freshly baked sandwich bread with a fluffy texture and golden crust.",
        "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
        "rating": 4.7,
        "stock": 25,
        "featured": True
    },
    {
        "name": "Farm Fresh Brown Eggs",
        "category": "Dairy & Eggs",
        "price": 85.0,
        "unit": "6 pcs pack",
        "description": "Organic cage-free farm eggs packed with protein and essential nutrients.",
        "image": "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=600&q=80",
        "rating": 4.9,
        "stock": 40,
        "featured": True
    },
    {
        "name": "Crisp Royal Gala Apples",
        "category": "Fruits & Vegetables",
        "price": 160.0,
        "unit": "1 kg pack",
        "description": "Sweet, juicy, and crunchy orchard-picked apples rich in dietary fiber.",
        "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
        "rating": 4.8,
        "stock": 35,
        "featured": True
    },
    {
        "name": "Ripe Robusta Bananas",
        "category": "Fruits & Vegetables",
        "price": 50.0,
        "unit": "1 dozen",
        "description": "Naturally ripened sweet bananas rich in potassium and energy.",
        "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
        "rating": 4.7,
        "stock": 40,
        "featured": False
    },
    {
        "name": "Fresh Farm Potatoes",
        "category": "Fruits & Vegetables",
        "price": 35.0,
        "unit": "1 kg pack",
        "description": "Firm earthy potatoes perfect for curries, roasting, mashing, or french fries.",
        "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
        "rating": 4.5,
        "stock": 55,
        "featured": False
    },
    {
        "name": "Vine Ripe Tomatoes",
        "category": "Fruits & Vegetables",
        "price": 40.0,
        "unit": "1 kg pack",
        "description": "Bright red, juicy plump tomatoes ideal for salads, sauces, and soups.",
        "image": "https://images.unsplash.com/photo-1546470427-0d4db154ceb7?auto=format&fit=crop&w=600&q=80",
        "rating": 4.6,
        "stock": 45,
        "featured": True
    },
    {
        "name": "Crunchy Butter Biscuits",
        "category": "Bakery & Snacks",
        "price": 35.0,
        "unit": "250 g pack",
        "description": "Golden baked buttery biscuits, a crispy companion for your afternoon chai or coffee.",
        "image": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
        "rating": 4.7,
        "stock": 50,
        "featured": False
    },
    {
        "name": "Pure Sunflower Cooking Oil",
        "category": "Pantry Essentials",
        "price": 155.0,
        "unit": "1 Liter bottle",
        "description": "Heart-friendly light cooking oil enriched with vitamins A & D for everyday healthy meals.",
        "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
        "rating": 4.8,
        "stock": 35,
        "featured": True
    }
]

CATEGORIES = [
    {"id": "all", "name": "All Items", "icon": "bi-grid"},
    {"id": "Fruits & Vegetables", "name": "Fruits & Veggies", "icon": "bi-apple"},
    {"id": "Dairy & Eggs", "name": "Dairy & Eggs", "icon": "bi-cup-straw"},
    {"id": "Bakery & Snacks", "name": "Bakery & Snacks", "icon": "bi-cake2"},
    {"id": "Grains & Flour", "name": "Grains & Flour", "icon": "bi-box-seam"},
    {"id": "Pantry Essentials", "name": "Pantry & Oils", "icon": "bi-basket"}
]
