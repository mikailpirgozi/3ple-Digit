import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { env } from './env';

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiError;
}

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: `${env.VITE_API_URL}/api`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      // Handle 401 - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
      }

      // Extract API error or create generic error
      const apiError: ApiError = error.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
        details: error.response?.data,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// Helper types for API responses
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  size?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Generic API methods
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }).then(res => res.data),
  
  post: <T>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data).then(res => res.data),
  
  put: <T>(url: string, data?: unknown) =>
    apiClient.put<T>(url, data).then(res => res.data),
  
  patch: <T>(url: string, data?: unknown) =>
    apiClient.patch<T>(url, data).then(res => res.data),
  
  delete: <T>(url: string) =>
    apiClient.delete<T>(url).then(res => res.data),
};
