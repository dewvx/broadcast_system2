import axiosClient from './axiosClient';

export function getSummary() {
  return axiosClient.get('/api/report/summary');
}

export function getTopNews(limit = 5) {
  return axiosClient.get(`/api/report/top-news?limit=${limit}`);
}

export function getBroadcastHistory(limit = 10) {
  return axiosClient.get(`/api/report/broadcast-history?limit=${limit}`);
}