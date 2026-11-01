const Analytics = require('../models/Analytics.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const parseUserAgent = require('../utils/userAgent');
const {
  hashSession,
  hashVisitor,
  cleanText,
  normalizePath,
  parseReferrer,
  resolveSource,
  resolveGeo
} = require('../utils/analytics');
const {
  resolveTimezone,
  resolveRange,
  getGranularity,
  buildBuckets,
  startOfDay
} = require('../utils/dateRange');

const MAX_DURATION = 3600;
const ACTIVE_WINDOW_MS = 5 * 60 * 1000;
const FORMATS = {
  hour: '%Y-%m-%dT%H:00',
  day: '%Y-%m-%d',
  month: '%Y-%m'
};

const track = asyncHandler(async (req, res) => {
  res.status(204).end();

  const body = req.body;
  const userAgent = String(req.get('user-agent') || '');
  const agent = parseUserAgent(userAgent);
  if (agent.isBot) return;

  const sessionHash = hashSession(body.sessionId);

  try {
    if (body.type === 'duration') {
      const duration = Math.min(Math.round(Number(body.duration)), MAX_DURATION);
      await Analytics.updateOne(
        { type: 'pageview', viewId: body.viewId, sessionHash },
        { $max: { duration } }
      );
      return;
    }

    const base = {
      visitorHash: hashVisitor(req.ip, userAgent),
      path: normalizePath(body.path),
      device: { category: agent.category, os: agent.os, browser: agent.browser },
      geo: resolveGeo(req.headers, req.ip),
      createdAt: new Date()
    };

    if (body.type === 'event') {
      await Analytics.create({
        ...base,
        type: 'event',
        sessionHash,
        eventName: body.eventName,
        eventLabel: cleanText(body.eventLabel, 100)
      });
      return;
    }

    const referrer = parseReferrer(body.referrer);
    const utmInput = body.utm && typeof body.utm === 'object' ? body.utm : {};
    const utm = {
      source: cleanText(utmInput.source, 60).toLowerCase(),
      medium: cleanText(utmInput.medium, 60).toLowerCase(),
      campaign: cleanText(utmInput.campaign, 100)
    };

    await Analytics.updateOne(
      { type: 'pageview', viewId: body.viewId, sessionHash },
      {
        $setOnInsert: {
          ...base,
          title: cleanText(body.title, 150),
          referrer: referrer.url,
          referrerHost: referrer.host,
          source: resolveSource(utm.source, referrer.host),
          utm
        }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) logger.error(`Analytics track failed: ${error.message}`);
  }
});

const getTotals = async (match) => {
  const [row] = await Analytics.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$visitorHash',
        views: { $sum: 1 },
        durationSum: { $sum: '$duration' },
        durationCount: { $sum: { $cond: [{ $gt: ['$duration', 0] }, 1, 0] } }
      }
    },
    {
      $group: {
        _id: null,
        visitors: { $sum: 1 },
        pageviews: { $sum: '$views' },
        durationSum: { $sum: '$durationSum' },
        durationCount: { $sum: '$durationCount' }
      }
    }
  ]);

  if (!row) return { visitors: 0, pageviews: 0, avgTimeSeconds: 0 };

  return {
    visitors: row.visitors,
    pageviews: row.pageviews,
    avgTimeSeconds: row.durationCount ? Math.round(row.durationSum / row.durationCount) : 0
  };
};

const getTimeseries = async (match, granularity, timezone, start, end) => {
  const rows = await Analytics.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          bucket: { $dateToString: { format: FORMATS[granularity], date: '$createdAt', timezone } },
          visitor: '$visitorHash'
        },
        views: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.bucket',
        visitors: { $sum: 1 },
        pageviews: { $sum: '$views' }
      }
    }
  ]);

  const lookup = new Map(rows.map((row) => [row._id, row]));

  return buildBuckets(start, end, granularity, timezone).map((key) => {
    const row = lookup.get(key);
    return {
      date: key,
      visitors: row ? row.visitors : 0,
      pageviews: row ? row.pageviews : 0
    };
  });
};

