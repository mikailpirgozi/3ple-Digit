import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from './context';

const loginSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
  password: z.string().min(6, 'Heslo musí mať aspoň 6 znakov'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error: unknown) {
      setError('root', {
        message: (error as Error).message ?? 'Prihlásenie sa nepodarilo',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 xs:py-6 sm:py-12 px-3 xs:px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 xs:space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-2 xs:mt-4 sm:mt-6 text-center text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
            Prihlásenie do 3ple Digit
          </h2>
          <p className="mt-2 text-center text-xs xs:text-sm text-gray-600">
            Alebo{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              vytvorte si nový účet
            </Link>
          </p>
        </div>

        <form className="mt-6 xs:mt-8 space-y-4 xs:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3 xs:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs xs:text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-xs xs:text-sm"
                placeholder="Zadajte váš email"
              />
              {errors.email && <p className="mt-1 text-xs xs:text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs xs:text-sm font-medium text-gray-700">
                Heslo
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-xs xs:text-sm"
                placeholder="Zadajte vaše heslo"
              />
              {errors.password && (
                <p className="mt-1 text-xs xs:text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-3 xs:p-4">
              <p className="text-xs xs:text-sm text-red-800">{errors.root.message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs xs:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Prihlasovanie...' : 'Prihlásiť sa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
