import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '../../i18n';

export default function Pagination({ meta, onChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, limit, total, totalPages, hasNextPage, hasPrevPage } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 mt-4 sm:flex-row">
      <p className="text-sm text-slate-500">{t('Showing {from}–{to} of {total}', { from, to, total })}</p>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-secondary" disabled={!hasPrevPage} onClick={() => onChange(page - 1)}>
          <ChevronRight size={16} />
          {t('Prev')}
        </button>
        <span className="px-2 text-sm text-slate-600">
          {t('Page {page} of {total}', { page, total: totalPages })}
        </span>
        <button type="button" className="btn-secondary" disabled={!hasNextPage} onClick={() => onChange(page + 1)}>
          {t('Next')}
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
}