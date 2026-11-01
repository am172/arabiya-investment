import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import settingsService from '../services/settings.service';
import { rememberBrand } from '../utils/splash';

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    settingsService
      .get()
      .then((res) => {
        const data = res.data || {};
        const colors = (data.theme && data.theme.colors) || {};
        rememberBrand({
          name: data.siteName,
          logo: data.logo && data.logo.url,
          color: colors.primary
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 overflow-y-auto sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}