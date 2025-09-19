#!/usr/bin/env node

/**
 * 🛡️ SAFE PRISMA WRAPPER
 * 
 * Tento wrapper blokuje nebezpečné Prisma príkazy na produkcii
 * a automaticky vytvára zálohy pred zmenami.
 */

import { execSync } from 'child_process';
import DatabaseProtection from './database-protection.js';

const protection = new DatabaseProtection();

const args = process.argv.slice(2);
const command = args.join(' ');

console.log('🛡️  Safe Prisma Wrapper');
console.log(`Command: prisma ${command}`);

// Check if this is a dangerous command
try {
  protection.blockDangerousCommand(`prisma ${command}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

// Handle specific commands safely
if (command.includes('db push')) {
  console.error('🚨 BLOCKED: Use safe migration instead!');
  console.error('Run: node safe-prisma.js migrate "describe_your_change"');
  process.exit(1);
}

if (command.includes('migrate reset')) {
  console.error('🚨 BLOCKED: migrate reset is dangerous on production!');
  console.error('If you really need to reset, contact admin.');
  process.exit(1);
}

// Safe commands that create backups first
const BACKUP_COMMANDS = [
  'migrate dev',
  'migrate deploy',
  'db seed'
];

const needsBackup = BACKUP_COMMANDS.some(cmd => command.includes(cmd));

async function runCommand() {
  try {
    // Create backup for risky commands
    if (needsBackup && protection.isProduction) {
      console.log('🔄 Creating safety backup...');
      await protection.createBackup(`before_${command.replace(/\s+/g, '_')}`);
    }

    // Run the actual Prisma command
    console.log('🔄 Running Prisma command...');
    execSync(`npx prisma ${command}`, { stdio: 'inherit' });
    
    console.log('✅ Command completed successfully!');
    
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    if (needsBackup) {
      console.error('💡 Backup was created before this command - check backups/ folder');
    }
    process.exit(1);
  }
}

runCommand();
