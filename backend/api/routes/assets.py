# File: backend/api/routes/assets.py
# Purpose: API endpoints for managing assets

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from ...db.database import get_db
from ...models.asset import Asset, AssetType
from ..schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.post("", response_model=AssetResponse)
async def create_asset(asset: AssetCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """Create a new trading asset"""
    # Check if asset with this symbol already exists
    result = await db.execute(select(Asset).where(Asset.symbol == asset.symbol))
    existing_asset = result.scalars().first()
    
    if existing_asset:
        raise HTTPException(status_code=400, detail=f"Asset with symbol {asset.symbol} already exists")
    
    # Create new asset
    db_asset = Asset(
        symbol=asset.symbol,
        name=asset.name,
        description=asset.description,
        asset_type=asset.asset_type,
        exchange=asset.exchange,
        is_active=asset.is_active,
        tick_size=asset.tick_size,
        value_per_tick=asset.value_per_tick,
        contract_size=asset.contract_size,
        currency=asset.currency,
        trading_hours=asset.trading_hours,
        session_times=asset.session_times,
        default_risk_per_trade=asset.default_risk_per_trade,
        max_position_size=asset.max_position_size,
        custom_fields=asset.custom_fields,
        tags=asset.tags,
        user_id=current_user.id
    )
    
    db.add(db_asset)
    await db.commit()
    await db.refresh(db_asset)
    
    return db_asset

@router.get("", response_model=List[AssetResponse])
async def get_assets(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    asset_type: Optional[AssetType] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Get a list of trading assets"""
    query = select(Asset).where(or_(Asset.user_id == current_user.id, Asset.user_id == None))
    
    # Apply filters
    if search:
        query = query.where(
            or_(
                Asset.symbol.ilike(f"%{search}%"),
                Asset.name.ilike(f"%{search}%"),
                Asset.description.ilike(f"%{search}%")
            )
        )
    
    if asset_type:
        query = query.where(Asset.asset_type == asset_type)
    
    if is_active is not None:
        query = query.where(Asset.is_active == is_active)
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(asset_id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """Get a specific trading asset"""
    result = await db.execute(
        select(Asset).where(
            (Asset.id == asset_id) & 
            (or_(Asset.user_id == current_user.id, Asset.user_id == None))
        )
    )
    asset = result.scalars().first()
    
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset with ID {asset_id} not found")
    
    return asset

@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: int, 
    asset_update: AssetUpdate, 
    db: AsyncSession = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Update a trading asset"""
    result = await db.execute(
        select(Asset).where(
            (Asset.id == asset_id) & 
            (Asset.user_id == current_user.id)
        )
    )
    db_asset = result.scalars().first()
    
    if not db_asset:
        raise HTTPException(status_code=404, detail=f"Asset with ID {asset_id} not found or you don't have permission to modify it")
    
    # Update asset fields
    update_data = asset_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_asset, key, value)
    
    await db.commit()
    await db.refresh(db_asset)
    
    return db_asset

@router.delete("/{asset_id}", response_model=dict)
async def delete_asset(asset_id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """Delete a trading asset"""
    result = await db.execute(
        select(Asset).where(
            (Asset.id == asset_id) & 
            (Asset.user_id == current_user.id)
        )
    )
    db_asset = result.scalars().first()
    
    if not db_asset:
        raise HTTPException(status_code=404, detail=f"Asset with ID {asset_id} not found or you don't have permission to delete it")
    
    # Check if asset is used in any trades before deleting
    trades_result = await db.execute(select(Asset.trades).where(Asset.id == asset_id))
    trades = trades_result.scalars().all()
    
    if trades and len(trades) > 0:
        # Don't delete, just mark as inactive
        db_asset.is_active = False
        await db.commit()
        return {"status": "success", "message": f"Asset with ID {asset_id} marked as inactive (has associated trades)"}
    
    await db.delete(db_asset)
    await db.commit()
    
    return {"status": "success", "message": f"Asset with ID {asset_id} deleted successfully"}

@router.get("/types", response_model=List[str])
async def get_asset_types():
    """Get all available asset types"""
    return [asset_type.value for asset_type in AssetType]

@router.get("/symbol/{symbol}", response_model=AssetResponse)
async def get_asset_by_symbol(
    symbol: str, 
    db: AsyncSession = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Get an asset by its symbol"""
    result = await db.execute(
        select(Asset).where(
            (Asset.symbol == symbol) & 
            (or_(Asset.user_id == current_user.id, Asset.user_id == None))
        )
    )
    asset = result.scalars().first()
    
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset with symbol {symbol} not found")
    
    return asset
