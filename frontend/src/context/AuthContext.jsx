import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi, getMe } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true ตอนแรกสุด กันหน้าจอกระพริบก่อนเช็ค localStorage เสร็จ

  // ตอนเปิดแอปครั้งแรก (หรือ refresh หน้า) เช็คว่ามี user เก็บไว้ใน localStorage มั้ย
  useEffect(() => {
    async function initializeAuth() {
      const savedUser = localStorage.getItem('admin_user');
      const savedToken = localStorage.getItem('admin_token');

      if (savedUser && savedToken) {
        try {
          // ตั้งค่าผู้ใช้งานจาก localStorage ทันทีเพื่อแสดงผลเบื้องต้นอย่างรวดเร็ว (Optimistic Load)
          setUser(JSON.parse(savedUser));
          
          // ตรวจสอบความถูกต้องของ Token และดึงข้อมูลผู้ใช้ที่อัปเดตที่สุดจากเซิร์ฟเวอร์
          const res = await getMe();
          const freshUser = res.data.user;
          localStorage.setItem('admin_user', JSON.stringify(freshUser));
          setUser(freshUser);
        } catch (err) {
          console.error('Session validation failed:', err);
          // หาก token หมดอายุ (401) ให้ล้างเซสชันและบังคับลอกอินใหม่
          if (err.response?.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    }

    initializeAuth();
  }, []);

  async function login(username, password) {
    const res = await loginApi(username, password);
    const { token, user: userData } = res.data;

    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  }

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  }

  function refreshUser(updatedUser) {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('admin_user', JSON.stringify(merged));
    setUser(merged);
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}