import { createContext, useContext, useEffect, useRef, useState } from 'react';
import liff from '@line/liff';

const LiffContext = createContext(null);

export function LiffProvider({ children }) {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [liffError, setLiffError] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
  if (hasInitialized.current) return;
  hasInitialized.current = true;

  async function initLiff() {
      try {
        await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

        // ถ้ายังไม่ login เข้า LINE เลย (เช่นเปิดผ่าน browser ปกติ) ให้เด้งไป login ก่อน
        if (!liff.isLoggedIn()) {
          liff.login();
          return; // liff.login() จะ redirect ออกไปเลย โค้ดหลังจากนี้จะไม่ทำงานต่อในรอบนี้
        }

        const token = liff.getIDToken();
        const userProfile = await liff.getProfile();

        setIdToken(token);
        setProfile(userProfile);
        setIsLiffReady(true);
      } catch (err) {
        console.error('LIFF init error:', err);
        setLiffError(err.message);
      }
    }

    initLiff();
  }, []);

  return (
    <LiffContext.Provider value={{ isLiffReady, liffError, idToken, profile }}>
      {children}
    </LiffContext.Provider>
  );
}

// custom hook เรียกใช้ง่ายๆ จาก component อื่น: const { idToken } = useLiff();
export function useLiff() {
  return useContext(LiffContext);
}