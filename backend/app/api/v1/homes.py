from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.api.middleware.auth import get_current_user
from app.models.user import User
from app.models.expense import ExpenseStatus
from app.services.home_service import HomeService, MembershipService
from app.services.expense_service import ExpenseService
from app.schemas.home import (
    HomeCreate, HomeUpdate, HomeResponse, HomeWithMembershipResponse,
    MembershipCreate, MemberResponse, MembershipUpdate,
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, BalanceResponse
)


router = APIRouter(prefix="/homes", tags=["homes"])


# Home endpoints
@router.post("", response_model=HomeResponse, status_code=status.HTTP_201_CREATED)
async def create_home(
    home_data: HomeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new home."""
    home = await HomeService.create_home(db, home_data, current_user.id)
    return home


@router.get("", response_model=List[HomeWithMembershipResponse])
async def get_user_homes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all homes the user is a member of."""
    homes = await HomeService.get_user_homes(db, current_user.id)
    
    result = []
    for home in homes:
        membership = await MembershipService.get_user_membership(db, home.id, current_user.id)
        member_count = len([m for m in home.memberships if m.status.value == "active"])
        
        result.append(HomeWithMembershipResponse(
            id=home.id,
            name=home.name,
            description=home.description,
            invite_code=home.invite_code,
            currency=home.currency,
            is_active=home.is_active,
            created_by=home.created_by,
            created_at=home.created_at,
            updated_at=home.updated_at,
            user_role=membership.role if membership else None,
            user_status=membership.status if membership else None,
            member_count=member_count,
        ))
    
    return result


@router.get("/{home_id}", response_model=HomeWithMembershipResponse)
async def get_home(
    home_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a home by ID."""
    home = await HomeService.get_home_by_id(db, home_id, current_user.id)
    
    if not home:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Home not found"
        )
    
    membership = await MembershipService.get_user_membership(db, home.id, current_user.id)
    member_count = len([m for m in home.memberships if m.status.value == "active"])
    
    return HomeWithMembershipResponse(
        id=home.id,
        name=home.name,
        description=home.description,
        invite_code=home.invite_code,
        currency=home.currency,
        is_active=home.is_active,
        created_by=home.created_by,
        created_at=home.created_at,
        updated_at=home.updated_at,
        user_role=membership.role if membership else None,
        user_status=membership.status if membership else None,
        member_count=member_count,
    )


@router.patch("/{home_id}", response_model=HomeResponse)
async def update_home(
    home_id: UUID,
    home_data: HomeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a home."""
    home = await HomeService.update_home(db, home_id, home_data, current_user.id)
    
    if not home:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this home"
        )
    
    return home


@router.delete("/{home_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_home(
    home_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a home."""
    success = await HomeService.delete_home(db, home_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this home"
        )


@router.post("/{home_id}/regenerate", response_model=HomeResponse)
async def regenerate_invite_code(
    home_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Regenerate invite code for a home."""
    home = await HomeService.get_home_by_id(db, home_id, current_user.id)
    
    if not home:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Home not found"
        )
    
    new_code = await HomeService.regenerate_invite_code(db, home_id, current_user.id)
    
    if not new_code:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to regenerate invite code"
        )
    
    home.invite_code = new_code
    return home


