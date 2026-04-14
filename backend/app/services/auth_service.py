from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime, timedelta
import hashlib

from app.models.user import User, RefreshToken
from app.schemas.auth import UserCreate, UserResponse
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.config import settings


class AuthService:
    """Service class for authentication operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user."""
        # Check if user already exists
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("Email already registered")
        
        # Create user
        user = User(
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            phone=user_data.phone,
        )
        
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = await self.get_user_by_email(email)
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        if not user.is_active:
            raise ValueError("Account is deactivated")
        
        # Update last login
        user.update_last_login()
        await self.db.flush()
        
        return user
    
    async def create_tokens(self, user: User) -> dict:
        """Create access and refresh tokens for user."""
        # Create access token
        access_token = create_access_token(
            subject=str(user.id),
            additional_claims={"email": user.email}
        )
        
        # Create refresh token
        refresh_token = create_refresh_token(subject=str(user.id))
        
        # Store refresh token hash in database
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
        
        db_refresh_token = RefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        
        self.db.add(db_refresh_token)
        await self.db.flush()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60,
        }
    
    async def refresh_tokens(self, refresh_token: str) -> dict:
        """Refresh access token using refresh token."""
        # Decode and validate the refresh token
        payload = decode_token(refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid refresh token")
        
        # Check if token is in database and valid
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        db_token = result.scalar_one_or_none()
        
        if not db_token or not db_token.is_valid:
            raise ValueError("Invalid or revoked refresh token")
        
        # Get user
        user = await self.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise ValueError("User not found or inactive")
        
        # Revoke old refresh token
        db_token.revoke()
        
        # Create new tokens
        return await self.create_tokens(user)
    
    async def logout(self, refresh_token: str) -> None:
        """Logout user by revoking refresh token."""
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        db_token = result.scalar_one_or_none()
        
        if db_token:
            db_token.revoke()
            await self.db.flush()
    
    async def revoke_all_tokens(self, user_id: str) -> None:
        """Revoke all refresh tokens for a user."""
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked == False
            )
        )
        tokens = result.scalars().all()
        
        for token in tokens:
            token.revoke()
        
        await self.db.flush()
    
    @staticmethod
    def user_to_response(user: User) -> UserResponse:
        """Convert User model to UserResponse schema."""
        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            avatar_url=user.avatar_url,
            is_verified=user.is_verified,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
