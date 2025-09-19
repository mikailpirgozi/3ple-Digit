import { errors } from '@/core/error-handler';
import { log } from '@/core/logger';
import { prisma } from '@/core/prisma';
// Investor and InvestorCashflow types removed as not exported from @prisma/client
import type {
  CashflowResponse,
  CreateCashflowRequest,
  CreateInvestorRequest,
  GetCashflowsQuery,
  GetInvestorsQuery,
  InvestorResponse,
  UpdateCashflowRequest,
  UpdateInvestorRequest,
} from './schema';

export class InvestorsService {
  /**
   * Helper function to convert undefined to null for Prisma compatibility
   */
  private toNullable<T>(value: T | undefined): T | null {
    return value ?? null;
  }

  /**
   * Helper function to filter out undefined values from update data
   */
  private filterUpdateData<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        (filtered as Record<string, unknown>)[key] = value;
      }
    }
    return filtered;
  }

  /**
   * Create a new investor
   */
  async createInvestor(data: CreateInvestorRequest, userId?: string): Promise<InvestorResponse> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw errors.notFound('User not found');
    }

    // Check if investor profile already exists for this user
    const existingInvestor = await prisma.investor.findUnique({
      where: { userId: data.userId },
    });

    if (existingInvestor) {
      throw errors.conflict('Investor profile already exists for this user');
    }

    const investor = await prisma.investor.create({
      data: {
        userId: data.userId,
        name: data.name,
        email: data.email,
        phone: this.toNullable(data.phone),
        address: this.toNullable(data.address),
        taxId: this.toNullable(data.taxId),
      },
    });

    log.info('Investor created', { investorId: investor.id, createdBy: userId });

    return this.formatInvestorResponse(investor);
  }

  /**
   * Get all investors with pagination and search
   */
  async getInvestors(query: GetInvestorsQuery): Promise<{
    investors: InvestorResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { taxId: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get total count
    const total = await prisma.investor.count({ where });

    // Get all investors for total capital calculation (needed for ownership percentage)
    const allInvestors = await prisma.investor.findMany({
      include: {
        cashflows: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    // Calculate total capital across all investors
    const totalCapital = allInvestors.reduce((sum, investor) => {
      const totalDeposits = investor.cashflows
        .filter(cf => cf.type === 'DEPOSIT')
        .reduce((sum, cf) => sum + cf.amount, 0);

      const totalWithdrawals = investor.cashflows
        .filter(cf => cf.type === 'WITHDRAWAL')
        .reduce((sum, cf) => sum + cf.amount, 0);

      return sum + (totalDeposits - totalWithdrawals);
    }, 0);

    // Get investors with capital calculations
    const investors = await prisma.investor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        cashflows: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    const investorsWithCapital = investors.map(investor => {
      const totalDeposits = investor.cashflows
        .filter(cf => cf.type === 'DEPOSIT')
        .reduce((sum, cf) => sum + cf.amount, 0);

      const totalWithdrawals = investor.cashflows
        .filter(cf => cf.type === 'WITHDRAWAL')
        .reduce((sum, cf) => sum + cf.amount, 0);

      const investorCapital = totalDeposits - totalWithdrawals;
      const ownershipPercent = totalCapital > 0 ? (investorCapital / totalCapital) * 100 : 0;

      return this.formatInvestorResponse({
        ...investor,
        totalCapital: investorCapital,
        totalDeposits,
        totalWithdrawals,
        ownershipPercent,
      });
    });

    return {
      investors: investorsWithCapital,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get investor by ID
   */
  async getInvestorById(id: string): Promise<InvestorResponse> {
    const investor = await prisma.investor.findUnique({
      where: { id },
      include: {
        cashflows: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    if (!investor) {
      throw errors.notFound('Investor not found');
    }

    // Get all investors for total capital calculation (needed for ownership percentage)
    const allInvestors = await prisma.investor.findMany({
      include: {
        cashflows: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    // Calculate total capital across all investors
    const totalCapitalAll = allInvestors.reduce((sum, inv) => {
      const totalDeposits = inv.cashflows
        .filter(cf => cf.type === 'DEPOSIT')
        .reduce((sum, cf) => sum + cf.amount, 0);

      const totalWithdrawals = inv.cashflows
        .filter(cf => cf.type === 'WITHDRAWAL')
        .reduce((sum, cf) => sum + cf.amount, 0);

      return sum + (totalDeposits - totalWithdrawals);
    }, 0);

    const totalDeposits = investor.cashflows
      .filter(cf => cf.type === 'DEPOSIT')
      .reduce((sum, cf) => sum + cf.amount, 0);

    const totalWithdrawals = investor.cashflows
      .filter(cf => cf.type === 'WITHDRAWAL')
      .reduce((sum, cf) => sum + cf.amount, 0);

    const investorCapital = totalDeposits - totalWithdrawals;
    const ownershipPercent = totalCapitalAll > 0 ? (investorCapital / totalCapitalAll) * 100 : 0;

    return this.formatInvestorResponse({
      ...investor,
      totalCapital: investorCapital,
      totalDeposits,
      totalWithdrawals,
      ownershipPercent,
    });
  }

  /**
   * Update investor
   */
  async updateInvestor(
    id: string,
    data: UpdateInvestorRequest,
    userId?: string
  ): Promise<InvestorResponse> {
    const existingInvestor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!existingInvestor) {
      throw errors.notFound('Investor not found');
    }

    const updateData = this.filterUpdateData({
      ...data,
      phone: data.phone !== undefined ? this.toNullable(data.phone) : undefined,
      address: data.address !== undefined ? this.toNullable(data.address) : undefined,
      taxId: data.taxId !== undefined ? this.toNullable(data.taxId) : undefined,
    });

    const investor = await prisma.investor.update({
      where: { id },
      data: updateData,
    });

    log.info('Investor updated', { investorId: id, updatedBy: userId });

    return this.formatInvestorResponse(investor);
  }

  /**
   * Delete investor
   */
  async deleteInvestor(id: string, userId?: string): Promise<void> {
    log.info('Attempting to delete investor', { investorId: id, deletedBy: userId });

    const existingInvestor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!existingInvestor) {
      log.warn('Investor not found for deletion', { investorId: id });
      throw errors.notFound('Investor not found');
    }

    try {
      await prisma.investor.delete({
        where: { id },
      });

      log.info('Investor deleted successfully', { investorId: id, deletedBy: userId });
    } catch (error) {
      log.error('Failed to delete investor', {
        investorId: id,
        deletedBy: userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Create cashflow entry
   */
  async createCashflow(data: CreateCashflowRequest, userId?: string): Promise<CashflowResponse> {
    // Verify investor exists
    const investor = await prisma.investor.findUnique({
      where: { id: data.investorId },
    });

    if (!investor) {
      throw errors.notFound('Investor not found');
    }

    const cashflow = await prisma.investorCashflow.create({
      data: {
        investorId: data.investorId,
        type: data.type,
        amount: data.amount,
        date: data.date,
        note: this.toNullable(data.note),
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

    log.info('Cashflow created', {
      cashflowId: cashflow.id,
      investorId: data.investorId,
      type: data.type,
      amount: data.amount,
      createdBy: userId,
    });

    return this.formatCashflowResponse(cashflow);
  }

  /**
   * Get cashflows with filtering and pagination
   */
  async getCashflows(query: GetCashflowsQuery): Promise<{
    cashflows: CashflowResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, limit, investorId, type, dateFrom, dateTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (investorId) {
      where.investorId = investorId;
    }

    if (type) {
      where.type = type;
    }

    if (dateFrom ?? dateTo) {
      where.date = {} as Record<string, unknown>;
      if (dateFrom) (where.date as Record<string, unknown>).gte = dateFrom;
      if (dateTo) (where.date as Record<string, unknown>).lte = dateTo;
    }

    // Get total count
    const total = await prisma.investorCashflow.count({ where });

    // Get cashflows
    const cashflows = await prisma.investorCashflow.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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

    return {
      cashflows: cashflows.map(cf => this.formatCashflowResponse(cf)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update cashflow entry
   */
  async updateCashflow(
    id: string,
    data: UpdateCashflowRequest,
    userId?: string
  ): Promise<CashflowResponse> {
    const existingCashflow = await prisma.investorCashflow.findUnique({
      where: { id },
    });

    if (!existingCashflow) {
      throw errors.notFound('Cashflow not found');
    }

    const updateData = this.filterUpdateData({
      ...data,
      note: data.note !== undefined ? this.toNullable(data.note) : undefined,
    });

    const cashflow = await prisma.investorCashflow.update({
      where: { id },
      data: updateData,
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

    log.info('Cashflow updated', { cashflowId: id, updatedBy: userId });

    return this.formatCashflowResponse(cashflow);
  }

  /**
   * Delete cashflow entry
   */
  async deleteCashflow(id: string, userId?: string): Promise<void> {
    const existingCashflow = await prisma.investorCashflow.findUnique({
      where: { id },
    });

    if (!existingCashflow) {
      throw errors.notFound('Cashflow not found');
    }

    await prisma.investorCashflow.delete({
      where: { id },
    });

    log.info('Cashflow deleted', { cashflowId: id, deletedBy: userId });
  }

  /**
   * Get investor capital summary
   */
  async getInvestorCapitalSummary(investorId: string): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalCapital: number;
    cashflowCount: number;
  }> {
    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
      include: {
        cashflows: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    if (!investor) {
      throw errors.notFound('Investor not found');
    }

    const totalDeposits = investor.cashflows
      .filter(cf => cf.type === 'DEPOSIT')
      .reduce((sum, cf) => sum + cf.amount, 0);

    const totalWithdrawals = investor.cashflows
      .filter(cf => cf.type === 'WITHDRAWAL')
      .reduce((sum, cf) => sum + cf.amount, 0);

    const totalCapital = totalDeposits - totalWithdrawals;

    return {
      totalDeposits,
      totalWithdrawals,
      totalCapital,
      cashflowCount: investor.cashflows.length,
    };
  }

  /**
   * Format investor response
   */
  private formatInvestorResponse(investor: Record<string, unknown>): InvestorResponse {
    return {
      id: investor.id as string,
      userId: investor.userId as string,
      name: investor.name as string,
      email: investor.email as string,
      phone: investor.phone as string | null,
      address: investor.address as string | null,
      taxId: investor.taxId as string | null,
      createdAt: investor.createdAt as Date,
      updatedAt: investor.updatedAt as Date,
      totalCapital: investor.totalCapital as number,
      totalDeposits: investor.totalDeposits as number,
      totalWithdrawals: investor.totalWithdrawals as number,
      ownershipPercent: investor.ownershipPercent as number | undefined,
    };
  }

  /**
   * Format cashflow response
   */
  private formatCashflowResponse(cashflow: Record<string, unknown>): CashflowResponse {
    return {
      id: cashflow.id as string,
      investorId: cashflow.investorId as string,
      type: cashflow.type as string,
      amount: cashflow.amount as number,
      date: cashflow.date as Date,
      note: cashflow.note as string | null,
      createdAt: cashflow.createdAt as Date,
      updatedAt: cashflow.updatedAt as Date,
      investor: cashflow.investor as { id: string; name: string; email: string } | undefined,
    };
  }
}

export const investorsService = new InvestorsService();
