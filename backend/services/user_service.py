# File: backend/services/user_service.py
# Purpose: User management service

import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..db.repository import Repository
from ..models.user import User
from ..db.schemas import UserCreate, UserUpdate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    """Service for user management operations"""
    
    def __init__(self, db: Session):
        """
        Initialize user service
        
        Args:
            db (Session): Database session
        """
        self.db = db
        self.repository = Repository[User, UserCreate, UserUpdate](User, db)
    
    def create_user(self, user_data: UserCreate) -> User:
        """
        Create a new user
        
        Args:
            user_data (UserCreate): User data
            
        Returns:
            User: Created user
            
        Raises:
            ValueError: If username or email already exists
        """
        # Check if username exists
        if self.get_user_by_username(user_data.username):
            raise ValueError(f"Username '{user_data.username}' already exists")
        
        # Check if email exists
        if self.get_user_by_email(user_data.email):
            raise ValueError(f"Email '{user_data.email}' already exists")
        
        # Hash password
        hashed_password = self._hash_password(user_data.password)
        
        # Create user dict with hashed password
        user_dict = user_data.dict()
        user_dict["hashed_password"] = hashed_password
        del user_dict["password"]  # Remove plain password
        
        # Add default preferences
        user_dict["preferences"] = user_dict.get("preferences", {})
        
        # Create user object
        user_create = UserCreate(**user_dict)
        
        # Create user in database
        return self.repository.create(user_create)
    
    def get_user(self, user_id: int) -> Optional[User]:
        """
        Get user by ID
        
        Args:
            user_id (int): User ID
            
        Returns:
            Optional[User]: User if found, None otherwise
        """
        return self.repository.get_by_id(user_id)
    
    def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Get all users with pagination
        
        Args:
            skip (int, optional): Number of users to skip. Defaults to 0.
            limit (int, optional): Maximum number of users to return. Defaults to 100.
            
        Returns:
            List[User]: List of users
        """
        return self.repository.get_all(skip=skip, limit=limit)
    
    def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """
        Update user
        
        Args:
            user_id (int): User ID
            user_data (UserUpdate): User data
            
        Returns:
            Optional[User]: Updated user if found, None otherwise
            
        Raises:
            ValueError: If username or email already exists
        """
        # Get user
        user = self.get_user(user_id)
        if not user:
            return None
        
        # Check if username exists
        if user_data.username and user_data.username != user.username:
            if self.get_user_by_username(user_data.username):
                raise ValueError(f"Username '{user_data.username}' already exists")
        
        # Check if email exists
        if user_data.email and user_data.email != user.email:
            if self.get_user_by_email(user_data.email):
                raise ValueError(f"Email '{user_data.email}' already exists")
        
        # Update user dict
        user_dict = user_data.dict(exclude_unset=True)
        
        # Hash password if provided
        if "password" in user_dict:
            user_dict["hashed_password"] = self._hash_password(user_dict["password"])
            del user_dict["password"]  # Remove plain password
        
        # Create update object
        user_update = UserUpdate(**user_dict)
        
        # Update user in database
        return self.repository.update(user_id, user_update)
    
    def delete_user(self, user_id: int) -> bool:
        """
        Delete user
        
        Args:
            user_id (int): User ID
            
        Returns:
            bool: True if user was deleted, False otherwise
        """
        return self.repository.delete(user_id)
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username
        
        Args:
            username (str): Username
            
        Returns:
            Optional[User]: User if found, None otherwise
        """
        users = self.repository.filter_by(username=username)
        return users[0] if users else None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email
        
        Args:
            email (str): Email
            
        Returns:
            Optional[User]: User if found, None otherwise
        """
        users = self.repository.filter_by(email=email)
        return users[0] if users else None
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify password
        
        Args:
            plain_password (str): Plain password
            hashed_password (str): Hashed password
            
        Returns:
            bool: True if password is valid, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """
        Authenticate user
        
        Args:
            username (str): Username
            password (str): Password
            
        Returns:
            Optional[User]: User if authenticated, None otherwise
        """
        user = self.get_user_by_username(username)
        if not user:
            return None
        
        if not self.verify_password(password, user.hashed_password):
            return None
        
        return user
    
    def _hash_password(self, password: str) -> str:
        """
        Hash password
        
        Args:
            password (str): Plain password
            
        Returns:
            str: Hashed password
        """
        return pwd_context.hash(password)
    
    def update_preferences(self, user_id: int, preferences: Dict[str, Any]) -> Optional[User]:
        """
        Update user preferences
        
        Args:
            user_id (int): User ID
            preferences (Dict[str, Any]): User preferences
            
        Returns:
            Optional[User]: Updated user if found, None otherwise
        """
        # Get user
        user = self.get_user(user_id)
        if not user:
            return None
        
        # Create update object with merged preferences
        user_prefs = user.preferences.copy() if user.preferences else {}
        user_prefs.update(preferences)
        
        user_update = UserUpdate(preferences=user_prefs)
        
        # Update user in database
        return self.repository.update(user_id, user_update)
