import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LiffProvider } from '../context/LiffContext';
import RegisterPage from '../pages/liff/RegisterPage';
import NewsDetailPage from '../pages/liff/NewsDetailPage';

function LiffLayout() {
  return (
    <LiffProvider>
      <Outlet />
    </LiffProvider>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/liff/register" replace />,
  },
  {
    path: '/liff',
    element: <LiffLayout />,
    children: [
      { path: 'register', element: <RegisterPage /> },
      { path: 'news/:id', element: <NewsDetailPage /> },
    ],
  },
]);

export default router;