const getTopPages = async (match) => {
  const rows = await Analytics.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$path',
        views: { $sum: 1 },
        visitors: { $addToSet: '$visitorHash' },
        avgTime: { $avg: { $cond: [{ $gt: ['$duration', 0] }, '$duration', null] } }
      }
    },
    { $project: { views: 1, avgTime: 1, visitors: { $size: '$visitors' } } },
    { $sort: { views: -1, _id: 1 } },
    { $limit: 10 }
  ]);

  return rows.map((row) => ({
    path: row._id,
    views: row.views,
    visitors: row.visitors,
    avgTimeSeconds: Math.round(row.avgTime || 0)
  }));
};

const groupVisitors = async (match, fields, limit) => {
  const keys = Object.keys(fields);
  const rows = await Analytics.aggregate([
    { $match: match },
    { $group: { _id: { ...fields, visitor: '$visitorHash' } } },
    {
      $group: {
        _id: keys.reduce((acc, key) => ({ ...acc, [key]: `$_id.${key}` }), {}),
        visitors: { $sum: 1 }
      }
    },
    { $sort: { visitors: -1 } },
    { $limit: limit }
  ]);

  return rows.map((row) => ({ ...row._id, visitors: row.visitors }));
};

const getTopEvents = async (match) => {
  const rows = await Analytics.aggregate([
    { $match: { ...match, type: 'event' } },
    {
      $group: {
        _id: { name: '$eventName', label: '$eventLabel' },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return rows.map((row) => ({ name: row._id.name, label: row._id.label, count: row.count }));
};

const getActiveNow = async () => {
  const visitors = await Analytics.distinct('visitorHash', {
    type: 'pageview',
    createdAt: { $gte: new Date(Date.now() - ACTIVE_WINDOW_MS) }
  });
  return visitors.length;
};

const getAnalytics = asyncHandler(async (req, res) => {
  const timezone = resolveTimezone(req.query.timezone);
  const range = resolveRange(req.query, timezone);

  if (range.key === 'all') {
    const first = await Analytics.findOne({ type: 'pageview' })
      .sort({ createdAt: 1 })
      .select('createdAt')
      .lean();
    range.start = startOfDay(first ? first.createdAt : new Date(), timezone);
  }

  const granularity = getGranularity(range.start, range.end);
  const match = { createdAt: { $gte: range.start, $lt: range.end } };
  const pageviews = { ...match, type: 'pageview' };

  const previousMatch =
    range.key === 'all'
      ? null
      : {
          type: 'pageview',
          createdAt: {
            $gte: new Date(range.start.getTime() - (range.end.getTime() - range.start.getTime())),
            $lt: range.start
          }
        };

  const [
    totals,
    previous,
    events,
    activeNow,
    timeseries,
    topPages,
    devices,
    browsers,
    operatingSystems,
    countries,
    cities,
    sources,
    topEvents
  ] = await Promise.all([
    getTotals(pageviews),
    previousMatch ? getTotals(previousMatch) : null,
    Analytics.countDocuments({ ...match, type: 'event' }),
    getActiveNow(),
    getTimeseries(pageviews, granularity, timezone, range.start, range.end),
    getTopPages(pageviews),
    groupVisitors(pageviews, { name: '$device.category' }, 6),
    groupVisitors(pageviews, { name: '$device.browser' }, 6),
    groupVisitors(pageviews, { name: '$device.os' }, 6),
    groupVisitors(pageviews, { code: '$geo.country', name: '$geo.countryName' }, 10),
    groupVisitors(
      { ...pageviews, 'geo.city': { $ne: '' } },
      { city: '$geo.city', country: '$geo.countryName' },
      10
    ),
    groupVisitors(pageviews, { name: '$source' }, 10),
    getTopEvents(match)
  ]);

  const data = {
    range: {
      key: range.key,
      start: range.start,
      end: range.end,
      timezone,
      granularity
    },
    totals: { ...totals, events, activeNow },
    previous,
    timeseries,
    topPages,
    devices,
    browsers,
    operatingSystems,
    countries,
    cities,
    sources,
    topEvents
  };

  res.set('Cache-Control', 'no-store');
  res.status(200).json(new ApiResponse(200, data, 'Analytics fetched successfully'));
});

module.exports = { track, getAnalytics };