import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PurchaseRequest(BaseModel):
    package_id: uuid.UUID


class PurchaseResponse(BaseModel):
    transaction_id: uuid.UUID
    package_name: str
    credits_added: int
    balance_after: int
    purchased_at: datetime


class PurchaseHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    package_name: str
    amount: Decimal
    credits_added: int
    status: str
    payment_method: str
    created_at: datetime