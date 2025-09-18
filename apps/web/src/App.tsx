import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AuthProvider } from '@/features/auth/context';
import { ThemeProvider } from '@/lib/theme';
import { Toaster } from '@/ui';
import { Layout } from '@/ui/Layout';
import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy loaded components for better performance
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then(m => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/features/auth/RegisterPage').then(m => ({ default: m.RegisterPage }))
);
const HomePage = lazy(() =>
  import('@/features/home/HomePage').then(m => ({ default: m.HomePage }))
);
const InvestorsPage = lazy(() =>
  import('@/features/investors/InvestorsPage').then(m => ({ default: m.InvestorsPage }))
);
const AssetsPage = lazy(() =>
  import('@/features/assets/AssetsPage').then(m => ({ default: m.AssetsPage }))
);
const BankPage = lazy(() =>
  import('@/features/bank/BankPage').then(m => ({ default: m.BankPage }))
);
const LiabilitiesPage = lazy(() =>
  import('@/features/liabilities/LiabilitiesPage').then(m => ({ default: m.LiabilitiesPage }))
);
const SnapshotsPage = lazy(() =>
  import('@/features/snapshots/SnapshotsPage').then(m => ({ default: m.SnapshotsPage }))
);
const DocumentsPage = lazy(() =>
  import('@/features/documents/DocumentsPage').then(m => ({ default: m.DocumentsPage }))
);
const ReportsPage = lazy(() =>
  import('@/features/reports/ReportsPage').then(m => ({ default: m.ReportsPage }))
);

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="3ple-digit-theme">
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<PageLoader />}>
                <RegisterPage />
              </Suspense>
            }
          />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/investors" element={<InvestorsPage />} />
                      <Route path="/assets" element={<AssetsPage />} />
                      <Route path="/bank" element={<BankPage />} />
                      <Route path="/liabilities" element={<LiabilitiesPage />} />
                      <Route path="/snapshots" element={<SnapshotsPage />} />
                      <Route path="/documents" element={<DocumentsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
