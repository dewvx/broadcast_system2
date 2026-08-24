import axiosClient from './axiosClient';

export function getZones() {
  return axiosClient.get('/api/broadcast/zones');
}

export function broadcastNews(newsId, zoneName) {
  return axiosClient.post(`/api/broadcast/${newsId}`, zoneName ? { zoneName } : {});
}

export function scheduleBroadcast(newsId, zoneName, scheduledAt) {
  return axiosClient.post(`/api/broadcast/${newsId}/schedule`, {
    zoneName: zoneName || undefined,
    scheduledAt,
  });
}

export function getScheduledBroadcasts(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return axiosClient.get(`/api/broadcast/scheduled${query}`);
}

export function cancelScheduledBroadcast(scheduleId) {
  return axiosClient.delete(`/api/broadcast/schedule/${scheduleId}`);
}
