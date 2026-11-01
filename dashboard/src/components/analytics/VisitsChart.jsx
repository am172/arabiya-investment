import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import ChartCard, { ChartEmpty } from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { CHART_COLORS, axisTick } from './chartTheme';
import { formatAxisLabel, formatTooltipLabel } from '../../utils/analytics';
import { formatNumber } from '../../utils/formatters';
import { t } from '../../i18n';

const SERIES = [
  { key: 'visits', label: 'Visits', color: CHART_COLORS.primary },
  { key: 'pageviews', label: 'Pageviews', color: CHART_COLORS.accent }
];

export default function VisitsChart({ data, granularity, empty }) {
  const [visible, setVisible] = useState({ visits: true, pageviews: true });

  const toggle = (key) => {
    const next = { ...visible, [key]: !visible[key] };
    if (!next.visits && !next.pageviews) return;
    setVisible(next);
  };

  const toggles = (
    <div className="flex gap-2">
      {SERIES.map((series) => (
        <button
          key={series.key}
          type="button"
          aria-pressed={visible[series.key]}
          onClick={() => toggle(series.key)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            visible[series.key]
              ? 'border-slate-300 bg-card text-slate-800'
              : 'border-slate-200 bg-slate-50 text-slate-400'
          }`}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: visible[series.key] ? series.color : '#94a3b8' }}
          />
          {t(series.label)}
        </button>
      ))}
    </div>
  );

  return (
    <ChartCard
      title="Visits over time"
      description={t('Grouped by {unit}', { unit: t(granularity) })}
      action={toggles}
    >
      {empty ? (
        <ChartEmpty />
      ) : (
        <div dir="ltr" className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-visits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-pageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatAxisLabel(value, granularity)}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                cursor={{ stroke: CHART_COLORS.axis, strokeDasharray: '4 4' }}
                content={
                  <ChartTooltip
                    title={(label) => formatTooltipLabel(label, granularity)}
                    rows={(payload) =>
                      payload.map((item) => ({
                        label: t(item.name),
                        value: formatNumber(item.value),
                        color: item.color || item.stroke
                      }))
                    }
                  />
                }
              />
              {visible.pageviews && (
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  name="Pageviews"
                  stroke={CHART_COLORS.accent}
                  strokeWidth={2.5}
                  fill="url(#grad-pageviews)"
                  dot={data.length <= 2}
                  activeDot={{ r: 5 }}
                />
              )}
              {visible.visits && (
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="Visits"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2.5}
                  fill="url(#grad-visits)"
                  dot={data.length <= 2}
                  activeDot={{ r: 5 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}