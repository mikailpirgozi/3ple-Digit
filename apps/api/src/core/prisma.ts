import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { log } from './logger';

// Create Prisma Client factory function for dynamic URL support
function createPrismaClient() {
  return new PrismaClient({
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
        url: process.env.DATABASE_URL ?? env.DATABASE_URL,
      },
    },
  });
}

// Create initial Prisma Client instance
let prisma = createPrismaClient();

// Function to reinitialize Prisma client (useful for tests)
export function reinitializePrismaClient() {
  // Disconnect existing client
  prisma.$disconnect().catch(() => {
    // Ignore disconnect errors
  });

  // Create new client with current environment
  prisma = createPrismaClient();

  // Re-setup event listeners
  setupPrismaEventListeners();

  return prisma;
}

// Setup event listeners function
function setupPrismaEventListeners() {
  // Log database queries in development
  if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e: { query: string; params: string; duration: number }) => {
      log.debug('Database query', {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
      });
    });
  }

  // Log database errors
  prisma.$on('error', (e: { message: string; target: string }) => {
    log.error('Database error', {
      message: e.message,
      target: e.target,
    });
  });

  // Log database info
  prisma.$on('info', (e: { message: string; target: string }) => {
    log.info('Database info', {
      message: e.message,
      target: e.target,
    });
  });

  // Log database warnings
  prisma.$on('warn', (e: { message: string; target: string }) => {
    log.warn('Database warning', {
      message: e.message,
      target: e.target,
    });
  });
}

// Setup initial event listeners
setupPrismaEventListeners();

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

// Initial connection check - don't block startup
setTimeout(async () => {
  try {
    const connected = await checkConnection();
    isConnected = connected;
    if (!connected) {
      void reconnectDatabase();
    }
  } catch (error) {
    log.warn('Initial database connection check failed, will retry later', {
      error: (error as Error).message,
    });
  }
}, 1000); // Wait 1 second after startup

// Periodic health check
void setInterval(async () => {
  const connected = await checkConnection();
  if (!connected && reconnectAttempts === 0) {
    void reconnectDatabase();
  }
}, 30000); // Check every 30 seconds

// Graceful shutdown
void process.on('beforeExit', async () => {
  log.info('Disconnecting from database...');
  await prisma.$disconnect();
});

void process.on('SIGINT', async () => {
  log.info('Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

void process.on('SIGTERM', async () => {
  log.info('Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

export * from '@prisma/client';
export { prisma };
