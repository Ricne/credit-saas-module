import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.feature import Feature
from app.models.package import Package, PackageStatus, package_features


class PackageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_active_packages(self) -> list[Package]:
        stmt = (
            select(Package)
            .options(selectinload(Package.features))
            .where(Package.status == PackageStatus.ACTIVE)
            .where(Package.deleted_at.is_(None))
            .order_by(Package.price.asc())
        )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, package_id: uuid.UUID) -> Package | None:
        stmt = (
            select(Package)
            .options(selectinload(Package.features))
            .where(Package.id == package_id)
            .where(Package.deleted_at.is_(None))
        )

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Package | None:
        stmt = (
            select(Package)
            .where(Package.name == name)
            .where(Package.deleted_at.is_(None))
        )

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_features_by_codes(self, feature_codes: list[str]) -> list[Feature]:
        if not feature_codes:
            return []

        stmt = (
            select(Feature)
            .where(Feature.code.in_(feature_codes))
            .where(Feature.is_active.is_(True))
        )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_package(
        self,
        package: Package,
        features: list[Feature],
    ) -> Package:
        package.features = features

        self.db.add(package)
        await self.db.flush()
        await self.db.refresh(package)

        return package

    async def replace_package_features(
        self,
        package: Package,
        features: list[Feature],
    ) -> Package:
        await self.db.execute(
            delete(package_features).where(
                package_features.c.package_id == package.id
            )
        )

        package.features = features

        await self.db.flush()
        await self.db.refresh(package)

        return package