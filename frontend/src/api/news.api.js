import axiosClient from './axiosClient';

export function getAllNews() {
  return axiosClient.get('/api/news');
}

export function getNewsById(id) {
  return axiosClient.get(`/api/news/${id}`);
}

export function createNews(data) {
  return axiosClient.post('/api/news', data);
}

export function updateNews(id, data) {
  return axiosClient.put(`/api/news/${id}`, data);
}

export function deleteNews(id) {
  return axiosClient.delete(`/api/news/${id}`);
}

export function approveNews(id) {
  return axiosClient.patch(`/api/news/${id}/approve`);
}

export function rejectNews(id) {
  return axiosClient.patch(`/api/news/${id}/reject`);
}

export function viewNewsDetail(newsId, idToken) {
  return axiosClient.post(`/api/news/${newsId}/view`, { idToken });
}
export function uploadNewsImage(newsId, file) {
  const formData = new FormData();
  formData.append('image', file);
  return axiosClient.post(`/api/news/${newsId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}