import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import authService from '../services/auth.service';
import { getToken, removeToken, setToken } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return undefined;
    let active = true;
    authService
      .me()
      .then((res) => active && setAdmin(res.data))
      .catch(() => removeToken())
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => setAdmin(null);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    setToken(res.data.token);
    setAdmin(res.data.admin);
    return res.data.admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      removeToken();
    }
    removeToken();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, loading, login, logout, updateAdmin: setAdmin }),
    [admin, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}