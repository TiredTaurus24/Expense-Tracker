from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class MemberRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class MembershipStatus(str, Enum):
    ACTIVE = "active"
    PENDING = "pending"
    SUSPENDED = "suspended"


class SplitType(str, Enum):
    EQUAL = "equal"
    PERCENTAGE = "percentage"
    EXACT = "exact"
    RATIO = "ratio"


class ExpenseStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    SETTLED = "settled"
    CANCELLED = "cancelled"


# Home Schemas
class HomeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    currency: str = Field(default="USD", min_length=3, max_length=3)


class HomeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    is_active: Optional[bool] = None


class HomeResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    invite_code: str
    currency: str
    is_active: bool
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HomeWithMembershipResponse(HomeResponse):
    user_role: MemberRole
    user_status: MembershipStatus
    member_count: int


# Membership Schemas
class MembershipCreate(BaseModel):
    invite_code: str = Field(..., min_length=1)


class MembershipUpdate(BaseModel):
    role: Optional[MemberRole] = None
    status: Optional[MembershipStatus] = None
    nickname: Optional[str] = Field(None, max_length=100)


class MemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    home_id: UUID
    role: MemberRole
    status: MembershipStatus
    nickname: Optional[str]
    joined_at: datetime
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None

    class Config:
        from_attributes = True


# Expense Schemas
class ExpenseSplitCreate(BaseModel):
    membership_id: UUID
    amount: Optional[float] = None  # For exact split
    percentage: Optional[float] = None  # For percentage split
    ratio: Optional[int] = None  # For ratio split


class ExpenseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    total_amount: float = Field(..., gt=0)
    currency: Optional[str] = Field("USD", min_length=3, max_length=3)
    split_type: SplitType = SplitType.EQUAL
    expense_date: Optional[datetime] = None
    receipt_url: Optional[str] = None
    splits: Optional[List[ExpenseSplitCreate]] = None


class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    total_amount: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    split_type: Optional[SplitType] = None
    status: Optional[ExpenseStatus] = None
    expense_date: Optional[datetime] = None
    receipt_url: Optional[str] = None


class ExpenseSplitResponse(BaseModel):
    id: UUID
    expense_id: UUID
    membership_id: UUID
    amount: float
    percentage: Optional[float]
    ratio: Optional[int]
    is_settled: bool
    settled_at: Optional[datetime]

    class Config:
        from_attributes = True


class ExpenseResponse(BaseModel):
    id: UUID
    home_id: UUID
    paid_by_membership_id: Optional[UUID]
    title: str
    description: Optional[str]
    total_amount: float
    currency: str
    split_type: SplitType
    status: ExpenseStatus
    expense_date: datetime
    settled_at: Optional[datetime]
    receipt_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    splits: List[ExpenseSplitResponse] = []

    class Config:
        from_attributes = True


class ExpenseSummary(BaseModel):
    total_expenses: float
    total_settled: float
    total_pending: float
    expense_count: int


class BalanceResponse(BaseModel):
    membership_id: UUID
    user_name: Optional[str]
    total_paid: float
    total_owed: float
    balance: float  # positive means they are owed money, negative means they owe
