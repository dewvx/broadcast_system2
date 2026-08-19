import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LiffProvider, useLiff } from '../../context/LiffContext';
import { checkOrLogin } from '../../api/villager.api';
import { Home, Newspaper, Calendar, FileText, User, Radio } from 'lucide-react';

function LiffNavigation({ isRegistered }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 max-w-md mx-auto flex items-center justify-around h-14 shadow-lg">
      <NavLink
        to="/liff/home"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-secondary'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span>หน้าหลัก</span>
      </NavLink>

      <NavLink
        to="/liff/news"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-secondary'
          }`
        }
      >
        <Newspaper className="w-5 h-5" />
        <span>ข่าว</span>
      </NavLink>

      <NavLink
        to="/liff/activities"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-secondary'
          }`
        }
      >
        <Calendar className="w-5 h-5" />
        <span>กิจกรรม</span>
      </NavLink>

      <NavLink
        to="/liff/documents"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-secondary'
          }`
        }
      >
        <FileText className="w-5 h-5" />
        <span>เอกสาร</span>
      </NavLink>

      <NavLink
        to="/liff/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-secondary'
          }`
        }
      >
        <User className="w-5 h-5" />
        <span>{isRegistered ? 'ฉัน' : 'ลงทะเบียน'}</span>
      </NavLink>
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
    <div className="min-h-screen bg-background pb-16">
      {/* Mobile Header Bar */}
      <header className="h-12 bg-slate-900 text-white px-4 flex items-center justify-between sticky top-0 z-30 max-w-md mx-auto shadow-sm">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold tracking-wide">หอกระจายข่าวชุมชน</span>
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
