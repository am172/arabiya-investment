import { LogOut, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import ThemeToggle from '../common/ThemeToggle';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { initials } from '../../utils/formatters';
import { t } from '../../i18n';

export default function Topbar({ onMenu }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="flex items-center justify-between h-16 gap-3 px-4 border-b shrink-0 border-slate-200 bg-card sm:px-6">
      <div className="flex items-center min-w-0 gap-3">
        <button
          type="button"
          className="w-10 h-10 icon-btn lg:hidden"
          aria-label={t('Open menu')}
          onClick={onMenu}
        >
          <Menu size={20} />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 shrink-0 sm:gap-3">
        <ThemeToggle />
        <Link
          to={ROUTES.PROFILE}
          className="flex items-center gap-3 px-2 py-1 transition rounded-xl hover:bg-slate-100"
        >
          <div className="hidden text-start sm:block">
            <p className="text-sm font-semibold text-slate-800">{admin.name}</p>
            <p className="text-xs text-slate-500">{t(admin.role === 'super_admin' ? 'Super admin' : 'Admin')}</p>
          </div>
          {admin.avatar && admin.avatar.url ? (
            <img src={admin.avatar.url} alt="" className="object-cover rounded-full h-9 w-9" />
          ) : (
            <div className="flex items-center justify-center text-sm font-semibold rounded-full h-9 w-9 bg-brand-100 text-brand-700">
              {initials(admin.name)}
            </div>
          )}
        </Link>
        <button
          type="button"
          className="w-10 h-10 icon-btn"
          title={t('Log out')}
          aria-label={t('Log out')}
          onClick={handleLogout}
        >
          <LogOut size={18} className="text-red-700 rtl:-scale-x-100" />
        </button>
      </div>
    </header>
  );
}