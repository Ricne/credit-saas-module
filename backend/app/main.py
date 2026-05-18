from fastapi.middleware.cors import CORSMiddleware

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import get_db

from app.models.user import User
from app.models.feature import Feature
from app.models.package import Package
from app.models.credit_wallet import CreditWallet
from app.models.transaction import Transaction
from app.models.credit_ledger import CreditLedger
from app.models.user_feature import UserFeature


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "message": "Credit SaaS API is running"
    }


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    await db.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "database": "connected"
    }