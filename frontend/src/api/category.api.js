import axiosClient from './axiosClient';

export function getAllCategories() {
  return axiosClient.get('/api/category');
}

// Alias for getCategories
export const getCategories = getAllCategories;

export function createCategory(data) {
  return axiosClient.post('/api/category', data);
}

export function updateCategory(id, data) {
  return axiosClient.put(`/api/category/${id}`, data);
}

export function deleteCategory(id) {
  return axiosClient.delete(`/api/category/${id}`);
}
