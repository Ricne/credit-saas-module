import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MyFeatureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    feature_code: str
    granted_at: datetime
    expired_at: datetime | None
    revoked_at: datetime | None