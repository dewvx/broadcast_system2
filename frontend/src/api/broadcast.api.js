import axiosClient from './axiosClient';

export function getZones() {
  return axiosClient.get('/api/broadcast/zones');
}

export function broadcastNews(newsId, zoneName) {
  return axiosClient.post(`/api/broadcast/${newsId}`, zoneName ? { zoneName } : {});
}