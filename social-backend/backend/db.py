import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import certifi

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

# If .env is empty or missing value, fallback to localhost
if not MONGODB_URI or MONGODB_URI.strip() == "":
    MONGODB_URI = "mongodb://localhost:27017"

# ---- FIX for SSL handshake error ----
# Enable TLS + load CA certificates
client = MongoClient(
    MONGODB_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client["football_app"]

users = db["users"]
posts = db["posts"]
matches = db["matches"]
teams = db["teams"]
followers = db["followers"]