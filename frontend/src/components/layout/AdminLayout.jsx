import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getAllNews } from '../../api/news.api';
import EditProfileModal from './EditProfileModal';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  FileText,
  Users,
  LogOut,
  UserCheck,
  Tag,
  Bot,
  UserCog,
  Settings,
  Menu,
  X,
  History,
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'หน้าหลัก', icon: LayoutDashboard, end: true },
  { to: '/admin/news', label: 'จัดการข่าวสาร', icon: Newspaper, badgeKey: 'pendingNews' },
  { to: '/admin/categories', label: 'หมวดหมู่ข่าวสาร', icon: Tag, adminOnly: true },
  { to: '/admin/activities', label: 'ปฏิทินกิจกรรม', icon: Calendar },
  { to: '/admin/documents', label: 'แบบฟอร์มราชการ', icon: FileText },
  { to: '/admin/villagers', label: 'ข้อมูลลูกบ้าน', icon: Users, adminOnly: true },
  { to: '/admin/users', label: 'จัดการผู้ใช้งานระบบ', icon: UserCog },
  { to: '/admin/chatbot-faq', label: 'แชทบอทตอบอัตโนมัติ', icon: Bot, adminOnly: true },
  { to: '/admin/chatbot-logs', label: 'ประวัติการสอบถาม', icon: History, adminOnly: true },
];

function SidebarContent({ user, pendingNewsCount, onEditProfile, onLogout }) {
  const visibleNav = navItems.filter(
    (item) => !item.adminOnly || user?.roleName === 'Admin'
  );

  return (
    <>
      {/* Logo & Brand */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/15 shadow-sm"
        />
        <div className="min-w-0">
          <h1 className="text-body font-bold tracking-wide text-white truncate">หอกระจายข่าว</h1>
          <p className="text-body-sm text-slate-400 truncate">บ้านสี่แยก</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const hasPendingBadge = item.badgeKey === 'pendingNews' && pendingNewsCount > 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center gap-3 min-h-11 px-3.5 rounded-md text-body-sm font-medium transition-colors duration-fast ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="admin-nav-active"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 bg-primary rounded-md shadow-sm"
                    />
                  )}
                  <Icon className="relative w-[18px] h-[18px] shrink-0" />
                  <span className="relative flex-1 truncate">{item.label}</span>
                  {hasPendingBadge && (
                    <span
                      className="relative px-2 py-0.5 text-meta font-bold bg-warning text-white rounded-full leading-none shrink-0"
                      title={`มีข่าวรออนุมัติ ${pendingNewsCount} ข่าว`}
                    >
                      {pendingNewsCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary-soft text-primary-active border border-white/10 flex items-center justify-center text-body-sm font-semibold shrink-0">
            {user?.fullName ? user.fullName.charAt(0) : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-semibold text-white truncate">{user?.fullName || 'ผู้ดูแลระบบ'}</p>
            <p className="text-meta text-slate-400 truncate">{user?.roleName || 'Admin'}</p>
          </div>
          <button
            onClick={onEditProfile}
            title="แก้ไขข้อมูลบัญชีของฉัน"
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors duration-fast shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onLogout}
          className="w-full min-h-11 flex items-center justify-center gap-2 px-3 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/25 text-red-400 text-body-sm font-medium rounded-md border border-red-500/20 transition-colors duration-fast cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </>
  );
}

/* ---------- Admin Layout ---------- */
function AdminLayout() {
  const { logout, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingNewsCount, setPendingNewsCount] = useState(0);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    async function fetchPendingNews() {
      try {
        const res = await getAllNews();
        if (res.data?.data) {
          const pending = res.data.data.filter((n) => n.news_status === 'Pending').length;
          setPendingNewsCount(pending);
        }
      } catch (err) {
        console.error('Failed to load pending news count:', err);
      }
    }

    if (user) {
      fetchPendingNews();
    }
  }, [user, location.pathname]);

  // ปิด drawer เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setShowMobileNav(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = showMobileNav ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileNav]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  function handleProfileSaved(updatedData) {
    refreshUser(updatedData);
  }

  const sidebarProps = {
    user,
    pendingNewsCount,
    onEditProfile: () => setShowEditProfile(true),
    onLogout: handleLogout,
  };

  return (
    <>
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          onSaved={handleProfileSaved}
        />
      )}

      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 h-14 bg-slate-900 text-white px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setShowMobileNav(true)}
            aria-label="เปิดเมนู"
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-body font-bold truncate">หอกระจายข่าวบ้านสี่แยก</span>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-meta font-medium bg-white/10 text-white border border-white/15 shrink-0">
          {user?.roleName || 'Admin'}
        </span>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {showMobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="lg:hidden fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setShowMobileNav(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[1150] w-72 max-w-[85vw] bg-slate-900 text-white flex flex-col shadow-lg"
            >
              <button
                onClick={() => setShowMobileNav(false)}
                aria-label="ปิดเมนู"
                className="absolute top-4 right-3 w-9 h-9 z-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent {...sidebarProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col shrink-0 sticky top-0 h-screen z-20">
          <SidebarContent {...sidebarProps} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="hidden lg:flex h-16 bg-surface border-b border-border px-8 justify-between items-center sticky top-0 z-30">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-[18px] h-[18px] text-secondary" />
              <span className="text-body text-text-secondary">
                สวัสดีคุณ <strong className="font-semibold text-text-primary">{user?.fullName || 'ผู้ใช้งาน'}</strong>
              </span>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-body-sm font-medium bg-primary-soft text-primary-active border border-primary/15">
              {user?.roleName || 'Admin'}
            </span>
          </header>

          {/* Page Container */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden max-w-7xl w-full mx-auto">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminLayout;
