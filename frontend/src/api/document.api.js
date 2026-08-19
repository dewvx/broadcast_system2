import axiosClient from './axiosClient';

export const getAllDocuments = () => axiosClient.get('/api/document');

export const uploadDocument = (formData) =>
  axiosClient.post('/api/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteDocument = (id) => axiosClient.delete(`/api/document/${id}`);
