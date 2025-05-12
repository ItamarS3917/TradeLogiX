# Setup Guide

This document provides detailed instructions for setting up the Trading Journal Application development environment.

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.9 or higher**
- **Node.js 16 or higher**
- **npm or yarn**
- **Git**
- **Docker and Docker Compose** (optional, for containerized setup)

## Getting the Code

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tradingjournalapp.git
   cd tradingjournalapp
   ```

## Backend Setup

### Option 1: Using Setup Script (Recommended)

The project includes a setup script that automates the backend setup process:

```bash
# Run the setup script
python install_dependencies.py
```

This script will:
- Create a virtual environment
- Install required dependencies
- Set up the initial database
- Configure MCP integration

### Option 2: Manual Setup

If you prefer to set up manually, follow these steps:

#### 1. Create a virtual environment:

```bash
# For macOS/Linux:
python -m venv venv
source venv/bin/activate

# For Windows:
python -m venv venv
venv\Scripts\activate
```

#### 2. Install dependencies:

```bash
pip install -r requirements.txt
```

If you encounter issues with pandas installation, use the provided script:
```bash
./install_pandas.sh
```

#### 3. Create environment file:

```bash
cp .env.example .env
```

Edit the `.env` file to add your Anthropic API key and other settings:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DATABASE_URL=sqlite:///./tradingjournalapp.db
JWT_SECRET=your_jwt_secret
# Other environment variables
```

#### 4. Initialize the database:

```bash
cd backend
python -c "from db.database import Base, engine; Base.metadata.create_all(bind=engine)"
cd ..
```

### Running the Backend

Once the setup is complete, you can run the backend server:

```bash
cd backend
uvicorn api.main:app --reload
```

The API will be available at `http://localhost:8000`.

API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Frontend Setup

### Option 1: Using Setup Script (Recommended)

The project includes a script to set up the frontend:

```bash
# Make the script executable (Unix/Linux/macOS)
chmod +x install_frontend_deps.sh

# Run the script
./install_frontend_deps.sh
```

### Option 2: Manual Setup

If you prefer to set up manually, follow these steps:

#### 1. Navigate to the frontend directory:

```bash
cd frontend-new
```

#### 2. Install dependencies:

```bash
npm install
```

#### 3. Create environment file:

```bash
cp .env.example .env
```

Edit the `.env` file to configure the API URL:
```
VITE_API_URL=http://localhost:8000
```

### Running the Frontend

Once the setup is complete, you can run the frontend development server:

```bash
cd frontend-new
npm run dev
```

The application will be available at `http://localhost:3000`.

## Docker Setup

For a containerized development environment, you can use Docker Compose:

```bash
# Copy the environment example file
cp .env.example .env

# Edit the .env file to add your Anthropic API key
# ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Start the containers
docker-compose up -d
```

This will start both the backend and frontend services. If you only want to run the backend:

```bash
docker-compose -f docker-compose.backend-only.yml up -d
```

## MCP Integration Setup

The Model Context Protocol (MCP) is a key component of the application. To set up MCP integration:

1. Ensure your Anthropic API key is set in the `.env` file
2. Configure MCP servers in `backend/mcp/mcp_config.py` if needed
3. MCP servers will be automatically started when the backend runs

For detailed information on MCP implementation, see:
- [MCP Implementation Guide](../MCP_IMPLEMENTATION.md)
- [TradeSage MCP Implementation](../MCP_TRADESAGE_IMPLEMENTATION.md)

## Development Workflow

Here's a typical development workflow:

1. Start the backend server:
   ```bash
   cd backend
   uvicorn api.main:app --reload
   ```

2. In a separate terminal, start the frontend server:
   ```bash
   cd frontend-new
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Database Management

The application uses SQLite for development and PostgreSQL for production.

### SQLite Database

No additional setup is required for SQLite. The database file will be created automatically at `tradingjournalapp.db`.

To reset the database:
```bash
rm tradingjournalapp.db
cd backend
python -c "from db.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

### PostgreSQL Database

To use PostgreSQL instead of SQLite:

1. Update the `DATABASE_URL` in your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost/tradingjournalapp
   ```

2. Create the database:
   ```bash
   psql -U username
   CREATE DATABASE tradingjournalapp;
   \q
   ```

3. Restart the backend server

## Troubleshooting

### Common Issues

#### 1. Package Installation Errors

If you encounter issues installing packages with pip:

```bash
# Try upgrading pip
pip install --upgrade pip

# For specific package issues
pip install package_name --no-binary :all:
```

#### 2. Python Version Issues

The application requires Python 3.9+. If you have multiple Python versions installed:

```bash
# Check your Python version
python --version

# If needed, specify Python 3.9 or higher
python3.9 -m venv venv
```

#### 3. Node.js and npm Issues

If you encounter issues with Node.js dependencies:

```bash
# Check versions
node --version
npm --version

# Clear npm cache
npm cache clean --force

# Try with legacy peer deps if using newer npm
npm install --legacy-peer-deps
```

#### 4. MCP Server Issues

If MCP servers don't start properly:

1. Check the logs for error messages
2. Verify that the ports specified in `mcp_config.py` are available
3. Ensure your Anthropic API key is correctly set
4. Try restarting the backend server

### Specific Platform Instructions

#### macOS

For macOS users, see the dedicated setup guide:
- [macOS Installation Guide](../INSTALL_MACOS.md)

#### Windows

On Windows, you might need to run commands in an administrator PowerShell:

```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# If execution policy prevents running scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Additional Resources

- [API Documentation](api.md): Detailed documentation of the API endpoints
- [Architecture Documentation](architecture.md): Overview of the application architecture
- [MCP Integration Documentation](mcp_integration.md): Details on the MCP integration
- [Project Roadmap](../PROJECT_ROADMAP.md): Future development plans
- [Modernization Guide](../MODERNIZATION_GUIDE.md): Guide for updating dependencies

## Getting Help

If you encounter any issues not covered in this guide, please:

1. Check the existing documentation
2. Look for error messages in the console outputs
3. Check the logs in the backend and frontend
4. Reach out to the development team for assistance
