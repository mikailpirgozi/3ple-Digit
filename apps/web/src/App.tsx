import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context';
import { ThemeProvider } from '@/lib/theme';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { Layout } from '@/ui/Layout';
import { HomePage } from '@/features/home/HomePage';
import { InvestorsPage } from '@/features/investors/InvestorsPage';
import { AssetsPage } from '@/features/assets/AssetsPage';
import { BankPage } from '@/features/bank/BankPage';
import { LiabilitiesPage } from '@/features/liabilities/LiabilitiesPage';
import { SnapshotsPage } from '@/features/snapshots/SnapshotsPage';
import { DocumentsPage } from '@/features/documents/DocumentsPage';
import { ReportsPage } from '@/features/reports/ReportsPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="3ple-digit-theme">
      <AuthProvider>
        <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
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
            </Layout>
          </ProtectedRoute>
        } />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
