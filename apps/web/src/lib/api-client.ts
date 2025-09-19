import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
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
  // TEMPORARY: Force Railway URL for debugging
  const baseURL = 'https://backend-production-2bd2.up.railway.app/api';
  
  // eslint-disable-next-line no-console
  console.log('🔧 API Client baseURL:', baseURL);
  // eslint-disable-next-line no-console
  console.log('🔧 env.VITE_API_URL:', env.VITE_API_URL);
  
  const client = axios.create({
    baseURL,
    timeout: 30000, // Increased timeout for file uploads
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    config => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Debug logging for API requests
    // eslint-disable-next-line no-console
    console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: config.headers,
      });
      
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data ? 'Data received' : 'No data',
      });
      return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
      // eslint-disable-next-line no-console
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
      // Handle 401 - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        // Trigger storage event to update auth state
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'auth_token',
          oldValue: localStorage.getItem('auth_token'),
          newValue: null,
          storageArea: localStorage,
        }));
      }

      // Extract API error or create generic error
      const apiError: ApiError = error.response?.data?.error ?? {
        code: 'NETWORK_ERROR',
        message: error.message ?? 'Network error occurred',
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

// Export the raw axios client for special cases (like FormData)
export { apiClient };

// Generic API methods
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }).then(res => res.data),

  post: <T>(url: string, data?: unknown) => apiClient.post<T>(url, data).then(res => res.data),

  put: <T>(url: string, data?: unknown) => apiClient.put<T>(url, data).then(res => res.data),

  patch: <T>(url: string, data?: unknown) => apiClient.patch<T>(url, data).then(res => res.data),

  delete: <T>(url: string) => apiClient.delete<T>(url).then(res => res.data),
};
