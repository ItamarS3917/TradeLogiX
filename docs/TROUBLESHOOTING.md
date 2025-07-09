# Troubleshooting Guide for the Trading Journal App

## Common Issues and Solutions

### "Failed to save/load data" Error

If you're seeing "Failed to save/load data" errors in the frontend:

1. **Check if the backend is running**
   ```bash
   # Check if backend is running on port 8000
   curl http://localhost:8000/api/health
   ```

   If you get a connection refused error, the backend isn't running.

2. **Start the backend (non-Docker method)**
   ```bash
   # Make the script executable
   chmod +x run_backend.sh
   
   # Run the backend
   ./run_backend.sh
   ```

3. **If the Python backend won't start, try from Docker**
   ```bash
   docker-compose -f docker-compose.backend-only.yml up
   ```

4. **If using Docker, check container logs**
   ```bash
   docker-compose logs backend
   ```

### Database Issues

If the backend starts but you still can't save data:

1. **Check database permissions**
   ```bash
   # Make sure the database file is writable
   chmod 644 tradingjournalapp.db
   ```

2. **Initialize a fresh database**
   ```bash
   # Run this to create a new database
   python -c "from backend.db.database import initialize_db; initialize_db()"
   ```

### Missing Dependencies

If you see import errors when starting the backend:

1. **Install all required packages**
   ```bash
   pip install -r requirements.txt
   ```

2. **For MacOS specific issues, see INSTALL_MACOS.md**

### Frontend Connection Issues

If the frontend can't connect to the backend:

1. **Check CORS settings**
   - Make sure the backend has CORS enabled for your frontend URL

2. **Verify API URL in frontend**
   - Check that the frontend is using http://localhost:8000 for API calls

3. **Test API directly**
   ```bash
   # Test a specific API endpoint
   curl http://localhost:8000/api/trades
   ```

## Getting More Detailed Errors

To see detailed errors from the backend:

1. **Enable debug mode**
   - Add `DEBUG=True` to your .env file

2. **Check browser console**
   - Open your browser's developer tools (F12) and look at the Console tab for error messages

3. **Check backend logs**
   - Look for error messages in the backend terminal output

## Still Having Issues?

If you're still having trouble:

1. Create a clean environment and install dependencies fresh
2. Try using the Docker setup which has all dependencies pre-configured
3. Check if the MCP_AI_ENABLED and MCP_TRADESAGE_ENABLED flags in .env affect functionality
