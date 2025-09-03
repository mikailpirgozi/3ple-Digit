import { useAuth } from '@/features/auth/context';
import { clsx } from 'clsx';
import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent mr-3"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              <Link to="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-xl font-medium text-foreground">ple Digit</div>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              {user && (
                <>
                  <div className="hidden sm:block text-sm text-muted-foreground">
                    {user.name} ({user.role})
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="hidden sm:inline">Odhlásiť sa</span>
                    <span className="sm:hidden">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map(item => {
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

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />

            {/* Sidebar */}
            <aside className="relative w-64 bg-card border-r border-border">
              <nav className="mt-8 px-4">
                <ul className="space-y-2">
                  {navigation.map(item => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
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
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
