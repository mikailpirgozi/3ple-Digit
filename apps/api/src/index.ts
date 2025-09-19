import { env } from '@/core/env';
import { errorHandler } from '@/core/error-handler';
import { logger } from '@/core/logger';
import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app: Express = express();

// Performance middleware
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses > 1KB
  })
);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for development
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Trust proxy for Railway deployment
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for development
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // increased limit for development
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit file uploads (increased for development)
  message: 'Too many file uploads, please try again later.',
});

app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/documents', uploadLimiter);

// Body parsing with size limits
app.use(
  express.json({
    limit: '2mb', // Reduced from 10mb for security
    verify: (_req, _res, buf) => {
      if (buf.length > 2 * 1024 * 1024) {
        // 2MB
        throw new Error('Request entity too large');
      }
    },
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '2mb',
    parameterLimit: 1000, // Limit number of parameters
  })
);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DANGEROUS SEED ENDPOINT - DISABLED FOR PRODUCTION SAFETY
// app.post('/seed', async (_req, res) => {
//   try {
//     const { execSync } = await import('child_process');
//     execSync('cd apps/api && pnpm db:seed', { stdio: 'inherit' });
//     res.json({ success: true, message: 'Database seeded successfully' });
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//     res.status(500).json({ success: false, error: errorMessage });
//   }
// });

// API routes
import { assetsRouter } from '@/modules/assets/index';
import { authRouter } from '@/modules/auth/index';
import { bankRouter } from '@/modules/bank/index';
import { documentsRouter } from '@/modules/documents/index';
import { investorsRouter } from '@/modules/investors/index';
import { liabilitiesRouter } from '@/modules/liabilities/index';
import { reportsRouter } from '@/modules/reports/index';
import { snapshotsRouter } from '@/modules/snapshots/index';

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0'
  });
});

app.use('/api/auth', authRouter);
app.use('/api/investors', investorsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/bank', bankRouter);
app.use('/api/liabilities', liabilitiesRouter);
app.use('/api/snapshots', snapshotsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/reports', reportsRouter);

// Error handling
app.use(errorHandler);

const port = env.PORT;

// Only start server if not in test environment
if (env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`, { port, env: env.NODE_ENV });
  });
}

export default app;
