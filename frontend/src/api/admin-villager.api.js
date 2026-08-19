import axiosClient from './axiosClient';

// Admin ดูรายชื่อลูกบ้านทั้งหมด (ต่างจาก villager.api.js ที่เป็นฝั่ง LIFF)
export const getAllVillagers = () => axiosClient.get('/api/villager');
