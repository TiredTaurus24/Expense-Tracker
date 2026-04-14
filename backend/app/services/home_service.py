from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

from app.models.home import Home, HomeMembership, MemberRole, MembershipStatus
from app.models.user import User
from app.schemas.home import HomeCreate, HomeUpdate


class HomeService:
    """Service for home management operations."""
    
    @staticmethod
    async def create_home(
        db: AsyncSession,
        home_data: HomeCreate,
        user_id: UUID
    ) -> Home:
        """Create a new home with the user as owner."""
        # Create home
        home = Home(
            name=home_data.name,
            description=home_data.description,
            currency=home_data.currency,
            invite_code=Home.generate_invite_code(),
            created_by=user_id,
        )
        db.add(home)
        await db.flush()
        
        # Create owner membership
        membership = HomeMembership(
            home_id=home.id,
            user_id=user_id,
            role=MemberRole.OWNER,
            status=MembershipStatus.ACTIVE,
        )
        db.add(membership)
        await db.refresh(home)
        return home
    
    @staticmethod
    async def get_user_homes(
        db: AsyncSession,
        user_id: UUID
    ) -> List[Home]:
        """Get all homes the user is a member of."""
        result = await db.execute(
            select(Home)
            .join(HomeMembership)
            .where(
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE,
                Home.is_active == True
            )
            .options(selectinload(Home.memberships))
            .order_by(Home.created_at.desc())
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_home_by_id(
        db: AsyncSession,
        home_id: UUID,
        user_id: UUID
    ) -> Optional[Home]:
        """Get a home by ID if user is a member."""
        result = await db.execute(
            select(Home)
            .join(HomeMembership)
            .where(
                Home.id == home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
            .options(selectinload(Home.memberships))
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_home(
        db: AsyncSession,
        home_id: UUID,
        home_data: HomeUpdate,
        user_id: UUID
    ) -> Optional[Home]:
        """Update a home if user is admin or owner."""
        # Check if user is admin or owner
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        membership = membership_result.scalar_one_or_none()
        
        if not membership or not membership.is_admin:
            return None
        
        # Get and update home
        result = await db.execute(
            select(Home).where(Home.id == home_id)
        )
        home = result.scalar_one_or_none()
        
        if not home:
            return None
        
        update_data = home_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(home, field, value)
        
        await db.refresh(home)
        return home
    
    @staticmethod
    async def delete_home(
        db: AsyncSession,
        home_id: UUID,
        user_id: UUID
    ) -> bool:
        """Delete a home if user is owner."""
        # Check if user is owner
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        membership = membership_result.scalar_one_or_none()
        
        if not membership or not membership.is_owner:
            return False
        
        # Delete home (cascade will delete memberships and expenses)
        result = await db.execute(
            select(Home).where(Home.id == home_id)
        )
        home = result.scalar_one_or_none()
        
        if not home:
            return False
        
        await db.delete(home)
        return True
    
    @staticmethod
    async def regenerate_invite_code(
        db: AsyncSession,
        home_id: UUID,
        user_id: UUID
    ) -> Optional[str]:
        """Regenerate invite code if user is admin or owner."""
        # Check if user is admin or owner
        membership_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == user_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        membership = membership_result.scalar_one_or_none()
        
        if not membership or not membership.is_admin:
            return None
        
        # Get home and regenerate code
        result = await db.execute(
            select(Home).where(Home.id == home_id)
        )
        home = result.scalar_one_or_none()
        
        if not home:
            return None
        
        home.invite_code = Home.generate_invite_code()
        await db.refresh(home)
        return home.invite_code
    
    @staticmethod
    async def get_home_by_invite_code(
        db: AsyncSession,
        invite_code: str
    ) -> Optional[Home]:
        """Get a home by invite code."""
        result = await db.execute(
            select(Home).where(
                Home.invite_code == invite_code.upper(),
                Home.is_active == True
            )
        )
        return result.scalar_one_or_none()


class MembershipService:
    """Service for membership management operations."""
    
    @staticmethod
    async def join_home(
        db: AsyncSession,
        invite_code: str,
        user_id: UUID
    ) -> Optional[HomeMembership]:
        """Join a home using an invite code."""
        # Get home by invite code
        home = await HomeService.get_home_by_invite_code(db, invite_code)
        
        if not home:
            return None
        
        # Check if user is already a member
        existing_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home.id,
                HomeMembership.user_id == user_id
            )
        )
        existing = existing_result.scalar_one_or_none()
        
        if existing:
            # Reactivate if suspended
            if existing.status == MembershipStatus.SUSPENDED:
                existing.status = MembershipStatus.ACTIVE
                await db.refresh(existing)
            return existing
        
        # Create new membership
        membership = HomeMembership(
            home_id=home.id,
            user_id=user_id,
            role=MemberRole.MEMBER,
            status=MembershipStatus.ACTIVE,
        )
        db.add(membership)
        await db.flush()
        await db.refresh(membership)
        return membership
    
    @staticmethod
    async def get_home_members(
        db: AsyncSession,
        home_id: UUID,
        user_id: UUID
    ) -> List[HomeMembership]:
        """Get all members of a home."""
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
        
        # Get all members with user info
        result = await db.execute(
            select(HomeMembership)
            .where(HomeMembership.home_id == home_id)
            .options(selectinload(HomeMembership.user))
            .order_by(HomeMembership.joined_at)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def update_member_role(
        db: AsyncSession,
        home_id: UUID,
        member_id: UUID,
        new_role: MemberRole,
        requester_id: UUID
    ) -> Optional[HomeMembership]:
        """Update a member's role. Only owner can change roles."""
        # Check if requester is owner
        requester_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == requester_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        requester = requester_result.scalar_one_or_none()
        
        if not requester or not requester.is_owner:
            return None
        
        # Get member to update
        member_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.id == member_id,
                HomeMembership.home_id == home_id
            )
        )
        member = member_result.scalar_one_or_none()
        
        if not member:
            return None
        
        # Cannot change owner's role
        if member.role == MemberRole.OWNER:
            return None
        
        member.role = new_role
        await db.refresh(member)
        return member
    
    @staticmethod
    async def remove_member(
        db: AsyncSession,
        home_id: UUID,
        member_id: UUID,
        requester_id: UUID
    ) -> bool:
        """Remove a member from a home."""
        # Check if requester is admin or owner
        requester_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == requester_id,
                HomeMembership.status == MembershipStatus.ACTIVE
            )
        )
        requester = requester_result.scalar_one_or_none()
        
        if not requester or not requester.is_admin:
            return False
        
        # Get member to remove
        member_result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.id == member_id,
                HomeMembership.home_id == home_id
            )
        )
        member = member_result.scalar_one_or_none()
        
        if not member:
            return False
        
        # Cannot remove owner
        if member.role == MemberRole.OWNER:
            return False
        
        # Admins cannot remove other admins (only owner can)
        if member.role == MemberRole.ADMIN and not requester.is_owner:
            return False
        
        await db.delete(member)
        return True
    
    @staticmethod
    async def leave_home(
        db: AsyncSession,
        home_id: UUID,
        user_id: UUID
    ) -> bool:
        """Leave a home. Owner cannot leave, must delete or transfer ownership."""
        # Get membership
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
            return False
        
        # Owner cannot leave
        if membership.role == MemberRole.OWNER:
            return False
        
        await db.delete(membership)
        return True
    
    @staticmethod
    async def get_user_membership(
        db: AsyncSession,
        home_id: UUID,
        user_id: UUID
    ) -> Optional[HomeMembership]:
        """Get user's membership for a home."""
        result = await db.execute(
            select(HomeMembership)
            .where(
                HomeMembership.home_id == home_id,
                HomeMembership.user_id == user_id
            )
        )
        return result.scalar_one_or_none()
