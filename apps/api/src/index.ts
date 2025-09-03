import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '@/core/env.js';
import { logger } from '@/core/logger.js';
import { errorHandler } from '@/core/error-handler.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Temporary seed endpoint (remove after seeding)
app.post('/seed', async (_req, res) => {
  try {
    const { execSync } = await import('child_process');
    execSync('cd apps/api && pnpm db:seed', { stdio: 'inherit' });
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API routes
import { authRouter } from '@/modules/auth/index.js';
import { investorsRouter } from '@/modules/investors/index.js';
import { assetsRouter } from '@/modules/assets/index.js';
import { bankRouter } from '@/modules/bank/index.js';
import { liabilitiesRouter } from '@/modules/liabilities/index.js';
import { snapshotsRouter } from '@/modules/snapshots/index.js';
import { documentsRouter } from '@/modules/documents/index.js';
import { reportsRouter } from '@/modules/reports/index.js';

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
