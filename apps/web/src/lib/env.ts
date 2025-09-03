import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:4000'),
  VITE_APP_NAME: z.string().default('3ple Digit'),
  VITE_NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(import.meta.env as Record<string, unknown>);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      console.error('❌ Invalid environment variables:');
      console.error(missingVars);
      console.error('\n💡 Please check your .env file and ensure all required variables are set.');

      throw new Error('Environment validation failed');
    }
    throw error;
  }
}

export const env = validateEnv();

// Type-safe environment variable access
export type { Env };
