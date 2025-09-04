#!/usr/bin/env node

/**
 * Check if production data is still intact
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

// Load .env file manually
function loadEnv() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.error('Could not load .env file');
  }
}

async function checkProductionData() {
  loadEnv();

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('🔍 Checking production database...');
    console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@'));

    const userCount = await prisma.user.count();
    const investorCount = await prisma.investor.count();
    const assetCount = await prisma.asset.count();
    const snapshotCount = await prisma.periodSnapshot.count();

    console.log('\n📊 Production Data Status:');
    console.log(`Users: ${userCount}`);
    console.log(`Investors: ${investorCount}`);
    console.log(`Assets: ${assetCount}`);
    console.log(`Snapshots: ${snapshotCount}`);

    if (userCount > 0) {
      console.log('\n✅ PRODUCTION DATA IS SAFE!');
      console.log('🛡️  Protection system worked correctly');
    } else {
      console.log('\n❌ NO USERS FOUND - Data may have been deleted!');
    }
  } catch (error) {
    console.error('❌ Error checking production data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionData();
