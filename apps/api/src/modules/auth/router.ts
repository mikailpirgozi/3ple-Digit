import { asyncHandler } from '@/core/error-handler.js';
import { log } from '@/core/logger.js';
import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from './middleware.js';
import { loginSchema, registerSchema } from './schema.js';
import { authService } from './service.js';

const router: ExpressRouter = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);

    const result = await authService.register(data);

    log.info('User registration successful', {
      userId: result.user.id,
      email: result.user.email,
      ip: req.ip,
    });

    res.status(201).json(result);
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);

    const result = await authService.login(data);

    log.info('User login successful', {
      userId: result.user.id,
      email: result.user.email,
      ip: req.ip,
    });

    res.json(result);
  })
);

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    log.info('User logout', {
      userId: req.user?.id,
      email: req.user?.email,
      ip: req.ip,
    });

    res.json({ message: 'Logged out successfully' });
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user?.id ?? '');

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        investorProfile: user.investorProfile,
      },
    });
  })
);

/**
 * POST /api/auth/verify
 * Verify token validity
 */
router.post(
  '/verify',
  asyncHandler(async (req, res): Promise<void> => {
    const { token } = req.body as { token: string };

    if (!token) {
      res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Token is required' },
      });
      return;
    }

    try {
      const payload = await authService.verifyToken(token);
      const user = await authService.getUserById(payload.userId);

      res.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch {
      res.json({ valid: false });
    }
  })
);

export { router as authRouter };
