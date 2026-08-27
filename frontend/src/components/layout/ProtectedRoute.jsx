import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // รอเช็ค localStorage ให้เสร็จก่อน (ดู AuthContext.jsx) กันเด้งไป login ผิดพลาดตอนเพิ่ง refresh หน้า
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // ผ่านแล้ว - render route ลูกที่ห่อไว้ (ดู <Outlet /> ใน router/index.jsx)
  return <Outlet />;
}

export default ProtectedRoute;