import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LiffProvider, useLiff } from '../../context/LiffContext';
import { checkOrLogin } from '../../api/villager.api';
import { Home, Newspaper, Calendar, FileText, User } from 'lucide-react';

const navItems = [
  { to: '/liff/home', label: 'หน้าหลัก', icon: Home },
  { to: '/liff/news', label: 'ข่าว', icon: Newspaper },
  { to: '/liff/activities', label: 'กิจกรรม', icon: Calendar },
  { to: '/liff/documents', label: 'เอกสาร', icon: FileText },
];

function LiffNavigation({ isRegistered }) {
  const items = [...navItems, { to: '/liff/profile', label: isRegistered ? 'ฉัน' : 'ลงทะเบียน', icon: User }];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border z-40 max-w-md mx-auto shadow-[0_-4px_16px_rgba(15,23,42,0.06)] safe-bottom">
      <div className="flex items-stretch justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 flex-1 min-h-11 text-body-sm font-medium transition-colors duration-fast ${
                  isActive ? 'text-primary' : 'text-text-muted active:text-text-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="liff-nav-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="absolute top-1.5 w-12 h-9 rounded-full bg-primary-soft"
                    />
                  )}
                  <motion.span whileTap={{ scale: 0.88 }} className="relative">
                    <Icon className={`w-6 h-6 transition-transform duration-fast ${isActive ? 'scale-105' : ''}`} />
                  </motion.span>
                  <span className="relative leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function LiffContentWrapper() {
  const { liff, isLiffReady, idToken } = useLiff();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistered, setIsRegistered] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isLiffReady || initializedRef.current) return;

    async function initLiffNavigation() {
      initializedRef.current = true;

      // 1. ตรวจจับ liff.state จาก query string (เมื่อกดมาจาก LINE Flex Message)
      const searchString = window.location.search;
      const params = new URLSearchParams(searchString);
      const liffState = params.get('liff.state');
      let flexTargetNewsPath = null;

      if (liffState) {
        const decodedPath = decodeURIComponent(liffState);
        let target = decodedPath.startsWith('/') ? decodedPath : `/${decodedPath}`;
        if (!target.startsWith('/liff')) {
          target = `/liff${target}`;
        }
        flexTargetNewsPath = target;

        // ล้าง liff.state ออกจาก URL history ทันที เพื่อไม่ให้เกิด Loop เมื่อผู้ใช้กดเปลี่ยนหน้าในแท็บบาร์ล่าง
        try {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (e) {
          console.warn('Could not clean liff.state query param:', e);
        }
      }

      // 2. ตรวจสอบการลงทะเบียนของลูกบ้านผ่าน backend API
      try {
        let token = idToken;
        if (!token && liff && liff.isLoggedIn && liff.isLoggedIn()) {
          token = liff.getIDToken();
        }

        if (token) {
          const res = await checkOrLogin(token);
          const isNewUser = res.data.isNewUser;

          if (isNewUser) {
            setIsRegistered(false);
            // หากมีข่าวเป้าหมายจากการกด Flex Message ให้จำไว้ส่งกลับไปหาหลังลงทะเบียนเสร็จ
            if (flexTargetNewsPath) {
              sessionStorage.setItem('target_after_register', flexTargetNewsPath);
            }
            // บังคับส่งผู้ใช้ใหม่ไปหน้าลงทะเบียนทันที
            if (window.location.pathname !== '/liff/register') {
              navigate('/liff/register', { replace: true });
            }
          } else {
            setIsRegistered(true);
            // ถ้าเคยลงทะเบียนแล้ว และกดข่าวมาจาก Flex Message ให้เปิดข่าวเป้าหมายนั้นทันที
            if (flexTargetNewsPath) {
              navigate(flexTargetNewsPath, { replace: true });
            }
          }
        } else {
          // หากไม่มี token (เช่น เปิดทดสอบนอก LINE) และกด Flex มา ให้ไปข่าวนั้น
          if (flexTargetNewsPath) {
            navigate(flexTargetNewsPath, { replace: true });
          }
        }
      } catch (err) {
        console.warn('Check registration error:', err);
        if (flexTargetNewsPath) {
          navigate(flexTargetNewsPath, { replace: true });
        }
      }
    }

    initLiffNavigation();
  }, [isLiffReady, liff, idToken, navigate]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile Header Bar */}
      <header className="h-14 bg-slate-900 text-white px-4 flex items-center justify-between sticky top-0 z-30 max-w-md mx-auto shadow-sm">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.jpg"
            alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
          />
          <div>
            <span className="text-[15px] font-bold tracking-wide block leading-tight">หอกระจายข่าวบ้านสี่แยก</span>
            <span className="text-meta text-slate-400 font-normal leading-tight">ระบบประชาสัมพันธ์ชุมชน</span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-md mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <LiffNavigation isRegistered={isRegistered} />
    </div>
  );
}

export function LiffLayout() {
  return (
    <LiffProvider>
      <LiffContentWrapper />
    </LiffProvider>
  );
}

export default LiffLayout;
