import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import { ROUTES } from '../constants/routes';
import { hideSplash } from '../utils/splash';

export default function ProtectedRoute({ roles }) {
  const { admin, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading) hideSplash();
  }, [loading]);

  if (loading) return <Loader fullScreen />;
  if (!admin) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  if (roles && !roles.includes(admin.role)) return <Navigate to={ROUTES.OVERVIEW} replace />;

  return <Outlet />;
}