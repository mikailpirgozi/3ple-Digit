import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { log } from './logger.js';

// Extend Prisma Client with logging and connection pooling
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
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

// Log database queries in development
if (env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    log.debug('Database query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Log database errors
prisma.$on('error', (e: any) => {
  log.error('Database error', {
    message: e.message,
    target: e.target,
  });
});

// Log database info
prisma.$on('info', (e: any) => {
  log.info('Database info', {
    message: e.message,
    target: e.target,
  });
});

// Log database warnings
prisma.$on('warn', (e: any) => {
  log.warn('Database warning', {
    message: e.message,
    target: e.target,
  });
});

// Connection health check and auto-reconnect
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

async function checkConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    if (!isConnected) {
      log.info('Database connection restored');
      isConnected = true;
      reconnectAttempts = 0;
    }
    return true;
  } catch (error) {
    if (isConnected) {
      log.error('Database connection lost', { error: (error as Error).message });
      isConnected = false;
    }
    return false;
  }
}

async function reconnectDatabase() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    log.error('Max reconnection attempts reached, giving up');
    return;
  }

  reconnectAttempts++;
  log.info(
    `Attempting to reconnect to database (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
  );

  try {
    await prisma.$disconnect();
    await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));
    await prisma.$connect();

    if (await checkConnection()) {
      log.info('Database reconnection successful');
      reconnectAttempts = 0;
    } else {
      setTimeout(reconnectDatabase, RECONNECT_DELAY);
    }
  } catch (error) {
    log.error('Database reconnection failed', {
      error: (error as Error).message,
      attempt: reconnectAttempts,
    });
    setTimeout(reconnectDatabase, RECONNECT_DELAY);
  }
}

// Initial connection check
checkConnection().then(connected => {
  isConnected = connected;
  if (!connected) {
    reconnectDatabase();
  }
});

// Periodic health check
setInterval(async () => {
  const connected = await checkConnection();
  if (!connected && reconnectAttempts === 0) {
    reconnectDatabase();
  }
}, 30000); // Check every 30 seconds

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

export * from '@prisma/client';
export { prisma };
