/**
 * Type helpers and utilities for 3ple Digit
 * MANDATORY: Use these helpers for type safety
 */

/**
 * Convert undefined to null for Prisma compatibility
 * USAGE: Use for all optional Prisma fields
 */
export function toNullable<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

/**
 * Brand type for type-safe IDs and values
 * USAGE: type UserId = Brand<string, 'UserId'>
 */
export type Brand<T, U> = T & { readonly __brand: U };

/**
 * Exhaustive check for switch statements
 * USAGE: Use in default case to ensure all enum values are handled
 */
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

/**
 * Money type - always use string to avoid float precision issues
 * USAGE: Use for all monetary values in API
 */
export type Money = Brand<string, 'Money'>;

/**
 * Create Money from number with proper formatting
 * USAGE: toMoney(123.45) -> "123.45"
 */
export function toMoney(value: number): Money {
  return value.toFixed(6) as Money;
}

/**
 * Parse Money to Decimal for database operations
 * USAGE: Use when storing to Prisma Decimal fields
 */
export function parseMoneyToDecimal(money: Money): string {
  return money;
}

/**
 * Branded ID types for type safety
 */
export type UserId = Brand<string, 'UserId'>;
export type InvestorId = Brand<string, 'InvestorId'>;
export type AssetId = Brand<string, 'AssetId'>;
export type SnapshotId = Brand<string, 'SnapshotId'>;

/**
 * Create branded ID
 */
export function createId<T extends string>(value: string): Brand<string, T> {
  return value as Brand<string, T>;
}

/**
 * Safe array access with proper typing
 */
export function safeArrayAccess<T>(array: T[], index: number): T | undefined {
  return array.at(index);
}

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Check if array is non-empty with type guard
 */
export function isNonEmpty<T>(array: T[]): array is NonEmptyArray<T> {
  return array.length > 0;
}

/**
 * Percentage type for type-safe percentage calculations
 */
export type Percentage = Brand<number, 'Percentage'>;

/**
 * Create percentage from number (0-100)
 */
export function toPercentage(value: number): Percentage {
  if (value < 0 || value > 100) {
    throw new Error(`Invalid percentage: ${value}. Must be between 0 and 100.`);
  }
  return value as Percentage;
}

/**
 * Convert percentage to decimal for calculations
 */
export function percentageToDecimal(percentage: Percentage): number {
  return percentage / 100;
}
