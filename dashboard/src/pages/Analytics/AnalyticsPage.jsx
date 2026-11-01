import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Clock,
  Eye,
  Globe,
  MousePointerClick,
  RefreshCw,
  Users
} from 'lucide-react';
import analyticsService from '../../services/analytics.service';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import DateRangePicker from '../../components/analytics/DateRangePicker';
import MetricCard from '../../components/analytics/MetricCard';
import VisitsChart from '../../components/analytics/VisitsChart';
import TopPagesChart from '../../components/analytics/TopPagesChart';
import DeviceChart from '../../components/analytics/DeviceChart';
import RankedCard from '../../components/analytics/RankedCard';
import AnalyticsSkeleton from '../../components/analytics/AnalyticsSkeleton';
import {
  buildParams,
  countryName,
  daysAgoInput,
  describeRange,
  eventTitle,
  flagEmoji,
  formatDuration,
  getTrend,
  todayInput
} from '../../utils/analytics';
import { formatNumber } from '../../utils/formatters';
import { t } from '../../i18n';

function Tile({ children }) {
  return (
    <span className="flex items-center justify-center text-base font-semibold h-9 w-9 shrink-0 rounded-xl bg-slate-100 text-slate-600">
      {children}
    </span>
  );
}

const countryItems = (list) =>
  list.map((item) => ({
    key: item.code || 'unknown',
    label: countryName(item.code),
    value: item.visits,
    leading: <Tile>{flagEmoji(item.code) || <Globe size={16} />}</Tile>
  }));

const cityItems = (list) =>
  list.map((item) => ({
    key: `${item.city}-${item.country}`,
    label: item.city,
    sublabel: item.country,
    value: item.visits,
    leading: <Tile>{item.city.charAt(0).toUpperCase()}</Tile>
  }));

const nameItems = (list) =>
  list.map((item) => ({
    key: item.name,
    label: t(item.name),
    value: item.visits,
    leading: <Tile>{item.name.charAt(0).toUpperCase()}</Tile>
  }));

const eventItems = (list) =>
  list.map((item) => ({
    key: `${item.name}-${item.label}`,
    label: eventTitle(item.name),
    sublabel: item.label,
    value: item.count,
    leading: (
      <Tile>
        <MousePointerClick size={16} />
      </Tile>
    )
  }));

function AnalyticsBody({ data, busy }) {
  const {
    totals,
    previous,
    range,
    timeseries,
    topPages,
    devices,
    browsers,
    operatingSystems,
    countries,
    cities,
    sources,
    topEvents
  } = data;

  const previousValue = (key) => (previous ? previous[key] : null);

  return (
    <div className={`mt-6 space-y-6 transition-opacity ${busy ? 'opacity-60' : ''}`}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total visits"
          value={formatNumber(totals.visits)}
          icon={Users}
          tone="bg-indigo-50 text-indigo-600"
          trend={getTrend(totals.visits, previousValue('visits'))}
          hint="New visit after 30 min idle"
        />
        <MetricCard
          label="Total pageviews"
          value={formatNumber(totals.pageviews)}
          icon={Eye}
          tone="bg-pink-50 text-pink-600"
          trend={getTrend(totals.pageviews, previousValue('pageviews'))}
          hint="All pages combined"
        />
        <MetricCard
          label="Avg. time on page"
          value={formatDuration(totals.avgTimeSeconds)}
          icon={Clock}
          tone="bg-amber-50 text-amber-600"
          trend={getTrend(totals.avgTimeSeconds, previousValue('avgTimeSeconds'))}
          hint="Per pageview"
        />
        <MetricCard
          label="Active now"
          value={formatNumber(totals.activeNow)}
          icon={Activity}
          tone="bg-emerald-50 text-emerald-600"
          hint="Last 5 minutes"
          live
        />
      </div>

      <VisitsChart data={timeseries} granularity={range.granularity} empty={totals.pageviews === 0} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopPagesChart pages={topPages} className="h-full" />
        </div>
        <DeviceChart devices={devices} className="h-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* <RankedCard
          title="Top locations"
          description="Visits by country and city"
          tabs={[
            { id: 'countries', label: 'Countries', items: countryItems(countries) },
            { id: 'cities', label: 'Cities', items: cityItems(cities) }
          ]}
          empty="No location data yet"
        /> */}
        <RankedCard
          title="Traffic sources"
          description="Where visits come from"
          tabs={[{ id: 'sources', label: 'Sources', items: nameItems(sources) }]}
          empty="No traffic sources yet"
        />
        <RankedCard
          title="Browsers and systems"
          description="Visits by technology"
          tabs={[
            { id: 'browsers', label: 'Browsers', items: nameItems(browsers) },
            { id: 'os', label: 'Systems', items: nameItems(operatingSystems) }
          ]}
          empty="No technology data yet"
        />
        <RankedCard
          title="Top actions"
          description="Clicks and interactions"
          tabs={[{ id: 'events', label: 'Actions', items: eventItems(topEvents) }]}
          empty="No actions recorded yet"
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState(() => ({
    preset: 'last7days',
    startDate: daysAgoInput(6),
    endDate: todayInput()
  }));
  const params = useMemo(() => buildParams(range), [range]);
  const { data, loading, error, refetch } = useFetch(
    () => analyticsService.get(params),
    [JSON.stringify(params)]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refetch();
    }, 60000);
    return () => clearInterval(timer);
  }, [refetch]);

  const description = data
    ? `${describeRange(data.range)} · ${data.range.timezone}`
    : 'Visitor insights for the public website.';

  return (
    <div>
      <PageHeader
        title="Analytics"
        description={description}
        action={
          <button type="button" className="btn-secondary" onClick={refetch} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {t('Refresh')}
          </button>
        }
      />

      <DateRangePicker value={range} onChange={setRange} />

      {error && data && (
        <div
          role="alert"
          className="flex items-start gap-3 px-4 py-3 mt-4 text-sm font-medium text-red-700 border border-red-200 rounded-xl bg-red-50"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {t(error)}
        </div>
      )}

      {!data && loading && <AnalyticsSkeleton />}

      {!data && !loading && (
        <div className="mt-6">
          <EmptyState
            title="Could not load analytics"
            description={error}
            action={
              <button type="button" className="btn-primary" onClick={refetch}>
                {t('Try again')}
              </button>
            }
          />
        </div>
      )}

      {data && <AnalyticsBody data={data} busy={loading} />}
    </div>
  );
}