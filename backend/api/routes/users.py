# File: backend/api/routes/users.py
# Purpose: API endpoints for user management

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import database session
from ...db.database import get_db

# Import services
from ...services.user_service import UserService

# Import schemas (will implement later)
from ...db.schemas import UserCreate, UserResponse, UserUpdate

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user
    """
    user_service = UserService(db)
    try:
        return user_service.create_user(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all users
    """
    user_service = UserService(db)
    return user_service.get_users(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get user by ID
    """
    user_service = UserService(db)
    user = user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """
    Update user
    """
    user_service = UserService(db)
    user = user_service.update_user(user_id, user_update)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Delete user
    """
    user_service = UserService(db)
    if not user_service.delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return None

# TODO: Add user authentication endpoints
# TODO: Add user preferences endpoints
# TODO: Add user statistics endpoints