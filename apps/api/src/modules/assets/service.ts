import { errors } from '@/core/error-handler.js';
import { log } from '@/core/logger.js';
import { prisma } from '@/core/prisma.js';
import type { Asset, AssetEvent } from '@prisma/client';
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
    return value === undefined ? null : value;
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
    const where: any = {};

    // Support both 'search' and 'q' parameters for search
    const searchTerm = search || q;
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
        .filter(event => ['PAYMENT_IN', 'VALUATION'].includes(event.type) && event.amount > 0)
        .reduce((sum, event) => sum + event.amount, 0);

      const totalOutflows = asset.events
        .filter(event => ['PAYMENT_OUT', 'CAPEX'].includes(event.type) || event.amount < 0)
        .reduce((sum, event) => sum + Math.abs(event.amount), 0);

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
      .filter(event => ['PAYMENT_IN', 'VALUATION'].includes(event.type) && event.amount > 0)
      .reduce((sum, event) => sum + event.amount, 0);

    const totalOutflows = asset.events
      .filter(event => ['PAYMENT_OUT', 'CAPEX'].includes(event.type) || event.amount < 0)
      .reduce((sum, event) => sum + Math.abs(event.amount), 0);

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
      salePrice: data.salePrice !== undefined ? this.toNullable(data.salePrice) : undefined,
      saleDate: data.saleDate !== undefined ? this.toNullable(data.saleDate) : undefined,
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

    // Create event and update asset value in transaction
    const result = await prisma.$transaction(async tx => {
      // Create the event
      const event = await tx.assetEvent.create({
        data: {
          assetId: data.assetId,
          type: data.type,
          amount: data.amount,
          date: data.date,
          note: this.toNullable(data.note),
        },
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

      // Update asset current value based on event type
      const newValue = this.calculateNewAssetValue(asset.currentValue, data.type, data.amount);

      await tx.asset.update({
        where: { id: data.assetId },
        data: { currentValue: newValue },
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
    const where: any = {};

    if (assetId) {
      where.assetId = assetId;
    }

    if (type) {
      where.type = type;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
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

    // Update event and recalculate asset value in transaction
    const result = await prisma.$transaction(async tx => {
      // Revert old event impact
      const revertedValue = this.revertAssetValue(
        existingEvent.asset.currentValue,
        existingEvent.type as AssetEventTypeEnum,
        existingEvent.amount
      );

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

      // Apply new event impact
      const newValue = this.calculateNewAssetValue(
        revertedValue,
        (data.type || existingEvent.type) as AssetEventTypeEnum,
        data.amount || existingEvent.amount
      );

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

    // Delete event and revert asset value in transaction
    await prisma.$transaction(async tx => {
      // Delete the event
      await tx.assetEvent.delete({
        where: { id },
      });

      // Revert asset value
      const revertedValue = this.revertAssetValue(
        existingEvent.asset.currentValue,
        existingEvent.type as AssetEventTypeEnum,
        existingEvent.amount
      );

      await tx.asset.update({
        where: { id: existingEvent.assetId },
        data: { currentValue: revertedValue },
      });
    });

    log.info('Asset event deleted', { eventId: id, deletedBy: userId });
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
      default:
        return currentValue;
    }
  }

  /**
   * Revert asset value change from an event
   */
  private revertAssetValue(
    currentValue: number,
    eventType: AssetEventTypeEnum,
    amount: number
  ): number {
    switch (eventType) {
      case 'VALUATION':
        // For valuation, we can't easily revert, so keep current value
        return currentValue;
      case 'PAYMENT_IN':
        return currentValue - amount; // Subtract the income
      case 'PAYMENT_OUT':
        return currentValue + Math.abs(amount); // Add back the outflow
      case 'CAPEX':
        return currentValue - amount; // Subtract the capex
      case 'NOTE':
        return currentValue; // No change for notes
      default:
        return currentValue;
    }
  }

  /**
   * Format asset response
   */
  private formatAssetResponse(
    asset: Asset & { eventsCount?: number; totalInflows?: number; totalOutflows?: number }
  ): AssetResponse {
    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      description: asset.description,
      currentValue: asset.currentValue,
      status: asset.status,
      acquiredPrice: asset.acquiredPrice,
      salePrice: asset.salePrice,
      saleDate: asset.saleDate,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      eventsCount: asset.eventsCount,
      totalInflows: asset.totalInflows,
      totalOutflows: asset.totalOutflows,
    };
  }

  /**
   * Format asset event response
   */
  private formatAssetEventResponse(
    event: AssetEvent & { asset?: { id: string; name: string; type: string } }
  ): AssetEventResponse {
    return {
      id: event.id,
      assetId: event.assetId,
      type: event.type,
      amount: event.amount,
      date: event.date,
      note: event.note,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      asset: event.asset,
    };
  }
}

export const assetsService = new AssetsService();
