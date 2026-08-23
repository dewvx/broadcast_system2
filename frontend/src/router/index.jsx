import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';
import LiffLayout from '../components/layout/LiffLayout';
import HomePage from '../pages/liff/HomePage';
import NewsListPage from '../pages/liff/NewsListPage';
import NewsDetailPage from '../pages/liff/NewsDetailPage';
import ActivityListPage from '../pages/liff/ActivityListPage';
import ActivityDetailPage from '../pages/liff/ActivityDetailPage';
import DocumentListPage from '../pages/liff/DocumentListPage';
import RegisterPage from '../pages/liff/RegisterPage';
import ProfilePage from '../pages/liff/ProfilePage';
import LoginPage from '../pages/admin/LoginPage';
import ForgotPasswordPage from '../pages/admin/ForgotPasswordPage';
import DashboardPage from '../pages/admin/DashboardPage';
import NewsManagementPage from '../pages/admin/NewsManagementPage';
import NewsFormPage from '../pages/admin/NewsFormPage';
import NewsViewPage from '../pages/admin/NewsViewPage';
import VillagerPage from '../pages/admin/VillagerPage';
import UserPage from '../pages/admin/UserPage';
import ActivityPage from '../pages/admin/ActivityPage';
import DocumentPage from '../pages/admin/DocumentPage';
import CategoryPage from '../pages/admin/CategoryPage';
import ChatbotFaqPage from '../pages/admin/ChatbotFaqPage';

function LiffIndexRedirector() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const liffState = params.get('liff.state');

  if (liffState) {
    return null;
  }

  return <Navigate to="/liff/home" replace />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LiffIndexRedirector />,
  },
  {
    path: '/liff',
    element: <LiffLayout />,
    children: [
      { index: true, element: <LiffIndexRedirector /> },
      { path: 'home', element: <HomePage /> },
      { path: 'news', element: <NewsListPage /> },
      { path: 'news/:id', element: <NewsDetailPage /> },
      { path: 'activities', element: <ActivityListPage /> },
      { path: 'activities/:id', element: <ActivityDetailPage /> },
      { path: 'documents', element: <DocumentListPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'news', element: <NewsManagementPage /> },
              { path: 'news/create', element: <NewsFormPage /> },
              { path: 'news/edit/:id', element: <NewsFormPage /> },
              { path: 'news/view/:id', element: <NewsViewPage /> },
              { path: 'categories', element: <CategoryPage /> },
              { path: 'activities', element: <ActivityPage /> },
              { path: 'documents', element: <DocumentPage /> },
              { path: 'villagers', element: <VillagerPage /> },
              { path: 'users', element: <UserPage /> },
              { path: 'chatbot-faq', element: <ChatbotFaqPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;