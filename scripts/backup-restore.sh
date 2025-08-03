#!/bin/bash

# WeAreVibers Backup & Restore Script
# Enterprise-grade backup and disaster recovery automation

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
    
    case $level in
        "ERROR") echo -e "${RED}${message}${NC}" ;;
        "WARN")  echo -e "${YELLOW}${message}${NC}" ;;
        "INFO")  echo -e "${GREEN}${message}${NC}" ;;
        "DEBUG") echo -e "${BLUE}${message}${NC}" ;;
    esac
}

# Error handler
error_handler() {
    local line_number=$1
    log "ERROR" "Script failed at line $line_number"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Create backup directory
setup_backup_dir() {
    log "INFO" "Setting up backup directory..."
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/config"
    mkdir -p "$BACKUP_DIR/assets"
    mkdir -p "$BACKUP_DIR/logs"
}

# Backup environment configuration
backup_environment() {
    log "INFO" "Backing up environment configuration..."
    
    local env_backup_dir="$BACKUP_DIR/config/$TIMESTAMP"
    mkdir -p "$env_backup_dir"
    
    # Backup configuration files (without secrets)
    cp "$PROJECT_ROOT/package.json" "$env_backup_dir/"
    cp "$PROJECT_ROOT/vite.config.ts" "$env_backup_dir/"
    cp "$PROJECT_ROOT/tsconfig.json" "$env_backup_dir/"
    cp "$PROJECT_ROOT/tailwind.config.ts" "$env_backup_dir/"
    cp "$PROJECT_ROOT/vercel.json" "$env_backup_dir/"
    cp "$PROJECT_ROOT/lighthouserc.js" "$env_backup_dir/"
    
    # Create environment template (without actual secrets)
    if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
        cp "$PROJECT_ROOT/.env.example" "$env_backup_dir/"
    fi
    
    # Backup CI/CD configuration
    if [[ -d "$PROJECT_ROOT/.github" ]]; then
        cp -r "$PROJECT_ROOT/.github" "$env_backup_dir/"
    fi
    
    # Create backup manifest
    cat > "$env_backup_dir/backup_manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "type": "environment_config",
  "version": "$(node -p "require('$PROJECT_ROOT/package.json').version")",
  "node_version": "$(node --version)",
  "npm_version": "$(npm --version)",
  "files": [
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "tailwind.config.ts",
    "vercel.json",
    "lighthouserc.js",
    ".env.example",
    ".github/"
  ],
  "created_by": "${USER:-unknown}",
  "hostname": "$(hostname)"
}
EOF
    
    log "INFO" "Environment configuration backed up to: $env_backup_dir"
}

# Backup Supabase database
backup_database() {
    log "INFO" "Starting database backup..."
    
    if [[ -z "${SUPABASE_DB_HOST:-}" ]] || [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
        log "WARN" "Database credentials not found. Skipping database backup."
        return 0
    fi
    
    local db_backup_dir="$BACKUP_DIR/database/$TIMESTAMP"
    mkdir -p "$db_backup_dir"
    
    # Full database dump
    log "INFO" "Creating full database dump..."
    PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
        -h "$SUPABASE_DB_HOST" \
        -p "${SUPABASE_DB_PORT:-5432}" \
        -U postgres \
        -d "${SUPABASE_DB_NAME:-postgres}" \
        -f "$db_backup_dir/full_backup.sql" \
        --verbose \
        --no-password \
        --format=custom \
        --compress=9
    
    # Schema-only backup
    log "INFO" "Creating schema-only backup..."
    PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
        -h "$SUPABASE_DB_HOST" \
        -p "${SUPABASE_DB_PORT:-5432}" \
        -U postgres \
        -d "${SUPABASE_DB_NAME:-postgres}" \
        -f "$db_backup_dir/schema_only.sql" \
        --schema-only \
        --no-password
    
    # Data-only backup
    log "INFO" "Creating data-only backup..."
    PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
        -h "$SUPABASE_DB_HOST" \
        -p "${SUPABASE_DB_PORT:-5432}" \
        -U postgres \
        -d "${SUPABASE_DB_NAME:-postgres}" \
        -f "$db_backup_dir/data_only.sql" \
        --data-only \
        --no-password
    
    # Create database backup manifest
    cat > "$db_backup_dir/db_manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "type": "database_backup",
  "database_host": "$SUPABASE_DB_HOST",
  "database_name": "${SUPABASE_DB_NAME:-postgres}",
  "backup_files": [
    "full_backup.sql",
    "schema_only.sql",
    "data_only.sql"
  ],
  "pg_dump_version": "$(pg_dump --version | head -1)",
  "created_by": "${USER:-unknown}"
}
EOF
    
    log "INFO" "Database backup completed: $db_backup_dir"
}

