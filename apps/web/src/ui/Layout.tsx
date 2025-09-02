import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '@/features/auth/context';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Investori', href: '/investors', icon: '👥' },
  { name: 'Aktíva', href: '/assets', icon: '🏢' },
  { name: 'Banka', href: '/bank', icon: '🏦' },
  { name: 'Záväzky', href: '/liabilities', icon: '💳' },
  { name: 'Snapshots', href: '/snapshots', icon: '📈' },
  { name: 'Dokumenty', href: '/documents', icon: '📄' },
  { name: 'Reporty', href: '/reports', icon: '📋' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-xl font-medium text-foreground">ple Digit</div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="text-sm text-muted-foreground">
                    {user.name} ({user.role})
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Odhlásiť sa
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={clsx(
                        'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
