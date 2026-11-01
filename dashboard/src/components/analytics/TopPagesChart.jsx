import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import ChartCard, { ChartEmpty } from './ChartCard';
import ChartTooltip from './ChartTooltip';
import { CHART_COLORS, axisTick } from './chartTheme';
import { formatDuration, pageLabel } from '../../utils/analytics';
import { formatNumber, truncate } from '../../utils/formatters';
import { t } from '../../i18n';

export default function TopPagesChart({ pages, className = '' }) {
    const data = pages.map((page) => ({ ...page, label: truncate(pageLabel(page.path), 20) }));
    const height = Math.max(220, data.length * 46 + 24);

    return (
        <ChartCard
            title="Top visited pages"
            description={t('Pageviews per page')}
            className={className}
        >
            {data.length === 0 ? (
                <ChartEmpty />
            ) : (
                <div dir="ltr" style={{ height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 36, left: 0, bottom: 0 }}
                            barCategoryGap={14}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={CHART_COLORS.grid}
                                strokeOpacity={0.3}
                                horizontal={false}
                            />
                            <XAxis type="number" allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
                            <YAxis
                                type="category"
                                dataKey="label"
                                width={120}
                                tick={axisTick}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgb(99 102 241 / 0.08)' }}
                                content={
                                    <ChartTooltip
                                        title={(label, payload) => payload[0].payload.path}
                                        rows={(payload) => {
                                            const page = payload[0].payload;
                                            return [
                                                { label: t('Views'), value: formatNumber(page.views), color: CHART_COLORS.primary },
                                                { label: t('Visits'), value: formatNumber(page.visits), color: CHART_COLORS.accent },
                                                {
                                                    label: t('Avg. time'),
                                                    value: page.avgTimeSeconds ? formatDuration(page.avgTimeSeconds) : '—',
                                                    color: CHART_COLORS.secondary
                                                }
                                            ];
                                        }}
                                    />
                                }
                            />
                            <Bar dataKey="views" name="Views" fill={CHART_COLORS.primary} radius={[0, 8, 8, 0]} barSize={18}>
                                <LabelList dataKey="views" position="right" fill="#94a3b8" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </ChartCard>
    );
}