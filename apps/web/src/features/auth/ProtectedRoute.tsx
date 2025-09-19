import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Array<'ADMIN' | 'INTERNAL' | 'INVESTOR'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Check role permissions if roles are specified
  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Nedostatočné oprávnenia
          </h1>
          <p className="text-gray-600">
            Nemáte oprávnenie na prístup k tejto stránke.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
