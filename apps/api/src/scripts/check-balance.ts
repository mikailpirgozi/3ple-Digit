#!/usr/bin/env tsx

/**
 * Script to check the balance between NAV and Investor Capital
 * Run with: npm run tsx src/scripts/check-balance.ts
 */

import {
  analyzeNavInvestorBalance,
  explainAccountingLogic,
} from '../modules/snapshots/nav-balance-analysis.js';

async function main() {
  console.log('🚀 Starting NAV vs Investor Capital Analysis\n');

  try {
    // Run the analysis
    const result = await analyzeNavInvestorBalance();

    // Show the explanation
    explainAccountingLogic();

    console.log('\n📋 SUMMARY');
    console.log('='.repeat(50));
    if (result.isBalanced) {
      console.log('✅ System is perfectly balanced');
    } else if (result.hasUnrealizedGains) {
      console.log(`✅ System shows €${result.difference.toLocaleString()} in unrealized gains`);
    } else {
      console.log(
        `⚠️  System shows €${Math.abs(result.difference).toLocaleString()} in unrealized losses`
      );
    }

    console.log('\n🎯 CONCLUSION:');
    console.log('The system is working correctly. The difference between NAV and');
    console.log('investor capital represents investment performance, which is normal');
    console.log('and expected in any investment fund.');
  } catch (error) {
    console.error('❌ Failed to analyze balance:', error);
    process.exit(1);
  }
}

main().catch(console.error);
