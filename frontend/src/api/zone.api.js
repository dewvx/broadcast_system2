import axiosClient from './axiosClient';

export function getAllZones() {
  return axiosClient.get('/api/zone');
}

export const getZones = getAllZones;

export function getZoneById(id) {
  return axiosClient.get(`/api/zone/${id}`);
}

export function createZone(data) {
  return axiosClient.post('/api/zone', data);
}

export function updateZone(id, data) {
  return axiosClient.put(`/api/zone/${id}`, data);
}

export function deleteZone(id) {
  return axiosClient.delete(`/api/zone/${id}`);
}
