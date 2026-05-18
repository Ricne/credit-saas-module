import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature import Feature
from app.models.user import User
from app.repositories.feature_repository import FeatureRepository
from app.schemas.feature import FeatureCreateRequest, FeatureUpdateRequest


class FeatureService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.feature_repository = FeatureRepository(db)

    async def list_features(self) -> list[Feature]:
        return await self.feature_repository.list_features()

    async def list_active_features(self) -> list[Feature]:
        return await self.feature_repository.list_active_features()

    async def create_feature(self, payload: FeatureCreateRequest) -> Feature:
        normalized_code = payload.code.upper().strip()

        existing_feature = await self.feature_repository.get_by_code(normalized_code)

        if existing_feature:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Feature code already exists",
            )

        feature = Feature(
            code=normalized_code,
            name=payload.name,
            description=payload.description,
            is_active=True,
        )

        feature = await self.feature_repository.create(feature)

        await self.db.commit()
        await self.db.refresh(feature)

        return feature

    async def update_feature(
        self,
        feature_id: uuid.UUID,
        payload: FeatureUpdateRequest,
    ) -> Feature:
        feature = await self.feature_repository.get_by_id(feature_id)

        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature not found",
            )

        if payload.code and payload.code.upper().strip() != feature.code:
            normalized_code = payload.code.upper().strip()
            existing_feature = await self.feature_repository.get_by_code(normalized_code)

            if existing_feature:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Feature code already exists",
                )

            feature.code = normalized_code

        if payload.name is not None:
            feature.name = payload.name

        if payload.description is not None:
            feature.description = payload.description

        if payload.is_active is not None:
            feature.is_active = payload.is_active

        await self.db.commit()
        await self.db.refresh(feature)

        return feature

    async def delete_feature(self, feature_id: uuid.UUID) -> None:
        feature = await self.feature_repository.get_by_id(feature_id)

        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature not found",
            )

        feature.is_active = False

        await self.db.commit()

    async def get_my_features(self, current_user: User):
        return await self.feature_repository.get_active_user_features(
            current_user.id
        )