import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

const SESSION_TIMEOUT = 18000;

export const useSession = () => {
  const { logout } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    localStorage.setItem('last_activity', Date.now().toString());

    timeoutRef.current = setTimeout(() => {
      logout();
      window.location.href = '/login?stat=Session expired';
    }, SESSION_TIMEOUT * 1000);
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'click', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};
