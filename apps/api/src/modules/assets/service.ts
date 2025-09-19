import { errors } from '@/core/error-handler.js';
import { log } from '@/core/logger.js';
import { prisma } from '@/core/prisma.js';
import type { Prisma } from '@prisma/client';
// Prisma types handled via any for CI compatibility
import type {
  AssetEventResponse,
  AssetEventTypeEnum,
  AssetResponse,
  CreateAssetEventRequest,
  CreateAssetRequest,
  GetAssetEventsQuery,
  GetAssetsQuery,
  UpdateAssetEventRequest,
  UpdateAssetRequest,
} from './schema.js';

export class AssetsService {
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
   * Create a new asset
   */
  async createAsset(data: CreateAssetRequest, userId?: string): Promise<AssetResponse> {
    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        type: data.type,
        description: this.toNullable(data.description),
        currentValue: data.currentValue,
        acquiredPrice: this.toNullable(data.acquiredPrice),
        acquiredDate: this.toNullable(data.acquiredDate),
        // Loan-specific fields
        loanPrincipal: this.toNullable(data.loanPrincipal),
        interestRate: this.toNullable(data.interestRate),
        interestPeriod: this.toNullable(data.interestPeriod),
        loanStartDate: this.toNullable(data.loanStartDate),
        loanMaturityDate: this.toNullable(data.loanMaturityDate),
        loanStatus: data.type === 'PÔŽIČKY' ? 'ACTIVE' : null,
      },
    });

    log.info('Asset created', { assetId: asset.id, createdBy: userId });

    return this.formatAssetResponse(asset);
  }

  /**
   * Get all assets with pagination and filtering
   */
  async getAssets(query: GetAssetsQuery): Promise<{
    assets: AssetResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, limit, search, q, type, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    // Support both 'search' and 'q' parameters for search
    const searchTerm = search ?? q;
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Only apply type filter if it's not empty
    if (type && type.trim() !== '') {
      where.type = type;
    }

    // Get total count
    const total = await prisma.asset.count({ where });

    // Get assets with event statistics
    const assets = await prisma.asset.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        events: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    const assetsWithStats = assets.map(asset => {
      const eventsCount = asset.events.length;

      const totalInflows = asset.events
        .filter(
          event =>
            ['PAYMENT_IN', 'VALUATION'].includes(event.type) &&
            event.amount != null &&
            event.amount > 0
        )
        .reduce((sum: number, event: { amount: number | null }) => sum + (event.amount ?? 0), 0);

      const totalOutflows = asset.events
        .filter(
          event =>
            (['PAYMENT_OUT', 'CAPEX'].includes(event.type) ||
              (event.amount != null && event.amount < 0)) &&
            event.amount != null
        )
        .reduce(
          (sum: number, event: { amount: number | null }) => sum + Math.abs(event.amount ?? 0),
          0
        );

      return this.formatAssetResponse({
        ...asset,
        eventsCount,
        totalInflows,
        totalOutflows,
      });
    });

    return {
      assets: assetsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get asset by ID
   */
  async getAssetById(id: string): Promise<AssetResponse> {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        events: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    if (!asset) {
      throw errors.notFound('Asset not found');
    }

    const eventsCount = asset.events.length;

    const totalInflows = asset.events
      .filter(
        event =>
          ['PAYMENT_IN', 'VALUATION'].includes(event.type) &&
          event.amount != null &&
          event.amount > 0
      )
      .reduce((sum: number, event: { amount: number | null }) => sum + (event.amount ?? 0), 0);

    const totalOutflows = asset.events
      .filter(
        event =>
          (['PAYMENT_OUT', 'CAPEX'].includes(event.type) ||
            (event.amount != null && event.amount < 0)) &&
          event.amount != null
      )
      .reduce(
        (sum: number, event: { amount: number | null }) => sum + Math.abs(event.amount ?? 0),
        0
      );

    return this.formatAssetResponse({
      ...asset,
      eventsCount,
      totalInflows,
      totalOutflows,
    });
  }

  /**
   * Update asset
   */
  async updateAsset(id: string, data: UpdateAssetRequest, userId?: string): Promise<AssetResponse> {
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      throw errors.notFound('Asset not found');
    }

    const updateData = this.filterUpdateData({
      ...data,
      category: data.category !== undefined ? this.toNullable(data.category) : undefined,
      description: data.description !== undefined ? this.toNullable(data.description) : undefined,
      acquiredPrice:
        data.acquiredPrice !== undefined ? this.toNullable(data.acquiredPrice) : undefined,
      acquiredDate:
        data.acquiredDate !== undefined ? this.toNullable(data.acquiredDate) : undefined,
      salePrice: data.salePrice !== undefined ? this.toNullable(data.salePrice) : undefined,
      saleDate: data.saleDate !== undefined ? this.toNullable(data.saleDate) : undefined,
      // Loan-specific fields
      loanPrincipal: data.loanPrincipal !== undefined ? this.toNullable(data.loanPrincipal) : undefined,
      interestRate: data.interestRate !== undefined ? this.toNullable(data.interestRate) : undefined,
      interestPeriod: data.interestPeriod !== undefined ? this.toNullable(data.interestPeriod) : undefined,
      loanStartDate: data.loanStartDate !== undefined ? this.toNullable(data.loanStartDate) : undefined,
      loanMaturityDate: data.loanMaturityDate !== undefined ? this.toNullable(data.loanMaturityDate) : undefined,
      loanStatus: data.loanStatus !== undefined ? this.toNullable(data.loanStatus) : undefined,
    });

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
    });

    log.info('Asset updated', { assetId: id, updatedBy: userId });

    return this.formatAssetResponse(asset);
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: string, userId?: string): Promise<void> {
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      throw errors.notFound('Asset not found');
    }

    await prisma.asset.delete({
      where: { id },
    });

    log.info('Asset deleted', { assetId: id, deletedBy: userId });
  }

  /**
   * Get validation info for new asset events
   */
  async getAssetEventValidationInfo(assetId: string): Promise<{
    canAddEvents: boolean;
    minDate: Date | null;
    lastEventDate: Date | null;
    lastEventType: string | null;
    isSold: boolean;
    acquiredDate: Date | null;
  }> {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        events: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!asset) {
      throw errors.notFound('Asset not found');
    }

    const isSold = asset.status === 'SOLD';
    const lastEvent = asset.events[0];
    const acquiredDate = asset?.acquiredDate ?? null;
    
    // Determine minimum allowed date
    let minDate: Date | null = null;
    if (lastEvent) {
      // Next event must be on or after the last event (same day allowed)
      minDate = new Date(lastEvent.date);
      // Don't add 1 day - allow same day events
    } else if (acquiredDate) {
      // First event must be on or after acquisition date
      minDate = new Date(acquiredDate);
    }

    return {
      canAddEvents: !isSold,
      minDate,
      lastEventDate: lastEvent?.date ?? null,
      lastEventType: lastEvent?.type ?? null,
      isSold,
      acquiredDate,
    };
  }

  /**
   * Validate asset event date
   */
  private async validateAssetEventDate(assetId: string, eventDate: Date): Promise<void> {
    const validationInfo = await this.getAssetEventValidationInfo(assetId);

    // Check if asset is sold
    if (!validationInfo.canAddEvents) {
      throw errors.badRequest('Cannot add events to sold assets');
    }

    // Check minimum date constraint
    if (validationInfo.minDate && eventDate < validationInfo.minDate) {
      const minDateStr = validationInfo.minDate.toLocaleDateString('sk-SK');
      
      if (validationInfo.lastEventDate) {
        const lastEventDateStr = validationInfo.lastEventDate.toLocaleDateString('sk-SK');
        throw errors.badRequest(
          `Event date must be on or after the last event date (${lastEventDateStr}). Minimum allowed date: ${minDateStr}`
        );
      } else if (validationInfo.acquiredDate) {
        const acquiredDateStr = validationInfo.acquiredDate.toLocaleDateString('sk-SK');
        throw errors.badRequest(
          `Event date must be on or after the asset acquisition date (${acquiredDateStr}). Minimum allowed date: ${minDateStr}`
        );
      }
    }
  }

  /**
   * Create asset event and update current value
   */
  async createAssetEvent(
    data: CreateAssetEventRequest,
    userId?: string
  ): Promise<AssetEventResponse> {
    // Verify asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
    });

    if (!asset) {
      throw errors.notFound('Asset not found');
    }

    // Validate event date
    await this.validateAssetEventDate(data.assetId, data.date);

    // Create event and update asset value in transaction
    const result = await prisma.$transaction(async tx => {
      // Create the event
      const event = await tx.assetEvent.create({
        data: {
          assetId: data.assetId,
          type: data.type,
          amount: data.amount ?? null,
          date: data.date,
          note: this.toNullable(data.note),
          // Loan payment tracking fields
          isPaid: this.toNullable(data.isPaid),
          paymentDate: this.toNullable(data.paymentDate),
          principalAmount: this.toNullable(data.principalAmount),
          interestAmount: this.toNullable(data.interestAmount),
          referencePeriodStart: this.toNullable(data.referencePeriodStart),
          referencePeriodEnd: this.toNullable(data.referencePeriodEnd),
        },
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              type: true,
              loanPrincipal: true,
            },
          },
        },
      });

      // Calculate new value based on asset type and event
      const newValue = await this.calculateNewAssetValueWithLoanSupport(
        tx,
        asset,
        data.type,
        data.amount ?? 0,
        data
      );

      // Update asset based on event type
      const updateData: Record<string, unknown> = { currentValue: newValue };
      
      if (data.type === 'SALE') {
        updateData.status = 'SOLD';
        updateData.salePrice = data.amount ?? 0;
        updateData.saleDate = data.date;
      } else if (data.type === 'LOAN_REPAYMENT') {
        updateData.loanStatus = 'REPAID';
      } else if (data.type === 'DEFAULT') {
        updateData.loanStatus = 'DEFAULTED';
      }

      await tx.asset.update({
        where: { id: data.assetId },
        data: updateData,
      });

      return event;
    });

    log.info('Asset event created', {
      eventId: result.id,
      assetId: data.assetId,
      type: data.type,
      amount: data.amount,
      createdBy: userId,
    });

    return this.formatAssetEventResponse(result);
  }

  /**
   * Get asset events with filtering and pagination
   */
  async getAssetEvents(query: GetAssetEventsQuery): Promise<{
    events: AssetEventResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, limit, assetId, type, dateFrom, dateTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (assetId) {
      where.assetId = assetId;
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
    const total = await prisma.assetEvent.count({ where });

    // Get events
    const events = await prisma.assetEvent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      events: events.map(event => this.formatAssetEventResponse(event)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update asset event
   */
  async updateAssetEvent(
    id: string,
    data: UpdateAssetEventRequest,
    userId?: string
  ): Promise<AssetEventResponse> {
    const existingEvent = await prisma.assetEvent.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!existingEvent) {
      throw errors.notFound('Asset event not found');
    }

    // If date is being updated, validate it
    if (data.date) {
      await this.validateAssetEventDate(existingEvent.assetId, data.date);
    }

    // Update event and recalculate asset value in transaction
    const result = await prisma.$transaction(async tx => {
      // Update the event
      const eventUpdateData = this.filterUpdateData({
        ...data,
        note: data.note !== undefined ? this.toNullable(data.note) : undefined,
      });

      const updatedEvent = await tx.assetEvent.update({
        where: { id },
        data: eventUpdateData,
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      // Recalculate asset value based on all events
      const newValue = await this.recalculateAssetValue(existingEvent.assetId, tx);

      await tx.asset.update({
        where: { id: existingEvent.assetId },
        data: { currentValue: newValue },
      });

      return updatedEvent;
    });

    log.info('Asset event updated', { eventId: id, updatedBy: userId });

    return this.formatAssetEventResponse(result);
  }

  /**
   * Delete asset event
   */
  async deleteAssetEvent(id: string, userId?: string): Promise<void> {
    const existingEvent = await prisma.assetEvent.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!existingEvent) {
      throw errors.notFound('Asset event not found');
    }

    // Delete event and recalculate asset value in transaction
    await prisma.$transaction(async tx => {
      // Delete the event
      await tx.assetEvent.delete({
        where: { id },
      });

      // Check if there are any remaining SALE events for this asset
      const remainingSaleEvents = await tx.assetEvent.findFirst({
        where: {
          assetId: existingEvent.assetId,
          type: 'SALE',
        },
      });

      // Recalculate asset value based on remaining events
      const newValue = await this.recalculateAssetValue(existingEvent.assetId, tx);

      // Prepare update data
      const updateData: Record<string, unknown> = { currentValue: newValue };

      // If we deleted a SALE event and there are no remaining SALE events,
      // reset the asset status to ACTIVE and clear sale-related fields
      if (existingEvent.type === 'SALE' && !remainingSaleEvents) {
        updateData.status = 'ACTIVE';
        updateData.salePrice = null;
        updateData.saleDate = null;
      }

      await tx.asset.update({
        where: { id: existingEvent.assetId },
        data: updateData,
      });
    });

    log.info('Asset event deleted', { eventId: id, deletedBy: userId });
  }

  /**
   * Reset asset from SOLD status to ACTIVE
   * This is useful for assets that were marked as sold but have no SALE events
   */
  async resetAssetFromSold(id: string, userId?: string): Promise<AssetResponse> {
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      throw errors.notFound('Asset not found');
    }

    if (existingAsset.status !== 'SOLD') {
      throw errors.badRequest('Asset is not in SOLD status');
    }

    // Check if asset has any SALE events
    const saleEvents = await prisma.assetEvent.findFirst({
      where: {
        assetId: id,
        type: 'SALE',
      },
    });

    if (saleEvents) {
      throw errors.badRequest('Asset has SALE events. Delete the SALE events first.');
    }

    // Reset asset to ACTIVE status and clear sale-related fields
    const resetValue = existingAsset.acquiredPrice ?? existingAsset.currentValue;
    
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        currentValue: resetValue,
        salePrice: null,
        saleDate: null,
      },
    });

    log.info('Asset reset from SOLD to ACTIVE', { 
      assetId: id, 
      resetBy: userId,
      newValue: resetValue 
    });

    return this.formatAssetResponse(asset);
  }

  /**
   * Recalculate asset value based on all remaining events
   */
  private async recalculateAssetValue(assetId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const prismaClient = tx ?? prisma;

    // Get the asset's original acquired price (base value)
    const asset = await prismaClient.asset.findUnique({
      where: { id: assetId },
      select: { acquiredPrice: true },
    });

    const baseValue = asset?.acquiredPrice ?? 0;

    // Get all remaining events for this asset, ordered by date
    const events = await prismaClient.assetEvent.findMany({
      where: { assetId },
      orderBy: { date: 'asc' },
    });

    // Apply each event to calculate final value
    let currentValue = baseValue;
    for (const event of events) {
      currentValue = this.calculateNewAssetValue(
        currentValue,
        event.type as AssetEventTypeEnum,
        event.amount ?? 0
      );
    }

    return currentValue;
  }

  /**
   * Calculate new asset value based on event type
   */
  private calculateNewAssetValue(
    currentValue: number,
    eventType: AssetEventTypeEnum,
    amount: number
  ): number {
    switch (eventType) {
      case 'VALUATION':
        return amount; // Set to new valuation
      case 'PAYMENT_IN':
        return currentValue + amount; // Add income
      case 'PAYMENT_OUT':
        return currentValue - Math.abs(amount); // Subtract outflow
      case 'CAPEX':
        return currentValue + amount; // Add capital expenditure
      case 'NOTE':
        return currentValue; // No value change for notes
      case 'SALE':
        return 0; // Asset sold, no longer has value in portfolio
      // Loan-specific events
      case 'LOAN_DISBURSEMENT':
        return amount; // Initial loan amount
      case 'INTEREST_ACCRUAL':
        // This is handled in calculateNewAssetValueWithLoanSupport
        return currentValue;
      case 'INTEREST_PAYMENT':
        // This is handled in calculateNewAssetValueWithLoanSupport
        return currentValue;
      case 'PRINCIPAL_PAYMENT':
        return currentValue - Math.abs(amount); // Reduce outstanding loan
      case 'LOAN_REPAYMENT':
        return 0; // Loan fully repaid
      case 'DEFAULT':
        return 0; // Loan defaulted, write off
      default:
        return currentValue;
    }
  }

  /**
   * Calculate new asset value with loan support
   */
  private async calculateNewAssetValueWithLoanSupport(
    tx: Prisma.TransactionClient,
    asset: { type: string; currentValue: number },
    eventType: AssetEventTypeEnum,
    amount: number,
    eventData: CreateAssetEventRequest
  ): Promise<number> {
    // For non-loan assets or non-interest events, use standard calculation
    if (asset.type !== 'PÔŽIČKY' || 
        (eventType !== 'INTEREST_ACCRUAL' && eventType !== 'INTEREST_PAYMENT')) {
      return this.calculateNewAssetValue(asset.currentValue, eventType, amount);
    }

    // Handle loan-specific interest events
    if (eventType === 'INTEREST_ACCRUAL') {
      // If interest is not paid, it gets capitalized (added to principal)
      if (!eventData.isPaid) {
        const interestAmount = eventData.interestAmount ?? amount;
        return asset.currentValue + interestAmount;
      }
      // If paid, value stays the same (money goes to bank account)
      return asset.currentValue;
    }

    if (eventType === 'INTEREST_PAYMENT') {
      // Payment of previously accrued unpaid interest
      // We need to check if there are unpaid interest events
      const unpaidInterest = await tx.assetEvent.aggregate({
        where: {
          assetId: asset.id,
          type: 'INTEREST_ACCRUAL',
          isPaid: false,
        },
        _sum: {
          interestAmount: true,
        },
      });

      const totalUnpaidInterest = unpaidInterest._sum.interestAmount ?? 0;
      const paymentAmount = eventData.interestAmount ?? amount;
      
      // Reduce the capitalized interest from current value
      return Math.max(0, asset.currentValue - Math.min(paymentAmount, totalUnpaidInterest));
    }

    return asset.currentValue;
  }

  /**
   * Get loan statistics for an asset
   */
  async getLoanStatistics(assetId: string): Promise<{
    totalInterestEarned: number;
    totalInterestPaid: number;
    totalInterestUnpaid: number;
    outstandingPrincipal: number;
  }> {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        events: {
          where: {
            type: {
              in: ['INTEREST_ACCRUAL', 'INTEREST_PAYMENT', 'PRINCIPAL_PAYMENT'],
            },
          },
        },
      },
    });

    if (!asset || asset.type !== 'PÔŽIČKY') {
      return {
        totalInterestEarned: 0,
        totalInterestPaid: 0,
        totalInterestUnpaid: 0,
        outstandingPrincipal: asset?.currentValue ?? 0,
      };
    }

    let totalInterestEarned = 0;
    let totalInterestPaid = 0;
    let totalInterestUnpaid = 0;

    for (const event of asset.events) {
      if (event.type === 'INTEREST_ACCRUAL') {
        const interestAmount = (event as { interestAmount?: number }).interestAmount ?? event.amount ?? 0;
        totalInterestEarned += interestAmount;
        
        if ((event as { isPaid?: boolean }).isPaid) {
          totalInterestPaid += interestAmount;
        } else {
          totalInterestUnpaid += interestAmount;
        }
      } else if (event.type === 'INTEREST_PAYMENT') {
        const paymentAmount = (event as { interestAmount?: number }).interestAmount ?? event.amount ?? 0;
        totalInterestPaid += paymentAmount;
        totalInterestUnpaid = Math.max(0, totalInterestUnpaid - paymentAmount);
      }
    }

    return {
      totalInterestEarned,
      totalInterestPaid,
      totalInterestUnpaid,
      outstandingPrincipal: asset.currentValue,
    };
  }

  /**
   * Format asset response
   */
  private formatAssetResponse(asset: Record<string, unknown>): AssetResponse {
    const response: AssetResponse = {
        id: asset.id as string,
        name: asset.name as string,
        type: asset.type as string,
        description: asset.description as string | null,
        currentValue: asset.currentValue as number,
        status: asset.status as string,
        acquiredPrice: asset.acquiredPrice as number | null,
        acquiredDate: asset.acquiredDate as Date | null,
        salePrice: asset.salePrice as number | null,
        saleDate: asset.saleDate as Date | null,
        // Loan-specific fields
        loanPrincipal: asset.loanPrincipal as number | null,
        interestRate: asset.interestRate as number | null,
        interestPeriod: asset.interestPeriod as string | null,
        loanStartDate: asset.loanStartDate as Date | null,
        loanMaturityDate: asset.loanMaturityDate as Date | null,
        loanStatus: asset.loanStatus as string | null,
        createdAt: asset.createdAt as Date,
        updatedAt: asset.updatedAt as Date,
        eventsCount: (asset.eventsCount as number) ?? 0,
        totalInflows: (asset.totalInflows as number) ?? 0,
        totalOutflows: (asset.totalOutflows as number) ?? 0,
      };

    // Add loan statistics if it's a loan
    if (asset.type === 'PÔŽIČKY') {
      response.totalInterestEarned = asset.totalInterestEarned as number | undefined;
      response.totalInterestPaid = asset.totalInterestPaid as number | undefined;
      response.totalInterestUnpaid = asset.totalInterestUnpaid as number | undefined;
      response.outstandingPrincipal = asset.outstandingPrincipal as number | undefined;
    }

    return response;
  }

  /**
   * Format asset event response
   */
  private formatAssetEventResponse(event: Record<string, unknown>): AssetEventResponse {
    return {
      id: event.id as string,
      assetId: event.assetId as string,
      type: event.type as string,
      amount: event.amount as number | null,
      date: event.date as Date,
      note: event.note as string | null,
      // Loan payment tracking fields
      isPaid: event.isPaid as boolean | null | undefined,
      paymentDate: event.paymentDate as Date | null | undefined,
      principalAmount: event.principalAmount as number | null | undefined,
      interestAmount: event.interestAmount as number | null | undefined,
      referencePeriodStart: event.referencePeriodStart as Date | null | undefined,
      referencePeriodEnd: event.referencePeriodEnd as Date | null | undefined,
      createdAt: event.createdAt as Date,
      updatedAt: event.updatedAt as Date,
      asset: event.asset as { type: string; name: string; id: string } | undefined,
    };
  }
}

export const assetsService = new AssetsService();
