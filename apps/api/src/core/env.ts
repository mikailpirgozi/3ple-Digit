import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform(val => val.split(',')),

  // JWT/Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Cloudflare R2 (optional for tests)
  R2_ACCOUNT_ID: z.string().default('test-account-id'),
  R2_ACCESS_KEY_ID: z.string().default('test-access-key'),
  R2_SECRET_ACCESS_KEY: z.string().default('test-secret-key'),
  R2_BUCKET_NAME: z.string().default('test-bucket'),
  R2_PUBLIC_URL: z.string().default('https://test-bucket.r2.dev'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      console.error('❌ Invalid environment variables:');
      console.error(missingVars);
      console.error('\n💡 Please check your .env file and ensure all required variables are set.');
      console.error('⚠️  Attempting to continue with default values...');

      // Try to continue with partial validation
      try {
        const partialEnv = envSchema.partial().parse(process.env);
        return {
          NODE_ENV: 'production',
          PORT: 4000,
          DATABASE_URL: process.env.DATABASE_URL || '',
          CORS_ORIGINS: ['http://localhost:3000'],
          JWT_SECRET:
            process.env.JWT_SECRET ||
            'fallback-secret-key-for-production-please-set-proper-jwt-secret',
          JWT_EXPIRES_IN: '7d',
          R2_ACCOUNT_ID: 'test-account-id',
          R2_ACCESS_KEY_ID: 'test-access-key',
          R2_SECRET_ACCESS_KEY: 'test-secret-key',
          R2_BUCKET_NAME: 'test-bucket',
          R2_PUBLIC_URL: 'https://test-bucket.r2.dev',
          LOG_LEVEL: 'info',
          ...partialEnv,
        } as Env;
      } catch {
        console.error('❌ Failed to create fallback environment, exiting...');
        process.exit(1);
      }
    }
    throw error;
  }
}

export const env = validateEnv();

// Type-safe environment variable access
export type { Env };
