from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.purchase import (
    PurchaseHistoryItem,
    PurchaseRequest,
    PurchaseResponse,
)
from app.services.purchase_service import PurchaseService


router = APIRouter(
    prefix="/purchases",
    tags=["Purchases"],
)


@router.post(
    "",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def purchase_package(
    payload: PurchaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PurchaseService(db)

    return await service.purchase_package(
        current_user=current_user,
        payload=payload,
    )


@router.get(
    "/history",
    response_model=list[PurchaseHistoryItem],
)
async def purchase_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PurchaseService(db)

    return await service.get_purchase_history(current_user)