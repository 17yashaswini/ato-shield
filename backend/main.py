"""
ATO Shield — FastAPI Backend
Account Takeover prevention using Behavioral Biometrics + ML

Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.mongodb import connect_db, disconnect_db
from routes.behavior import router as behavior_router
from routes.admin import router as admin_router
from routes.user import router as user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="ATO Shield API",
    description="Behavioral Biometrics Account Takeover Prevention System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(behavior_router)
app.include_router(admin_router)
app.include_router(user_router)


@app.get("/")
async def root():
    return {
        "service": "ATO Shield API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
