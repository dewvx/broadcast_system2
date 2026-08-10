import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LiffProvider } from '../context/LiffContext';
import RegisterPage from '../pages/liff/RegisterPage';

// Layout เล็กๆ ไว้ครอบเฉพาะ route ใต้ /liff ด้วย LiffProvider
// (ทำให้ liff.init() รันเฉพาะตอนอยู่ใน path นี้เท่านั้น ไม่กระทบฝั่ง Admin)
function LiffLayout({ children }) {
  return <LiffProvider>{children}</LiffProvider>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/liff/register" replace />, // TODO: เปลี่ยนเป็น /admin/login ทีหลังตอนทำหน้า Admin
  },
  {
    path: '/liff/register',
    element: (
      <LiffLayout>
        <RegisterPage />
      </LiffLayout>
    ),
  },
  // TODO: เพิ่ม route ฝั่ง /admin ทีหลัง (ไม่ครอบ LiffProvider)
]);

export default router;