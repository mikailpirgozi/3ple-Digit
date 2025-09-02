import { errors } from './error-handler.js';

/**
 * Validates that a required parameter exists and is not empty
 */
export function validateRequiredParam(param: string | undefined, paramName: string): string {
  if (!param || param.trim() === '') {
    throw errors.badRequest(`${paramName} is required`);
  }
  return param;
}

/**
 * Validates multiple required parameters at once
 */
export function validateRequiredParams(params: Record<string, string | undefined>): Record<string, string> {
  const validated: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    validated[key] = validateRequiredParam(value, key);
  }
  
  return validated;
}
