from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric, Text, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from datetime import datetime
import uuid
import enum


class SplitType(str, enum.Enum):
    """Split type enum."""
    EQUAL = "equal"
    PERCENTAGE = "percentage"
    EXACT = "exact"
    RATIO = "ratio"


class ExpenseStatus(str, enum.Enum):
    """Expense status enum."""
    DRAFT = "draft"
    PENDING = "pending"
    SETTLED = "settled"
    CANCELLED = "cancelled"


class Expense(BaseModel):
    """Expense model for tracking expenses within homes."""
    __tablename__ = "expenses"
    
    home_id = Column(UUID(as_uuid=True), ForeignKey("homes.id", ondelete="CASCADE"), nullable=False)
    paid_by_membership_id = Column(UUID(as_uuid=True), ForeignKey("home_memberships.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    total_amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    split_type = Column(SQLEnum(SplitType), default=SplitType.EQUAL, nullable=False)
    status = Column(SQLEnum(ExpenseStatus), default=ExpenseStatus.PENDING, nullable=False)
    expense_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    settled_at = Column(DateTime, nullable=True)
    receipt_url = Column(String(500), nullable=True)
    
    # Relationships
    home = relationship("Home", back_populates="expenses")
    paid_by = relationship("HomeMembership", foreign_keys=[paid_by_membership_id])
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Expense {self.title} - {self.total_amount}>"


class ExpenseSplit(BaseModel):
    """Expense split model for tracking individual shares."""
    __tablename__ = "expense_splits"
    
    expense_id = Column(UUID(as_uuid=True), ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False)
    membership_id = Column(UUID(as_uuid=True), ForeignKey("home_memberships.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    percentage = Column(Numeric(5, 2), nullable=True)  # For percentage-based splits
    ratio = Column(Integer, nullable=True)  # For ratio-based splits
    is_settled = Column(Boolean, default=False, nullable=False)
    settled_at = Column(DateTime, nullable=True)
    
    # Relationships
    expense = relationship("Expense", back_populates="splits")
    membership = relationship("HomeMembership", back_populates="expense_splits")
    
    def __repr__(self):
        return f"<ExpenseSplit {self.membership_id}: {self.amount}>"
