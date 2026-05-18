import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Table, Text, Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class PackageStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ARCHIVED = "ARCHIVED"


package_features = Table(
    "package_features",
    Base.metadata,
    Column("package_id", UUID(as_uuid=True), ForeignKey("packages.id"), primary_key=True),
    Column("feature_id", UUID(as_uuid=True), ForeignKey("features.id"), primary_key=True),
    Column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False),
)


class Package(Base):
    __tablename__ = "packages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    credits: Mapped[int] = mapped_column(nullable=False)

    status: Mapped[PackageStatus] = mapped_column(
        Enum(PackageStatus, name="package_status_enum"),
        nullable=False,
        default=PackageStatus.ACTIVE,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    features = relationship(
        "Feature",
        secondary=package_features,
        back_populates="packages",
    )

    transactions = relationship("Transaction", back_populates="package")