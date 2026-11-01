import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import { ROUTES } from '../constants/routes';
import { hideSplash } from '../utils/splash';

export default function PublicRoute() {
  const { admin, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading) hideSplash();
  }, [loading]);

  if (loading) return <Loader fullScreen />;
  if (admin) {
    const target =
      (location.state && location.state.from && location.state.from.pathname) || ROUTES.OVERVIEW;
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}