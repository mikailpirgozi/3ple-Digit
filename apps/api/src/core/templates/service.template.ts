/**
 * Template for new service classes
 * Copy this template when creating new services to ensure TypeScript safety
 */

import { errors } from '@/core/error-handler.js';
import { log } from '@/core/logger.js';
import { prisma } from '@/core/prisma.js';

export class TemplateService {
  /**
   * Helper function to convert undefined to null for Prisma compatibility
   * MANDATORY: Use this for all optional Prisma fields
   */
  private toNullable<T>(value: T | undefined): T | null {
    return value === undefined ? null : value;
  }

  /**
   * Helper function to filter out undefined values from update data
   * MANDATORY: Use this for all Prisma update operations
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
   * Example create method - ALWAYS use toNullable for optional fields
   */
  async createExample(
    data: Record<string, unknown>,
    userId?: string
  ): Promise<Record<string, unknown>> {
    const example = await prisma.example.create({
      data: {
        name: data.name, // Required field - direct assignment
        description: this.toNullable(data.description), // Optional field - use toNullable
        amount: data.amount,
        date: data.date,
        // Add more fields as needed
      },
    });

    log.info('Example created', { exampleId: example.id, createdBy: userId });
    return example;
  }

  /**
   * Example update method - ALWAYS use filterUpdateData
   */
  async updateExample(
    id: string,
    data: Record<string, unknown>,
    userId?: string
  ): Promise<Record<string, unknown>> {
    // Check if exists
    const existing = await prisma.example.findUnique({ where: { id } });
    if (!existing) {
      throw errors.notFound('Example not found');
    }

    // Prepare update data with proper null handling
    const updateData = this.filterUpdateData({
      name: data.name,
      description: data.description !== undefined ? this.toNullable(data.description) : undefined,
      amount: data.amount,
      date: data.date,
    });

    const example = await prisma.example.update({
      where: { id },
      data: updateData,
    });

    log.info('Example updated', { exampleId: id, updatedBy: userId });
    return example;
  }
}

export const templateService = new TemplateService();
