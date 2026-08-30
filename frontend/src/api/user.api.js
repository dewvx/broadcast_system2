import axiosClient from './axiosClient';

export function getUsers() {
  return axiosClient.get('/api/user');
}

export function getRoles() {
  return axiosClient.get('/api/user/roles');
}

export function getPublicContacts() {
  return axiosClient.get('/api/user/public/contacts');
}

export function createUser(data) {
  return axiosClient.post('/api/user', data);
}

export function updateUser(id, data) {
  return axiosClient.put(`/api/user/${id}`, data);
}

export function deleteUser(id) {
  return axiosClient.delete(`/api/user/${id}`);
}
