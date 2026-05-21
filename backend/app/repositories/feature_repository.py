import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature import Feature
from app.models.user_feature import UserFeature

from sqlalchemy import desc
from app.models.transaction import Transaction


class FeatureRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_features(self) -> list[Feature]:
        stmt = select(Feature).order_by(Feature.created_at.desc())

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def list_active_features(self) -> list[Feature]:
        stmt = (
            select(Feature)
            .where(Feature.is_active.is_(True))
            .order_by(Feature.created_at.desc())
        )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, feature_id: uuid.UUID) -> Feature | None:
        stmt = select(Feature).where(Feature.id == feature_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_code(self, code: str) -> Feature | None:
        stmt = select(Feature).where(Feature.code == code)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, feature: Feature) -> Feature:
        self.db.add(feature)
        await self.db.flush()
        await self.db.refresh(feature)
        return feature

    async def get_active_user_features(
        self,
        user_id: uuid.UUID,
    ) -> list[UserFeature]:
        stmt = (
            select(UserFeature)
            .where(UserFeature.user_id == user_id)
            .where(UserFeature.revoked_at.is_(None))
            .order_by(UserFeature.granted_at.desc())
        )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())
    
    async def get_active_user_features(self, user_id: uuid.UUID):
        stmt = (
            select(
                UserFeature.id,
                UserFeature.feature_code,
                Transaction.package_name,
                UserFeature.granted_at,
                UserFeature.expired_at,
                UserFeature.revoked_at,
            )
            .join(Transaction, Transaction.id == UserFeature.source_transaction_id)
            .where(UserFeature.user_id == user_id)
            .where(UserFeature.revoked_at.is_(None))
            .order_by(UserFeature.feature_code.asc(), desc(UserFeature.granted_at))
        )

        result = await self.db.execute(stmt)
        rows = result.mappings().all()

        unique_features = {}

        for row in rows:
            code = row["feature_code"]

            if code not in unique_features:
                unique_features[code] = row

        return list(unique_features.values())