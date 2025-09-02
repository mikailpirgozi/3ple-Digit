// Auth module exports
export { authRouter } from './router.js';
export { authService } from './service.js';
export { authenticate, authorize, adminOnly, adminOrInternal, optionalAuth } from './middleware.js';
export { UserRole, type UserRoleType, type LoginRequest, type RegisterRequest, type AuthResponse } from './schema.js';
