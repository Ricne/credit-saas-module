from fastapi import HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit_ledger import CreditLedger
from app.models.user import User
from app.repositories.wallet_repository import WalletRepository


class CreditService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.wallet_repository = WalletRepository(db)

    async def get_my_wallet(self, current_user: User):
        wallet = await self.wallet_repository.get_by_user_id_without_lock(
            current_user.id
        )

        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found",
            )

        return wallet

    async def get_my_ledger(self, current_user: User):
        stmt = (
            select(CreditLedger)
            .where(CreditLedger.user_id == current_user.id)
            .order_by(desc(CreditLedger.created_at))
        )

        result = await self.db.execute(stmt)

        return list(result.scalars().all())