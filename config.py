import os
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "freshcart-secret-key-beginner-friendly")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/freshcart")
    DB_NAME = os.getenv("DB_NAME", "freshcart")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
