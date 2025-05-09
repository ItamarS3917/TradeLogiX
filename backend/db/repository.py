# File: backend/db/repository.py
# Purpose: Generic repository class for database operations

import logging
from typing import Generic, TypeVar, Type, List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel

from .database import Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Type variables
T = TypeVar('T', bound=Base)  # SQLAlchemy model
C = TypeVar('C', bound=BaseModel)  # Create schema
U = TypeVar('U', bound=BaseModel)  # Update schema

class Repository(Generic[T, C, U]):
    """
    Generic repository for database operations
    
    Provides CRUD operations for a specific model
    """
    
    def __init__(self, model: Type[T], db: Session):
        """
        Initialize repository
        
        Args:
            model (Type[T]): SQLAlchemy model class
            db (Session): Database session
        """
        self.model = model
        self.db = db
    
    def create(self, schema: C) -> T:
        """
        Create a new record
        
        Args:
            schema (C): Create schema
            
        Returns:
            T: Created model instance
            
        Raises:
            Exception: If database operation fails
        """
        try:
            # Convert schema to dict
            data = schema.dict()
            
            # Create model instance
            db_item = self.model(**data)
            
            # Add to session
            self.db.add(db_item)
            self.db.commit()
            self.db.refresh(db_item)
            
            return db_item
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Error creating {self.model.__name__}: {str(e)}")
            raise Exception(f"Failed to create {self.model.__name__}: {str(e)}")
    
    def get_by_id(self, id: int) -> Optional[T]:
        """
        Get record by ID
        
        Args:
            id (int): Record ID
            
        Returns:
            Optional[T]: Model instance if found, None otherwise
        """
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """
        Get all records with pagination
        
        Args:
            skip (int, optional): Number of records to skip. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            
        Returns:
            List[T]: List of model instances
        """
        return self.db.query(self.model).offset(skip).limit(limit).all()
    
    def update(self, id: int, schema: U) -> Optional[T]:
        """
        Update record by ID
        
        Args:
            id (int): Record ID
            schema (U): Update schema
            
        Returns:
            Optional[T]: Updated model instance if found, None otherwise
            
        Raises:
            Exception: If database operation fails
        """
        try:
            # Get existing record
            db_item = self.get_by_id(id)
            
            if not db_item:
                return None
            
            # Convert schema to dict, excluding None values
            update_data = schema.dict(exclude_unset=True)
            
            # Update fields
            for key, value in update_data.items():
                setattr(db_item, key, value)
            
            # Commit changes
            self.db.commit()
            self.db.refresh(db_item)
            
            return db_item
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Error updating {self.model.__name__} with ID {id}: {str(e)}")
            raise Exception(f"Failed to update {self.model.__name__}: {str(e)}")
    
    def delete(self, id: int) -> bool:
        """
        Delete record by ID
        
        Args:
            id (int): Record ID
            
        Returns:
            bool: True if record was deleted, False otherwise
            
        Raises:
            Exception: If database operation fails
        """
        try:
            # Get existing record
            db_item = self.get_by_id(id)
            
            if not db_item:
                return False
            
            # Delete record
            self.db.delete(db_item)
            self.db.commit()
            
            return True
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Error deleting {self.model.__name__} with ID {id}: {str(e)}")
            raise Exception(f"Failed to delete {self.model.__name__}: {str(e)}")
    
    def filter_by(self, **kwargs) -> List[T]:
        """
        Filter records by attributes
        
        Args:
            **kwargs: Filter criteria as keyword arguments
            
        Returns:
            List[T]: List of matching model instances
        """
        query = self.db.query(self.model)
        
        for key, value in kwargs.items():
            if hasattr(self.model, key) and value is not None:
                query = query.filter(getattr(self.model, key) == value)
        
        return query.all()
    
    def count(self) -> int:
        """
        Count total records
        
        Returns:
            int: Total number of records
        """
        return self.db.query(self.model).count()
