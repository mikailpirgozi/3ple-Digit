import { log } from '@/core/logger.js';
import { prisma } from '@/core/prisma.js';
import type {
  CashflowReport,
  ExportCsvRequest,
  GetCashflowReportQuery,
  GetInvestorReportQuery,
  GetPerformanceReportQuery,
  GetPortfolioReportQuery,
  InvestorReport,
  PerformanceReport,
  PortfolioReport,
} from './schema.js';

export class ReportsService {
  /**
   * Generate portfolio report
   */
  async getPortfolioReport(query: GetPortfolioReportQuery): Promise<PortfolioReport> {
    const { dateFrom, dateTo, groupBy } = query;

    // Build date filter
    const dateFilter = this.buildDateFilter(dateFrom, dateTo);

    // Get assets
    const assets = await prisma.asset.findMany({
      ...(dateFilter && { where: { createdAt: dateFilter } }),
    });

    // Calculate total value for active assets only
    const activeAssets = assets.filter(asset => asset.status !== 'SOLD');
    const totalValue = activeAssets.reduce((sum, asset) => {
      const value = asset.currentValue || 0;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    const totalCount = assets.length;

    // Group by type (active assets only)
    const typeGroups = new Map<string, { count: number; totalValue: number }>();
    activeAssets.forEach(asset => {
      if (!typeGroups.has(asset.type)) {
        typeGroups.set(asset.type, { count: 0, totalValue: 0 });
      }
      const group = typeGroups.get(asset.type)!;
      group.count++;
      const value = asset.currentValue || 0;
      group.totalValue += isNaN(value) ? 0 : value;
    });

    const byType = Array.from(typeGroups.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      totalValue: data.totalValue,
      percentage:
        totalValue > 0 && !isNaN(totalValue) && !isNaN(data.totalValue)
          ? (data.totalValue / totalValue) * 100
          : 0,
    }));

    // Get top assets (active only)
    const topAssets = activeAssets
      .sort((a, b) => {
        const aValue = a.currentValue || 0;
        const bValue = b.currentValue || 0;
        return (isNaN(bValue) ? 0 : bValue) - (isNaN(aValue) ? 0 : aValue);
      })
      .slice(0, 10)
      .map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        currentValue: isNaN(asset.currentValue) ? 0 : asset.currentValue,
      }));

    // Group by month if requested
    let byMonth;
    if (groupBy === 'month') {
      const monthGroups = new Map<string, { totalValue: number; count: number }>();
      assets.forEach(asset => {
        const month = asset.createdAt.toISOString().substring(0, 7); // YYYY-MM
        if (!monthGroups.has(month)) {
          monthGroups.set(month, { totalValue: 0, count: 0 });
        }
        const group = monthGroups.get(month)!;
        group.totalValue += asset.currentValue;
        group.count++;
      });

      byMonth = Array.from(monthGroups.entries()).map(([month, data]) => ({
        month,
        totalValue: data.totalValue,
        count: data.count,
      }));
    }

    // Get sold assets with PnL calculation
    const soldAssets = assets
      .filter(asset => asset.status === 'SOLD')
      .map(asset => {
        const pnl =
          asset.salePrice && asset.acquiredPrice ? asset.salePrice - asset.acquiredPrice : 0;
        const pnlPercent =
          asset.acquiredPrice && asset.acquiredPrice > 0 ? (pnl / asset.acquiredPrice) * 100 : 0;

        return {
          ...asset,
          pnl,
          pnlPercent,
        };
      });

    return {
      totalAssetValue: totalValue, // Match integration test expectations
      totalValue, // Keep for backward compatibility
      totalCount,
      activeAssets: activeAssets.map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        currentValue: asset.currentValue,
        status: asset.status,
      })),
      soldAssets,
      // Frontend expects assetsByType with value field
      assetsByType: byType.map(item => ({
        type: item.type,
        count: item.count,
        value: item.totalValue,
        percentage: item.percentage,
      })),
      byType, // Keep for backward compatibility
      byMonth,
      // Frontend expects topAssets with value field
      topAssets: topAssets.map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        value: isNaN(asset.currentValue) ? 0 : asset.currentValue,
      })),
    };
  }

  /**
   * Generate investor report
   */
  async getInvestorReport(query: GetInvestorReportQuery): Promise<InvestorReport> {
    const { investorId, dateFrom, dateTo } = query;

    // Build filters
    const where: any = {};
    if (investorId) {
      where.id = investorId;
    }

    const cashflowWhere: any = {};
    if (dateFrom || dateTo) {
      cashflowWhere.date = this.buildDateFilter(dateFrom, dateTo);
    }

    // Get investors with cashflows
    const investors = await prisma.investor.findMany({
      where,
      include: {
        cashflows: {
          where: cashflowWhere,
          select: {
            type: true,
            amount: true,
            date: true,
          },
        },
      },
    });

    const investorData = investors.map(investor => {
      const totalDeposits = investor.cashflows
        .filter(cf => cf.type === 'DEPOSIT')
        .reduce((sum, cf) => sum + cf.amount, 0);

      const totalWithdrawals = investor.cashflows
        .filter(cf => cf.type === 'WITHDRAWAL')
        .reduce((sum, cf) => sum + cf.amount, 0);

      const capitalAmount = totalDeposits - totalWithdrawals;

      const lastActivity =
        investor.cashflows.length > 0
          ? investor.cashflows.reduce(
              (latest, cf) => (cf.date > latest ? cf.date : latest),
              investor.cashflows[0]!.date
            )
          : null;

      return {
        id: investor.id,
        name: investor.name,
        email: investor.email,
        totalDeposits,
        totalWithdrawals,
        capitalAmount,
        ownershipPercent: 0, // Will be calculated below
        lastActivity,
      };
    });

    // Calculate ownership percentages
    const totalCapital = investorData.reduce((sum, inv) => sum + inv.capitalAmount, 0);
    investorData.forEach(investor => {
      investor.ownershipPercent =
        totalCapital > 0 ? (investor.capitalAmount / totalCapital) * 100 : 0;
    });

    // Create capital distribution
    const capitalRanges = [
      { min: 0, max: 10000, label: '€0 - €10k' },
      { min: 10000, max: 50000, label: '€10k - €50k' },
      { min: 50000, max: 100000, label: '€50k - €100k' },
      { min: 100000, max: 500000, label: '€100k - €500k' },
      { min: 500000, max: Infinity, label: '€500k+' },
    ];

    const capitalDistribution = capitalRanges.map(range => {
      const count = investorData.filter(
        inv => inv.capitalAmount >= range.min && inv.capitalAmount < range.max
      ).length;

      return {
        range: range.label,
        count,
        percentage: investorData.length > 0 ? (count / investorData.length) * 100 : 0,
      };
    });

    return {
      totalInvestors: investorData.length,
      totalCapital,
      averageCapital: investorData.length > 0 ? totalCapital / investorData.length : 0,
      investors: investorData,
      capitalDistribution,
    };
  }

  /**
   * Generate performance report
   */
  async getPerformanceReport(query: GetPerformanceReportQuery): Promise<PerformanceReport> {
    const { dateFrom, dateTo } = query;

    // Get snapshots
    const dateFilter = this.buildDateFilter(dateFrom, dateTo);
    const snapshots = await prisma.periodSnapshot.findMany({
      ...(dateFilter && { where: { date: dateFilter } }),
      orderBy: { date: 'desc' },
    });

    const currentNav = snapshots.length > 0 ? snapshots[0]!.nav : 0;
    const previousNav = snapshots.length > 1 ? snapshots[1]!.nav : null;
    const navChange = previousNav ? currentNav - previousNav : null;
    const navChangePercent =
      previousNav && previousNav !== 0 ? ((currentNav - previousNav) / previousNav) * 100 : null;

    // Get current totals
    const assets = await prisma.asset.findMany({
      include: {
        events: {
          orderBy: { date: 'desc' },
        },
      },
    });
    const liabilities = await prisma.liability.findMany();
    const bankBalances = await prisma.bankBalance.findMany({
      orderBy: { date: 'desc' },
    });

    // Get latest bank balances per account
    const latestBankBalances = new Map<string, any>();
    bankBalances.forEach(balance => {
      const key = `${balance.accountName}-${balance.bankName || 'unknown'}`;
      if (!latestBankBalances.has(key) || latestBankBalances.get(key).date < balance.date) {
        latestBankBalances.set(key, balance);
      }
    });

    const totalAssets = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + liability.currentBalance,
      0
    );
    const totalBankBalance = Array.from(latestBankBalances.values()).reduce(
      (sum, balance) => sum + balance.amount,
      0
    );

    // Calculate PnL
    let totalUnrealizedPnL = 0;
    let totalRealizedPnL = 0;

    assets.forEach(asset => {
      if (asset.status === 'SOLD' && asset.salePrice && asset.acquiredPrice) {
        // Realized PnL from sold assets
        totalRealizedPnL += asset.salePrice - asset.acquiredPrice;
      } else {
        // Unrealized PnL from active assets
        const acquiredPrice = asset.acquiredPrice || asset.currentValue;
        totalUnrealizedPnL += asset.currentValue - acquiredPrice;
      }
    });

    // Performance fees analysis
    const performanceFeeSnapshots = snapshots.filter(
      s => s.totalPerformanceFee && s.totalPerformanceFee > 0
    );
    const totalPerformanceFees = performanceFeeSnapshots.reduce(
      (sum, s) => sum + (s.totalPerformanceFee || 0),
      0
    );
    const averagePerformanceFeeRate =
      performanceFeeSnapshots.length > 0
        ? performanceFeeSnapshots.reduce((sum, s) => sum + (s.performanceFeeRate || 0), 0) /
          performanceFeeSnapshots.length
        : 0;

    const performanceFeesByPeriod = performanceFeeSnapshots.map(snapshot => ({
      period: snapshot.date.toISOString().substring(0, 7), // YYYY-MM
      amount: snapshot.totalPerformanceFee || 0,
      rate: snapshot.performanceFeeRate || 0,
    }));

    // Count sold assets
    const soldAssetsCount = assets.filter(asset => asset.status === 'SOLD').length;

    return {
      currentNav,
      previousNav,
      navChange,
      navChangePercent,
      totalAssets,
      totalLiabilities,
      totalBankBalance,
      totalUnrealizedPnL,
      totalRealizedPnL,
      soldAssetsCount,
      snapshots: snapshots.map(s => ({
        date: s.date,
        nav: s.nav,
        totalAssetValue: s.totalAssetValue,
        totalBankBalance: s.totalBankBalance,
        totalLiabilities: s.totalLiabilities,
      })),
      performanceFees: {
        totalCollected: totalPerformanceFees,
        averageRate: averagePerformanceFeeRate,
        byPeriod: performanceFeesByPeriod,
      },
    };
  }

  /**
   * Generate cashflow report
   */
  async getCashflowReport(query: GetCashflowReportQuery): Promise<CashflowReport> {
    const { dateFrom, dateTo, groupBy } = query;

    // Get investor cashflows
    const dateFilter = this.buildDateFilter(dateFrom, dateTo);
    const cashflows = await prisma.investorCashflow.findMany({
      ...(dateFilter && { where: { date: dateFilter } }),
      include: {
        investor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Get asset events (payments)
    const assetEvents = await prisma.assetEvent.findMany({
      where: {
        type: { in: ['PAYMENT_IN', 'PAYMENT_OUT'] },
        ...(dateFrom || dateTo ? { date: this.buildDateFilter(dateFrom, dateTo) } : {}),
      },
      include: {
        asset: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate totals
    const deposits = cashflows
      .filter(cf => cf.type === 'DEPOSIT')
      .reduce((sum, cf) => sum + cf.amount, 0);
    const withdrawals = cashflows
      .filter(cf => cf.type === 'WITHDRAWAL')
      .reduce((sum, cf) => sum + cf.amount, 0);
    const assetPaymentsIn = assetEvents
      .filter(ae => ae.type === 'PAYMENT_IN')
      .reduce((sum, ae) => sum + ae.amount, 0);
    const assetPaymentsOut = assetEvents
      .filter(ae => ae.type === 'PAYMENT_OUT')
      .reduce((sum, ae) => sum + Math.abs(ae.amount), 0);

    const totalInflows = deposits + assetPaymentsIn;
    const totalOutflows = withdrawals + assetPaymentsOut;
    const netCashflow = totalInflows - totalOutflows;

    // Group by period
    const periodGroups = new Map<string, { inflows: number; outflows: number }>();

    [...cashflows, ...assetEvents].forEach(item => {
      let period: string;
      const date = item.date;

      switch (groupBy) {
        case 'month':
          period = date.toISOString().substring(0, 7); // YYYY-MM
          break;
        case 'quarter': {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          period = `${date.getFullYear()}-Q${quarter}`;
          break;
        }
        case 'year':
          period = date.getFullYear().toString();
          break;
        default:
          period = date.toISOString().substring(0, 7);
      }

      if (!periodGroups.has(period)) {
        periodGroups.set(period, { inflows: 0, outflows: 0 });
      }

      const group = periodGroups.get(period)!;

      // Type guard to distinguish between cashflows and asset events
      if ('investorId' in item) {
        // Cashflow
        if (item.type === 'DEPOSIT') {
          group.inflows += item.amount;
        } else {
          group.outflows += item.amount;
        }
      } else {
        // Asset event
        if (item.type === 'PAYMENT_IN') {
          group.inflows += item.amount;
        } else {
          group.outflows += Math.abs(item.amount);
        }
      }
    });

    const byPeriod = Array.from(periodGroups.entries()).map(([period, data]) => ({
      period,
      inflows: data.inflows,
      outflows: data.outflows,
      netFlow: data.inflows - data.outflows,
    }));

    // Top inflows and outflows
    const topInflows = [
      ...cashflows
        .filter(cf => cf.type === 'DEPOSIT')
        .map(cf => ({
          source: `Deposit from investor`, // cf.investor.name not available
          amount: cf.amount,
          date: cf.date,
        })),
      ...assetEvents
        .filter(ae => ae.type === 'PAYMENT_IN')
        .map(ae => ({
          source: `Payment from ${ae.asset.name}`,
          amount: ae.amount,
          date: ae.date,
        })),
    ]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    const topOutflows = [
      ...cashflows
        .filter(cf => cf.type === 'WITHDRAWAL')
        .map(cf => ({
          destination: `Withdrawal to investor`, // cf.investor.name not available
          amount: cf.amount,
          date: cf.date,
        })),
      ...assetEvents
        .filter(ae => ae.type === 'PAYMENT_OUT')
        .map(ae => ({
          destination: `Payment for ${ae.asset.name}`,
          amount: Math.abs(ae.amount),
          date: ae.date,
        })),
    ]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return {
      totalInflows,
      totalOutflows,
      netCashflow,
      byPeriod,
      byType: {
        deposits,
        withdrawals,
        assetPayments: assetPaymentsIn,
        expenses: assetPaymentsOut,
      },
      topInflows,
      topOutflows,
    };
  }

  /**
   * Export report data as CSV
   */
  async exportCsv(data: ExportCsvRequest, userId?: string): Promise<string> {
    const { reportType, dateFrom, dateTo } = data;
    // const { filters } = data; // Unused for now

    let csvData: string;

    switch (reportType) {
      case 'portfolio': {
        const portfolioReport = await this.getPortfolioReport({
          dateFrom,
          dateTo,
          groupBy: 'type',
        });
        csvData = this.portfolioToCsv(portfolioReport);
        break;
      }

      case 'investors': {
        const investorReport = await this.getInvestorReport({ dateFrom, dateTo });
        csvData = this.investorsToCsv(investorReport);
        break;
      }

      case 'performance': {
        const performanceReport = await this.getPerformanceReport({
          dateFrom,
          dateTo,
          includeProjections: false,
        });
        csvData = this.performanceToCsv(performanceReport);
        break;
      }

      case 'cashflow': {
        const cashflowReport = await this.getCashflowReport({ dateFrom, dateTo, groupBy: 'month' });
        csvData = this.cashflowToCsv(cashflowReport);
        break;
      }

      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    log.info('CSV export generated', { reportType, exportedBy: userId });

    return csvData;
  }

  /**
   * Build date filter for Prisma queries
   */
  private buildDateFilter(dateFrom?: Date, dateTo?: Date) {
    if (!dateFrom && !dateTo) return undefined;

    const filter: any = {};
    if (dateFrom) filter.gte = dateFrom;
    if (dateTo) filter.lte = dateTo;

    return filter;
  }

  /**
   * Convert portfolio report to CSV
   */
  private portfolioToCsv(report: PortfolioReport): string {
    const headers = ['Asset Type', 'Count', 'Total Value', 'Percentage'];
    const rows = report.byType.map(item => [
      item.type,
      item.count.toString(),
      item.totalValue.toFixed(2),
      `${item.percentage.toFixed(2)}%`,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Convert investors report to CSV
   */
  private investorsToCsv(report: InvestorReport): string {
    const headers = [
      'Name',
      'Email',
      'Total Deposits',
      'Total Withdrawals',
      'Capital Amount',
      'Ownership %',
    ];
    const rows = report.investors.map(investor => [
      investor.name,
      investor.email,
      investor.totalDeposits.toFixed(2),
      investor.totalWithdrawals.toFixed(2),
      investor.capitalAmount.toFixed(2),
      `${investor.ownershipPercent.toFixed(2)}%`,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Convert performance report to CSV
   */
  private performanceToCsv(report: PerformanceReport): string {
    const headers = ['Date', 'NAV', 'Total Assets', 'Total Bank Balance', 'Total Liabilities'];
    const rows = report.snapshots.map(snapshot => [
      snapshot.date.toISOString().split('T')[0],
      snapshot.nav.toFixed(2),
      snapshot.totalAssetValue.toFixed(2),
      snapshot.totalBankBalance.toFixed(2),
      snapshot.totalLiabilities.toFixed(2),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Convert cashflow report to CSV
   */
  private cashflowToCsv(report: CashflowReport): string {
    const headers = ['Period', 'Inflows', 'Outflows', 'Net Flow'];
    const rows = report.byPeriod.map(period => [
      period.period,
      period.inflows.toFixed(2),
      period.outflows.toFixed(2),
      period.netFlow.toFixed(2),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export const reportsService = new ReportsService();
