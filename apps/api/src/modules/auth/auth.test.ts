import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { testPrisma as prisma } from '../../test-prisma';
import app from '../../index';

describe('Auth API', () => {
  beforeAll(async () => {
    // CRITICAL SAFETY CHECK - NEVER DELETE PRODUCTION DATA
    const hasProductionUrl =
      process.env.DATABASE_URL?.includes('railway.app') ||
      process.env.DATABASE_URL?.includes('rlwy.net');

    if (hasProductionUrl) {
      throw new Error('🚨 AUTH TEST BLOCKED: Cannot run on production database!');
    }

    // Clean up test data (ONLY on test database)
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } },
    });
  });

  afterAll(async () => {
    // CRITICAL SAFETY CHECK - NEVER DELETE PRODUCTION DATA
    const hasProductionUrl =
      process.env.DATABASE_URL?.includes('railway.app') ||
      process.env.DATABASE_URL?.includes('rlwy.net');

    if (hasProductionUrl) {
      console.error('🚨 AUTH CLEANUP BLOCKED: Cannot clean production database!');
      await prisma.$disconnect();
      return;
    }

    // Clean up test data (ONLY on test database)
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with bcrypt password', async () => {
      const userData = {
        email: 'test-register@example.com',
        password: 'testpass123',
        name: 'Test User',
        role: 'ADMIN',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        email: 'test-duplicate@example.com',
        password: 'testpass123',
        name: 'Test User',
        role: 'ADMIN',
      };

      // First registration
      await request(app).post('/api/auth/register').send(userData).expect(201);

      // Second registration with same email
      const response = await request(app).post('/api/auth/register').send(userData).expect(409);

      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // too short
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Create test user
      await request(app).post('/api/auth/register').send({
        email: 'test-login@example.com',
        password: 'testpass123',
        name: 'Login Test User',
        role: 'ADMIN',
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'testpass123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test-login@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpass123',
        })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeAll(async () => {
      // Register and login to get token
      const registerResponse = await request(app).post('/api/auth/register').send({
        email: 'test-me@example.com',
        password: 'testpass123',
        name: 'Me Test User',
        role: 'ADMIN',
      });

      authToken = registerResponse.body.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('test-me@example.com');
      expect(response.body.user.name).toBe('Me Test User');
      expect(response.body.user.role).toBe('ADMIN');
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
