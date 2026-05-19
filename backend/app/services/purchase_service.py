import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit_ledger import CreditLedger, LedgerType
from app.models.transaction import (
    PaymentMethod,
    Transaction,
    TransactionStatus,
)
from app.models.user import User
from app.models.user_feature import UserFeature
from app.repositories.package_repository import PackageRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.wallet_repository import WalletRepository
from app.schemas.purchase import PurchaseRequest


class PurchaseService:
    def __init__(self, db: AsyncSession):
        self.db = db

        self.package_repository = PackageRepository(db)
        self.wallet_repository = WalletRepository(db)
        self.transaction_repository = TransactionRepository(db)

    async def purchase_package(
        self,
        current_user: User,
        payload: PurchaseRequest,
    ):
        package = await self.package_repository.get_by_id(payload.package_id)

        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Package not found",
            )

        wallet = await self.wallet_repository.get_by_user_id(current_user.id)

        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found",
            )
        payment = payload.payment

        card_number = payment.card_number.replace(" ", "")
        if not card_number.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Card number must contain digits only",
            )

        if not payment.cvv.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CVV must contain digits only",
            )

        if not payment.expiry_month.isdigit() or not 1 <= int(payment.expiry_month) <= 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid expiry month",
            )

        if not payment.expiry_year.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid expiry year",
            )

        balance_before = wallet.balance
        balance_after = balance_before + package.credits

        transaction = Transaction(
            user_id=current_user.id,
            package_id=package.id,
            package_name=package.name,
            status=TransactionStatus.SUCCESS,
            amount=package.price,
            credits_added=package.credits,
            payment_method=PaymentMethod.FAKE_PAYMENT,
            payment_reference=f"FAKE-{uuid.uuid4()}",
            idempotency_key=uuid.uuid4(),
            completed_at=datetime.now(timezone.utc),
        )

        transaction = await self.transaction_repository.create(transaction)

        wallet.balance = balance_after

        ledger_entry = CreditLedger(
            user_id=current_user.id,
            transaction_id=transaction.id,
            type=LedgerType.PURCHASE,
            amount=package.credits,
            balance_before=balance_before,
            balance_after=balance_after,
            description=f"Purchased package {package.name}",
        )

        self.db.add(ledger_entry)

        for feature in package.features:
            user_feature = UserFeature(
                user_id=current_user.id,
                feature_code=feature.code,
                source_transaction_id=transaction.id,
            )

            self.db.add(user_feature)

        await self.db.commit()

        return {
            "transaction_id": transaction.id,
            "package_name": package.name,
            "credits_added": package.credits,
            "balance_after": balance_after,
            "purchased_at": transaction.completed_at,
        }

    async def get_purchase_history(
        self,
        current_user: User,
    ):
        return await self.transaction_repository.get_user_transactions(
            current_user.id
        )