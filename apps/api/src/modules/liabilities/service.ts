import { errors } from '@/core/error-handler.js';
import { log } from '@/core/logger.js';
import { prisma } from '@/core/prisma.js';
// Liability type removed as not exported from @prisma/client
import type {
  CreateLiabilityRequest,
  GetLiabilitiesQuery,
  LiabilityResponse,
  UpdateLiabilityRequest,
} from './schema.js';

export class LiabilitiesService {
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
        filtered[key] = value;
      }
    }
    return filtered;
  }

  /**
   * Create a new liability
   */
  async createLiability(data: CreateLiabilityRequest, userId?: string): Promise<LiabilityResponse> {
    const liability = await prisma.liability.create({
      data: {
        name: data.name,
        description: this.toNullable(data.description),
        currentBalance: data.currentBalance,
        interestRate: this.toNullable(data.interestRate),
        maturityDate: this.toNullable(data.maturityDate),
      },
    });

    log.info('Liability created', { liabilityId: liability.id, createdBy: userId });

    return this.formatLiabilityResponse(liability);
  }

  /**
   * Get all liabilities with pagination and search
   */
  async getLiabilities(query: GetLiabilitiesQuery): Promise<{
    liabilities: LiabilityResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalBalance: number;
      averageInterestRate: number;
      count: number;
    };
  }> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get total count and liabilities
    const [total, liabilities] = await Promise.all([
      prisma.liability.count({ where }),
      prisma.liability.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    // Calculate summary
    const allLiabilities = await prisma.liability.findMany({ where });
    const totalBalance = allLiabilities.reduce(
      (sum, liability) => sum + liability.currentBalance,
      0
    );
    const averageInterestRate =
      allLiabilities.length > 0
        ? allLiabilities
            .filter(l => l.interestRate !== null)
            .reduce((sum, l) => sum + (l.interestRate ?? 0), 0) /
          allLiabilities.filter(l => l.interestRate !== null).length
        : 0;

    return {
      liabilities: liabilities.map(liability => this.formatLiabilityResponse(liability)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalBalance,
        averageInterestRate: averageInterestRate ?? 0,
        count: allLiabilities.length,
      },
    };
  }

  /**
   * Get liability by ID
   */
  async getLiabilityById(id: string): Promise<LiabilityResponse> {
    const liability = await prisma.liability.findUnique({
      where: { id },
    });

    if (!liability) {
      throw errors.notFound('Liability not found');
    }

    return this.formatLiabilityResponse(liability);
  }

  /**
   * Update liability
   */
  async updateLiability(
    id: string,
    data: UpdateLiabilityRequest,
    userId?: string
  ): Promise<LiabilityResponse> {
    const existingLiability = await prisma.liability.findUnique({
      where: { id },
    });

    if (!existingLiability) {
      throw errors.notFound('Liability not found');
    }

    const updateData = this.filterUpdateData({
      ...data,
      description: data.description !== undefined ? this.toNullable(data.description) : undefined,
      interestRate:
        data.interestRate !== undefined ? this.toNullable(data.interestRate) : undefined,
      maturityDate:
        data.maturityDate !== undefined ? this.toNullable(data.maturityDate) : undefined,
    });

    const liability = await prisma.liability.update({
      where: { id },
      data: updateData,
    });

    log.info('Liability updated', { liabilityId: id, updatedBy: userId });

    return this.formatLiabilityResponse(liability);
  }

  /**
   * Delete liability
   */
  async deleteLiability(id: string, userId?: string): Promise<void> {
    const existingLiability = await prisma.liability.findUnique({
      where: { id },
    });

    if (!existingLiability) {
      throw errors.notFound('Liability not found');
    }

    await prisma.liability.delete({
      where: { id },
    });

    log.info('Liability deleted', { liabilityId: id, deletedBy: userId });
  }

  /**
   * Get liabilities summary
   */
  async getLiabilitiesSummary(): Promise<{
    totalBalance: number;
    averageInterestRate: number;
    count: number;
    upcomingMaturity: LiabilityResponse[];
  }> {
    const liabilities = await prisma.liability.findMany();

    const totalBalance = liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0);
    const withInterestRate = liabilities.filter(l => l.interestRate !== null);
    const averageInterestRate =
      withInterestRate.length > 0
        ? withInterestRate.reduce((sum, l) => sum + (l.interestRate ?? 0), 0) /
          withInterestRate.length
        : 0;

    // Get liabilities maturing in the next 6 months
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const upcomingMaturity = liabilities
      .filter(l => l.maturityDate && l.maturityDate <= sixMonthsFromNow)
      .sort((a, b) => (a.maturityDate?.getTime() ?? 0) - (b.maturityDate?.getTime() ?? 0))
      .map(liability => this.formatLiabilityResponse(liability));

    return {
      totalBalance,
      averageInterestRate,
      count: liabilities.length,
      upcomingMaturity,
    };
  }

  /**
   * Format liability response
   */
  private formatLiabilityResponse(liability: Record<string, unknown>): LiabilityResponse {
    return {
      id: liability.id as string,
      name: liability.name as string,
      description: liability.description as string | null,
      currentBalance: liability.currentBalance as number,
      interestRate: liability.interestRate as number | null,
      maturityDate: liability.maturityDate as Date | null,
      createdAt: liability.createdAt as Date,
      updatedAt: liability.updatedAt as Date,
    };
  }
}

export const liabilitiesService = new LiabilitiesService();
