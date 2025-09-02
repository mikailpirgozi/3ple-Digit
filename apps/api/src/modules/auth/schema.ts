import { z } from 'zod';

// Auth request schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'INTERNAL', 'INVESTOR']).default('INVESTOR'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Auth response schemas
export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

// JWT payload schema
export const jwtPayloadSchema = z.object({
  userId: z.string(),
  email: z.string(),
  role: z.string(),
  iat: z.number(),
  exp: z.number(),
});

// Types
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

// Role enum for type safety
export const UserRole = {
  ADMIN: 'ADMIN',
  INTERNAL: 'INTERNAL', 
  INVESTOR: 'INVESTOR',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
