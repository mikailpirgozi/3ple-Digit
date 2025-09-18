import { env } from '@/core/env.js';
import { errorHandler } from '@/core/error-handler.js';
import { logger } from '@/core/logger.js';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);

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
import { assetsRouter } from '@/modules/assets/index.js';
import { authRouter } from '@/modules/auth/index.js';
import { bankRouter } from '@/modules/bank/index.js';
import { documentsRouter } from '@/modules/documents/index.js';
import { investorsRouter } from '@/modules/investors/index.js';
import { liabilitiesRouter } from '@/modules/liabilities/index.js';
import { reportsRouter } from '@/modules/reports/index.js';
import { snapshotsRouter } from '@/modules/snapshots/index.js';

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
