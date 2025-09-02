import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/core/prisma.js';
import { env } from '@/core/env.js';
import { errors } from '@/core/error-handler.js';
import { log } from '@/core/logger.js';
import type { LoginRequest, RegisterRequest, AuthResponse, JwtPayload, UserRoleType } from './schema.js';

export class AuthService {
  private readonly jwtSecret = env.JWT_SECRET;
  private readonly jwtExpiresIn = env.JWT_EXPIRES_IN;

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, name, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw errors.conflict('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    });

    log.info('User registered successfully', { userId: user.id, email, role });

    // Generate tokens
    return this.generateAuthResponse(user);
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw errors.unauthorized('Invalid email or password');
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw errors.unauthorized('Invalid email or password');
    }

    log.info('User logged in successfully', { userId: user.id, email });

    return this.generateAuthResponse(user);
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw errors.unauthorized('User not found');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw errors.unauthorized('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw errors.unauthorized('Token expired');
      }
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        investorProfile: true,
      },
    });

    if (!user) {
      throw errors.notFound('User not found');
    }

    return user;
  }

  /**
   * Check if user has required role
   */
  hasRole(userRole: string, requiredRoles: UserRoleType[]): boolean {
    return requiredRoles.includes(userRole as UserRoleType);
  }

  /**
   * Generate auth response with tokens
   */
  private generateAuthResponse(user: { id: string; email: string; name: string; role: string }): AuthResponse {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '30d', // Longer expiry for refresh token
    });

    // Calculate expiry time
    const decoded = jwt.decode(accessToken) as JwtPayload;
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}

export const authService = new AuthService();
