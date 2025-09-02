import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context';
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
  );
}

export default App;
