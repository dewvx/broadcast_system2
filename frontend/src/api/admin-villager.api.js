import axiosClient from './axiosClient';

// Admin ดูรายชื่อลูกบ้านทั้งหมด (ต่างจาก villager.api.js ที่เป็นฝั่ง LIFF)
export const getAllVillagers = () => axiosClient.get('/api/villager');

// Admin แก้ไขข้อมูลลูกบ้านแทนให้
export const updateVillager = (id, formData) => axiosClient.put(`/api/villager/${id}`, formData);

// Admin ลบลูกบ้านออกจากระบบ
export const deleteVillager = (id) => axiosClient.delete(`/api/villager/${id}`);
