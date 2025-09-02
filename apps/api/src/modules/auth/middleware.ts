import { Request, Response, NextFunction } from 'express';
import { authService } from './service.js';
import { errors } from '@/core/error-handler.js';
import { UserRoleType } from './schema.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * JWT Authentication middleware
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw errors.unauthorized('Access token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const payload = await authService.verifyToken(token);
    
    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (roles: UserRoleType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(errors.unauthorized('Authentication required'));
      return;
    }

    if (!authService.hasRole(req.user.role, roles)) {
      next(errors.forbidden('Insufficient permissions'));
      return;
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize(['ADMIN']);

/**
 * Admin or Internal middleware
 */
export const adminOrInternal = authorize(['ADMIN', 'INTERNAL']);

/**
 * Optional authentication middleware (doesn't throw if no token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = await authService.verifyToken(token);
      
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};
