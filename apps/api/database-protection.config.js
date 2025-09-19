/**
 * 🛡️ DATABASE PROTECTION CONFIGURATION
 */

export const PROTECTION_CONFIG = {
  // Production database indicators
  PRODUCTION_INDICATORS: [
    'railway.app',
    'rlwy.net', 
    'nozomi.proxy.rlwy.net'
  ],

  // Commands that are NEVER allowed on production
  BLOCKED_COMMANDS: [
    'prisma db push',
    'prisma migrate reset', 
    'DROP TABLE',
    'TRUNCATE',
    'DELETE FROM'
  ],

  // Commands that require backup first
  BACKUP_REQUIRED_COMMANDS: [
    'prisma migrate dev',
    'prisma migrate deploy',
    'prisma db seed'
  ],

  // Maximum number of backups to keep
  MAX_BACKUPS: 10,

  // Backup directory
  BACKUP_DIR: './backups',

  // Enable automatic backups before risky operations
  AUTO_BACKUP_ENABLED: true,

  // Enable pre-commit hooks
  PRE_COMMIT_PROTECTION: true,

  // Require confirmation for production operations
  PRODUCTION_CONFIRMATION_REQUIRED: true
};
