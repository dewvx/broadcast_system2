import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// แนบ JWT token อัตโนมัติทุก request (ถ้ามี)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ถ้า token หมดอายุ/ไม่ถูกต้อง (401)
// เด้งกลับหน้า /admin/login เฉพาะเมื่อผู้ใช้กำลังใช้งานฝั่ง Admin (/admin/*) เท่านั้น
// ห้ามเด้งไป /admin/login หากผู้ใช้กำลังใช้งานฝั่งลูกบ้าน (LIFF /liff/*)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || '';

      // เช็คว่าเป็นฝั่ง Admin หรือไม่ (ไม่ใช่ LIFF)
      const isAdminRoute = currentPath.startsWith('/admin') && currentPath !== '/admin/login';
      const isVillagerApi = requestUrl.includes('/api/villager') || requestUrl.includes('/view');

      if (isAdminRoute && !isVillagerApi) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;