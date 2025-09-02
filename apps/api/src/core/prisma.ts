import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { log } from './logger.js';

// Extend Prisma Client with logging
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database queries in development
if (env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    log.debug('Database query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Log database errors
prisma.$on('error', (e) => {
  log.error('Database error', {
    message: e.message,
    target: e.target,
  });
});

// Log database info
prisma.$on('info', (e) => {
  log.info('Database info', {
    message: e.message,
    target: e.target,
  });
});

// Log database warnings
prisma.$on('warn', (e) => {
  log.warn('Database warning', {
    message: e.message,
    target: e.target,
  });
});

// Graceful shutdown
process.on('beforeExit', async () => {
  log.info('Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  log.info('Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log.info('Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
export * from '@prisma/client';
