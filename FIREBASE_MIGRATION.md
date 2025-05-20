# Firebase Migration Guide

This document outlines the steps required to migrate the Trading Journal App from a local SQLite/PostgreSQL database to Firebase Firestore.

## Table of Contents

1. [Overview](#overview)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Data Migration](#data-migration)
6. [Testing and Verification](#testing-and-verification)
7. [Troubleshooting](#troubleshooting)

## Overview

### Benefits of Migration
- Cloud-based storage accessible from anywhere
- Real-time data synchronization
- Automatic backups and data redundancy
- Scalable infrastructure
- Simplified deployment

### Migration Strategy
This migration will follow a phased approach:
1. Set up Firebase project and configurations
2. Implement Firebase repositories alongside existing repositories
3. Add a feature flag to switch between database types
4. Migrate existing data (if any)
5. Transition fully to Firebase

## Firebase Project Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Trading Journal App")
4. Configure Google Analytics (optional)
5. Click "Create project"

### 2. Set Up Firestore Database
1. In Firebase Console, select your project
2. Navigate to "Firestore Database" from the left sidebar
3. Click "Create database"
4. Choose start mode:
   - "Start in test mode" for development (allows read/write access)
   - "Start in production mode" for stricter security
5. Select a location closest to your users
6. Click "Enable"

### 3. Generate Service Account
1. In Firebase Console, go to Project Settings (gear icon)
2. Navigate to "Service accounts" tab
3. Click "Generate new private key" under Firebase Admin SDK
4. Save the JSON file as `firebase-credentials.json`

### 4. Configure Web App
1. In Project Settings, click "Add app" and select web (</> icon)
2. Register app with a nickname (e.g., "Trading Journal Web")
3. Copy the `firebaseConfig` object for your frontend

## Backend Implementation

### 1. Add Firebase Dependencies
Add to `requirements.txt`:
```
firebase-admin==6.2.0
google-cloud-firestore==2.11.1
```

### 2. Create Firebase Configuration

Create file: `/backend/config/firebase_config.py`
```python
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    # Check if already initialized
    if firebase_admin._apps:
        return firebase_admin.get_app()
        
    # Environment-based configuration
    if os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'):
        # Use service account from environment variable
        cred = credentials.ApplicationDefault()
    elif os.path.exists('firebase-credentials.json'):
        # Use service account from file
        cred = credentials.Certificate('firebase-credentials.json')
    else:
        # Create service account from environment variables
        service_account_info = {
            "type": "service_account",
            "project_id": os.environ.get('FIREBASE_PROJECT_ID'),
            "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
            "private_key": os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
            "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL'),
            "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": os.environ.get('FIREBASE_CLIENT_CERT_URL')
        }
        cred = credentials.Certificate(service_account_info)
    
    # Initialize app
    app = firebase_admin.initialize_app(cred)
    return app

def get_firestore_client():
    """Get Firestore client"""
    # Ensure Firebase is initialized
    initialize_firebase()
    # Return Firestore client
    return firestore.client()
```

### 3. Create Firestore Repository Base Class

Create file: `/backend/db/firestore/base_repository.py`
```python
from typing import Generic, TypeVar, List, Optional, Any, Dict, Type
from pydantic import BaseModel

from firebase_admin import firestore
from ...config.firebase_config import get_firestore_client

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class FirestoreRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Base Firestore repository for database operations"""
    
    def __init__(self, collection_name: str, model_class: Type[ModelType]):
        """Initialize repository
        
        Args:
            collection_name (str): Firestore collection name
            model_class (Type[ModelType]): Model class
        """
        self.db = get_firestore_client()
        self.collection = self.db.collection(collection_name)
        self.model_class = model_class
    
    def get_by_id(self, id: str) -> Optional[ModelType]:
        """Get document by ID"""
        doc = self.collection.document(id).get()
        if not doc.exists:
            return None
            
        data = doc.to_dict()
        # Add ID to data
        data['id'] = doc.id
        return self.model_class(**data)
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all documents with pagination"""
        query = self.collection.limit(limit)
        if skip > 0:
            # Get all documents up to skip + limit and slice
            query = self.collection.limit(skip + limit)
            
        docs = list(query.stream())
        # Skip documents if needed
        if skip > 0:
            docs = docs[skip:]
            
        result = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            result.append(self.model_class(**data))
            
        return result
    
    def create(self, obj_in: CreateSchemaType) -> ModelType:
        """Create a new document"""
        # Convert Pydantic model to dict
        obj_data = obj_in.model_dump(exclude_unset=True)
        
        # Create document
        doc_ref = self.collection.document()
        doc_ref.set(obj_data)
        
        # Get created document
        doc = doc_ref.get()
        data = doc.to_dict()
        data['id'] = doc.id
        
        return self.model_class(**data)
    
    def update(self, id: str, obj_in: UpdateSchemaType) -> Optional[ModelType]:
        """Update document"""
        # Check if document exists
        doc_ref = self.collection.document(id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
            
        # Convert Pydantic model to dict, excluding None values
        update_data = {
            k: v for k, v in obj_in.model_dump(exclude_unset=True).items()
            if v is not None
        }
        
        # Update document
        doc_ref.update(update_data)
        
        # Get updated document
        updated_doc = doc_ref.get()
        data = updated_doc.to_dict()
        data['id'] = updated_doc.id
        
        return self.model_class(**data)
    
    def delete(self, id: str) -> bool:
        """Delete document"""
        # Check if document exists
        doc_ref = self.collection.document(id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
            
        # Delete document
        doc_ref.delete()
        
        return True
    
    def count(self) -> int:
        """Count all documents"""
        return len(list(self.collection.stream()))
        
    def query(self, filters: Dict[str, Any]) -> List[ModelType]:
        """Query documents with filters"""
        query = self.collection
        
        # Apply filters
        for field, value in filters.items():
            query = query.where(field, "==", value)
            
        # Get results
        docs = list(query.stream())
        
        result = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            result.append(self.model_class(**data))
            
        return result
```

### 4. Implement Specific Model Repositories

Create `/backend/db/firestore/__init__.py` first:
```python
# Firestore repositories
```

#### Trade Repository

Create file: `/backend/db/firestore/trade_repository.py`
```python
from typing import List, Optional, Dict, Any
from datetime import datetime, date

from .base_repository import FirestoreRepository
from ...models.trade import Trade, TradeCreate, TradeUpdate

class FirestoreTradeRepository(FirestoreRepository[Trade, TradeCreate, TradeUpdate]):
    """Firestore repository for Trade model"""
    
    def __init__(self):
        super().__init__("trades", Trade)
    
    def get_by_user_id(self, user_id: str, skip: int = 0, limit: int = 100) -> List[Trade]:
        """Get trades by user ID"""
        return self.query({"user_id": user_id})
    
    def get_by_symbol(self, symbol: str, skip: int = 0, limit: int = 100) -> List[Trade]:
        """Get trades by symbol"""
        return self.query({"symbol": symbol})
    
    def get_by_date_range(self, user_id: str, start_date: Optional[datetime] = None, 
                           end_date: Optional[datetime] = None) -> List[Trade]:
        """Get trades by date range"""
        query = self.collection.where("user_id", "==", user_id)
        
        if start_date:
            query = query.where("entry_time", ">=", start_date)
        
        if end_date:
            query = query.where("entry_time", "<=", end_date)
            
        docs = list(query.stream())
        
        result = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            result.append(self.model_class(**data))
            
        return result
```

#### Similarly implement repositories for other models (example for Daily Plan)

Create file: `/backend/db/firestore/daily_plan_repository.py`
```python
from typing import List, Optional
from datetime import date

from .base_repository import FirestoreRepository
from ...models.daily_plan import DailyPlan, DailyPlanCreate, DailyPlanUpdate

class FirestoreDailyPlanRepository(FirestoreRepository[DailyPlan, DailyPlanCreate, DailyPlanUpdate]):
    """Firestore repository for DailyPlan model"""
    
    def __init__(self):
        super().__init__("daily_plans", DailyPlan)
    
    def get_by_user_id(self, user_id: str, skip: int = 0, limit: int = 100) -> List[DailyPlan]:
        """Get plans by user ID"""
        return self.query({"user_id": user_id})
    
    def get_by_date(self, user_id: str, date_value: date) -> Optional[DailyPlan]:
        """Get plan by date"""
        query = self.collection.where("user_id", "==", user_id).where("date", "==", date_value)
        docs = list(query.stream())
        
        if not docs:
            return None
            
        doc = docs[0]
        data = doc.to_dict()
        data['id'] = doc.id
        
        return self.model_class(**data)
```

### 5. Update API Dependencies

Modify file: `/backend/api/dependencies.py`
```python
from fastapi import Depends
from typing import Union

from ..db.database import get_db
from ..db.repository import TradeRepository, DailyPlanRepository
from ..db.firestore.trade_repository import FirestoreTradeRepository
from ..db.firestore.daily_plan_repository import FirestoreDailyPlanRepository
from ..models.trade import Trade
from ..models.daily_plan import DailyPlan

from sqlalchemy.orm import Session

# Environment variable to control database type
import os
USE_FIRESTORE = os.getenv("USE_FIRESTORE", "false").lower() == "true"

def get_trade_repository(db: Session = Depends(get_db)) -> Union[TradeRepository, FirestoreTradeRepository]:
    """Get trade repository based on configuration"""
    if USE_FIRESTORE:
        return FirestoreTradeRepository()
    else:
        return TradeRepository(Trade, db)

def get_daily_plan_repository(db: Session = Depends(get_db)) -> Union[DailyPlanRepository, FirestoreDailyPlanRepository]:
    """Get daily plan repository based on configuration"""
    if USE_FIRESTORE:
        return FirestoreDailyPlanRepository()
    else:
        return DailyPlanRepository(DailyPlan, db)

# Similarly add other repository dependencies
```

### 6. Update API Routes

Modify file: `/backend/api/routes/trades.py` (example)
```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional

from ...models.trade import TradeCreate, TradeUpdate, TradeResponse
from ..dependencies import get_trade_repository

router = APIRouter()

@router.get("/", response_model=List[TradeResponse])
async def get_trades(
    repository = Depends(get_trade_repository),
    skip: int = 0, 
    limit: int = 100
):
    """Get all trades"""
    trades = repository.get_all(skip=skip, limit=limit)
    return trades

@router.post("/", response_model=TradeResponse)
async def create_trade(
    trade: TradeCreate,
    repository = Depends(get_trade_repository)
):
    """Create a new trade"""
    return repository.create(trade)

@router.get("/{trade_id}", response_model=TradeResponse)
async def get_trade(
    trade_id: str,
    repository = Depends(get_trade_repository)
):
    """Get trade by ID"""
    trade = repository.get_by_id(trade_id)
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@router.put("/{trade_id}", response_model=TradeResponse)
async def update_trade(
    trade_id: str,
    trade: TradeUpdate,
    repository = Depends(get_trade_repository)
):
    """Update trade"""
    updated_trade = repository.update(trade_id, trade)
    if updated_trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    return updated_trade

@router.delete("/{trade_id}")
async def delete_trade(
    trade_id: str,
    repository = Depends(get_trade_repository)
):
    """Delete trade"""
    deleted = repository.delete(trade_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Trade not found")
    return {"detail": "Trade deleted successfully"}
```

### 7. Update Main Application

Modify file: `/backend/api/main.py`
```python
# Add to imports
from ..config.firebase_config import initialize_firebase

# Add to startup event
@app.on_event("startup")
async def startup_event():
    # Initialize database
    initialize_db()
    
    # Initialize Firebase if enabled
    if os.getenv("USE_FIRESTORE", "false").lower() == "true":
        initialize_firebase()
    
    # Initialize MCP integration
    mcp = initialize_mcp(app)
    
    # Start MCP servers
    mcp.start_servers()
```

### 8. Update Environment Settings

Create or update `.env` file:
```
# Database settings
USE_FIRESTORE=true

# Firebase settings
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=your-client-cert-url

# Or use credentials file
# GOOGLE_APPLICATION_CREDENTIALS=path/to/firebase-credentials.json
```

## Frontend Implementation

### 1. Install Firebase SDK

```bash
cd frontend-new
npm install firebase
```

### 2. Create Firebase Configuration

Create file: `/frontend-new/src/config/firebase.js`
```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
```

### 3. Update Frontend Environment

Create or update `.env` file in frontend-new directory:
```
VITE_API_URL=http://localhost:8000
VITE_USE_FIREBASE_DIRECTLY=false
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Create Direct Firebase Service (Optional)

This is a more advanced step if you want to optionally bypass the backend and connect directly to Firebase from the frontend for certain operations.

Create file: `/frontend-new/src/services/firebase/tradeService.js`
```javascript
import { db } from '../../config/firebase';
import { 
  collection, doc, addDoc, getDoc, getDocs, 
  updateDoc, deleteDoc, query, where, orderBy, limit 
} from 'firebase/firestore';

// Collection reference
const tradesCollection = collection(db, 'trades');

// Get all trades with optional filters
export const getTrades = async (filters = {}) => {
  try {
    let q = tradesCollection;
    
    // Apply filters
    if (filters.userId) {
      q = query(q, where('user_id', '==', filters.userId));
    }
    
    if (filters.symbol) {
      q = query(q, where('symbol', '==', filters.symbol));
    }
    
    // Apply sorting and limit
    q = query(q, orderBy('entry_time', 'desc'));
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    // Get documents
    const querySnapshot = await getDocs(q);
    
    // Map documents to trade objects
    const trades = [];
    querySnapshot.forEach((doc) => {
      trades.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return trades;
  } catch (error) {
    console.error('Error getting trades:', error);
    throw error;
  }
};

// Get trade by ID
export const getTradeById = async (id) => {
  try {
    const docRef = doc(db, 'trades', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Trade not found');
    }
  } catch (error) {
    console.error('Error getting trade:', error);
    throw error;
  }
};

// Create a new trade
export const createTrade = async (tradeData) => {
  try {
    const docRef = await addDoc(tradesCollection, {
      ...tradeData,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Get the created document
    const docSnap = await getDoc(docRef);
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error creating trade:', error);
    throw error;
  }
};

// Update a trade
export const updateTrade = async (id, tradeData) => {
  try {
    const docRef = doc(db, 'trades', id);
    
    // Update document
    await updateDoc(docRef, {
      ...tradeData,
      updated_at: new Date()
    });
    
    // Get updated document
    const docSnap = await getDoc(docRef);
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error updating trade:', error);
    throw error;
  }
};

// Delete a trade
export const deleteTrade = async (id) => {
  try {
    const docRef = doc(db, 'trades', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting trade:', error);
    throw error;
  }
};
```

### 5. Update Service Factory (Optional)

Create file: `/frontend-new/src/services/serviceFactory.js`
```javascript
import * as apiTradeService from './tradeService';
import * as firebaseTradeService from './firebase/tradeService';

// Use environment variable to determine which implementation to use
const useFirebaseDirect = import.meta.env.VITE_USE_FIREBASE_DIRECTLY === 'true';

// Export the appropriate service based on configuration
export const tradeService = useFirebaseDirect ? firebaseTradeService : apiTradeService;

// Add other services here following the same pattern
```

### 6. Update Service Imports

Update service imports in components:
```javascript
// Before
import { createTrade, updateTrade } from '../services/tradeService';

// After
import { tradeService } from '../services/serviceFactory';
// Then use tradeService.createTrade, tradeService.updateTrade, etc.
```

## Data Migration

### 1. Create Migration Script

Create file: `/scripts/migrate_to_firebase.py`
```python
"""
Script to migrate data from SQLite/PostgreSQL to Firebase Firestore.
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Import database modules
from backend.db.database import SessionLocal, get_engine
from backend.config.firebase_config import get_firestore_client
from sqlalchemy import text

# Set up logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_all_data_from_table(table_name):
    """Get all data from a table"""
    engine = get_engine()
    with engine.connect() as connection:
        result = connection.execute(text(f"SELECT * FROM {table_name}"))
        columns = result.keys()
        return [dict(zip(columns, row)) for row in result]

def migrate_table(table_name, collection_name, transform_func=None):
    """Migrate a table to Firestore"""
    logger.info(f"Migrating {table_name} to {collection_name}...")
    
    # Get data from table
    rows = get_all_data_from_table(table_name)
    logger.info(f"Found {len(rows)} rows in {table_name}")
    
    # Get Firestore client
    db = get_firestore_client()
    collection = db.collection(collection_name)
    
    # Migrate each row
    for row in rows:
        # Transform data if needed
        if transform_func:
            row = transform_func(row)
            
        # Convert dates to timestamps
        for key, value in row.items():
            if isinstance(value, datetime):
                row[key] = value
        
        # Add to Firestore
        try:
            doc_ref = collection.document(str(row.get('id')))
            doc_ref.set(row)
            logger.info(f"Migrated {table_name} ID {row.get('id')}")
        except Exception as e:
            logger.error(f"Error migrating {table_name} ID {row.get('id')}: {e}")
    
    logger.info(f"Completed migration of {table_name}")

def transform_trade(row):
    """Transform a trade row from SQLite to Firestore format"""
    # Example transformation (adjust as needed)
    if 'screenshots' in row and row['screenshots']:
        # Ensure screenshots is properly formatted as list
        if isinstance(row['screenshots'], str):
            try:
                row['screenshots'] = json.loads(row['screenshots'])
            except json.JSONDecodeError:
                row['screenshots'] = []
    else:
        row['screenshots'] = []
        
    if 'tags' in row and row['tags']:
        # Ensure tags is properly formatted as list
        if isinstance(row['tags'], str):
            try:
                row['tags'] = json.loads(row['tags'])
            except json.JSONDecodeError:
                row['tags'] = []
    else:
        row['tags'] = []
    
    return row

def main():
    """Main migration function"""
    logger.info("Starting migration to Firebase Firestore...")
    
    # Migrate users table
    migrate_table("users", "users")
    
    # Migrate trades table with transformation
    migrate_table("trades", "trades", transform_trade)
    
    # Migrate daily_plans table
    migrate_table("daily_plans", "daily_plans")
    
    # Migrate journals table
    migrate_table("journals", "journals")
    
    # Migrate other tables as needed
    
    logger.info("Migration completed successfully!")

if __name__ == "__main__":
    main()
```

### 2. Run Migration Script

```bash
# Make sure Firebase is configured
export USE_FIRESTORE=true

# Run migration script
python scripts/migrate_to_firebase.py
```

## Testing and Verification

### 1. Test Backend API with Firebase

Create file: `/scripts/test_firebase_backend.py`
```python
"""
Script to test the backend API with Firebase.
"""
import requests
import json

# API base URL
BASE_URL = "http://localhost:8000/api"

def test_create_trade():
    """Test creating a trade"""
    trade_data = {
        "user_id": "1",
        "symbol": "NQ",
        "setup_type": "ICT_BPR",
        "entry_price": 18000.0,
        "exit_price": 18050.0,
        "position_size": 1.0,
        "entry_time": "2023-05-15T10:30:00Z",
        "exit_time": "2023-05-15T11:15:00Z",
        "planned_risk_reward": 3.0,
        "actual_risk_reward": 2.5,
        "outcome": "Win",
        "profit_loss": 50.0,
        "emotional_state": "Calm",
        "plan_adherence": "Followed",
        "notes": "Test trade",
        "tags": ["test", "firebase"]
    }
    
    response = requests.post(f"{BASE_URL}/trades", json=trade_data)
    print(f"Create trade response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    return response.json()

def test_get_trades():
    """Test getting trades"""
    response = requests.get(f"{BASE_URL}/trades")
    print(f"Get trades response: {response.status_code}")
    print(f"Number of trades: {len(response.json())}")
    
    return response.json()

def test_update_trade(trade_id):
    """Test updating a trade"""
    update_data = {
        "notes": "Updated test trade",
        "tags": ["test", "firebase", "updated"]
    }
    
    response = requests.put(f"{BASE_URL}/trades/{trade_id}", json=update_data)
    print(f"Update trade response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    return response.json()

def test_delete_trade(trade_id):
    """Test deleting a trade"""
    response = requests.delete(f"{BASE_URL}/trades/{trade_id}")
    print(f"Delete trade response: {response.status_code}")
    print(response.json())
    
    return response.json()

def main():
    """Run all tests"""
    print("Testing Firebase backend...")
    
    # Create a trade
    created_trade = test_create_trade()
    trade_id = created_trade["id"]
    
    # Get all trades
    test_get_trades()
    
    # Update the trade
    test_update_trade(trade_id)
    
    # Delete the trade
    test_delete_trade(trade_id)
    
    print("Tests completed!")

if __name__ == "__main__":
    main()
```

### 2. Test Direct Firebase Connection

Create file: `/frontend-new/src/tests/testFirebase.js`
```javascript
import { db } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Function to test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    // Test collection
    const testCollection = collection(db, 'test');
    
    // Add a document
    const docRef = await addDoc(testCollection, {
      name: 'Test Document',
      timestamp: new Date(),
      value: Math.random()
    });
    
    console.log('Document added with ID:', docRef.id);
    
    // Read documents
    const querySnapshot = await getDocs(testCollection);
    console.log('Documents in test collection:');
    querySnapshot.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
    });
    
    return {
      success: true,
      message: 'Firebase connection successful'
    };
  } catch (error) {
    console.error('Error testing Firebase:', error);
    return {
      success: false,
      message: `Firebase connection error: ${error.message}`
    };
  }
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Firebase Credentials Not Working

**Symptoms**: "Failed to initialize Firebase: Invalid credential"

**Solutions**:
- Verify the `firebase-credentials.json` file is in the correct location
- Check environment variables are correctly set
- Ensure the service account has the necessary permissions

#### 2. Data Not Appearing in Firestore

**Symptoms**: API calls succeed but data is not visible in Firebase Console

**Solutions**:
- Check security rules in Firebase Console
- Verify the collection names match between code and database
- Ensure data validation is not rejecting the documents

#### 3. Type Conversion Issues

**Symptoms**: "Error: Cannot convert object to primitive value"

**Solutions**:
- Ensure dates are properly converted to Firebase timestamps
- Check JSON serialization of complex objects
- Verify enum values match between backend and Firestore

#### 4. CORS Issues with Direct Firebase Access

**Symptoms**: "Access to fetch at 'https://firestore.googleapis.com/...' has been blocked by CORS policy"

**Solutions**:
- Configure CORS in Firebase Console
- Ensure Firebase hosting settings are correct
- Use the backend API as a proxy instead of direct access

#### 5. Authentication Issues

**Symptoms**: "Firebase: Error (auth/...)"

**Solutions**:
- Verify authentication configuration
- Check token expiration and refresh mechanisms
- Ensure users have correct permissions

## Conclusion

Migrating from a local database to Firebase Firestore provides significant benefits for your Trading Journal App, including cloud storage, real-time synchronization, and simplified deployment. By following this guide, you can transition your application smoothly while maintaining functionality throughout the process.

The phased approach allows you to:
1. Test Firebase integration without disrupting existing functionality
2. Gradually migrate features to Firestore
3. Transition completely once everything is verified

Remember to back up your data before migration and thoroughly test each component after transitioning to Firestore.
