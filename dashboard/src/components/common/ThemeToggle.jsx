import { Moon, Sun } from 'lucide-react';
import useDashboardTheme from '../../hooks/useDashboardTheme';
import { t } from '../../i18n';

export default function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useDashboardTheme();
  const label = dark ? t('Light mode') : t('Dark mode');

  return (
    <button
      type="button"
      className={`icon-btn h-10 w-10 ${className}`}
      title={label}
      aria-label={label}
      onClick={toggle}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}