import { Menu, Bell, Download, Moon, Sun } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { useTheme } from '../../app/contexts/ThemeContext';
import { NotificationsDropdown } from '../features/admin/NotificationsDropdown';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export const Header = ({ title, subtitle, onMenuClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] border-b border-[var(--border-default)] dark:border-[var(--border-default)] px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-48 lg:w-64 pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </header>
  );
};


