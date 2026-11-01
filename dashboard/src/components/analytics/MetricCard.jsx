import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { t } from '../../i18n';

const TREND_STYLES = {
  up: { icon: ArrowUpRight, cls: 'bg-emerald-50 text-emerald-700' },
  down: { icon: ArrowDownRight, cls: 'bg-rose-50 text-rose-700' },
  flat: { icon: Minus, cls: 'bg-slate-100 text-slate-600' }
};

export default function MetricCard({ label, value, icon: Icon, tone, trend, hint, live = false }) {
  const style = trend ? TREND_STYLES[trend.direction] : null;
  const TrendIcon = style ? style.icon : null;

  return (
    <div className="p-5 card">
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={22} />
        </span>
        {live && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-500" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            {t('Live')}
          </span>
        )}
        {style && (
          <span
            title={t('Compared with the previous period')}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style.cls}`}
          >
            <TrendIcon size={14} />
            {trend.label}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{t(label)}</p>
      {hint && <p className="text-xs text-slate-500">{t(hint)}</p>}
    </div>
  );
}