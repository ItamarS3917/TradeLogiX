# Application Architecture

This document outlines the architecture of the MCP-Enhanced Trading Journal Application.

## System Overview

The Trading Journal Application follows a client-server architecture with a React frontend and a FastAPI backend. The system is enhanced with Model Context Protocol (MCP) technology that enables advanced AI capabilities, real-time data processing, and specialized analytics.

## High-Level Architecture

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│  React Frontend │◄────┤  FastAPI Backend  │◄────┤  MCP Services   │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └─────────────────┘
        ▲                        ▲                        ▲
        │                        │                        │
        │                        │                        │
        │                        ▼                        │
        │                ┌───────────────────┐           │
        │                │                   │           │
        └───────────────┤   Database Layer   │◄──────────┘
                         │                   │
                         └───────────────────┘
```

## Backend Architecture

### API Layer

The API layer is implemented using FastAPI and follows a RESTful architecture. It includes the following components:

- **Routes**: Defines API endpoints organized by domain
- **Controllers**: Handles request processing and response formatting
- **Middleware**: Provides cross-cutting concerns (authentication, logging, etc.)
- **Exception Handlers**: Manages error handling and response formatting

### Service Layer

The service layer contains the business logic of the application:

- **Trade Service**: Manages trade-related operations
- **Journal Service**: Handles journal entry operations
- **Statistics Service**: Calculates and analyzes trading performance
- **User Service**: Manages user-related operations
- **Alert Service**: Processes and manages alerts
- **Plan Service**: Handles pre-market planning

### Data Access Layer

The data access layer handles database operations:

- **Repositories**: Implements data access patterns for each entity
- **Models**: Defines SQLAlchemy ORM models
- **Schemas**: Defines Pydantic models for data validation and serialization
- **Database Connection**: Manages database connection and session handling

### MCP Integration Layer

The MCP integration layer provides enhanced capabilities:

- **MCP Integration Manager**: Coordinates all MCP services
- **MCP Servers**: Specialized servers for different functionalities
- **MCP Tools**: Standalone components for data analysis and processing
- **MCP Clients**: Components for communicating with MCP servers

## Frontend Architecture

The frontend is built with React and organized as follows:

### Presentation Layer

- **Pages**: Container components for each route
- **Components**: Reusable UI components
- **Layouts**: Page layout templates

### State Management

- **Context API**: Manages application state
- **Custom Hooks**: Encapsulates reusable stateful logic

### Service Layer

- **API Client**: Communicates with backend API
- **MCP Client**: Interfaces with MCP services

### Utility Layer

- **Formatters**: Handles data formatting
- **Validators**: Provides client-side validation
- **Helpers**: Contains utility functions

## Database Schema

The application uses a relational database with the following core entities:

- **User**: Stores user information
- **Trade**: Records trade details
- **Journal**: Stores journal entries
- **DailyPlan**: Contains pre-market planning information
- **Alert**: Stores alert configurations and occurrences
- **Statistic**: Stores cached statistical calculations

## Key Workflows

### Trade Recording Workflow

1. User enters trade details on frontend
2. Frontend validates and sends data to backend
3. Backend validates and stores trade information
4. MCP services analyze trade data
5. Statistics are updated via MCP
6. Frontend displays confirmation and updated statistics

### Pre-Market Planning Workflow

1. User completes planning form
2. Planning data is sent to backend
3. Backend stores planning information
4. MCP services provide plan analysis
5. Relevant alerts are generated if applicable
6. Frontend displays confirmation and plan summary

### TradeSage AI Workflow

1. User requests AI insights
2. Frontend sends request to backend
3. Backend collects relevant trade and journal data
4. MCP services process data
5. Claude API analyzes data via MCP
6. Insights are sent back through MCP services
7. Frontend displays AI insights to user

## Deployment Architecture

The application supports multiple deployment options:

### Development Environment

- Local Docker Compose setup
- SQLite database
- Local MCP servers

### Production Environment

- Kubernetes cluster
- PostgreSQL database
- Distributed MCP services
- Load balancing and auto-scaling

## Security Architecture

The application implements security at multiple levels:

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Data Protection**: Encryption at rest and in transit
- **API Security**: Input validation, rate limiting, CSRF protection
- **MCP Security**: Token-based authentication for MCP services

## Future Architectural Enhancements

- **Microservices**: Migrate to a full microservices architecture
- **Event-Driven**: Implement event-driven communication between services
- **Real-Time Updates**: Add WebSocket support for real-time data updates
- **Mobile Support**: Extend architecture to support mobile clients
- **Advanced MCP Orchestration**: Implement distributed MCP service discovery
