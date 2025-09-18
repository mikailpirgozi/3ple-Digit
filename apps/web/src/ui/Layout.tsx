import { useAuth } from '@/features/auth/context';
import { cn } from '@/lib/utils';
import { LogOut, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { NavigationIcons } from './icons';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: NavigationIcons.dashboard },
  { name: 'Investori', href: '/investors', icon: NavigationIcons.investors },
  { name: 'Aktíva', href: '/assets', icon: NavigationIcons.assets },
  { name: 'Banka', href: '/bank', icon: NavigationIcons.bank },
  { name: 'Záväzky', href: '/liabilities', icon: NavigationIcons.liabilities },
  { name: 'Snapshots', href: '/snapshots', icon: NavigationIcons.snapshots },
  { name: 'Dokumenty', href: '/documents', icon: NavigationIcons.documents },
  { name: 'Reporty', href: '/reports', icon: NavigationIcons.reports },
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
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden mr-3">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <nav className="mt-8">
                    <ul className="space-y-2">
                      {navigation.map(item => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </SheetContent>
              </Sheet>

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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Odhlásiť</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:border-r lg:border-border lg:bg-card lg:pb-4">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center px-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-xl font-medium text-foreground">ple Digit</div>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col px-6">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map(item => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
