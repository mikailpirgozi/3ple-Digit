import { errors } from '@/core/error-handler.js';
import { log } from '@/core/logger.js';
import { prisma } from '@/core/prisma.js';
import type { PeriodSnapshot, InvestorSnapshot } from '@prisma/client';
import type {
  CreateSnapshotRequest,
  GetSnapshotsQuery,
  InvestorOwnership,
  InvestorSnapshotResponse,
  NavCalculation,
  SnapshotResponse,
  UpdateSnapshotRequest,
} from './schema.js';

export class SnapshotsService {
  /**
   * Helper function to convert undefined to null for Prisma compatibility
   */
  private toNullable<T>(value: T | undefined): T | null {
    return value === undefined ? null : value;
  }

  /**
   * Helper function to filter out undefined values from update data
   */
  private filterUpdateData<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        (filtered as any)[key] = value;
      }
    }
    return filtered;
  }

  /**
   * Calculate current NAV (Net Asset Value)
   * NAV = Σ assets + Σ bank_balances - Σ liabilities
   */
  async calculateCurrentNav(): Promise<NavCalculation> {
    // Get all active assets (not sold) with their current values
    const assets = await prisma.asset.findMany({
      where: {
        status: {
          not: 'SOLD',
        },
      },
      select: {
        type: true,
        currentValue: true,
      },
    });

    // Get latest bank balances (group by account and take latest)
    const bankBalances = await prisma.bankBalance.findMany({
      orderBy: { date: 'desc' },
    });

    // Group bank balances by account and take latest
    const latestBankBalances = new Map<string, any>();
    bankBalances.forEach(balance => {
      const key = `${balance.accountName}-${balance.bankName || 'unknown'}`;
      if (!latestBankBalances.has(key) || latestBankBalances.get(key).date < balance.date) {
        latestBankBalances.set(key, balance);
      }
    });

    // Get all liabilities
    const liabilities = await prisma.liability.findMany({
      select: {
        name: true,
        currentBalance: true,
      },
    });

    // Calculate totals
    const totalAssetValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalBankBalance = Array.from(latestBankBalances.values()).reduce(
      (sum, balance) => sum + balance.amount,
      0
    );
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + liability.currentBalance,
      0
    );
    const nav = totalAssetValue + totalBankBalance - totalLiabilities;

    // Create breakdowns
    const assetBreakdown = this.createAssetBreakdown(assets);
    const bankBreakdown = this.createBankBreakdown(Array.from(latestBankBalances.values()));
    const liabilityBreakdown = liabilities.map(liability => ({
      name: liability.name,
      currentBalance: liability.currentBalance,
    }));

    return {
      totalAssetValue,
      totalBankBalance,
      totalLiabilities,
      nav,
      assetBreakdown,
      bankBreakdown,
      liabilityBreakdown,
    };
  }

  /**
   * Calculate investor ownership percentages
   */
  async calculateInvestorOwnership(): Promise<InvestorOwnership[]> {
    const investors = await prisma.investor.findMany({
      include: {
        cashflows: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    const investorOwnerships: InvestorOwnership[] = [];
    let totalCapital = 0;

    // Calculate each investor's capital
    for (const investor of investors) {
      const totalDeposits = investor.cashflows
        .filter(cf => cf.type === 'DEPOSIT')
        .reduce((sum, cf) => sum + cf.amount, 0);

      const totalWithdrawals = investor.cashflows
        .filter(cf => cf.type === 'WITHDRAWAL')
        .reduce((sum, cf) => sum + cf.amount, 0);

      const capitalAmount = totalDeposits - totalWithdrawals;
      totalCapital += capitalAmount;

      investorOwnerships.push({
        investorId: investor.id,
        name: investor.name,
        email: investor.email,
        totalDeposits,
        totalWithdrawals,
        capitalAmount,
        ownershipPercent: 0, // Will be calculated after we have total capital
        performanceFee: null,
      });
    }

    // Calculate ownership percentages
    investorOwnerships.forEach(ownership => {
      ownership.ownershipPercent =
        totalCapital > 0 ? (ownership.capitalAmount / totalCapital) * 100 : 0;
    });

    return investorOwnerships;
  }

  /**
   * Create a new snapshot
   */
  async createSnapshot(data: CreateSnapshotRequest, userId?: string): Promise<SnapshotResponse> {
    // Calculate current NAV
    const navCalculation = await this.calculateCurrentNav();

    // Calculate investor ownership
    const investorOwnerships = await this.calculateInvestorOwnership();

    // Calculate performance fees if rate is provided
    let totalPerformanceFee = null;
    if (data.performanceFeeRate && data.performanceFeeRate > 0) {
      // Simple performance fee calculation (can be enhanced later)
      totalPerformanceFee = navCalculation.nav * (data.performanceFeeRate / 100);
    }

    // Create snapshot and investor snapshots in transaction
    const result = await prisma.$transaction(async tx => {
      // Create the main snapshot
      const snapshot = await tx.periodSnapshot.create({
        data: {
          date: data.date,
          totalAssetValue: navCalculation.totalAssetValue,
          totalBankBalance: navCalculation.totalBankBalance,
          totalLiabilities: navCalculation.totalLiabilities,
          nav: navCalculation.nav,
          performanceFeeRate: this.toNullable(data.performanceFeeRate),
          totalPerformanceFee: this.toNullable(totalPerformanceFee),
        },
      });

      // Create investor snapshots
      const investorSnapshots = [];
      for (const ownership of investorOwnerships) {
        let performanceFee = null;
        if (totalPerformanceFee && data.performanceFeeRate) {
          // Allocate performance fee based on ownership percentage
          performanceFee = totalPerformanceFee * (ownership.ownershipPercent / 100);
        }

        const investorSnapshot = await tx.investorSnapshot.create({
          data: {
            snapshotId: snapshot.id,
            investorId: ownership.investorId,
            capitalAmount: ownership.capitalAmount,
            ownershipPercent: ownership.ownershipPercent,
            performanceFee,
          },
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        investorSnapshots.push(investorSnapshot);
      }

      return { snapshot, investorSnapshots };
    });

    log.info('Snapshot created', {
      snapshotId: result.snapshot.id,
      nav: navCalculation.nav,
      investorCount: investorOwnerships.length,
      createdBy: userId,
    });

    return this.formatSnapshotResponse({
      ...result.snapshot,
      investorSnapshots: result.investorSnapshots,
    });
  }

  /**
   * Get all snapshots with pagination
   */
  async getSnapshots(query: GetSnapshotsQuery): Promise<{
    snapshots: SnapshotResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, limit, dateFrom, dateTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    // Get total count and snapshots
    const [total, snapshots] = await Promise.all([
      prisma.periodSnapshot.count({ where }),
      prisma.periodSnapshot.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          investorSnapshots: {
            include: {
              investor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      snapshots: snapshots.map(snapshot => this.formatSnapshotResponse(snapshot)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get snapshot by ID
   */
  async getSnapshotById(id: string): Promise<SnapshotResponse> {
    const snapshot = await prisma.periodSnapshot.findUnique({
      where: { id },
      include: {
        investorSnapshots: {
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!snapshot) {
      throw errors.notFound('Snapshot not found');
    }

    return this.formatSnapshotResponse(snapshot);
  }

  /**
   * Update snapshot
   */
  async updateSnapshot(
    id: string,
    data: UpdateSnapshotRequest,
    userId?: string
  ): Promise<SnapshotResponse> {
    const existingSnapshot = await prisma.periodSnapshot.findUnique({
      where: { id },
    });

    if (!existingSnapshot) {
      throw errors.notFound('Snapshot not found');
    }

    const updateData = this.filterUpdateData({
      ...data,
      performanceFeeRate:
        data.performanceFeeRate !== undefined
          ? this.toNullable(data.performanceFeeRate)
          : undefined,
    });

    const snapshot = await prisma.periodSnapshot.update({
      where: { id },
      data: updateData,
      include: {
        investorSnapshots: {
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    log.info('Snapshot updated', { snapshotId: id, updatedBy: userId });

    return this.formatSnapshotResponse(snapshot);
  }

  /**
   * Delete snapshot
   */
  async deleteSnapshot(id: string, userId?: string): Promise<void> {
    const existingSnapshot = await prisma.periodSnapshot.findUnique({
      where: { id },
    });

    if (!existingSnapshot) {
      throw errors.notFound('Snapshot not found');
    }

    await prisma.periodSnapshot.delete({
      where: { id },
    });

    log.info('Snapshot deleted', { snapshotId: id, deletedBy: userId });
  }

  /**
   * Get investor snapshots for a specific investor
   */
  async getInvestorSnapshots(investorId: string): Promise<InvestorSnapshotResponse[]> {
    const investorSnapshots = await prisma.investorSnapshot.findMany({
      where: { investorId },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        snapshot: {
          select: {
            id: true,
            date: true,
            nav: true,
          },
        },
      },
      orderBy: { snapshot: { date: 'desc' } },
    });

    return investorSnapshots.map(snapshot => this.formatInvestorSnapshotResponse(snapshot));
  }

  /**
   * Get latest snapshot
   */
  async getLatestSnapshot(): Promise<SnapshotResponse | null> {
    const snapshot = await prisma.periodSnapshot.findFirst({
      orderBy: { date: 'desc' },
      include: {
        investorSnapshots: {
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return snapshot ? this.formatSnapshotResponse(snapshot) : null;
  }

  /**
   * Create asset breakdown by type
   */
  private createAssetBreakdown(assets: Array<{ type: string; currentValue: number }>) {
    const breakdown = new Map<string, { count: number; totalValue: number }>();

    assets.forEach(asset => {
      if (!breakdown.has(asset.type)) {
        breakdown.set(asset.type, { count: 0, totalValue: 0 });
      }
      const current = breakdown.get(asset.type)!;
      current.count++;
      current.totalValue += asset.currentValue;
    });

    return Array.from(breakdown.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      totalValue: data.totalValue,
    }));
  }

  /**
   * Create bank breakdown by currency
   */
  private createBankBreakdown(balances: Array<{ currency: string; amount: number }>) {
    const breakdown = new Map<string, number>();

    balances.forEach(balance => {
      breakdown.set(balance.currency, (breakdown.get(balance.currency) || 0) + balance.amount);
    });

    return Array.from(breakdown.entries()).map(([currency, totalAmount]) => ({
      currency,
      totalAmount,
    }));
  }

  /**
   * Format snapshot response
   */
  private formatSnapshotResponse(
    snapshot: PeriodSnapshot & { investorSnapshots?: InvestorSnapshot[] }
  ): SnapshotResponse {
    return {
      id: snapshot.id,
      date: snapshot.date,
      totalAssetValue: snapshot.totalAssetValue,
      totalBankBalance: snapshot.totalBankBalance,
      totalLiabilities: snapshot.totalLiabilities,
      nav: snapshot.nav,
      performanceFeeRate: snapshot.performanceFeeRate,
      totalPerformanceFee: snapshot.totalPerformanceFee,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      investorSnapshots: snapshot.investorSnapshots
        ?.filter((is: any) => is.investor)
        ?.map((is: any) => ({
          id: is.id,
          investorId: is.investorId,
          capitalAmount: is.capitalAmount,
          ownershipPercent: is.ownershipPercent,
          performanceFee: is.performanceFee,
          investor: is.investor,
        })),
    };
  }

  /**
   * Format investor snapshot response
   */
  private formatInvestorSnapshotResponse(
    investorSnapshot: InvestorSnapshot & {
      investor?: { id: string; name: string; email: string };
      snapshot?: { id: string; date: Date; nav: number };
    }
  ): InvestorSnapshotResponse {
    return {
      id: investorSnapshot.id,
      snapshotId: investorSnapshot.snapshotId,
      investorId: investorSnapshot.investorId,
      capitalAmount: investorSnapshot.capitalAmount,
      ownershipPercent: investorSnapshot.ownershipPercent,
      performanceFee: investorSnapshot.performanceFee,
      createdAt: investorSnapshot.createdAt,
      updatedAt: investorSnapshot.updatedAt,
      investor: investorSnapshot.investor,
      snapshot: investorSnapshot.snapshot,
    };
  }
}

export const snapshotsService = new SnapshotsService();
