import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"


class PaymentMethod(str, enum.Enum):
    FAKE_PAYMENT = "FAKE_PAYMENT"
    STRIPE = "STRIPE"
    PAYPAL = "PAYPAL"


class Transaction(Base):
    __tablename__ = "transactions"

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

    package_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("packages.id"),
        nullable=False,
    )

    package_name: Mapped[str] = mapped_column(String(255), nullable=False)

    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus, name="transaction_status_enum"),
        nullable=False,
        default=TransactionStatus.PENDING,
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    credits_added: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, name="payment_method_enum"),
        nullable=False,
        default=PaymentMethod.FAKE_PAYMENT,
    )

    payment_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)

    idempotency_key: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
    )

    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user = relationship("User", back_populates="transactions")
    package = relationship("Package", back_populates="transactions")
    ledger_entries = relationship("CreditLedger", back_populates="transaction")
    unlocked_features = relationship("UserFeature", back_populates="source_transaction")