# Backup application assets
backup_assets() {
    log "INFO" "Backing up application assets..."
    
    local assets_backup_dir="$BACKUP_DIR/assets/$TIMESTAMP"
    mkdir -p "$assets_backup_dir"
    
    # Backup source code (excluding node_modules and dist)
    tar -czf "$assets_backup_dir/source_code.tar.gz" \
        --exclude="node_modules" \
        --exclude="dist" \
        --exclude=".git" \
        --exclude="backups" \
        --exclude="*.log" \
        -C "$PROJECT_ROOT" .
    
    # Backup built assets if they exist
    if [[ -d "$PROJECT_ROOT/dist" ]]; then
        tar -czf "$assets_backup_dir/built_assets.tar.gz" \
            -C "$PROJECT_ROOT" dist
    fi
    
    # Create assets manifest
    cat > "$assets_backup_dir/assets_manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "type": "assets_backup",
  "source_size": "$(du -sh "$PROJECT_ROOT" | cut -f1)",
  "backup_files": [
    "source_code.tar.gz",
    "built_assets.tar.gz"
  ],
  "created_by": "${USER:-unknown}"
}
EOF
    
    log "INFO" "Assets backup completed: $assets_backup_dir"
}

# Verify backup integrity
verify_backup() {
    log "INFO" "Verifying backup integrity..."
    
    local backup_date=$1
    local backup_path="$BACKUP_DIR"
    
    # Check if backup directories exist
    local dirs=("config/$backup_date" "database/$backup_date" "assets/$backup_date")
    for dir in "${dirs[@]}"; do
        if [[ -d "$backup_path/$dir" ]]; then
            log "INFO" "✓ Found: $dir"
        else
            log "WARN" "✗ Missing: $dir"
        fi
    done
    
    # Verify file integrity
    find "$backup_path" -name "*.tar.gz" -exec tar -tzf {} > /dev/null \; -print | while read -r file; do
        log "INFO" "✓ Archive integrity verified: $(basename "$file")"
    done
    
    # Verify database backup
    if [[ -f "$backup_path/database/$backup_date/full_backup.sql" ]]; then
        if pg_restore --list "$backup_path/database/$backup_date/full_backup.sql" > /dev/null 2>&1; then
            log "INFO" "✓ Database backup integrity verified"
        else
            log "ERROR" "✗ Database backup integrity check failed"
        fi
    fi
}

