import axiosClient from './axiosClient';

export function checkOrLogin(idToken) {
  return axiosClient.post('/api/villager/check', { idToken });
}

export function registerVillager(idToken, formData) {
  return axiosClient.post('/api/villager/register', { idToken, ...formData });
}

export function getNewsListForVillager(idToken) {
  return axiosClient.post('/api/villager/news', { idToken });
}

export function getNewsDetailForVillager(newsId, idToken) {
  return axiosClient.post(`/api/news/${newsId}/view`, { idToken });
}

export function getActivitiesForVillager(idToken) {
  return axiosClient.post('/api/villager/activities', { idToken });
}

export function getActivityDetailForVillager(actId, idToken) {
  return axiosClient.post(`/api/villager/activities/${actId}`, { idToken });
}

export function getDocumentsForVillager(idToken) {
  return axiosClient.post('/api/villager/documents', { idToken });
}

export function getPublicCategories() {
  return axiosClient.get('/api/category/public');
}