import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}