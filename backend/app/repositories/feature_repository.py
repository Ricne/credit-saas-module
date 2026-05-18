import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_feature import UserFeature


class FeatureRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

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