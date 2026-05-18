from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=AuthResponse)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    access_token, user = await service.register(payload)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    access_token, user = await service.login(payload)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user