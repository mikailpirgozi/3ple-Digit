import { useTheme } from '@/lib/theme';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(actualTheme === 'dark' ? 'light' : 'dark');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return actualTheme === 'dark' ? Moon : Sun;
    }
    return theme === 'dark' ? Moon : Sun;
  };

  const getTooltip = () => {
    if (theme === 'system') {
      return `System (${actualTheme})`;
    }
    return theme === 'dark' ? 'Dark mode' : 'Light mode';
  };

  const Icon = getIcon();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-8 h-8 xs:w-9 xs:h-9"
      title={getTooltip()}
      aria-label="Toggle theme"
    >
      <Icon className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
    </Button>
  );
}
