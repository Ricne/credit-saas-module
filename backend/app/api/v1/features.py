import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.admin import require_admin
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.feature import (
    FeatureCreateRequest,
    FeatureResponse,
    FeatureUpdateRequest,
    MyFeatureResponse,
)
from app.services.feature_service import FeatureService


router = APIRouter(tags=["Features"])


@router.get("/features", response_model=list[FeatureResponse])
async def list_active_features(db: AsyncSession = Depends(get_db)):
    service = FeatureService(db)
    return await service.list_active_features()


@router.get("/features/me", response_model=list[MyFeatureResponse])
async def get_my_features(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = FeatureService(db)
    return await service.get_my_features(current_user)


@router.get("/admin/features", response_model=list[FeatureResponse])
async def admin_list_features(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = FeatureService(db)
    return await service.list_features()


@router.post(
    "/admin/features",
    response_model=FeatureResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_feature(
    payload: FeatureCreateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = FeatureService(db)
    return await service.create_feature(payload)


@router.patch("/admin/features/{feature_id}", response_model=FeatureResponse)
async def update_feature(
    feature_id: uuid.UUID,
    payload: FeatureUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = FeatureService(db)
    return await service.update_feature(feature_id, payload)


@router.delete(
    "/admin/features/{feature_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_feature(
    feature_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = FeatureService(db)
    await service.delete_feature(feature_id)
    return None