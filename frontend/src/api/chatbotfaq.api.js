import axiosClient from './axiosClient';

export const getAllFaqs = () => axiosClient.get('/api/chatbot-faq');

export const createFaq = (data) => axiosClient.post('/api/chatbot-faq', data);

export const updateFaq = (id, data) => axiosClient.put(`/api/chatbot-faq/${id}`, data);

export const deleteFaq = (id) => axiosClient.delete(`/api/chatbot-faq/${id}`);

export const getChatbotLogs = (params) => axiosClient.get('/api/chatbot-faq/logs', { params });
