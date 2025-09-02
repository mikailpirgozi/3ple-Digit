import { beforeAll, afterAll } from 'vitest';
import { prisma } from './core/prisma.js';

beforeAll(async () => {
  // Test setup
  console.log('Setting up tests...');
});

afterAll(async () => {
  // Clean up
  await prisma.$disconnect();
  console.log('Tests cleanup completed.');
});
