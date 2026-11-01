import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { getT } from '@/lib/serverTexts';

export default async function NotFound() {
  const t = await getT();

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <span className="flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-primary/10 text-primary">
        <SearchX size={36} />
      </span>
      <h1 className="text-4xl font-extrabold sm:text-5xl">{t('common_notFoundTitle')}</h1>
      <p className="max-w-md mt-4 text-muted">{t('common_notFoundText')}</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5"
      >
        {t('common_backHome')}
      </Link>
    </main>
  );
}