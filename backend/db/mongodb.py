import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "ato_shield")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    print(f"✅ Connected to MongoDB: {DB_NAME}")

    # Create indexes for performance
    await db.sessions.create_index("clerk_user_id")
    await db.sessions.create_index("timestamp")
    await db.behavioral_profiles.create_index("clerk_user_id", unique=True)
    await db.alerts.create_index("clerk_user_id")
    await db.alerts.create_index("timestamp")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("❌ Disconnected from MongoDB")


def get_db():
    return db
