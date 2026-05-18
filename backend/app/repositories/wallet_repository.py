import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit_wallet import CreditWallet


class WalletRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_id(self, user_id: uuid.UUID) -> CreditWallet | None:
        stmt = (
            select(CreditWallet)
            .where(CreditWallet.user_id == user_id)
            .with_for_update()
        )

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_by_user_id_without_lock(self, user_id: uuid.UUID) -> CreditWallet | None:
        stmt = select(CreditWallet).where(CreditWallet.user_id == user_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()