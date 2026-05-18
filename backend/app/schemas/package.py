import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict
from pydantic import Field


class FeatureInPackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    name: str
    description: str | None


class PackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    price: Decimal
    credits: int
    status: str
    created_at: datetime
    features: list[FeatureInPackageResponse] = []

class PackageCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    price: Decimal = Field(ge=0)
    credits: int = Field(gt=0)
    feature_codes: list[str] = []


class PackageUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    credits: int | None = Field(default=None, gt=0)
    status: str | None = None
    feature_codes: list[str] | None = None