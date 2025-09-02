import { api } from '@/lib/api-client';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '@/types/api';

export const authApi = {
  // Login user
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/auth/login', data),

  // Register user
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post('/auth/register', data),

  // Get current user
  me: (): Promise<User> =>
    api.get('/auth/me'),

  // Logout (client-side only - remove token)
  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  // Set auth token
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};
