# File: backend/services/journal_service.py
# Purpose: Service layer for journal entries

from typing import List, Optional, Dict, Any
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..db.schemas import JournalCreate, JournalUpdate, JournalResponse
from ..models.journal import Journal
from ..mcp.tools.sentiment_analysis import analyze_sentiment

class JournalService:
    """Service for managing journal entries"""
    
    def __init__(self, db: Session):
        """
        Initialize the service with a database session
        
        Args:
            db (Session): SQLAlchemy database session
        """
        self.db = db
    
    def create_journal(self, journal: JournalCreate, user_id: int) -> Journal:
        """
        Create a new journal entry
        
        Args:
            journal (JournalCreate): Journal entry data
            user_id (int): User ID for the journal entry
            
        Returns:
            Journal: Created journal entry
        """
        # Create journal entry dictionary with user ID
        journal_data = journal.dict()
        journal_data["user_id"] = user_id
        
        # Convert list of tags to JSON string if present
        if journal_data.get("tags"):
            journal_data["tags"] = ",".join(journal_data["tags"])
            
        # Convert list of related trade IDs to JSON string if present
        if journal_data.get("related_trade_ids"):
            journal_data["related_trade_ids"] = ",".join(map(str, journal_data["related_trade_ids"]))
        
        # Perform sentiment analysis on content if available
        if journal_data.get("content") and len(journal_data["content"]) > 0:
            try:
                sentiment_score = analyze_sentiment(journal_data["content"])
                journal_data["sentiment_score"] = sentiment_score
            except Exception as e:
                # If sentiment analysis fails, proceed without it
                print(f"Sentiment analysis failed: {str(e)}")
        
        # Create new journal entry
        db_journal = Journal(**journal_data)
        self.db.add(db_journal)
        self.db.commit()
        self.db.refresh(db_journal)
        return db_journal
    
    def get_journal(self, journal_id: int) -> Optional[Journal]:
        """
        Get a journal entry by ID
        
        Args:
            journal_id (int): Journal entry ID
            
        Returns:
            Optional[Journal]: Journal entry if found, None otherwise
        """
        return self.db.query(Journal).filter(Journal.id == journal_id).first()
    
    def get_journal_by_date(self, date_obj: date, user_id: int) -> Optional[Journal]:
        """
        Get a journal entry by date for a specific user
        
        Args:
            date_obj (date): Date to find journal entry for
            user_id (int): User ID
            
        Returns:
            Optional[Journal]: Journal entry if found, None otherwise
        """
        return self.db.query(Journal).filter(
            Journal.date == date_obj,
            Journal.user_id == user_id
        ).first()
    
    def get_journals(
        self, 
        skip: int = 0, 
        limit: int = 100,
        user_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        tag: Optional[str] = None,
        mood_min: Optional[int] = None,
        mood_max: Optional[int] = None
    ) -> List[Journal]:
        """
        Get a list of journal entries with optional filtering
        
        Args:
            skip (int, optional): Number of entries to skip. Defaults to 0.
            limit (int, optional): Maximum number of entries to return. Defaults to 100.
            user_id (Optional[int], optional): User ID to filter by. Defaults to None.
            start_date (Optional[date], optional): Start date for filtering. Defaults to None.
            end_date (Optional[date], optional): End date for filtering. Defaults to None.
            tag (Optional[str], optional): Tag to filter by. Defaults to None.
            mood_min (Optional[int], optional): Minimum mood rating. Defaults to None.
            mood_max (Optional[int], optional): Maximum mood rating. Defaults to None.
            
        Returns:
            List[Journal]: List of journal entries
        """
        query = self.db.query(Journal)
        
        # Apply filters if provided
        if user_id:
            query = query.filter(Journal.user_id == user_id)
            
        if start_date:
            query = query.filter(Journal.date >= start_date)
            
        if end_date:
            query = query.filter(Journal.date <= end_date)
            
        if tag:
            query = query.filter(Journal.tags.like(f"%{tag}%"))
            
        if mood_min is not None:
            query = query.filter(Journal.mood_rating >= mood_min)
            
        if mood_max is not None:
            query = query.filter(Journal.mood_rating <= mood_max)
            
        # Order by date (newest first) and apply pagination
        return query.order_by(desc(Journal.date)).offset(skip).limit(limit).all()
    
    def update_journal(self, journal_id: int, journal_update: JournalUpdate) -> Optional[Journal]:
        """
        Update an existing journal entry
        
        Args:
            journal_id (int): Journal entry ID
            journal_update (JournalUpdate): Updated journal entry data
            
        Returns:
            Optional[Journal]: Updated journal entry if found, None otherwise
        """
        db_journal = self.db.query(Journal).filter(Journal.id == journal_id).first()
        
        if not db_journal:
            return None
            
        # Update fields
        update_data = journal_update.dict(exclude_unset=True)
        
        # Convert list of tags to string if present
        if "tags" in update_data and update_data["tags"] is not None:
            update_data["tags"] = ",".join(update_data["tags"])
            
        # Convert list of related trade IDs to string if present
        if "related_trade_ids" in update_data and update_data["related_trade_ids"] is not None:
            update_data["related_trade_ids"] = ",".join(map(str, update_data["related_trade_ids"]))
        
        # Update sentiment score if content is being updated
        if "content" in update_data and update_data["content"]:
            try:
                sentiment_score = analyze_sentiment(update_data["content"])
                update_data["sentiment_score"] = sentiment_score
            except Exception as e:
                # If sentiment analysis fails, proceed without it
                print(f"Sentiment analysis failed: {str(e)}")
        
        # Apply updates
        for key, value in update_data.items():
            setattr(db_journal, key, value)
            
        db_journal.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_journal)
        return db_journal
    
    def delete_journal(self, journal_id: int) -> bool:
        """
        Delete a journal entry
        
        Args:
            journal_id (int): Journal entry ID
            
        Returns:
            bool: True if deleted, False if not found
        """
        db_journal = self.db.query(Journal).filter(Journal.id == journal_id).first()
        
        if not db_journal:
            return False
            
        self.db.delete(db_journal)
        self.db.commit()
        return True
    
    def get_journals_with_trades(self, user_id: int, start_date: Optional[date] = None, 
                               end_date: Optional[date] = None) -> List[Dict[str, Any]]:
        """
        Get journal entries with associated trade data
        
        Args:
            user_id (int): User ID
            start_date (Optional[date], optional): Start date for filtering. Defaults to None.
            end_date (Optional[date], optional): End date for filtering. Defaults to None.
            
        Returns:
            List[Dict[str, Any]]: List of journal entries with trade data
        """
        # This is a placeholder that would join journal entries with trade data
        # In a real implementation, this would use SQLAlchemy joins
        
        # Get journal entries
        journals = self.get_journals(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Extract trade IDs from all journals
        all_trade_ids = set()
        for journal in journals:
            if journal.related_trade_ids:
                trade_ids = journal.related_trade_ids.split(",")
                all_trade_ids.update([int(tid) for tid in trade_ids if tid.strip().isdigit()])
        
        # If there are no trade IDs, return the journals as is
        if not all_trade_ids:
            return [self._journal_to_dict(journal) for journal in journals]
        
        # Get all relevant trades (this could be optimized with a proper join)
        trades = {}
        if all_trade_ids:
            from ..models.trade import Trade
            db_trades = self.db.query(Trade).filter(Trade.id.in_(all_trade_ids)).all()
            trades = {trade.id: trade for trade in db_trades}
        
        # Combine journal entries with trade data
        result = []
        for journal in journals:
            journal_dict = self._journal_to_dict(journal)
            
            # Add trade data if available
            if journal.related_trade_ids:
                trade_ids = [int(tid) for tid in journal.related_trade_ids.split(",") if tid.strip().isdigit()]
                journal_dict["trades"] = [
                    {
                        "id": trade.id,
                        "symbol": trade.symbol,
                        "setup_type": trade.setup_type,
                        "entry_time": trade.entry_time,
                        "exit_time": trade.exit_time,
                        "outcome": trade.outcome,
                        "profit_loss": trade.profit_loss
                    }
                    for tid in trade_ids
                    if tid in trades
                ]
            else:
                journal_dict["trades"] = []
                
            result.append(journal_dict)
            
        return result
    
    def _journal_to_dict(self, journal: Journal) -> Dict[str, Any]:
        """
        Convert a Journal model to a dictionary
        
        Args:
            journal (Journal): Journal entry
            
        Returns:
            Dict[str, Any]: Journal entry as dictionary
        """
        journal_dict = {
            "id": journal.id,
            "user_id": journal.user_id,
            "date": journal.date,
            "content": journal.content,
            "mood_rating": journal.mood_rating,
            "sentiment_score": journal.sentiment_score,
            "created_at": journal.created_at,
            "updated_at": journal.updated_at
        }
        
        # Convert tags string to list
        if journal.tags:
            journal_dict["tags"] = journal.tags.split(",")
        else:
            journal_dict["tags"] = []
            
        # Convert related trade IDs string to list
        if journal.related_trade_ids:
            journal_dict["related_trade_ids"] = [
                int(tid) for tid in journal.related_trade_ids.split(",")
                if tid.strip().isdigit()
            ]
        else:
            journal_dict["related_trade_ids"] = []
            
        return journal_dict
