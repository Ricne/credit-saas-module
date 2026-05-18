import enum
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class LedgerType(str, enum.Enum):
    PURCHASE = "PURCHASE"
    USAGE = "USAGE"
    REFUND = "REFUND"
    BONUS = "BONUS"
    EXPIRE = "EXPIRE"
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"


class CreditLedger(Base):
    __tablename__ = "credit_ledger"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id"),
        nullable=True,
    )

    type: Mapped[LedgerType] = mapped_column(
        Enum(LedgerType, name="ledger_type_enum"),
        nullable=False,
    )

    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)

    balance_before: Mapped[int] = mapped_column(BigInteger, nullable=False)
    balance_after: Mapped[int] = mapped_column(BigInteger, nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="ledger_entries")
    transaction = relationship("Transaction", back_populates="ledger_entries")