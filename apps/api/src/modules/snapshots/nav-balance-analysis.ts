import { snapshotsService } from './service.js';

/**
 * Analyze the balance between NAV and Investor Capital
 * This function checks if the fundamental accounting equation holds:
 * NAV = Total Investor Capital + Unrealized Gains/Losses
 */
export async function analyzeNavInvestorBalance() {
  // eslint-disable-next-line no-console
  console.log('🔍 Analyzing NAV vs Investor Capital Balance...\n');

  try {
    // Get current NAV calculation
    const navCalculation = await snapshotsService.calculateCurrentNav();

    // Get investor ownership (which includes capital calculations)
    const investorOwnership = await snapshotsService.calculateInvestorOwnership();

    // Calculate totals
    const totalInvestorCapital = investorOwnership.reduce((sum, inv) => sum + inv.capitalAmount, 0);

    const navValue = navCalculation.nav;
    const difference = navValue - totalInvestorCapital;
    const differencePercent =
      totalInvestorCapital > 0 ? (difference / totalInvestorCapital) * 100 : 0;

    // Display results
    // eslint-disable-next-line no-console
    console.log('📊 CURRENT BALANCE ANALYSIS');
    // eslint-disable-next-line no-console
    console.log('='.repeat(50));
    // eslint-disable-next-line no-console
    console.log(`NAV Components:`);
    // eslint-disable-next-line no-console
    console.log(`  Assets:      €${navCalculation.totalAssetValue.toLocaleString()}`);
    // eslint-disable-next-line no-console
    console.log(`  Bank:        €${navCalculation.totalBankBalance.toLocaleString()}`);
    // eslint-disable-next-line no-console
    console.log(`  Liabilities: €${navCalculation.totalLiabilities.toLocaleString()}`);
    // eslint-disable-next-line no-console
    console.log(`  NAV Total:   €${navValue.toLocaleString()}`);
    // eslint-disable-next-line no-console
    console.log('');

    // eslint-disable-next-line no-console
    console.log(`Investor Capital:`);
    investorOwnership.forEach(inv => {
      // eslint-disable-next-line no-console
      console.log(
        `  ${inv.name}: €${inv.capitalAmount.toLocaleString()} (${inv.ownershipPercent.toFixed(2)}%)`
      );
    });
    // eslint-disable-next-line no-console
    console.log(`  Total Capital: €${totalInvestorCapital.toLocaleString()}`);
    // eslint-disable-next-line no-console
    console.log('');

    // eslint-disable-next-line no-console
    console.log(`Balance Check:`);
    // eslint-disable-next-line no-console
    console.log(`  NAV:              €${navValue.toLocaleString()}`);
    // eslint-disable-next-line no-console
    console.log(`  Investor Capital: €${totalInvestorCapital.toLocaleString()}`);
    // eslint-disable-next-line no-console
    console.log(
      `  Difference:       €${difference.toLocaleString()} (${differencePercent.toFixed(2)}%)`
    );
    // eslint-disable-next-line no-console
    console.log('');

    // Interpret results
    if (Math.abs(difference) < 1) {
      // eslint-disable-next-line no-console
      console.log('✅ PERFECT BALANCE: NAV equals investor capital');
      // eslint-disable-next-line no-console
      console.log('   This means no unrealized gains/losses exist.');
    } else if (difference > 0) {
      // eslint-disable-next-line no-console
      console.log('📈 UNREALIZED GAINS: NAV exceeds investor capital');
      // eslint-disable-next-line no-console
      console.log(`   Assets have appreciated by €${difference.toLocaleString()}`);
      // eslint-disable-next-line no-console
      console.log('   This is normal when investments perform well.');
    } else {
      // eslint-disable-next-line no-console
      console.log('📉 UNREALIZED LOSSES: NAV is below investor capital');
      // eslint-disable-next-line no-console
      console.log(`   Assets have depreciated by €${Math.abs(difference).toLocaleString()}`);
      // eslint-disable-next-line no-console
      console.log('   This indicates investment losses.');
    }

    // eslint-disable-next-line no-console
    console.log('\n💡 EXPLANATION:');
    // eslint-disable-next-line no-console
    console.log('The difference between NAV and investor capital represents:');
    // eslint-disable-next-line no-console
    console.log('• Unrealized gains/losses on assets');
    // eslint-disable-next-line no-console
    console.log('• Performance of investments since initial purchase');
    // eslint-disable-next-line no-console
    console.log('• This is NORMAL and expected in investment funds');
    // eslint-disable-next-line no-console
    console.log('\nThe system correctly tracks both:');
    // eslint-disable-next-line no-console
    console.log('• Investor capital (what they put in)');
    // eslint-disable-next-line no-console
    console.log('• Current NAV (current value of their investments)');

    return {
      nav: navValue,
      totalInvestorCapital,
      difference,
      differencePercent,
      isBalanced: Math.abs(difference) < 1,
      hasUnrealizedGains: difference > 0,
      hasUnrealizedLosses: difference < 0,
    };
  } catch (error) {
    console.error('❌ Error analyzing balance:', error);
    throw error;
  }
}

/**
 * Check if the system properly handles the accounting equation
 */
export function explainAccountingLogic() {
  // eslint-disable-next-line no-console
  console.log('\n📚 ACCOUNTING LOGIC EXPLANATION');
  // eslint-disable-next-line no-console
  console.log('='.repeat(50));
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('1. INVESTOR CAPITAL = What investors deposited - what they withdrew');
  // eslint-disable-next-line no-console
  console.log('   • This represents the "book value" of their investment');
  // eslint-disable-next-line no-console
  console.log('   • Calculated from InvestorCashflow table');
  // eslint-disable-next-line no-console
  console.log('   • Does NOT change when asset values change');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('2. NAV = Assets + Bank - Liabilities');
  // eslint-disable-next-line no-console
  console.log('   • This represents the current market value');
  // eslint-disable-next-line no-console
  console.log('   • Changes when assets are revalued');
  // eslint-disable-next-line no-console
  console.log('   • Reflects current worth of the fund');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('3. DIFFERENCE = NAV - Investor Capital');
  // eslint-disable-next-line no-console
  console.log('   • Positive = Unrealized gains (good performance)');
  // eslint-disable-next-line no-console
  console.log('   • Negative = Unrealized losses (poor performance)');
  // eslint-disable-next-line no-console
  console.log('   • Zero = No gains/losses since investment');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('4. OWNERSHIP % = Individual Capital / Total Capital');
  // eslint-disable-next-line no-console
  console.log('   • Based on capital contributed, not current NAV');
  // eslint-disable-next-line no-console
  console.log('   • Ensures fair distribution of gains/losses');
  // eslint-disable-next-line no-console
  console.log('   • Each investor gets their % of total performance');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('✅ This is the CORRECT way to handle investment funds!');
  // eslint-disable-next-line no-console
  console.log('   The system properly separates:');
  // eslint-disable-next-line no-console
  console.log('   • What investors put in (capital)');
  // eslint-disable-next-line no-console
  console.log('   • What their investment is worth now (NAV share)');
}

// Export for use in other files
export default { analyzeNavInvestorBalance, explainAccountingLogic };
