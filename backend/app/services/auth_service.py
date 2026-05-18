from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserStatus
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repository = UserRepository(db)

    async def register(self, payload: RegisterRequest) -> tuple[str, User]:
        existing_user = await self.user_repository.get_by_email(payload.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        password_hash = hash_password(payload.password)

        user = await self.user_repository.create_user(
            email=payload.email,
            password_hash=password_hash,
        )

        await self.db.commit()
        await self.db.refresh(user)

        access_token = create_access_token(subject=str(user.id))

        return access_token, user

    async def login(self, payload: LoginRequest) -> tuple[str, User]:
        user = await self.user_repository.get_by_email(payload.email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if user.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not active",
            )

        if not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        access_token = create_access_token(subject=str(user.id))

        return access_token, user