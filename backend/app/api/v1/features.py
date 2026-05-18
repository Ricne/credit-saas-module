from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.feature import MyFeatureResponse
from app.services.feature_service import FeatureService


router = APIRouter(
    prefix="/features",
    tags=["Features"],
)


@router.get("/me", response_model=list[MyFeatureResponse])
async def get_my_features(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = FeatureService(db)
    return await service.get_my_features(current_user)