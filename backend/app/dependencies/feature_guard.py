from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.user_feature import UserFeature


def require_feature(feature_code: str):
    async def checker(
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> User:
        now = datetime.now(timezone.utc)

        stmt = (
            select(UserFeature)
            .where(UserFeature.user_id == current_user.id)
            .where(UserFeature.feature_code == feature_code)
            .where(UserFeature.revoked_at.is_(None))
            .where(
                (UserFeature.expired_at.is_(None))
                | (UserFeature.expired_at > now)
            )
            .limit(1)
        )

        result = await db.execute(stmt)
        user_feature = result.scalar_one_or_none()

        if not user_feature:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature required: {feature_code}",
            )

        return current_user

    return checker