import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { queryKeys } from '@/lib/query-client';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  const isAuthenticated = authApi.isAuthenticated();

  // Query to get current user (only if authenticated)
  const { data: userData, isLoading } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.me,
    enabled: isAuthenticated,
    retry: false,
    staleTime: Infinity, // User data doesn't change often
  });

  // Update user state when query data changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (!isAuthenticated) {
      setUser(null);
    }
  }, [userData, isAuthenticated]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: data => {
      authApi.setToken(data.accessToken);
      setUser(data.user);
      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      // Invalidate all queries to refetch with new auth
      void queryClient.invalidateQueries();
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: data => {
      authApi.setToken(data.accessToken);
      setUser(data.user);
      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      // Invalidate all queries to refetch with new auth
      void queryClient.invalidateQueries();
    },
  });

  // Login function
  const login = async (data: LoginRequest) => {
    await loginMutation.mutateAsync(data);
  };

  // Register function
  const register = async (data: RegisterRequest) => {
    await registerMutation.mutateAsync(data);
  };

  // Logout function
  const logout = () => {
    authApi.logout();
    setUser(null);
    // Clear all queries
    queryClient.clear();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading: isLoading ?? loginMutation.isPending ?? registerMutation.isPending,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
