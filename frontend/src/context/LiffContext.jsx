import { createContext, useContext, useEffect, useRef, useState } from 'react';
import liff from '@line/liff';

const LiffContext = createContext(null);

export function LiffProvider({ children }) {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [liffError, setLiffError] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [profile, setProfile] = useState(null);

  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    async function initLiff() {
      const liffId = import.meta.env.VITE_LIFF_ID;

      if (!liffId) {
        console.warn('VITE_LIFF_ID is not defined in environment variables.');
        setIsLiffReady(true);
        return;
      }

      try {
        // init liff พร้อมกับการ auto redirect login เมื่อเปิดภายนอก
        await liff.init({ liffId });

        if (liff.isLoggedIn()) {
          try {
            const token = liff.getIDToken();
            const userProfile = await liff.getProfile();
            setIdToken(token);
            setProfile(userProfile);
          } catch (profileErr) {
            console.warn('Failed to fetch LIFF profile/token:', profileErr);
          }
        } else {
          // ถ้ายังไม่ได้ล็อกอิน ให้สั่ง liff.login() อัตโนมัติ
          liff.login({ redirectUri: window.location.href });
          return;
        }

        setIsLiffReady(true);
      } catch (err) {
        console.error('LIFF init error:', err);
        setLiffError(err.message || 'ไม่สามารถเปิดใช้งาน LINE LIFF ได้');
        setIsLiffReady(true);
      }
    }

    initLiff();
  }, []);

  return (
    <LiffContext.Provider value={{ liff, isLiffReady, liffError, idToken, profile }}>
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  return useContext(LiffContext);
}