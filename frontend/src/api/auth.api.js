import axiosClient from './axiosClient';

export function login(username, password) {
  return axiosClient.post('/api/auth/login', { username, password });
}

export function getMe() {
  return axiosClient.get('/api/auth/me');
}

export function forgotPassword(username) {
  return axiosClient.post('/api/auth/forgot-password', { username });
}

export function resetPassword({ username, otp, newPassword }) {
  return axiosClient.post('/api/auth/reset-password', { username, otp, newPassword });
}