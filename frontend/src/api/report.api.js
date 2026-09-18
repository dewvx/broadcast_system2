import axiosClient from './axiosClient';

export function getSummary() {
  return axiosClient.get('/api/report/summary');
}

export function getTopNews(limit = 5) {
  return axiosClient.get(`/api/report/top-news?limit=${limit}`);
}

export function getBroadcastHistory(params = 10) {
  if (typeof params === 'number') {
    return axiosClient.get(`/api/report/broadcast-history?limit=${params}`);
  }
  const { page = 1, limit = 10, search = '' } = params || {};
  const query = new URLSearchParams();
  if (page) query.append('page', page);
  if (limit) query.append('limit', limit);
  if (search && search.trim()) query.append('search', search.trim());
  return axiosClient.get(`/api/report/broadcast-history?${query.toString()}`);
}