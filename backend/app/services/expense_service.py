from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict
from uuid import UUID
from decimal import Decimal
from datetime import datetime

from app.models.expense import Expense, ExpenseSplit, SplitType, ExpenseStatus
from app.models.home import HomeMembership, MembershipStatus, MemberRole
from app.schemas.home import ExpenseCreate, ExpenseUpdate, ExpenseSplitCreate


class SplitEngine:
    """Engine for calculating expense splits."""
    
    @staticmethod
    def calculate_equal_split(
        total_amount: Decimal,
        member_count: int
    ) -> List[Decimal]:
        """Calculate equal split amounts."""
        if member_count == 0:
            return []
        
        amount_per_member = total_amount / member_count
        # Round to 2 decimal places
        amount_per_member = amount_per_member.quantize(Decimal('0.01'))
        
        splits = [amount_per_member] * member_count
        # Adjust for rounding errors - add remainder to first member
        total_split = sum(splits)
        if total_split < total_amount:
            splits[0] += total_amount - total_split
        
        return splits
    
    @staticmethod
    def calculate_percentage_split(
        total_amount: Decimal,
        percentages: List[Decimal]
    ) -> List[Decimal]:
        """Calculate percentage-based split amounts."""
        splits = []
        for percentage in percentages:
            amount = (total_amount * percentage / 100).quantize(Decimal('0.01'))
            splits.append(amount)
        
        # Adjust for rounding errors
        total_split = sum(splits)
        if total_split != total_amount:
            diff = total_amount - total_split
            # Find the largest split and adjust it
            max_idx = splits.index(max(splits))
            splits[max_idx] += diff
        
        return splits
    
    @staticmethod
    def calculate_exact_split(
        amounts: List[Decimal]
    ) -> List[Decimal]:
        """Return exact split amounts (already provided)."""
        return amounts
    
    @staticmethod
    def calculate_ratio_split(
        total_amount: Decimal,
        ratios: List[int]
    ) -> List[Decimal]:
        """Calculate ratio-based split amounts."""
        total_ratio = sum(ratios)
        if total_ratio == 0:
            return [Decimal('0')] * len(ratios)
        
        splits = []
        for ratio in ratios:
            amount = (total_amount * Decimal(ratio) / Decimal(total_ratio)).quantize(Decimal('0.01'))
            splits.append(amount)
        
        # Adjust for rounding errors
        total_split = sum(splits)
        if total_split != total_amount:
            diff = total_amount - total_split
            max_idx = splits.index(max(splits))
            splits[max_idx] += diff
        
        return splits


