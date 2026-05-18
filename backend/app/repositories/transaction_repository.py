import uuid

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction


class TransactionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, transaction: Transaction) -> Transaction:
        self.db.add(transaction)
        await self.db.flush()
        await self.db.refresh(transaction)
        return transaction

    async def get_user_transactions(
        self,
        user_id: uuid.UUID,
    ) -> list[Transaction]:
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(desc(Transaction.created_at))
        )

        result = await self.db.execute(stmt)

        return list(result.scalars().all())