import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from '../components/common/Toast';
import { t } from '../i18n';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, type, message: t(message) }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message)
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toast toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);