import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import ChartCard, { ChartEmpty } from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { DEVICE_COLORS, FALLBACK_COLORS } from './chartTheme';
import { formatNumber } from '../../utils/formatters';
import { t } from '../../i18n';

const ICONS = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };

const colorFor = (name, index) =>
  DEVICE_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

export default function DeviceChart({ devices, className = '' }) {
  const total = devices.reduce((sum, item) => sum + item.visits, 0);

  return (
    <ChartCard title="Device types" description={t('Visits by device')} className={className}>
      {devices.length === 0 ? (
        <ChartEmpty />
      ) : (
        <div>
          <div dir="ltr" className="relative mx-auto h-52 w-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={devices}
                  dataKey="visits"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={devices.length > 1 ? 3 : 0}
                  stroke="none"
                >
                  {devices.map((item, index) => (
                    <Cell key={item.name} fill={colorFor(item.name, index)} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip
                      rows={(payload) =>
                        payload.map((item, index) => ({
                          label: t(item.name),
                          value: `${formatNumber(item.value)} ${t('visits')}`,
                          color: colorFor(item.name, index)
                        }))
                      }
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{formatNumber(total)}</span>
              <span className="text-xs text-slate-500">{t('visits')}</span>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {devices.map((item, index) => {
              const Icon = ICONS[item.name] || Monitor;
              const percent = total ? Math.round((item.visits / total) * 100) : 0;
              return (
                <li key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2.5 text-slate-700">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: colorFor(item.name, index) }}
                    />
                    <Icon size={16} className="text-slate-400" />
                    {t(item.name)}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {formatNumber(item.visits)}
                    <span className="ms-1.5 font-normal text-slate-400">· {percent}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}