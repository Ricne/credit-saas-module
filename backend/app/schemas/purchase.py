import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class FakePaymentInfo(BaseModel):
    cardholder_name: str = Field(min_length=2, max_length=100)
    card_number: str = Field(min_length=12, max_length=19)
    expiry_month: str = Field(min_length=2, max_length=2)
    expiry_year: str = Field(min_length=4, max_length=4)
    cvv: str = Field(min_length=3, max_length=4)
    billing_email: EmailStr


class PurchaseRequest(BaseModel):
    package_id: uuid.UUID
    payment: FakePaymentInfo


class PurchaseResponse(BaseModel):
    transaction_id: uuid.UUID
    package_name: str
    credits_added: int
    balance_after: int
    purchased_at: datetime


class PurchaseHistoryItem(BaseModel):
    id: uuid.UUID
    package_name: str
    amount: Decimal
    credits_added: int
    status: str
    payment_method: str
    created_at: datetime

    class Config:
        from_attributes = True