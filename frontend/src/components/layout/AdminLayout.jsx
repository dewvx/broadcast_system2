import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllNews } from '../../api/news.api';
import { updateUser } from '../../api/user.api';
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
  X,
  Eye,
  EyeOff,
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
];

/* ---------- Edit Profile Modal ---------- */
function EditProfileModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fullName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (form.newPassword && form.newPassword.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setSaving(true);
      const payload = { fullName: form.fullName.trim() };
      if (form.newPassword) {
        payload.password = form.newPassword;
      }

      const res = await updateUser(user.userId, payload);
      setSuccess('บันทึกข้อมูลเรียบร้อยแล้ว');
      onSaved({ fullName: form.fullName.trim() });
      setForm((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-text-primary text-sm">แก้ไขข้อมูลบัญชีของฉัน</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-sm hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* ชื่อเข้าใช้งาน (readonly) */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              ชื่อเข้าใช้งาน (Username)
            </label>
            <input
              type="text"
              value={user?.username || ''}
              readOnly
              className="w-full text-sm px-3 py-2 border border-border rounded-sm bg-slate-50 text-text-muted cursor-not-allowed"
            />
          </div>

          {/* ชื่อ-นามสกุล */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              ชื่อ-นามสกุล <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="ระบุชื่อ-นามสกุลที่แสดงในระบบ"
              className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* เปลี่ยนรหัสผ่าน */}
          <div className="border-t border-border pt-3 space-y-3">
            <p className="text-xs font-medium text-text-secondary">
              เปลี่ยนรหัสผ่าน{' '}
              <span className="font-normal text-text-muted">(ว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span>
            </p>

            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                className="w-full text-sm px-3 py-2 pr-10 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary cursor-pointer"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <input
              type={showPass ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="ยืนยันรหัสผ่านใหม่"
              className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Error / Success */}
          {error && (
            <p className="text-xs text-error bg-error-soft/40 border border-error/20 rounded-sm px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-success bg-success-soft/40 border border-success/20 rounded-sm px-3 py-2">
              ✓ {success}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium border border-border rounded-sm text-text-secondary hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ปิด
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 text-sm font-semibold bg-primary text-white rounded-sm hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Admin Layout ---------- */
function AdminLayout() {
  const { logout, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingNewsCount, setPendingNewsCount] = useState(0);
  const [showEditProfile, setShowEditProfile] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  function handleProfileSaved(updatedData) {
    refreshUser(updatedData);
  }

  const visibleNav = navItems.filter(
    (item) => !item.adminOnly || user?.roleName === 'Admin'
  );

  return (
    <>
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          onSaved={handleProfileSaved}
        />
      )}

      <div className="min-h-screen flex bg-background">
        {/* Sidebar */}
        <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0 shadow-lg z-20">
          {/* Logo & Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-700 shadow-sm"
            />
            <div className="min-w-0">
              <h1 className="text-sm font-bold leading-tight tracking-wide text-white truncate">หอกระจายข่าว</h1>
              <p className="text-[11px] text-slate-400 font-normal truncate">บ้านสี่แยก</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const hasPendingBadge = item.badgeKey === 'pendingNews' && pendingNewsCount > 0;
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
                  <span className="flex-1 truncate">{item.label}</span>
                  {hasPendingBadge && (
                    <span
                      className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-white rounded-full leading-none shadow-xs shrink-0"
                      title={`มีข่าวรออนุมัติ ${pendingNewsCount} ข่าว`}
                    >
                      {pendingNewsCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold shrink-0">
                {user?.fullName ? user.fullName.charAt(0) : 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'ผู้ดูแลระบบ'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.roleName || 'Admin'}</p>
              </div>
              {/* Edit Profile Button */}
              <button
                onClick={() => setShowEditProfile(true)}
                title="แก้ไขข้อมูลบัญชีของฉัน"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-sm transition-colors shrink-0 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
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
    </>
  );
}

export default AdminLayout;
