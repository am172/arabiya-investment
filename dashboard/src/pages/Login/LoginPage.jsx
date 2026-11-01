import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import FormInput from '../../components/forms/FormInput';
import { isEmail } from '../../utils/validators';
import { t } from '../../i18n';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isEmail(form.email) || !form.password) {
      setError(t('Enter a valid email and password'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      setError(t(err.message));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-5 card">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t('Welcome back')}</h2>
        <p className="text-sm text-slate-500">{t('Sign in to manage the academy website')}</p>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm font-medium text-red-700 border border-red-200 rounded-xl bg-red-50">
          {error}
        </div>
      )}

      <FormInput
        label="Email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
      />
      <FormInput
        label="Password"
        type="password"
        autoComplete="current-password"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
      />

      <button type="submit" disabled={submitting} className="w-full btn-primary">
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {t('Sign in')}
      </button>
    </form>
  );
}