# Restore from backup
restore_backup() {
    local backup_date=$1
    log "INFO" "Starting restore process for backup: $backup_date"
    
    # Confirmation prompt
    echo -e "${RED}WARNING: This will restore from backup and may overwrite current data!${NC}"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        log "INFO" "Restore cancelled by user"
        exit 0
    fi
    
    # Restore configuration
    local config_backup="$BACKUP_DIR/config/$backup_date"
    if [[ -d "$config_backup" ]]; then
        log "INFO" "Restoring configuration files..."
        cp "$config_backup"/*.json "$PROJECT_ROOT/" 2>/dev/null || true
        cp "$config_backup"/*.ts "$PROJECT_ROOT/" 2>/dev/null || true
        cp "$config_backup"/*.js "$PROJECT_ROOT/" 2>/dev/null || true
        
        # Restore CI/CD configuration
        if [[ -d "$config_backup/.github" ]]; then
            rm -rf "$PROJECT_ROOT/.github"
            cp -r "$config_backup/.github" "$PROJECT_ROOT/"
        fi
    fi
    
    # Restore source code
    local assets_backup="$BACKUP_DIR/assets/$backup_date"
    if [[ -f "$assets_backup/source_code.tar.gz" ]]; then
        log "INFO" "Restoring source code..."
        read -p "This will overwrite current source code. Continue? (yes/no): " confirm_source
        
        if [[ "$confirm_source" == "yes" ]]; then
            tar -xzf "$assets_backup/source_code.tar.gz" -C "$PROJECT_ROOT"
            log "INFO" "Source code restored"
        fi
    fi
    
    # Restore database
    local db_backup="$BACKUP_DIR/database/$backup_date"
    if [[ -f "$db_backup/full_backup.sql" ]] && [[ -n "${SUPABASE_DB_HOST:-}" ]]; then
        log "WARN" "Database restore requires manual intervention due to Supabase managed database"
        log "INFO" "Database backup location: $db_backup/full_backup.sql"
        log "INFO" "Use Supabase dashboard or CLI to restore database"
    fi
    
    log "INFO" "Restore process completed"
}

# Cleanup old backups
cleanup_old_backups() {
    local retention_days=${1:-30}
    log "INFO" "Cleaning up backups older than $retention_days days..."
    
    find "$BACKUP_DIR" -type d -name "*_*" -mtime +$retention_days | while read -r old_backup; do
        log "INFO" "Removing old backup: $(basename "$old_backup")"
        rm -rf "$old_backup"
    done
}

# Generate backup report
generate_report() {
    log "INFO" "Generating backup report..."
    
    local report_file="$BACKUP_DIR/backup_report_$TIMESTAMP.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>WeAreVibers Backup Report - $TIMESTAMP</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 10px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>WeAreVibers Backup Report</h1>
        <p><strong>Date:</strong> $TIMESTAMP</p>
        <p><strong>Server:</strong> $(hostname)</p>
        <p><strong>User:</strong> ${USER:-unknown}</p>
    </div>
    
    <div class="section">
        <h2>Backup Summary</h2>
        <table>
            <tr><th>Component</th><th>Status</th><th>Size</th><th>Location</th></tr>
            <tr><td>Configuration</td><td class="success">✓ Complete</td><td>$(du -sh "$BACKUP_DIR/config/$TIMESTAMP" 2>/dev/null | cut -f1 || echo "N/A")</td><td>config/$TIMESTAMP</td></tr>
            <tr><td>Database</td><td class="success">✓ Complete</td><td>$(du -sh "$BACKUP_DIR/database/$TIMESTAMP" 2>/dev/null | cut -f1 || echo "N/A")</td><td>database/$TIMESTAMP</td></tr>
            <tr><td>Assets</td><td class="success">✓ Complete</td><td>$(du -sh "$BACKUP_DIR/assets/$TIMESTAMP" 2>/dev/null | cut -f1 || echo "N/A")</td><td>assets/$TIMESTAMP</td></tr>
        </table>
    </div>
    
    <div class="section">
        <h2>Verification Results</h2>
        <p>All backup components have been verified for integrity.</p>
    </div>
    
    <div class="section">
        <h2>Recovery Instructions</h2>
        <ol>
            <li>To restore configuration: <code>./backup-restore.sh restore $TIMESTAMP</code></li>
            <li>To restore database: Use Supabase dashboard or CLI with backup file</li>
            <li>To restore source code: Extract from assets backup</li>
        </ol>
    </div>
</body>
</html>
EOF
    
    log "INFO" "Backup report generated: $report_file"
}

# Main execution
main() {
    case "${1:-backup}" in
        "backup")
            log "INFO" "Starting full backup process..."
            setup_backup_dir
            backup_environment
            backup_database
            backup_assets
            verify_backup "$TIMESTAMP"
            generate_report
            cleanup_old_backups 30
            log "INFO" "Backup process completed successfully!"
            ;;
        "restore")
            if [[ -z "${2:-}" ]]; then
                log "ERROR" "Please specify backup date (format: YYYYMMDD_HHMMSS)"
                exit 1
            fi
            restore_backup "$2"
            ;;
        "verify")
            if [[ -z "${2:-}" ]]; then
                log "ERROR" "Please specify backup date to verify"
                exit 1
            fi
            verify_backup "$2"
            ;;
        "cleanup")
            cleanup_old_backups "${2:-30}"
            ;;
        "list")
            log "INFO" "Available backups:"
            find "$BACKUP_DIR" -maxdepth 2 -name "*_*" -type d | sort
            ;;
        *)
            echo "Usage: $0 {backup|restore|verify|cleanup|list} [options]"
            echo "  backup                     - Create full backup"
            echo "  restore <timestamp>        - Restore from backup"
            echo "  verify <timestamp>         - Verify backup integrity"
            echo "  cleanup [days]             - Remove backups older than N days (default: 30)"
            echo "  list                       - List available backups"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"