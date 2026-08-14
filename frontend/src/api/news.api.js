import axiosClient from './axiosClient';

export function viewNewsDetail(newsId, idToken) {
  return axiosClient.post(`/api/news/${newsId}/view`, { idToken });
}