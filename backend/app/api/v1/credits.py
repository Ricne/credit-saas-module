from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.credit import CreditLedgerItem, WalletResponse
from app.services.credit_service import CreditService


router = APIRouter(
    prefix="/credits",
    tags=["Credits"],
)


@router.get("/wallet", response_model=WalletResponse)
async def get_my_wallet(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CreditService(db)
    return await service.get_my_wallet(current_user)


@router.get("/ledger", response_model=list[CreditLedgerItem])
async def get_my_ledger(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CreditService(db)
    return await service.get_my_ledger(current_user)