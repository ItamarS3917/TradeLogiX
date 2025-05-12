# API Documentation

This document describes the RESTful API endpoints provided by the Trading Journal Application.

## Base URL

All API endpoints are prefixed with: `/api/v1`

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### Login

```
POST /auth/login
```

Request Body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

#### Register

```
POST /auth/register
```

Request Body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "id": "string",
  "username": "string",
  "email": "string"
}
```

## User Endpoints

#### Get Current User

```
GET /users/me
```

Response:
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "preferences": {}
}
```

#### Update User Preferences

```
PUT /users/preferences
```

Request Body:
```json
{
  "theme": "string",
  "dashboardLayout": [],
  "notifications": {}
}
```

Response:
```json
{
  "preferences": {}
}
```

## Trade Endpoints

#### List Trades

```
GET /trades
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `start_date`: Filter by start date
- `end_date`: Filter by end date
- `setup_type`: Filter by setup type
- `outcome`: Filter by outcome (win/loss/breakeven)

Response:
```json
{
  "items": [
    {
      "id": "string",
      "date": "string",
      "symbol": "string",
      "setup_type": "string",
      "entry_price": "number",
      "exit_price": "number",
      "position_size": "number",
      "entry_time": "string",
      "exit_time": "string",
      "planned_risk_reward": "number",
      "actual_risk_reward": "number",
      "outcome": "string",
      "profit_loss": "number",
      "emotional_state": "string",
      "plan_adherence": "number",
      "notes": "string",
      "tags": []
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number",
  "pages": "number"
}
```

#### Get Trade

```
GET /trades/{trade_id}
```

Response:
```json
{
  "id": "string",
  "date": "string",
  "symbol": "string",
  "setup_type": "string",
  "entry_price": "number",
  "exit_price": "number",
  "position_size": "number",
  "entry_time": "string",
  "exit_time": "string",
  "planned_risk_reward": "number",
  "actual_risk_reward": "number",
  "outcome": "string",
  "profit_loss": "number",
  "emotional_state": "string",
  "plan_adherence": "number",
  "screenshots": [],
  "notes": "string",
  "tags": [],
  "related_plan_id": "string"
}
```

#### Create Trade

```
POST /trades
```

Request Body:
```json
{
  "date": "string",
  "symbol": "string",
  "setup_type": "string",
  "entry_price": "number",
  "exit_price": "number",
  "position_size": "number",
  "entry_time": "string",
  "exit_time": "string",
  "planned_risk_reward": "number",
  "actual_risk_reward": "number",
  "outcome": "string",
  "profit_loss": "number",
  "emotional_state": "string",
  "plan_adherence": "number",
  "notes": "string",
  "tags": [],
  "related_plan_id": "string"
}
```

Response:
```json
{
  "id": "string",
  "date": "string",
  "symbol": "string",
  "setup_type": "string",
  "entry_price": "number",
  "exit_price": "number",
  "position_size": "number",
  "entry_time": "string",
  "exit_time": "string",
  "planned_risk_reward": "number",
  "actual_risk_reward": "number",
  "outcome": "string",
  "profit_loss": "number",
  "emotional_state": "string",
  "plan_adherence": "number",
  "notes": "string",
  "tags": [],
  "related_plan_id": "string"
}
```

#### Update Trade

```
PUT /trades/{trade_id}
```

Request Body: Same as Create Trade

Response: Same as Get Trade

#### Delete Trade

```
DELETE /trades/{trade_id}
```

Response:
```json
{
  "message": "Trade deleted successfully"
}
```

#### Upload Trade Screenshot

```
POST /trades/{trade_id}/screenshots
```

Request: Form data with file

Response:
```json
{
  "id": "string",
  "trade_id": "string",
  "filename": "string",
  "url": "string"
}
```

## Journal Endpoints

#### List Journal Entries

```
GET /journals
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `start_date`: Filter by start date
- `end_date`: Filter by end date
- `tags`: Filter by tags (comma-separated)

Response:
```json
{
  "items": [
    {
      "id": "string",
      "date": "string",
      "content": "string",
      "mood_rating": "number",
      "tags": [],
      "related_trade_ids": []
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number",
  "pages": "number"
}
```

#### Get Journal Entry

```
GET /journals/{journal_id}
```

Response:
```json
{
  "id": "string",
  "date": "string",
  "content": "string",
  "mood_rating": "number",
  "tags": [],
  "related_trade_ids": []
}
```

#### Create Journal Entry

```
POST /journals
```

Request Body:
```json
{
  "date": "string",
  "content": "string",
  "mood_rating": "number",
  "tags": [],
  "related_trade_ids": []
}
```

Response: Same as Get Journal Entry

#### Update Journal Entry

```
PUT /journals/{journal_id}
```

Request Body: Same as Create Journal Entry

Response: Same as Get Journal Entry

#### Delete Journal Entry

```
DELETE /journals/{journal_id}
```

Response:
```json
{
  "message": "Journal entry deleted successfully"
}
```

## Pre-Market Planning Endpoints

#### List Plans

```
GET /plans
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `start_date`: Filter by start date
- `end_date`: Filter by end date

Response:
```json
{
  "items": [
    {
      "id": "string",
      "date": "string",
      "market_bias": "string",
      "key_levels": [],
      "goals": [],
      "risk_parameters": {},
      "mental_state": "string",
      "notes": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number",
  "pages": "number"
}
```

#### Get Plan

```
GET /plans/{plan_id}
```

Response:
```json
{
  "id": "string",
  "date": "string",
  "market_bias": "string",
  "key_levels": [],
  "goals": [],
  "risk_parameters": {},
  "mental_state": "string",
  "notes": "string"
}
```

#### Create Plan

```
POST /plans
```

Request Body:
```json
{
  "date": "string",
  "market_bias": "string",
  "key_levels": [],
  "goals": [],
  "risk_parameters": {},
  "mental_state": "string",
  "notes": "string"
}
```

Response: Same as Get Plan

#### Update Plan

```
PUT /plans/{plan_id}
```

Request Body: Same as Create Plan

Response: Same as Get Plan

#### Delete Plan

```
DELETE /plans/{plan_id}
```

Response:
```json
{
  "message": "Plan deleted successfully"
}
```

## Statistics Endpoints

#### Get Overall Statistics

```
GET /statistics/overall
```

Query Parameters:
- `start_date`: Filter by start date
- `end_date`: Filter by end date
- `symbol`: Filter by symbol

Response:
```json
{
  "win_rate": "number",
  "profit_loss": "number",
  "average_win": "number",
  "average_loss": "number",
  "largest_win": "number",
  "largest_loss": "number",
  "risk_reward_ratio": "number",
  "profit_factor": "number",
  "total_trades": "number",
  "winning_trades": "number",
  "losing_trades": "number",
  "breakeven_trades": "number"
}
```

#### Get Statistics By Setup

```
GET /statistics/by-setup
```

Query Parameters:
- `start_date`: Filter by start date
- `end_date`: Filter by end date
- `symbol`: Filter by symbol

Response:
```json
{
  "setups": [
    {
      "setup_type": "string",
      "win_rate": "number",
      "profit_loss": "number",
      "average_win": "number",
      "average_loss": "number",
      "total_trades": "number"
    }
  ]
}
```

#### Get Statistics By Time

```
GET /statistics/by-time
```

Query Parameters:
- `start_date`: Filter by start date
- `end_date`: Filter by end date
- `symbol`: Filter by symbol
- `interval`: Time interval (hour, day, week, month)

Response:
```json
{
  "intervals": [
    {
      "interval": "string",
      "win_rate": "number",
      "profit_loss": "number",
      "total_trades": "number"
    }
  ]
}
```

#### Get Advanced Statistics

```
GET /statistics/advanced
```

Query Parameters:
- `start_date`: Filter by start date
- `end_date`: Filter by end date
- `symbol`: Filter by symbol
- `metrics`: Comma-separated list of requested metrics

Response:
```json
{
  "metrics": {}
}
```

## MCP-Enhanced Endpoints

These endpoints leverage MCP technology for enhanced functionality:

### TradeSage AI Endpoints

#### Analyze Trading Patterns

```
POST /mcp/tradesage/analyze-patterns
```

Request Body:
```json
{
  "trade_ids": [],
  "start_date": "string",
  "end_date": "string"
}
```

Response:
```json
{
  "patterns": [],
  "insights": "string",
  "recommendations": []
}
```

#### Generate Improvement Plan

```
POST /mcp/tradesage/improvement-plan
```

Request Body:
```json
{
  "trade_ids": [],
  "journal_ids": [],
  "focus_areas": []
}
```

Response:
```json
{
  "plan": {
    "observations": "string",
    "strengths": [],
    "areas_to_improve": [],
    "action_items": [],
    "metrics_to_track": []
  }
}
```

#### Ask Trading Question

```
POST /mcp/tradesage/ask
```

Request Body:
```json
{
  "question": "string",
  "context": {
    "include_trades": "boolean",
    "include_journals": "boolean",
    "start_date": "string",
    "end_date": "string"
  }
}
```

Response:
```json
{
  "answer": "string",
  "references": []
}
```

### Market Data Endpoints

#### Get Market Data

```
GET /mcp/market-data/{symbol}
```

Query Parameters:
- `timeframe`: Data timeframe (1m, 5m, 15m, 1h, 1d)
- `start`: Start timestamp
- `end`: End timestamp

Response:
```json
{
  "symbol": "string",
  "timeframe": "string",
  "data": [
    {
      "timestamp": "string",
      "open": "number",
      "high": "number",
      "low": "number",
      "close": "number",
      "volume": "number"
    }
  ]
}
```

#### Get Key Levels

```
GET /mcp/market-data/{symbol}/key-levels
```

Query Parameters:
- `timeframe`: Data timeframe (1m, 5m, 15m, 1h, 1d)
- `level_type`: Type of levels (support, resistance, pivot)

Response:
```json
{
  "symbol": "string",
  "timeframe": "string",
  "levels": [
    {
      "price": "number",
      "type": "string",
      "strength": "number",
      "description": "string"
    }
  ]
}
```

### Alert Endpoints

#### List Alerts

```
GET /alerts
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (active, triggered, dismissed)

Response:
```json
{
  "items": [
    {
      "id": "string",
      "type": "string",
      "conditions": {},
      "message": "string",
      "status": "string",
      "created_at": "string",
      "triggered_at": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number",
  "pages": "number"
}
```

#### Create Alert

```
POST /alerts
```

Request Body:
```json
{
  "type": "string",
  "conditions": {},
  "message": "string"
}
```

Response:
```json
{
  "id": "string",
  "type": "string",
  "conditions": {},
  "message": "string",
  "status": "string",
  "created_at": "string"
}
```

#### Update Alert

```
PUT /alerts/{alert_id}
```

Request Body:
```json
{
  "type": "string",
  "conditions": {},
  "message": "string",
  "status": "string"
}
```

Response: Same as Create Alert Response

#### Delete Alert

```
DELETE /alerts/{alert_id}
```

Response:
```json
{
  "message": "Alert deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden

```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 422 Unprocessable Entity

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```
