# Trading Journal App Cleanup Instructions

This README provides instructions for cleaning up unnecessary files in your Trading Journal App directory.

## Why Cleanup is Needed

Your directory contains many temporary fix scripts that are no longer needed for the application to function properly. These were likely created to address specific issues during development but are now cluttering your workspace.

## Files to be Removed

The cleanup.sh script will remove the following types of files:
- Temporary fix scripts (fix_*.sh, fix_*.py)
- Debug scripts (debug_*.py, *_debug.*)
- Backup database files (*.backup)
- Container and Docker fix scripts
- Restart scripts
- Test scripts

## How to Run the Cleanup

1. Make the cleanup script executable:
```
chmod +x /Users/itamarmacbook/Desktop/tradingjournalapp/cleanup.sh
```

2. Run the cleanup script:
```
cd /Users/itamarmacbook/Desktop/tradingjournalapp
./cleanup.sh
```

## Important Files That Will Be Kept

The following important components will be preserved:
- Backend code (FastAPI with MCP SDK integration)
- Frontend code (React.js with MCP client libraries)
- Docker configuration files
- Main database file
- Documentation files
- Application code structure aligning with the MCP-Enhanced Trading Journal Masterplan

## After Cleanup

After running the cleanup script, your directory will be more organized and focused on the essential files needed for your trading journal application as described in the masterplan.
