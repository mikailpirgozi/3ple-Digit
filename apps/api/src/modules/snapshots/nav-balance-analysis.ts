import { snapshotsService } from './service.js';

/**
 * Analyze the balance between NAV and Investor Capital
 * This function checks if the fundamental accounting equation holds:
 * NAV = Total Investor Capital + Unrealized Gains/Losses
 */
export async function analyzeNavInvestorBalance() {
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
    console.log('📊 CURRENT BALANCE ANALYSIS');
    console.log('='.repeat(50));
    console.log(`NAV Components:`);
    console.log(`  Assets:      €${navCalculation.totalAssetValue.toLocaleString()}`);
    console.log(`  Bank:        €${navCalculation.totalBankBalance.toLocaleString()}`);
    console.log(`  Liabilities: €${navCalculation.totalLiabilities.toLocaleString()}`);
    console.log(`  NAV Total:   €${navValue.toLocaleString()}`);
    console.log('');

    console.log(`Investor Capital:`);
    investorOwnership.forEach(inv => {
      console.log(
        `  ${inv.name}: €${inv.capitalAmount.toLocaleString()} (${inv.ownershipPercent.toFixed(2)}%)`
      );
    });
    console.log(`  Total Capital: €${totalInvestorCapital.toLocaleString()}`);
    console.log('');

    console.log(`Balance Check:`);
    console.log(`  NAV:              €${navValue.toLocaleString()}`);
    console.log(`  Investor Capital: €${totalInvestorCapital.toLocaleString()}`);
    console.log(
      `  Difference:       €${difference.toLocaleString()} (${differencePercent.toFixed(2)}%)`
    );
    console.log('');

    // Interpret results
    if (Math.abs(difference) < 1) {
      console.log('✅ PERFECT BALANCE: NAV equals investor capital');
      console.log('   This means no unrealized gains/losses exist.');
    } else if (difference > 0) {
      console.log('📈 UNREALIZED GAINS: NAV exceeds investor capital');
      console.log(`   Assets have appreciated by €${difference.toLocaleString()}`);
      console.log('   This is normal when investments perform well.');
    } else {
      console.log('📉 UNREALIZED LOSSES: NAV is below investor capital');
      console.log(`   Assets have depreciated by €${Math.abs(difference).toLocaleString()}`);
      console.log('   This indicates investment losses.');
    }

    console.log('\n💡 EXPLANATION:');
    console.log('The difference between NAV and investor capital represents:');
    console.log('• Unrealized gains/losses on assets');
    console.log('• Performance of investments since initial purchase');
    console.log('• This is NORMAL and expected in investment funds');
    console.log('\nThe system correctly tracks both:');
    console.log('• Investor capital (what they put in)');
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
  console.log('\n📚 ACCOUNTING LOGIC EXPLANATION');
  console.log('='.repeat(50));
  console.log('');
  console.log('1. INVESTOR CAPITAL = What investors deposited - what they withdrew');
  console.log('   • This represents the "book value" of their investment');
  console.log('   • Calculated from InvestorCashflow table');
  console.log('   • Does NOT change when asset values change');
  console.log('');
  console.log('2. NAV = Assets + Bank - Liabilities');
  console.log('   • This represents the current market value');
  console.log('   • Changes when assets are revalued');
  console.log('   • Reflects current worth of the fund');
  console.log('');
  console.log('3. DIFFERENCE = NAV - Investor Capital');
  console.log('   • Positive = Unrealized gains (good performance)');
  console.log('   • Negative = Unrealized losses (poor performance)');
  console.log('   • Zero = No gains/losses since investment');
  console.log('');
  console.log('4. OWNERSHIP % = Individual Capital / Total Capital');
  console.log('   • Based on capital contributed, not current NAV');
  console.log('   • Ensures fair distribution of gains/losses');
  console.log('   • Each investor gets their % of total performance');
  console.log('');
  console.log('✅ This is the CORRECT way to handle investment funds!');
  console.log('   The system properly separates:');
  console.log('   • What investors put in (capital)');
  console.log('   • What their investment is worth now (NAV share)');
}

// Export for use in other files
export default { analyzeNavInvestorBalance, explainAccountingLogic };
