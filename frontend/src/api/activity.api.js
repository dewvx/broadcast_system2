import axiosClient from './axiosClient';

export const getAllActivities = () => axiosClient.get('/api/activity');

export const getActivity = (id) => axiosClient.get(`/api/activity/${id}`);

export const createActivity = (data) => axiosClient.post('/api/activity', data);

export const updateActivity = (id, data) => axiosClient.put(`/api/activity/${id}`, data);

export const deleteActivity = (id) => axiosClient.delete(`/api/activity/${id}`);
