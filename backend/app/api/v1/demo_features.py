from fastapi import APIRouter, Depends

from app.dependencies.feature_guard import require_feature
from app.models.user import User


router = APIRouter(
    prefix="/demo-features",
    tags=["Demo Features"],
)


@router.post("/ai-chat")
async def use_ai_chat(
    current_user: User = Depends(require_feature("AI_CHAT")),
):
    return {
        "message": "AI Chat feature is unlocked",
        "user_id": str(current_user.id),
    }


@router.post("/image-generation")
async def use_image_generation(
    current_user: User = Depends(require_feature("IMAGE_GENERATION")),
):
    return {
        "message": "Image Generation feature is unlocked",
        "user_id": str(current_user.id),
    }


@router.post("/auto-post")
async def use_auto_post(
    current_user: User = Depends(require_feature("AUTO_POST")),
):
    return {
        "message": "Auto Post feature is unlocked",
        "user_id": str(current_user.id),
    }


@router.post("/export-hd")
async def use_export_hd(
    current_user: User = Depends(require_feature("EXPORT_HD")),
):
    return {
        "message": "Export HD feature is unlocked",
        "user_id": str(current_user.id),
    }