# Membership endpoints
@router.post("/join", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def join_home(
    membership_data: MembershipCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a home using an invite code."""
    membership = await MembershipService.join_home(
        db, membership_data.invite_code, current_user.id
    )
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invite code"
        )
    
    return MemberResponse(
        id=membership.id,
        user_id=membership.user_id,
        home_id=membership.home_id,
        role=membership.role,
        status=membership.status,
        nickname=membership.nickname,
        joined_at=membership.joined_at,
    )


@router.get("/{home_id}/members", response_model=List[MemberResponse])
async def get_home_members(
    home_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all members of a home."""
    members = await MembershipService.get_home_members(db, home_id, current_user.id)
    
    return [
        MemberResponse(
            id=member.id,
            user_id=member.user_id,
            home_id=member.home_id,
            role=member.role,
            status=member.status,
            nickname=member.nickname,
            joined_at=member.joined_at,
            user_email=member.user.email if member.user else None,
            user_name=member.user.full_name if member.user else None,
            user_avatar=member.user.avatar_url if member.user else None,
        )
        for member in members
    ]


@router.patch("/{home_id}/members/{member_id}", response_model=MemberResponse)
async def update_member_role(
    home_id: UUID,
    member_id: UUID,
    update_data: MembershipUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a member's role."""
    if not update_data.role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role is required"
        )
    
    member = await MembershipService.update_member_role(
        db, home_id, member_id, update_data.role, current_user.id
    )
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update member role"
        )
    
    return MemberResponse(
        id=member.id,
        user_id=member.user_id,
        home_id=member.home_id,
        role=member.role,
        status=member.status,
        nickname=member.nickname,
        joined_at=member.joined_at,
    )


@router.delete("/{home_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    home_id: UUID,
    member_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a member from a home."""
    success = await MembershipService.remove_member(db, home_id, member_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove this member"
        )


@router.post("/{home_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_home(
    home_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Leave a home."""
    success = await MembershipService.leave_home(db, home_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot leave home (owner must delete or transfer ownership)"
        )


# Expense endpoints
@router.post("/{home_id}/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    home_id: UUID,
    expense_data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new expense."""
    expense = await ExpenseService.create_expense(db, home_id, expense_data, current_user.id)
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create expenses in this home"
        )
    
    return ExpenseResponse(
        id=expense.id,
        home_id=expense.home_id,
        paid_by_membership_id=expense.paid_by_membership_id,
        title=expense.title,
        description=expense.description,
        total_amount=float(expense.total_amount),
        currency=expense.currency,
        split_type=expense.split_type,
        status=expense.status,
        expense_date=expense.expense_date,
        settled_at=expense.settled_at,
        receipt_url=expense.receipt_url,
        created_at=expense.created_at,
        updated_at=expense.updated_at,
        splits=[
            {
                "id": s.id,
                "expense_id": s.expense_id,
                "membership_id": s.membership_id,
                "amount": float(s.amount),
                "percentage": float(s.percentage) if s.percentage else None,
                "ratio": s.ratio,
                "is_settled": s.is_settled,
                "settled_at": s.settled_at,
            }
            for s in expense.splits
        ],
    )


@router.get("/{home_id}/expenses", response_model=List[ExpenseResponse])
async def get_home_expenses(
    home_id: UUID,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all expenses for a home."""
    expense_status = None
    if status:
        try:
            expense_status = ExpenseStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status value"
            )
    
    expenses = await ExpenseService.get_home_expenses(
        db, home_id, current_user.id, expense_status, limit, offset
    )
    
    return [
        ExpenseResponse(
            id=expense.id,
            home_id=expense.home_id,
            paid_by_membership_id=expense.paid_by_membership_id,
            title=expense.title,
            description=expense.description,
            total_amount=float(expense.total_amount),
            currency=expense.currency,
            split_type=expense.split_type,
            status=expense.status,
            expense_date=expense.expense_date,
            settled_at=expense.settled_at,
            receipt_url=expense.receipt_url,
            created_at=expense.created_at,
            updated_at=expense.updated_at,
            splits=[
                {
                    "id": s.id,
                    "expense_id": s.expense_id,
                    "membership_id": s.membership_id,
                    "amount": float(s.amount),
                    "percentage": float(s.percentage) if s.percentage else None,
                    "ratio": s.ratio,
                    "is_settled": s.is_settled,
                    "settled_at": s.settled_at,
                }
                for s in expense.splits
            ],
        )
        for expense in expenses
    ]


@router.get("/{home_id}/balances", response_model=List[BalanceResponse])
async def get_home_balances(
    home_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get balance summary for all members in a home."""
    balances = await ExpenseService.get_balance_summary(db, home_id, current_user.id)
    
    return [BalanceResponse(**b) for b in balances.values()]


@router.get("/{home_id}/expenses/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    home_id: UUID,
    expense_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get an expense by ID."""
    expense = await ExpenseService.get_expense_by_id(db, expense_id, current_user.id)
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    return ExpenseResponse(
        id=expense.id,
        home_id=expense.home_id,
        paid_by_membership_id=expense.paid_by_membership_id,
        title=expense.title,
        description=expense.description,
        total_amount=float(expense.total_amount),
        currency=expense.currency,
        split_type=expense.split_type,
        status=expense.status,
        expense_date=expense.expense_date,
        settled_at=expense.settled_at,
        receipt_url=expense.receipt_url,
        created_at=expense.created_at,
        updated_at=expense.updated_at,
        splits=[
            {
                "id": s.id,
                "expense_id": s.expense_id,
                "membership_id": s.membership_id,
                "amount": float(s.amount),
                "percentage": float(s.percentage) if s.percentage else None,
                "ratio": s.ratio,
                "is_settled": s.is_settled,
                "settled_at": s.settled_at,
            }
            for s in expense.splits
        ],
    )


@router.patch("/{home_id}/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    home_id: UUID,
    expense_id: UUID,
    expense_data: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an expense."""
    expense = await ExpenseService.update_expense(db, expense_id, expense_data, current_user.id)
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this expense"
        )
    
    return ExpenseResponse(
        id=expense.id,
        home_id=expense.home_id,
        paid_by_membership_id=expense.paid_by_membership_id,
        title=expense.title,
        description=expense.description,
        total_amount=float(expense.total_amount),
        currency=expense.currency,
        split_type=expense.split_type,
        status=expense.status,
        expense_date=expense.expense_date,
        settled_at=expense.settled_at,
        receipt_url=expense.receipt_url,
        created_at=expense.created_at,
        updated_at=expense.updated_at,
        splits=[
            {
                "id": s.id,
                "expense_id": s.expense_id,
                "membership_id": s.membership_id,
                "amount": float(s.amount),
                "percentage": float(s.percentage) if s.percentage else None,
                "ratio": s.ratio,
                "is_settled": s.is_settled,
                "settled_at": s.settled_at,
            }
            for s in expense.splits
        ],
    )


@router.delete("/{home_id}/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    home_id: UUID,
    expense_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an expense."""
    success = await ExpenseService.delete_expense(db, expense_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this expense"
        )


@router.post("/{home_id}/expenses/{expense_id}/splits/{split_id}/settle", response_model=dict)
async def settle_split(
    home_id: UUID,
    expense_id: UUID,
    split_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a split as settled."""
    split = await ExpenseService.settle_split(db, split_id, current_user.id)
    
    if not split:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to settle this split"
        )
    
    return {"message": "Split settled successfully", "split_id": str(split.id)}
