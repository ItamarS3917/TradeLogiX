# Deployment Guide

This document provides instructions for deploying the Trading Journal Application in various environments.

## Deployment Options

The application can be deployed in several ways:

1. **Docker Compose**: Simplest deployment method for development and testing
2. **Docker Standalone**: Separate deployment of frontend and backend containers
3. **Kubernetes**: Scalable production deployment
4. **Manual Deployment**: Traditional deployment without containers

## Prerequisites

Regardless of deployment method, you'll need:

- Anthropic API key for Claude integration
- Database (SQLite for development, PostgreSQL for production)
- Node.js 16+ and npm (for frontend development)
- Python 3.9+ (for backend development)

## Docker Compose Deployment

### 1. Prepare Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tradingjournalapp.git
   cd tradingjournalapp
   ```

2. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file to add your Anthropic API key and other configuration values:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   DATABASE_URL=sqlite:///./tradingjournalapp.db
   # Set to postgresql://user:password@localhost/tradingjournalapp for PostgreSQL
   JWT_SECRET=your_jwt_secret
   # Other configuration values
   ```

### 2. Deploy with Docker Compose

1. Run the application:
   ```bash
   docker-compose up -d
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

3. Stop the application:
   ```bash
   docker-compose down
   ```

4. For backend-only deployment (useful for development):
   ```bash
   docker-compose -f docker-compose.backend-only.yml up -d
   ```

## Docker Standalone Deployment

### 1. Backend Deployment

1. Build the backend image:
   ```bash
   docker build -t tradingjournalapp-backend -f Dockerfile .
   ```

2. Run the backend container:
   ```bash
   docker run -d --name tradingjournalapp-backend \
     -p 8000:8000 \
     -e ANTHROPIC_API_KEY=your_anthropic_api_key_here \
     -e DATABASE_URL=sqlite:///./tradingjournalapp.db \
     -e JWT_SECRET=your_jwt_secret \
     tradingjournalapp-backend
   ```

### 2. Frontend Deployment

1. Navigate to the frontend directory:
   ```bash
   cd frontend-new
   ```

2. Build the frontend image:
   ```bash
   docker build -t tradingjournalapp-frontend -f Dockerfile .
   ```

3. Run the frontend container:
   ```bash
   docker run -d --name tradingjournalapp-frontend \
     -p 3000:80 \
     -e VITE_API_URL=http://your-backend-url:8000 \
     tradingjournalapp-frontend
   ```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster
- kubectl command-line tool
- Helm (optional)

### 1. Prepare Kubernetes Configuration

1. Create namespace:
   ```bash
   kubectl create namespace tradingjournalapp
   ```

2. Create ConfigMap for non-sensitive configuration:
   ```bash
   kubectl create configmap tradingjournalapp-config \
     --from-literal=ENVIRONMENT=production \
     --namespace tradingjournalapp
   ```

3. Create Secret for sensitive information:
   ```bash
   kubectl create secret generic tradingjournalapp-secrets \
     --from-literal=ANTHROPIC_API_KEY=your_anthropic_api_key_here \
     --from-literal=DATABASE_URL=postgresql://user:password@postgres/tradingjournalapp \
     --from-literal=JWT_SECRET=your_jwt_secret \
     --namespace tradingjournalapp
   ```

### 2. Deploy Database (if needed)

1. For PostgreSQL deployment:
   ```bash
   kubectl apply -f kubernetes/postgres.yaml
   ```

### 3. Deploy Backend

1. Apply backend deployment configuration:
   ```bash
   kubectl apply -f kubernetes/backend.yaml
   ```

### 4. Deploy Frontend

1. Apply frontend deployment configuration:
   ```bash
   kubectl apply -f kubernetes/frontend.yaml
   ```

### 5. Deploy Ingress (if needed)

1. Apply ingress configuration:
   ```bash
   kubectl apply -f kubernetes/ingress.yaml
   ```

## Manual Deployment

### Backend Deployment

1. Prepare Python environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Set environment variables:
   ```bash
   export ANTHROPIC_API_KEY=your_anthropic_api_key_here
   export DATABASE_URL=sqlite:///./tradingjournalapp.db
   export JWT_SECRET=your_jwt_secret
   # Other environment variables as needed
   ```

3. Run the backend:
   ```bash
   cd backend
   uvicorn api.main:app --host 0.0.0.0 --port 8000
   ```

4. For production, use Gunicorn:
   ```bash
   gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000 api.main:app
   ```

### Frontend Deployment

1. Build the frontend:
   ```bash
   cd frontend-new
   npm install
   npm run build
   ```

2. Serve with Nginx:
   - Copy the contents of the `dist` directory to your Nginx web root
   - Configure Nginx to serve the frontend and proxy API requests

   Example Nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       root /var/www/tradingjournalapp/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Database Migration

### For SQLite to PostgreSQL Migration

1. Export data from SQLite:
   ```bash
   python scripts/export_sqlite_data.py
   ```

2. Import data to PostgreSQL:
   ```bash
   python scripts/import_postgres_data.py
   ```

## MCP Server Configuration

MCP servers require special configuration for deployment:

1. Configure MCP servers in `backend/mcp/mcp_config.py`:
   ```python
   MCP_CONFIG = {
       "servers": {
           "statistics": {
               "enabled": True,
               "host": "localhost",
               "port": 8001,
               "version": "1.0.0"
           },
           "market_data": {
               "enabled": True,
               "host": "localhost",
               "port": 8002,
               "version": "1.0.0"
           },
           # Other MCP server configurations
       }
   }
   ```

2. For distributed MCP deployment, update host values to point to the correct services.

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check the DATABASE_URL environment variable
   - Ensure the database server is running and accessible
   - Verify database credentials

2. **MCP server issues**:
   - Check that MCP servers are properly configured
   - Verify port availability
   - Check logs for specific error messages

3. **Frontend API connection**:
   - Ensure the VITE_API_URL is correctly set
   - Check for CORS issues
   - Verify API endpoints are accessible

### Logging

By default, logs are sent to standard output. For production, consider configuring a logging service.

Example logging configuration:
```python
# In backend/api/main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("application.log"),
        logging.StreamHandler()
    ]
)
```

## Monitoring

For production deployments, consider setting up monitoring:

1. **Health Check Endpoints**:
   - Backend health: http://your-backend-url:8000/api/health
   - MCP server health checks are available at their respective `/health` endpoints

2. **Prometheus Integration**:
   - Metrics are exposed at http://your-backend-url:8000/metrics
   - Use with Prometheus and Grafana for monitoring

3. **Logging Integration**:
   - Consider using ELK stack (Elasticsearch, Logstash, Kibana) or similar

## Backup and Recovery

1. **Database Backup**:
   - For SQLite:
     ```bash
     cp tradingjournalapp.db tradingjournalapp.db.backup
     ```
   - For PostgreSQL:
     ```bash
     pg_dump -U username -d tradingjournalapp > backup.sql
     ```

2. **Application Configuration Backup**:
   - Backup the `.env` file and other configuration files
   - Keep Docker Compose and Kubernetes configuration files in version control

## Scaling

For high-traffic scenarios:

1. **Horizontal Scaling**:
   - Use Kubernetes to scale backend replicas:
     ```bash
     kubectl scale deployment tradingjournalapp-backend --replicas=3 -n tradingjournalapp
     ```

2. **Database Scaling**:
   - Consider PostgreSQL replication for read-heavy workloads
   - Use connection pooling (e.g., PgBouncer) for many concurrent connections

3. **MCP Server Scaling**:
   - Deploy MCP servers on separate infrastructure for intensive workloads
   - Implement load balancing for MCP services

## Security Considerations

1. **Environment Variables**:
   - Never commit `.env` files to version control
   - Use secrets management for production environments

2. **API Security**:
   - Ensure proper authentication and authorization
   - Implement rate limiting for public endpoints
   - Use HTTPS everywhere

3. **Database Security**:
   - Use strong passwords
   - Limit database access to necessary services
   - Regularly backup data

4. **Container Security**:
   - Keep Docker images updated
   - Scan for vulnerabilities
   - Use non-root users in containers
