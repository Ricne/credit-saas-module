import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WalletResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    balance: int
    created_at: datetime
    updated_at: datetime


class CreditLedgerItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    amount: int
    balance_before: int
    balance_after: int
    description: str | None
    created_at: datetime