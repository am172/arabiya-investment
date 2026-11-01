'use client';

import { RotateCcw } from 'lucide-react';
import { useT } from '@/components/providers/TextsProvider';

export default function ErrorPage({ reset }) {
  const t = useT();

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-extrabold sm:text-5xl">{t('common_errorTitle')}</h1>
      <p className="max-w-md mt-4 text-muted">{t('common_errorText')}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5"
      >
        <RotateCcw size={16} />
        {t('common_tryAgain')}
      </button>
    </main>
  );
}