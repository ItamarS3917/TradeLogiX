#!/bin/bash
# Created on $(date)

# Cleanup script for tradingjournalapp directory
# This script removes unnecessary fix and debug scripts

echo "Starting cleanup of tradingjournalapp directory..."

# Remove temporary fix scripts
rm -f apply_model_fix.sh
rm -f cleanup_for_github.py
rm -f container_fix.sh
rm -f container_script.py
rm -f db_debug.sh
rm -f db_health_check.sh
rm -f debug_trade_save.py
rm -f direct_fix.sh
rm -f direct_sql_fix.py
rm -f docker_container_fix.sh
rm -f docker_debug_fix.sh
rm -f docker_fix.sh
rm -f enable_debug_fix.sh
rm -f enable_fixes.sh
rm -f fix.sh
rm -f fix_and_restart.sh
rm -f fix_components_directly.sh
rm -f fix_container_contexts.sh
rm -f fix_database.py
rm -f fix_db_and_user.py
rm -f fix_db_config.sh
rm -f fix_db_final.sh
rm -f fix_docker_db.py
rm -f fix_docker_db.sh
rm -f fix_enum_values.py
rm -f fix_enum_values.sh
rm -f fix_frontend_contexts.py
rm -f fix_missing_files.py
rm -f fix_model_validation.py
rm -f fix_null_fields.py
rm -f fix_pydantic_models.py
rm -f fix_pydantic_validation.sh
rm -f fix_screenshot_db.sh
rm -f fix_volume_mappings.sh
rm -f fixed_db_health_check.sh
rm -f make_executable.sh
rm -f prepare_simple_fix.sh
rm -f quick_docker_fix.sh
rm -f restart_app.sh
rm -f restart_containers.sh
rm -f restart_with_fixes.sh
rm -f restart_with_validation_fix.sh
rm -f run_fixes.sh
rm -f simple_fix.sh
rm -f test_app.sh
rm -f test_app_direct.sh

# Remove backup database files but keep the main one
rm -f tradingjournalapp.db.backup-*

# Remove backup files in backend/db directory
rm -f backend/db/*.backup
rm -f backend/db/*.debug
rm -f backend/db/*.new

echo "Cleanup complete!"
echo "Remaining essential files include Docker setup, application code, and documentation."
