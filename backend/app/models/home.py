from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric, Text, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from datetime import datetime
import uuid
import enum
import secrets


class MemberRole(str, enum.Enum):
    """Member role enum."""
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class MembershipStatus(str, enum.Enum):
    """Membership status enum."""
    ACTIVE = "active"
    PENDING = "pending"
    SUSPENDED = "suspended"


class Home(BaseModel):
    """Home model for expense sharing groups."""
    __tablename__ = "homes"
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    invite_code = Column(String(32), unique=True, index=True, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    memberships = relationship("HomeMembership", back_populates="home", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="home", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<Home {self.name}>"
    
    @staticmethod
    def generate_invite_code() -> str:
        """Generate a unique invite code."""
        return secrets.token_urlsafe(16)[:16].upper()


class HomeMembership(BaseModel):
    """Home membership model for user-home relationships."""
    __tablename__ = "home_memberships"
    
    home_id = Column(UUID(as_uuid=True), ForeignKey("homes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(SQLEnum(MemberRole), default=MemberRole.MEMBER, nullable=False)
    status = Column(SQLEnum(MembershipStatus), default=MembershipStatus.ACTIVE, nullable=False)
    nickname = Column(String(100), nullable=True)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    home = relationship("Home", back_populates="memberships")
    user = relationship("User")
    expense_splits = relationship("ExpenseSplit", back_populates="membership", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<HomeMembership {self.user_id} in {self.home_id}>"
    
    @property
    def is_owner(self) -> bool:
        """Check if member is owner."""
        return self.role == MemberRole.OWNER
    
    @property
    def is_admin(self) -> bool:
        """Check if member is admin or owner."""
        return self.role in [MemberRole.OWNER, MemberRole.ADMIN]
