# File: backend/api/routes/journals.py
# Purpose: API endpoints for journal entries

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import date

# Import models and schemas
from ...db.schemas import JournalCreate, JournalUpdate, JournalResponse
from ...db.database import get_db
from sqlalchemy.orm import Session

# Import services
from ...services.journal_service import JournalService

# Create the router
router = APIRouter()

@router.get("/", response_model=List[JournalResponse])
async def get_journals(
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    tag: Optional[str] = None,
    mood_min: Optional[int] = None,
    mood_max: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get all journal entries with optional filtering and pagination
    """
    journal_service = JournalService(db)
    journals = journal_service.get_journals(
        skip=skip,
        limit=limit,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        tag=tag,
        mood_min=mood_min,
        mood_max=mood_max
    )
    return journals

@router.get("/{journal_id}", response_model=JournalResponse)
async def get_journal(
    journal_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get a specific journal entry by ID
    """
    journal_service = JournalService(db)
    journal = journal_service.get_journal(journal_id)
    
    if journal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal with ID {journal_id} not found"
        )
    
    return journal

@router.get("/by-date/{date_str}", response_model=JournalResponse)
async def get_journal_by_date(
    date_str: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a journal entry by date for a specific user
    """
    try:
        journal_date = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD."
        )
    
    journal_service = JournalService(db)
    journal = journal_service.get_journal_by_date(journal_date, user_id)
    
    if journal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal for date {date_str} not found"
        )
    
    return journal

@router.post("/", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
async def create_journal(
    journal: JournalCreate, 
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Create a new journal entry
    """
    journal_service = JournalService(db)
    
    # Check if a journal already exists for this date and user
    if journal.date:
        existing_journal = journal_service.get_journal_by_date(journal.date, user_id)
        if existing_journal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Journal entry already exists for date {journal.date}"
            )
    
    # Create the journal entry
    try:
        return journal_service.create_journal(journal, user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/{journal_id}", response_model=JournalResponse)
async def update_journal(
    journal_id: int, 
    journal: JournalUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an existing journal entry
    """
    journal_service = JournalService(db)
    
    # Check if the journal exists
    existing_journal = journal_service.get_journal(journal_id)
    if existing_journal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal with ID {journal_id} not found"
        )
    
    # Update the journal
    try:
        updated_journal = journal_service.update_journal(journal_id, journal)
        return updated_journal
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal(
    journal_id: int, 
    db: Session = Depends(get_db)
):
    """
    Delete a journal entry
    """
    journal_service = JournalService(db)
    
    # Check if the journal exists
    existing_journal = journal_service.get_journal(journal_id)
    if existing_journal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal with ID {journal_id} not found"
        )
    
    # Delete the journal
    success = journal_service.delete_journal(journal_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete journal entry"
        )
    
    return None

@router.get("/user/{user_id}/with-trades", response_model=List[dict])
async def get_journals_with_trades(
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Get journal entries with associated trade data for a user
    """
    journal_service = JournalService(db)
    journals_with_trades = journal_service.get_journals_with_trades(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date
    )
    
    return journals_with_trades
