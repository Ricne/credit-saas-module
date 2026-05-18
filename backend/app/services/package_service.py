import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.package import Package, PackageStatus
from app.repositories.package_repository import PackageRepository
from app.schemas.package import PackageCreateRequest, PackageUpdateRequest


class PackageService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.package_repository = PackageRepository(db)

    async def list_active_packages(self) -> list[Package]:
        return await self.package_repository.list_active_packages()

    async def create_package(self, payload: PackageCreateRequest) -> Package:
        existing_package = await self.package_repository.get_by_name(payload.name)

        if existing_package:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Package name already exists",
            )

        features = await self.package_repository.get_features_by_codes(
            payload.feature_codes
        )

        if len(features) != len(set(payload.feature_codes)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more feature codes are invalid",
            )

        package = Package(
            name=payload.name,
            description=payload.description,
            price=payload.price,
            credits=payload.credits,
            status=PackageStatus.ACTIVE,
        )

        package = await self.package_repository.create_package(
            package=package,
            features=features,
        )

        package_id = package.id

        await self.db.commit()

        package = await self.package_repository.get_by_id(package_id)

        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Package not found after creation",
            )

        return package

    async def update_package(
        self,
        package_id: uuid.UUID,
        payload: PackageUpdateRequest,
    ) -> Package:
        package = await self.package_repository.get_by_id(package_id)

        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Package not found",
            )

        if payload.name and payload.name != package.name:
            existing_package = await self.package_repository.get_by_name(payload.name)

            if existing_package:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Package name already exists",
                )

            package.name = payload.name

        if payload.description is not None:
            package.description = payload.description

        if payload.price is not None:
            package.price = payload.price

        if payload.credits is not None:
            package.credits = payload.credits

        if payload.status is not None:
            try:
                package.status = PackageStatus(payload.status)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid package status",
                )

        if payload.feature_codes is not None:
            features = await self.package_repository.get_features_by_codes(
                payload.feature_codes
            )

            if len(features) != len(set(payload.feature_codes)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more feature codes are invalid",
                )

            package = await self.package_repository.replace_package_features(
                package=package,
                features=features,
            )

        package_id = package.id

        await self.db.commit()

        package = await self.package_repository.get_by_id(package_id)

        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Package not found after update",
            )

        return package

    async def delete_package(self, package_id: uuid.UUID) -> None:
        package = await self.package_repository.get_by_id(package_id)

        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Package not found",
            )

        package.status = PackageStatus.ARCHIVED
        package.deleted_at = datetime.now(timezone.utc)

        await self.db.commit()