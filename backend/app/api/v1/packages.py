import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.admin import require_admin
from app.models.user import User
from app.schemas.package import (
    PackageCreateRequest,
    PackageResponse,
    PackageUpdateRequest,
)
from app.services.package_service import PackageService

router = APIRouter(tags=["Packages"])

@router.get("/packages", response_model=list[PackageResponse])
async def list_packages(db: AsyncSession = Depends(get_db)):
    service = PackageService(db)
    return await service.list_active_packages()

@router.post("/admin/packages",
             response_model=PackageResponse,
             status_code=status.HTTP_201_CREATED,)
async def create_package(
    payload: PackageCreateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = PackageService(db)
    return await service.create_package(payload)

@router.patch("/admin/packages/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: uuid.UUID,
    payload: PackageUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = PackageService(db)
    return await service.update_package(package_id, payload)

@router.delete(
    "/admin/packages/{package_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_package(
    package_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = PackageService(db)
    await service.delete_package(package_id)
    return None