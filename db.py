"""
Database connection and initialization module for FreshCart.
Provides connection to MongoDB using PyMongo, with automatic fallback
to an in-memory database if MongoDB daemon is not running locally.
"""

import sys
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from config import Config
from seed_data import SAMPLE_PRODUCTS

client = None
db = None
is_mock = False

def get_db():
    """Initializes and returns the database client and collections."""
    global client, db, is_mock
    if db is not None:
        return db

    try:
        # Try connecting to configured MongoDB instance with timeout
        real_client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=3500)
        # Force a command to test connectivity
        real_client.admin.command('ping')
        client = real_client
        db = client[Config.DB_NAME]
        is_mock = False
        print(f"[FreshCart DB] Successfully connected to live MongoDB at: {Config.MONGO_URI}")
    except (ServerSelectionTimeoutError, ConnectionFailure, Exception) as e:
        # Fallback to mongomock so the application runs without needing local mongod
        import mongomock
        client = mongomock.MongoClient()
        db = client[Config.DB_NAME]
        is_mock = True
        print("[FreshCart DB] NOTICE: Live MongoDB server is not running or unreachable.")
        print("[FreshCart DB] Switched seamlessly to In-Memory MongoDB mock.")
        print("[FreshCart DB] All collections (users, products, cart, orders) are functional!")

    # Auto-seed products if collection is empty
    init_seed_data(db)
    return db

def init_seed_data(database):
    """Seeds sample grocery products if products collection is empty."""
    products_col = database['products']
    if products_col.count_documents({}) == 0:
        print("[FreshCart DB] Seeding 12 sample grocery products into database...")
        # Insert copies so that original dictionaries aren't mutated with _id
        items_to_insert = [dict(item) for item in SAMPLE_PRODUCTS]
        products_col.insert_many(items_to_insert)
        print(f"[FreshCart DB] Successfully seeded {len(items_to_insert)} products.")

def doc_to_dict(doc):
    """Converts a MongoDB document to a JSON-serializable dictionary."""
    if not doc:
        return None
    res = dict(doc)
    if '_id' in res:
        res['id'] = str(res['_id'])
        del res['_id']
    return res

# Initialize on import for clean access
db = get_db()
users_col = db['users']
products_col = db['products']
cart_col = db['cart']
orders_col = db['orders']
