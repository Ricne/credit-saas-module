from fastapi import APIRouter

from app.api.v1 import auth, credits, demo_features, features, packages, purchases


api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(packages.router)
api_router.include_router(purchases.router)
api_router.include_router(credits.router)
api_router.include_router(features.router)
api_router.include_router(demo_features.router)