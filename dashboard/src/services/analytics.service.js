import api from './axiosInstance';

const withVisits = (item) =>
  item && typeof item === 'object' ? { ...item, visits: item.visits ?? item.visitors ?? 0 } : item;

const list = (value) => (Array.isArray(value) ? value.map(withVisits) : []);

const normalize = (res) => {
  const data = res.data || {};
  return {
    ...res,
    data: {
      ...data,
      totals: withVisits(data.totals),
      previous: data.previous ? withVisits(data.previous) : data.previous,
      timeseries: list(data.timeseries),
      topPages: list(data.topPages),
      devices: list(data.devices),
      browsers: list(data.browsers),
      operatingSystems: list(data.operatingSystems),
      countries: list(data.countries),
      cities: list(data.cities),
      sources: list(data.sources)
    }
  };
};

export default {
  get: (params) => api.get('/analytics', { params }).then(normalize)
};