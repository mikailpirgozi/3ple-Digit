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
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden mr-2 sm:mr-3 h-9 w-9 sm:h-10 sm:w-10">
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:w-80">
                  <nav className="mt-6 sm:mt-8">
                    <ul className="space-y-1 sm:space-y-2">
                      {navigation.map(item => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center space-x-3 rounded-lg px-3 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </SheetContent>
              </Sheet>

              <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="text-xl sm:text-2xl font-bold text-primary">3</div>
                <div className="text-lg sm:text-xl font-medium text-foreground">ple Digit</div>
              </Link>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              <ThemeToggle />
              {user && (
                <>
                  <div className="hidden xs:block text-xs sm:text-sm text-muted-foreground truncate max-w-32 sm:max-w-none">
                    <span className="hidden sm:inline">{user.name ?? 'User'}</span>
                    <span className="sm:hidden">{user.name?.split(' ')[0] ?? 'User'}</span>
                    <span className="text-xs"> ({user.role})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex items-center space-x-1 sm:space-x-2 h-8 sm:h-9 px-2 sm:px-3"
                  >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline text-xs sm:text-sm">Odhlásiť</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:ml-0 lg:pl-72">
        {children}
      </main>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-border lg:bg-card lg:pb-4">
        <div className="flex h-full flex-col">
          <div className="flex h-14 sm:h-16 shrink-0 items-center px-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-xl font-medium text-foreground">ple Digit</div>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col px-6">
            <ul className="flex flex-1 flex-col gap-y-6">
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
                            'group flex gap-x-3 rounded-md p-2.5 text-sm font-semibold leading-6 transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="truncate">{item.name}</span>
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
