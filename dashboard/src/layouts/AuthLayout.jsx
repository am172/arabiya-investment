import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';
import { APP_NAME } from '../constants/config';

export default function AuthLayout() {
  return (
    <div className="relative flex items-center justify-center min-h-full px-4 py-12 bg-gradient-to-br from-brand-50 via-slate-50 to-brand-100">
      <div className="absolute end-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mx-auto mb-4 text-white shadow-lg h-14 w-14 rounded-2xl bg-brand-600">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{APP_NAME}</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}