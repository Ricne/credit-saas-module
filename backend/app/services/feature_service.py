from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.feature_repository import FeatureRepository


class FeatureService:
    def __init__(self, db: AsyncSession):
        self.feature_repository = FeatureRepository(db)

    async def get_my_features(self, current_user: User):
        return await self.feature_repository.get_active_user_features(
            current_user.id
        )