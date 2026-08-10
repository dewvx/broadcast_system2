import axiosClient from './axiosClient';

export function checkOrLogin(idToken) {
  return axiosClient.post('/api/villager/check', { idToken });
}

export function registerVillager(idToken, formData) {
  return axiosClient.post('/api/villager/register', { idToken, ...formData });
}