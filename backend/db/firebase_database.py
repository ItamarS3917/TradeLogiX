# File: backend/db/firebase_database.py
# Purpose: Firebase/Firestore database configuration and connection management

import os
import logging
from typing import Optional, Dict, Any, List
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FirebaseDatabase:
    """
    Firebase/Firestore database manager for the Trading Journal application
    """
    
    def __init__(self):
        self.db: Optional[Client] = None
        self.app = None
        self._initialize()
    
    def _initialize(self) -> None:
        """
        Initialize Firebase Admin SDK and Firestore client
        """
        try:
            # Check if Firebase app is already initialized
            if not firebase_admin._apps:
                # Get Firebase credentials
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
                
                if os.path.exists(cred_path):
                    # Use service account credentials
                    cred = credentials.Certificate(cred_path)
                    self.app = firebase_admin.initialize_app(cred)
                    logger.info(f"Initialized Firebase with service account: {cred_path}")
                else:
                    # Use default credentials (for cloud environments)
                    self.app = firebase_admin.initialize_app()
                    logger.info("Initialized Firebase with default credentials")
            else:
                self.app = firebase_admin.get_app()
                logger.info("Using existing Firebase app")
            
            # Initialize Firestore client
            self.db = firestore.client()
            logger.info("Firebase/Firestore initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            raise

    def get_client(self) -> Client:
        """
        Get Firestore client
        
        Returns:
            Firestore client instance
        """
        if not self.db:
            raise Exception("Firebase not initialized")
        return self.db

    def get_collection(self, collection_name: str):
        """
        Get a Firestore collection reference
        
        Args:
            collection_name: Name of the collection
            
        Returns:
            Collection reference
        """
        return self.db.collection(collection_name)

    def add_document(self, collection_name: str, data: Dict[str, Any], document_id: Optional[str] = None) -> str:
        """
        Add a document to a collection
        
        Args:
            collection_name: Name of the collection
            data: Document data
            document_id: Optional document ID
            
        Returns:
            Document ID
        """
        try:
            # Add timestamp fields
            now = datetime.utcnow()
            data['created_at'] = now
            data['updated_at'] = now
            
            collection_ref = self.get_collection(collection_name)
            
            if document_id:
                doc_ref = collection_ref.document(document_id)
                doc_ref.set(data)
                return document_id
            else:
                doc_ref = collection_ref.add(data)
                return doc_ref[1].id
                
        except Exception as e:
            logger.error(f"Failed to add document to {collection_name}: {str(e)}")
            raise

    def get_document(self, collection_name: str, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a document by ID
        
        Args:
            collection_name: Name of the collection
            document_id: Document ID
            
        Returns:
            Document data or None if not found
        """
        try:
            doc_ref = self.get_collection(collection_name).document(document_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            else:
                return None
                
        except Exception as e:
            logger.error(f"Failed to get document {document_id} from {collection_name}: {str(e)}")
            raise

    def update_document(self, collection_name: str, document_id: str, data: Dict[str, Any]) -> bool:
        """
        Update a document
        
        Args:
            collection_name: Name of the collection
            document_id: Document ID
            data: Updated data
            
        Returns:
            True if successful
        """
        try:
            # Add update timestamp
            data['updated_at'] = datetime.utcnow()
            
            doc_ref = self.get_collection(collection_name).document(document_id)
            doc_ref.update(data)
            return True
            
        except Exception as e:
            logger.error(f"Failed to update document {document_id} in {collection_name}: {str(e)}")
            raise

    def delete_document(self, collection_name: str, document_id: str) -> bool:
        """
        Delete a document
        
        Args:
            collection_name: Name of the collection
            document_id: Document ID
            
        Returns:
            True if successful
        """
        try:
            doc_ref = self.get_collection(collection_name).document(document_id)
            doc_ref.delete()
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document {document_id} from {collection_name}: {str(e)}")
            raise

    def query_documents(self, collection_name: str, filters: Optional[List] = None, 
                       order_by: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Query documents with filters
        
        Args:
            collection_name: Name of the collection
            filters: List of filters [field, operator, value]
            order_by: Field to order by
            limit: Maximum number of documents
            
        Returns:
            List of documents
        """
        try:
            collection_ref = self.get_collection(collection_name)
            query = collection_ref
            
            # Apply filters
            if filters:
                for filter_item in filters:
                    if len(filter_item) == 3:
                        field, operator, value = filter_item
                        query = query.where(field, operator, value)
            
            # Apply ordering
            if order_by:
                query = query.order_by(order_by)
            
            # Apply limit
            if limit:
                query = query.limit(limit)
            
            # Execute query
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to query {collection_name}: {str(e)}")
            raise

    def get_user_documents(self, collection_name: str, user_id: str, 
                          order_by: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get all documents for a specific user
        
        Args:
            collection_name: Name of the collection
            user_id: User ID
            order_by: Field to order by
            limit: Maximum number of documents
            
        Returns:
            List of user's documents
        """
        filters = [['user_id', '==', user_id]]
        return self.query_documents(collection_name, filters, order_by, limit)

    def batch_write(self, operations: List[Dict[str, Any]]) -> bool:
        """
        Perform batch write operations
        
        Args:
            operations: List of operations with 'type', 'collection', 'document_id', and 'data'
            
        Returns:
            True if successful
        """
        try:
            batch = self.db.batch()
            
            for op in operations:
                collection_name = op['collection']
                document_id = op['document_id']
                data = op['data']
                op_type = op['type']
                
                doc_ref = self.get_collection(collection_name).document(document_id)
                
                if op_type == 'set':
                    batch.set(doc_ref, data)
                elif op_type == 'update':
                    data['updated_at'] = datetime.utcnow()
                    batch.update(doc_ref, data)
                elif op_type == 'delete':
                    batch.delete(doc_ref)
            
            batch.commit()
            return True
            
        except Exception as e:
            logger.error(f"Failed to perform batch write: {str(e)}")
            raise

    def get_statistics(self, user_id: str) -> Dict[str, Any]:
        """
        Get trading statistics for a user
        
        Args:
            user_id: User ID
            
        Returns:
            Statistics dictionary
        """
        try:
            # Get all trades for the user
            trades = self.get_user_documents('trades', user_id)
            
            if not trades:
                return {
                    'total_trades': 0,
                    'win_rate': 0,
                    'total_pnl': 0,
                    'average_win': 0,
                    'average_loss': 0
                }
            
            # Calculate statistics
            total_trades = len(trades)
            wins = [t for t in trades if t.get('outcome') == 'Win']
            losses = [t for t in trades if t.get('outcome') == 'Loss']
            
            win_rate = (len(wins) / total_trades) * 100 if total_trades > 0 else 0
            
            total_pnl = sum(t.get('profit_loss', 0) for t in trades)
            average_win = sum(t.get('profit_loss', 0) for t in wins) / len(wins) if wins else 0
            average_loss = sum(t.get('profit_loss', 0) for t in losses) / len(losses) if losses else 0
            
            return {
                'total_trades': total_trades,
                'win_rate': round(win_rate, 2),
                'total_pnl': round(total_pnl, 2),
                'average_win': round(average_win, 2),
                'average_loss': round(average_loss, 2),
                'wins': len(wins),
                'losses': len(losses)
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate statistics for user {user_id}: {str(e)}")
            raise

# Global Firebase database instance
firebase_db = FirebaseDatabase()

def get_firebase_db() -> FirebaseDatabase:
    """
    Get Firebase database instance
    
    Returns:
        Firebase database instance
    """
    return firebase_db

def initialize_firebase_db() -> None:
    """
    Initialize Firebase database
    """
    global firebase_db
    if not firebase_db.db:
        firebase_db._initialize()
    logger.info("Firebase database initialized and ready")
