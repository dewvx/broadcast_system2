import { createContext, useContext, useEffect, useState } from 'react';
import liff from '@line/liff';

const LiffContext = createContext(null);

export function LiffProvider({ children }) {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [liffError, setLiffError] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function initLiff() {
      try {
        await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
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

export function useLiff() {
  return useContext(LiffContext);
}