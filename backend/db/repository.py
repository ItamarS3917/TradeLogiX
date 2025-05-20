# File: backend/db/repository.py
# Purpose: Generic repository pattern implementation for database operations

from typing import Generic, Type, TypeVar, List, Optional, Any, Dict
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
import json
from datetime import datetime

from .database import Base
from ..models.trade import Trade
from ..models.user import User
from ..models.journal import Journal
from ..utils.json_helpers import process_json_field
from ..utils.date_helpers import parse_date_string

# Define generic types for models and schemas
ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class Repository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Generic repository for database operations
    
    Provides CRUD operations for a SQLAlchemy model
    """
    
    def __init__(self, model: Type[ModelType], db: Session):
        """
        Initialize repository
        
        Args:
            model (Type[ModelType]): SQLAlchemy model class
            db (Session): Database session
        """
        self.model = model
        self.db = db
    
    def get_by_id(self, id: Any) -> Optional[ModelType]:
        """
        Get model by ID
        
        Args:
            id (Any): Model ID
        
        Returns:
            Optional[ModelType]: Model instance if found, None otherwise
        """
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """
        Get all models with pagination
        
        Args:
            skip (int, optional): Number of records to skip. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
        
        Returns:
            List[ModelType]: List of model instances
        """
        return self.db.query(self.model).offset(skip).limit(limit).all()
    
    def create(self, obj_in: CreateSchemaType) -> ModelType:
        """
        Create a new model instance
        
        Args:
            obj_in (CreateSchemaType): Model creation schema
        
        Returns:
            ModelType: Created model instance
        """
        # Convert Pydantic model to dict
        obj_in_data = jsonable_encoder(obj_in)
        
        # Handle field name mapping for Trade model
        if self.model.__name__ == "Trade" and "daily_plan_id" in obj_in_data:
            obj_in_data["related_plan_id"] = obj_in_data.pop("daily_plan_id")
        
        # Process JSON fields for Trade model
        if self.model.__name__ == "Trade":
            # Process JSON fields
            if "screenshots" in obj_in_data:
                obj_in_data["screenshots"] = process_json_field(obj_in_data["screenshots"])
            if "tags" in obj_in_data:
                obj_in_data["tags"] = process_json_field(obj_in_data["tags"])
            
            # Process datetime fields
            if "entry_time" in obj_in_data and isinstance(obj_in_data["entry_time"], str):
                parsed_date = parse_date_string(obj_in_data["entry_time"])
                if parsed_date:
                    obj_in_data["entry_time"] = parsed_date
            
            if "exit_time" in obj_in_data and isinstance(obj_in_data["exit_time"], str):
                parsed_date = parse_date_string(obj_in_data["exit_time"])
                if parsed_date:
                    obj_in_data["exit_time"] = parsed_date
        
        # Create model instance
        db_obj = self.model(**obj_in_data)
        
        # Add to database
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        
        return db_obj
    
    def update(self, id: Any, obj_in: UpdateSchemaType) -> Optional[ModelType]:
        """
        Update model instance
        
        Args:
            id (Any): Model ID
            obj_in (UpdateSchemaType): Model update schema
        
        Returns:
            Optional[ModelType]: Updated model instance if found, None otherwise
        """
        # Get model instance
        db_obj = self.get_by_id(id)
        
        if db_obj is None:
            return None
        
        # Convert Pydantic model to dict
        obj_in_data = jsonable_encoder(obj_in)
        
        # Handle field name mapping for Trade model
        if self.model.__name__ == "Trade" and "daily_plan_id" in obj_in_data:
            obj_in_data["related_plan_id"] = obj_in_data.pop("daily_plan_id")
        
        # Process JSON fields and datetime for Trade model
        if self.model.__name__ == "Trade":
            # Process JSON fields
            if "screenshots" in obj_in_data and obj_in_data["screenshots"] is not None:
                obj_in_data["screenshots"] = process_json_field(obj_in_data["screenshots"])
            if "tags" in obj_in_data and obj_in_data["tags"] is not None:
                obj_in_data["tags"] = process_json_field(obj_in_data["tags"])
            
            # Process datetime fields
            if "entry_time" in obj_in_data and isinstance(obj_in_data["entry_time"], str):
                parsed_date = parse_date_string(obj_in_data["entry_time"])
                if parsed_date:
                    obj_in_data["entry_time"] = parsed_date
            
            if "exit_time" in obj_in_data and isinstance(obj_in_data["exit_time"], str):
                parsed_date = parse_date_string(obj_in_data["exit_time"])
                if parsed_date:
                    obj_in_data["exit_time"] = parsed_date
        
        # Update model instance
        for field, value in obj_in_data.items():
            # Skip fields with None values
            if value is None:
                continue
            
            # Set field value
            setattr(db_obj, field, value)
        
        # Commit changes
        self.db.commit()
        self.db.refresh(db_obj)
        
        return db_obj
    
    def delete(self, id: Any) -> bool:
        """
        Delete model instance
        
        Args:
            id (Any): Model ID
        
        Returns:
            bool: True if model was deleted, False otherwise
        """
        # Get model instance
        db_obj = self.get_by_id(id)
        
        if db_obj is None:
            return False
        
        # Delete model instance
        self.db.delete(db_obj)
        self.db.commit()
        
        return True
    
    def count(self) -> int:
        """
        Count all models
        
        Returns:
            int: Number of models
        """
        return self.db.query(self.model).count()
    
    def exists(self, id: Any) -> bool:
        """
        Check if model exists
        
        Args:
            id (Any): Model ID
        
        Returns:
            bool: True if model exists, False otherwise
        """
        return self.db.query(self.model).filter(self.model.id == id).first() is not None


# Specific repository implementations
class TradeRepository(Repository[Trade, CreateSchemaType, UpdateSchemaType]):
    """
    Repository for Trade model
    
    Provides CRUD operations for the Trade model with any additional Trade-specific methods
    """
    
    def __init__(self, db: Session):
        super().__init__(Trade, db)
    
    def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Trade]:
        """
        Get trades by user ID
        
        Args:
            user_id (int): User ID
            skip (int, optional): Number of records to skip. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
        
        Returns:
            List[Trade]: List of trades for the user
        """
        return self.db.query(self.model).filter(self.model.user_id == user_id).offset(skip).limit(limit).all()
    
    def get_by_symbol(self, symbol: str, skip: int = 0, limit: int = 100) -> List[Trade]:
        """
        Get trades by symbol
        
        Args:
            symbol (str): Trading symbol
            skip (int, optional): Number of records to skip. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
        
        Returns:
            List[Trade]: List of trades for the symbol
        """
        return self.db.query(self.model).filter(self.model.symbol == symbol).offset(skip).limit(limit).all()
    
    def get_by_user(self, user_id: int, date_range: Optional[Dict[str, Any]] = None) -> List[Trade]:
        """
        Get trades by user ID with optional date range filtering
        
        Args:
            user_id (int): User ID
            date_range (Optional[Dict[str, Any]], optional): Date range with 'start' and 'end' keys. Defaults to None.
        
        Returns:
            List[Trade]: List of trades for the user
        """
        query = self.db.query(self.model).filter(self.model.user_id == user_id)
        
        if date_range:
            if date_range.get('start'):
                query = query.filter(self.model.entry_time >= date_range['start'])
            if date_range.get('end'):
                query = query.filter(self.model.entry_time <= date_range['end'])
        
        return query.all()


class UserRepository(Repository[User, CreateSchemaType, UpdateSchemaType]):
    """
    Repository for User model
    
    Provides CRUD operations for the User model with any additional User-specific methods
    """
    
    def __init__(self, db: Session):
        super().__init__(User, db)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email
        
        Args:
            email (str): User email
        
        Returns:
            Optional[User]: User instance if found, None otherwise
        """
        return self.db.query(self.model).filter(self.model.email == email).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username
        
        Args:
            username (str): Username
        
        Returns:
            Optional[User]: User instance if found, None otherwise
        """
        return self.db.query(self.model).filter(self.model.username == username).first()


class JournalRepository(Repository[Journal, CreateSchemaType, UpdateSchemaType]):
    """
    Repository for Journal model
    
    Provides CRUD operations for the Journal model with any additional Journal-specific methods
    """
    
    def __init__(self, db: Session):
        super().__init__(Journal, db)
    
    def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Journal]:
        """
        Get journals by user ID
        
        Args:
            user_id (int): User ID
            skip (int, optional): Number of records to skip. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
        
        Returns:
            List[Journal]: List of journals for the user
        """
        return self.db.query(self.model).filter(self.model.user_id == user_id).offset(skip).limit(limit).all()
    
    def get_by_date_range(self, user_id: int, start_date: Optional[Any] = None, end_date: Optional[Any] = None) -> List[Journal]:
        """
        Get journals by date range for a user
        
        Args:
            user_id (int): User ID
            start_date (Optional[Any], optional): Start date. Defaults to None.
            end_date (Optional[Any], optional): End date. Defaults to None.
        
        Returns:
            List[Journal]: List of journals in the date range
        """
        query = self.db.query(self.model).filter(self.model.user_id == user_id)
        
        if start_date:
            query = query.filter(self.model.date >= start_date)
        
        if end_date:
            query = query.filter(self.model.date <= end_date)
        
        return query.all()
