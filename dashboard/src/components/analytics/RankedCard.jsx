import { useState } from 'react';
import ChartCard, { ChartEmpty } from './ChartCard';
import { formatNumber } from '../../utils/formatters';
import { t } from '../../i18n';

export default function RankedCard({ title, description, tabs, empty }) {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((tab) => tab.id === active) || tabs[0];
  const max = Math.max(...current.items.map((item) => item.value), 1);

  const switcher =
    tabs.length > 1 ? (
      <div className="inline-flex p-1 rounded-xl bg-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={tab.id === current.id}
            onClick={() => setActive(tab.id)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              tab.id === current.id
                ? 'bg-card text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <ChartCard title={title} description={t(description)} action={switcher}>
      {current.items.length === 0 ? (
        <ChartEmpty message={empty} />
      ) : (
        <ul className="space-y-4">
          {current.items.map((item) => (
            <li key={item.key}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center min-w-0 gap-3">
                  {item.leading}
                  <span className="min-w-0">
                    <span className="block font-medium truncate text-slate-800">{item.label}</span>
                    {item.sublabel && (
                      <span className="block text-xs truncate text-slate-400">{item.sublabel}</span>
                    )}
                  </span>
                </span>
                <span className="font-semibold shrink-0 tabular-nums text-slate-700">
                  {formatNumber(item.value)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-brand-500 to-pink-500"
                  style={{ width: `${Math.max(3, (item.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}