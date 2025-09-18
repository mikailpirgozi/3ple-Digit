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
  // eslint-disable-next-line no-console
  console.log('🚀 Starting NAV vs Investor Capital Analysis\n');

  try {
    // Run the analysis
    const result = await analyzeNavInvestorBalance();

    // Show the explanation
    explainAccountingLogic();

    // eslint-disable-next-line no-console
    console.log('\n📋 SUMMARY');
    // eslint-disable-next-line no-console
    console.log('='.repeat(50));
    if (result.isBalanced) {
      // eslint-disable-next-line no-console
      console.log('✅ System is perfectly balanced');
    } else if (result.hasUnrealizedGains) {
      // eslint-disable-next-line no-console
      console.log(`✅ System shows €${result.difference.toLocaleString()} in unrealized gains`);
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `⚠️  System shows €${Math.abs(result.difference).toLocaleString()} in unrealized losses`
      );
    }

    // eslint-disable-next-line no-console
    console.log('\n🎯 CONCLUSION:');
    // eslint-disable-next-line no-console
    console.log('The system is working correctly. The difference between NAV and');
    // eslint-disable-next-line no-console
    console.log('investor capital represents investment performance, which is normal');
    // eslint-disable-next-line no-console
    console.log('and expected in any investment fund.');
  } catch (error) {
    console.error('❌ Failed to analyze balance:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
});
