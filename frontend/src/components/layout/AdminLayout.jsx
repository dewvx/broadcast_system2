import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  FileText,
  Users,
  LogOut,
  Radio,
  UserCheck,
  Tag,
  Bot,
  UserCog,
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'หน้าหลัก', icon: LayoutDashboard, end: true },
  { to: '/admin/news', label: 'จัดการข่าวสาร', icon: Newspaper },
  { to: '/admin/categories', label: 'หมวดหมู่ข่าวสาร', icon: Tag, adminOnly: true },
  { to: '/admin/activities', label: 'ปฏิทินกิจกรรม', icon: Calendar },
  { to: '/admin/documents', label: 'แบบฟอร์มราชการ', icon: FileText },
  { to: '/admin/villagers', label: 'ข้อมูลลูกบ้าน', icon: Users, adminOnly: true },
  { to: '/admin/users', label: 'จัดการผู้ใช้งานระบบ', icon: UserCog },
  { to: '/admin/chatbot-faq', label: 'แชทบอทตอบอัตโนมัติ', icon: Bot, adminOnly: true },
];

function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const visibleNav = navItems.filter(
    (item) => !item.adminOnly || user?.roleName === 'Admin'
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0 shadow-lg z-20">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-wide">หอกระจายข่าว</h1>
            <p className="text-xs text-slate-400 font-normal">ระบบจัดการชุมชน</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2.5 px-3.5 rounded-sm text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold">
              {user?.fullName ? user.fullName.charAt(0) : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'ผู้ดูแลระบบ'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.roleName || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-sm border border-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-text-secondary">
              สวัสดีคุณ <strong className="text-text-primary">{user?.fullName || 'ผู้ใช้งาน'}</strong>
            </span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-soft text-primary border border-primary/20">
            {user?.roleName || 'Admin'}
          </span>
        </header>

        {/* Page Container */}
        <div className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
