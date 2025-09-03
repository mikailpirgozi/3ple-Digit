/**
 * Money handling utilities for 3ple Digit
 * CRITICAL: Never use JavaScript numbers for money calculations!
 */

import { Decimal } from '@prisma/client/runtime/library';
import type { Money } from './types-helpers.js';
import { toMoney } from './types-helpers.js';

/**
 * Rounding modes for money calculations
 */
export enum RoundingMode {
  HALF_UP = 'HALF_UP',
  HALF_DOWN = 'HALF_DOWN',
  HALF_EVEN = 'HALF_EVEN', // Banker's rounding
  UP = 'UP',
  DOWN = 'DOWN',
}

/**
 * Default rounding mode for the application
 */
export const DEFAULT_ROUNDING_MODE = RoundingMode.HALF_EVEN;

/**
 * Number of decimal places for money calculations
 */
export const MONEY_DECIMAL_PLACES = 6;

/**
 * Money calculator using Decimal for precision
 */
export class MoneyCalculator {
  private value: Decimal;

  constructor(value: string | number | Decimal | Money) {
    this.value = new Decimal(value.toString());
  }

  /**
   * Add money values
   */
  add(other: string | number | Decimal | Money): MoneyCalculator {
    return new MoneyCalculator(this.value.add(new Decimal(other.toString())));
  }

  /**
   * Subtract money values
   */
  subtract(other: string | number | Decimal | Money): MoneyCalculator {
    return new MoneyCalculator(this.value.sub(new Decimal(other.toString())));
  }

  /**
   * Multiply money by a factor
   */
  multiply(factor: string | number | Decimal): MoneyCalculator {
    return new MoneyCalculator(this.value.mul(new Decimal(factor.toString())));
  }

  /**
   * Divide money by a divisor
   */
  divide(divisor: string | number | Decimal): MoneyCalculator {
    return new MoneyCalculator(this.value.div(new Decimal(divisor.toString())));
  }

  /**
   * Calculate percentage of money
   */
  percentage(percent: number): MoneyCalculator {
    return this.multiply(percent).divide(100);
  }

  /**
   * Round to specified decimal places
   */
  round(
    decimalPlaces: number = MONEY_DECIMAL_PLACES,
    roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE
  ): MoneyCalculator {
    let rounded: Decimal;

    switch (roundingMode) {
      case RoundingMode.HALF_UP:
        rounded = this.value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP);
        break;
      case RoundingMode.HALF_DOWN:
        rounded = this.value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_DOWN);
        break;
      case RoundingMode.HALF_EVEN:
        rounded = this.value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_EVEN);
        break;
      case RoundingMode.UP:
        rounded = this.value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_UP);
        break;
      case RoundingMode.DOWN:
        rounded = this.value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN);
        break;
      default:
        throw new Error(`Unsupported rounding mode: ${roundingMode}`);
    }

    return new MoneyCalculator(rounded);
  }

  /**
   * Compare with another money value
   */
  equals(other: string | number | Decimal | Money): boolean {
    return this.value.equals(new Decimal(other.toString()));
  }

  /**
   * Check if greater than another money value
   */
  greaterThan(other: string | number | Decimal | Money): boolean {
    return this.value.greaterThan(new Decimal(other.toString()));
  }

  /**
   * Check if less than another money value
   */
  lessThan(other: string | number | Decimal | Money): boolean {
    return this.value.lessThan(new Decimal(other.toString()));
  }

  /**
   * Check if greater than or equal to another money value
   */
  greaterThanOrEqual(other: string | number | Decimal | Money): boolean {
    return this.value.greaterThanOrEqualTo(new Decimal(other.toString()));
  }

  /**
   * Check if less than or equal to another money value
   */
  lessThanOrEqual(other: string | number | Decimal | Money): boolean {
    return this.value.lessThanOrEqualTo(new Decimal(other.toString()));
  }

  /**
   * Get absolute value
   */
  abs(): MoneyCalculator {
    return new MoneyCalculator(this.value.abs());
  }

  /**
   * Check if negative
   */
  isNegative(): boolean {
    return this.value.isNegative();
  }

  /**
   * Check if positive
   */
  isPositive(): boolean {
    return this.value.isPositive();
  }

  /**
   * Check if zero
   */
  isZero(): boolean {
    return this.value.isZero();
  }

  /**
   * Convert to Money type for API
   */
  toMoney(): Money {
    return toMoney(this.value.toNumber());
  }

  /**
   * Convert to Decimal for database
   */
  toDecimal(): Decimal {
    return this.value;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this.value.toFixed(MONEY_DECIMAL_PLACES);
  }

  /**
   * Convert to number (use with caution!)
   */
  toNumber(): number {
    return this.value.toNumber();
  }
}

/**
 * Helper functions for common money operations
 */

/**
 * Create MoneyCalculator from various inputs
 */
export function money(value: string | number | Decimal | Money): MoneyCalculator {
  return new MoneyCalculator(value);
}

/**
 * Sum multiple money values
 */
export function sumMoney(values: (string | number | Decimal | Money)[]): MoneyCalculator {
  return values.reduce((sum, value) => sum.add(value), new MoneyCalculator(0));
}

/**
 * Calculate NAV (Net Asset Value)
 * NAV = Total Assets + Bank Balances - Liabilities
 */
export function calculateNAV(
  totalAssets: string | number | Decimal | Money,
  totalBankBalances: string | number | Decimal | Money,
  totalLiabilities: string | number | Decimal | Money
): MoneyCalculator {
  return money(totalAssets).add(totalBankBalances).subtract(totalLiabilities);
}

/**
 * Calculate ownership percentage
 */
export function calculateOwnershipPercentage(
  investorCapital: string | number | Decimal | Money,
  totalCapital: string | number | Decimal | Money
): number {
  if (money(totalCapital).isZero()) {
    return 0;
  }

  return money(investorCapital).divide(totalCapital).multiply(100).toNumber();
}

/**
 * Calculate performance fee
 */
export function calculatePerformanceFee(
  profit: string | number | Decimal | Money,
  feeRate: number // percentage (e.g., 20 for 20%)
): MoneyCalculator {
  return money(profit).percentage(feeRate);
}