class ExpenseService:
    """Service for expense management operations."""
    
    @staticmethod
    async def create_expense(
        db: AsyncSession,
        home_id: UUID,
        expense_data: ExpenseCreate,
        user_id: UUID
    ) -> Optional[Expense]:
        """Create a new expense with splits."""
        # Verify user is a member
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        membership = membership_result.scalar_one_or_none()
        
        if not membership:
            return None
        
        # Get all active members for split calculation
        members_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        members = list(members_result.scalars().all())
        
        if not members:
            return None
        
        # Create expense
        total_amount = Decimal(str(expense_data.total_amount))
        expense = Expense(
            home_id=home_id,
            paid_by_membership_id=membership.id,
            title=expense_data.title,
            description=expense_data.description,
            total_amount=total_amount,
            currency=expense_data.currency or "USD",
            split_type=SplitType(expense_data.split_type.value),
            status=ExpenseStatus.PENDING,
            expense_date=expense_data.expense_date or datetime.utcnow(),
            receipt_url=expense_data.receipt_url,
        )
        db.add(expense)
        await db.flush()
        
        # Calculate and create splits
        splits = await ExpenseService._calculate_splits(
            expense, members, expense_data.splits
        )
        
        for split in splits:
            db.add(split)
        
        await db.refresh(expense)
        return expense
    
    @staticmethod
    async def _calculate_splits(
        expense: Expense,
        members: List[HomeMembership],
        split_data: Optional[List[ExpenseSplitCreate]] = None
    ) -> List[ExpenseSplit]:
        """Calculate and create expense splits based on split type."""
        splits = []
        
        if expense.split_type == SplitType.EQUAL:
            amounts = SplitEngine.calculate_equal_split(
                expense.total_amount,
                len(members)
            )
            for i, member in enumerate(members):
                split = ExpenseSplit(
                    expense_id=expense.id,
                    membership_id=member.id,
                    amount=amounts[i],
                )
                splits.append(split)
        
        elif expense.split_type == SplitType.PERCENTAGE:
            if split_data:
                percentages = [Decimal(str(s.percentage or 0)) for s in split_data]
                amounts = SplitEngine.calculate_percentage_split(
                    expense.total_amount, percentages
                )
                for i, split_info in enumerate(split_data):
                    split = ExpenseSplit(
                        expense_id=expense.id,
                        membership_id=split_info.membership_id,
                        amount=amounts[i],
                        percentage=percentages[i],
                    )
                    splits.append(split)
        
        elif expense.split_type == SplitType.EXACT:
            if split_data:
                amounts = [Decimal(str(s.amount or 0)) for s in split_data]
                amounts = SplitEngine.calculate_exact_split(amounts)
                for i, split_info in enumerate(split_data):
                    split = ExpenseSplit(
                        expense_id=expense.id,
                        membership_id=split_info.membership_id,
                        amount=amounts[i],
                    )
                    splits.append(split)
        
        elif expense.split_type == SplitType.RATIO:
            if split_data:
                ratios = [s.ratio or 0 for s in split_data]
                amounts = SplitEngine.calculate_ratio_split(
                    expense.total_amount, ratios
                )
                for i, split_info in enumerate(split_data):
                    split = ExpenseSplit(
                        expense_id=expense.id,
                        membership_id=split_info.membership_id,
                        amount=amounts[i],
                        ratio=ratios[i],
                    )
                    splits.append(split)
        
        return splits
    
    @staticmethod
    async def get_home_expenses(
        db: AsyncSession,
        home_id: UUID,
        user_id: UUID,
        status: Optional[ExpenseStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Expense]:
        """Get all expenses for a home."""
        # Verify user is a member
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        if not membership_result.scalar_one_or_none():
            return []
        
        # Build query
        query = select(Expense).where(Expense.home_id == home_id)
        
        if status:
            query = query.where(Expense.status == status)
        
        query = query.options(
            selectinload(Expense.splits).selectinload(ExpenseSplit.membership),
            selectinload(Expense.paid_by)
        ).order_by(Expense.expense_date.desc()).limit(limit).offset(offset)
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_expense_by_id(
        db: AsyncSession,
        expense_id: UUID,
        user_id: UUID
    ) -> Optional[Expense]:
        """Get an expense by ID if user has access."""
        result = await db.execute(
            select(Expense)
            .join(HomeMembership, Expense.home_id == HomeMembership.home_id)
            .where(
                Expense.id == expense_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
            .options(
                selectinload(Expense.splits).selectinload(ExpenseSplit.membership),
                selectinload(Expense.paid_by)
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_expense(
        db: AsyncSession,
        expense_id: UUID,
        expense_data: ExpenseUpdate,
        user_id: UUID
    ) -> Optional[Expense]:
        """Update an expense."""
        expense = await ExpenseService.get_expense_by_id(db, expense_id, user_id)
        
        if not expense:
            return None
        
        # Check if user can edit (paid_by or admin)
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == expense.home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        membership = membership_result.scalar_one_or_none()
        
        if not membership:
            return None
        
        # Only payer or admin can edit
        if expense.paid_by_membership_id != membership.id and not membership.is_admin:
            return None
        
        # Update fields
        update_data = expense_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(expense, field, value)
        
        await db.refresh(expense)
        return expense
    
    @staticmethod
    async def delete_expense(
        db: AsyncSession,
        expense_id: UUID,
        user_id: UUID
    ) -> bool:
        """Delete an expense."""
        expense = await ExpenseService.get_expense_by_id(db, expense_id, user_id)
        
        if not expense:
            return False
        
        # Check if user can delete (paid_by or admin)
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == expense.home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        membership = membership_result.scalar_one_or_none()
        
        if not membership:
            return False
        
        # Only payer or admin can delete
        if expense.paid_by_membership_id != membership.id and not membership.is_admin:
            return False
        
        await db.delete(expense)
        return True
    
    @staticmethod
    async def settle_split(
        db: AsyncSession,
        split_id: UUID,
        user_id: UUID
    ) -> Optional[ExpenseSplit]:
        """Mark a split as settled."""
        # Get split with expense
        result = await db.execute(
            select(ExpenseSplit)
            .where(ExpenseSplit.id == split_id)
            .options(selectinload(ExpenseSplit.expense))
        )
        split = result.scalar_one_or_none()
        
        if not split:
            return None
        
        # Verify user is the one who owes this split
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.id == split.membership_id,
                HomeMembership.user_id == user_id
            )
        )
        if not membership_result.scalar_one_or_none():
            return None
        
        split.is_settled = True
        split.settled_at = datetime.utcnow()
        
        # Check if all splits are settled
        expense = split.expense
        all_splits_result = await db.execute(
            select(ExpenseSplit)
            .where(ExpenseSplit.expense_id == expense.id)
        )
        all_splits = list(all_splits_result.scalars().all())
        
        if all(s.is_settled for s in all_splits):
            expense.status = ExpenseStatus.SETTLED
            expense.settled_at = datetime.utcnow()
        
        await db.refresh(split)
        return split
    
    @staticmethod
    async def get_user_splits(
        db: AsyncSession,
        home_id: UUID,
        user_id: UUID,
        unsettled_only: bool = True
    ) -> List[ExpenseSplit]:
        """Get all splits for a user in a home."""
        # Get user's membership
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        membership = membership_result.scalar_one_or_none()
        
        if not membership:
            return []
        
        # Get splits
        query = select(ExpenseSplit).where(
            ExpenseSplit.membership_id == membership.id
        ).options(
            selectinload(ExpenseSplit.expense)
        )
        
        if unsettled_only:
            query = query.where(ExpenseSplit.is_settled == False)
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_balance_summary(
        db: AsyncSession,
        home_id: UUID,
        user_id: UUID
    ) -> Dict:
        """Get balance summary for all members in a home."""
        # Verify user is a member
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        if not membership_result.scalar_one_or_none():
            return {}
        
        # Get all active members
        members_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
            .options(selectinload(HomeMembership.user))
        )
        members = list(members_result.scalars().all())
        
        balances = {}
        
        for member in members:
            # Total paid by this member
            paid_result = await db.execute(
                select(func.sum(Expense.total_amount))
                .where(
                    Expense.home_id == home_id,
                    Expense.paid_by_membership_id == member.id,
                    Expense.status != ExpenseStatus.CANCELLED
                )
            )
            total_paid = paid_result.scalar() or Decimal('0')
            
            # Total owed by this member
            owed_result = await db.execute(
                select(func.sum(ExpenseSplit.amount))
                .join(Expense)
                .where(
                    Expense.home_id == home_id,
                    ExpenseSplit.membership_id == member.id,
                    Expense.status != ExpenseStatus.CANCELLED
                )
            )
            total_owed = owed_result.scalar() or Decimal('0')
            
            # Balance: positive means they are owed money, negative means they owe
            balance = total_paid - total_owed
            
            balances[str(member.id)] = {
                'membership_id': member.id,
                'user_name': member.user.full_name if member.user else None,
                'total_paid': float(total_paid),
                'total_owed': float(total_owed),
                'balance': float(balance),
            }
        
        return balances
