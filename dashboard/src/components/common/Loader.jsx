import { useEffect, useState } from 'react';
import BrandMark from './BrandMark';
import { t } from '../../i18n';

export default function Loader({ fullScreen = false, label }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? 'h-full min-h-screen' : 'py-20'
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="brand-bounce">
          <BrandMark size={48} />
        </div>
        <span className="brand-shadow mt-3 h-1.5 w-10 rounded-full bg-slate-900/20" />
      </div>
      {label && <p className="text-sm text-slate-500">{t(label)}</p>}
      {slow && (
        <p className="max-w-xs text-xs text-center text-slate-400">
          {t('The server is waking up. This can take up to a minute.')}
        </p>
      )}
    </div>
  );
}