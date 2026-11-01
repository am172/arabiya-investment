import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  Loader2,
  Plug,
  Save,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserPlus,
  LayoutDashboard,
  ClipboardPaste
} from 'lucide-react';
import cloudinaryService from '../../services/cloudinary.service';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../common/ConfirmDialog';
import Loader from '../common/Loader';
import FormInput from '../forms/FormInput';
import { CLOUDINARY_GUIDE_VIDEO } from '../../constants/config';
import { formatDateTime } from '../../utils/formatters';
import { mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create a free account',
    text: 'Go to cloudinary.com, press Sign up for free, and confirm your email.'
  },
  {
    icon: LayoutDashboard,
    title: 'Open your Dashboard',
    text: 'After logging in, open the Dashboard and look for the box named Product Environment Credentials.'
  },
  {
    icon: ClipboardPaste,
    title: 'Copy three values',
    text: 'Copy the Cloud name, the API Key and the API Secret, and paste them in the fields below.'
  }
];

const STATUS = {
  database: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700', label: 'Connected to your Cloudinary account' },
  env: { icon: ShieldCheck, cls: 'bg-sky-50 text-sky-700', label: 'Using the default server storage' },
  none: { icon: CircleDashed, cls: 'bg-amber-50 text-amber-700', label: 'No storage configured. Uploads will fail.' }
};

const isFile = (url) => /\.(mp4|webm)(\?.*)?$/i.test(url);

export default function CloudinaryPanel() {
  const toast = useToast();
  const { confirm, confirmProps } = useConfirm();
  const { data, loading, refetch } = useFetch(() => cloudinaryService.get(), []);
  const [form, setForm] = useState({ cloudName: '', apiKey: '', apiSecret: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (data) setForm((current) => ({ ...current, cloudName: data.cloudName || current.cloudName }));
  }, [data]);

  if (loading && !data) return <Loader />;
  if (!data) return null;

  const status = STATUS[data.source] || STATUS.none;
  const StatusIcon = status.icon;
  const saved = data.hasSecret;

  const bind = (name) => ({
    value: form[name],
    error: errors[name],
    autoComplete: 'off',
    onChange: (event) => setForm({ ...form, [name]: event.target.value })
  });

  const run = async (kind, action, onDone) => {
    setBusy(kind);
    setErrors({});
    try {
      const res = await action();
      onDone(res);
    } catch (err) {
      setErrors(mapServerErrors(err.errors));
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  };

  const handleTest = () =>
    run('test', () => cloudinaryService.test(form), (res) => setResult(res.data));

  const handleSave = () =>
    run('save', () => cloudinaryService.save(form), () => {
      setResult({ ok: true, message: 'Connected' });
      setForm((current) => ({ ...current, apiKey: '', apiSecret: '' }));
      toast.success('Cloudinary connected and saved');
      refetch();
    });

  const handleClear = async () => {
    const ok = await confirm({
      title: 'Remove Cloudinary account',
      message: 'Uploads will use the default server storage again. Files already uploaded stay in your Cloudinary account.',
      confirmLabel: 'Remove'
    });
    if (!ok) return;
    await run('clear', () => cloudinaryService.clear(), () => {
      setForm({ cloudName: '', apiKey: '', apiSecret: '' });
      setResult(null);
      toast.success('Cloudinary settings removed');
      refetch();
    });
  };

  return (
    <section className="p-6 mt-6 space-y-6 card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{t('Media storage (Cloudinary)')}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('Connect your own free Cloudinary account so your images and videos are stored with you.')}
          </p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${status.cls}`}>
          <StatusIcon size={14} />
          {t(status.label)}
        </span>
      </div>

      {data.error === 'decrypt' && (
        <div role="alert" className="flex gap-3 px-4 py-3 text-sm font-medium border rounded-xl border-amber-200 bg-amber-50 text-amber-800">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          {t('The saved secret cannot be read. Enter your API secret again and save.')}
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-semibold text-slate-900">{t('How to get your keys, in 3 steps')}</p>
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative p-4 border rounded-xl border-slate-200 bg-slate-50">
                <span className="absolute -top-2.5 start-4 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="flex items-center justify-center w-10 h-10 mt-1 mb-3 rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={20} />
                </span>
                <p className="text-sm font-semibold text-slate-900">{t(step.title)}</p>
                <p className="mt-1 text-xs leading-6 text-slate-500">{t(step.text)}</p>
              </li>
            );
          })}
        </ol>
        <a
          href="https://cloudinary.com/users/register_free"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
        >
          <ExternalLink size={14} />
          {t('Open cloudinary.com')}
        </a>
      </div>

      {CLOUDINARY_GUIDE_VIDEO && (
        <div className="overflow-hidden bg-black border rounded-xl border-slate-200">
          {isFile(CLOUDINARY_GUIDE_VIDEO) ? (
            <video src={CLOUDINARY_GUIDE_VIDEO} controls className="w-full aspect-video" />
          ) : (
            <iframe
              src={CLOUDINARY_GUIDE_VIDEO}
              title={t('Video guide')}
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video"
            />
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <FormInput label="Cloud name" dir="ltr" placeholder="my-academy" {...bind('cloudName')} />
        <FormInput
          label="API Key"
          dir="ltr"
          inputMode="numeric"
          placeholder={saved ? data.apiKeyMasked : '123456789012345'}
          hint={saved ? 'Leave empty to keep the saved key' : undefined}
          {...bind('apiKey')}
        />
        <FormInput
          label="API Secret"
          dir="ltr"
          type="password"
          placeholder={saved ? '••••••••••••' : ''}
          hint={saved ? 'Leave empty to keep the saved secret' : undefined}
          {...bind('apiSecret')}
        />
      </div>

      {result && (
        <p
          role="status"
          className={`flex items-center gap-2 text-sm font-medium ${result.ok ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {result.ok ? <CheckCircle2 size={16} /> : <TriangleAlert size={16} />}
          {result.ok ? t('The connection works') : `${t('Connection failed')}: ${result.message}`}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {saved && data.updatedAt ? `${t('Last saved')}: ${formatDateTime(data.updatedAt)}` : t('Your API secret is stored encrypted and never shown again.')}
        </p>
        <div className="flex flex-wrap gap-3">
          {saved && (
            <button type="button" className="btn-secondary" disabled={Boolean(busy)} onClick={handleClear}>
              {busy === 'clear' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {t('Remove')}
            </button>
          )}
          <button type="button" className="btn-secondary" disabled={Boolean(busy)} onClick={handleTest}>
            {busy === 'test' ? <Loader2 size={16} className="animate-spin" /> : <Plug size={16} />}
            {t('Test connection')}
          </button>
          <button type="button" className="btn-primary" disabled={Boolean(busy)} onClick={handleSave}>
            {busy === 'save' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {t('Test & Save')}
          </button>
        </div>
      </div>
      <ConfirmDialog {...confirmProps} />
    </section>
  );
}