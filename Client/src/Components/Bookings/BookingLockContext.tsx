// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from 'react';
// import { bookingApi, type MyLockResponse } from "../../services/bookingApi"

// interface LockInfo {
//   booking_id: string;
//   pnr: string;
//   locked_at: string;
//   session_id: string;
// }

// interface BookingLockContextValue {
//   lock: LockInfo | null;
//   loading: boolean;
//   /** Fetch the current lock from the server */
//   refresh: () => Promise<void>;
//   /** Explicitly set the lock (called by the detail page after acquiring) */
//   setLock: (lock: LockInfo | null) => void;
//   /** Clear the lock locally (called after Add Remark succeeds) */
//   clearLock: () => void;
//   /** True if the given booking id is currently held by the caller */
//   isHolding: (bookingId: string) => boolean;
//   /** True if the caller holds any lock at all */
//   hasAnyLock: boolean;
// }

// const BookingLockContext = createContext<BookingLockContextValue | undefined>(
//   undefined
// );

// export const BookingLockProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [lock, setLockState] = useState<LockInfo | null>(null);
//   const [loading, setLoading] = useState(true);

//   const refresh = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await bookingApi.getMyLock();
//       const data: MyLockResponse = res.data;
//       if (data.success && data.has_lock && data.lock) {
//         setLockState(data.lock);
//       } else {
//         setLockState(null);
//       }
//     } catch {
//       setLockState(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const setLock = useCallback((next: LockInfo | null) => {
//     setLockState(next);
//   }, []);

//   const clearLock = useCallback(() => {
//     setLockState(null);
//   }, []);

//   // Fetch on mount and whenever the tab regains focus
//   useEffect(() => {
//     refresh();
//     const onFocus = () => refresh();
//     window.addEventListener('focus', onFocus);
//     return () => window.removeEventListener('focus', onFocus);
//   }, [refresh]);

//   const isHolding = useCallback(
//     (bookingId: string) => lock?.booking_id === bookingId,
//     [lock]
//   );

//   const value = useMemo<BookingLockContextValue>(
//     () => ({
//       lock,
//       loading,
//       refresh,
//       setLock,
//       clearLock,
//       isHolding,
//       hasAnyLock: !!lock,
//     }),
//     [lock, loading, refresh, setLock, clearLock, isHolding]
//   );

//   return (
//     <BookingLockContext.Provider value={value}>
//       {children}
//     </BookingLockContext.Provider>
//   );
// };

// export const useBookingLock = (): BookingLockContextValue => {
//   const ctx = useContext(BookingLockContext);
//   if (!ctx) {
//     throw new Error('useBookingLock must be used inside <BookingLockProvider>');
//   }
//   return ctx;
// };



import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { bookingApi, type MyLockResponse } from '../../services/bookingApi';
import { useAuth } from '../../hooks/useAuth';

interface LockInfo {
  booking_id: string;
  pnr: string;
  locked_at: string;
  session_id: string;
}

interface BookingLockContextValue {
  lock: LockInfo | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setLock: (lock: LockInfo | null) => void;
  clearLock: () => void;
  isHolding: (bookingId: string) => boolean;
  hasAnyLock: boolean;
}

const BookingLockContext = createContext<BookingLockContextValue | undefined>(
  undefined
);

export const BookingLockProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [lock, setLockState] = useState<LockInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const userKey = user ? String(user.user_id) : '';

  const refresh = useCallback(async () => {
    if (!userKey) {
      setLockState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await bookingApi.getMyLock();
      const data: MyLockResponse = res.data;
      if (data.success && data.has_lock && data.lock) {
        setLockState(data.lock);
      } else {
        setLockState(null);
      }
    } catch {
      setLockState(null);
    } finally {
      setLoading(false);
    }
  }, [userKey]);

  const setLock = useCallback((next: LockInfo | null) => {
    setLockState(next);
  }, []);

  const clearLock = useCallback(() => {
    setLockState(null);
  }, []);

  useEffect(() => {
    if (!userKey) {
      setLockState(null);
      setLoading(false);
      return;
    }

    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh, userKey]);

  const isHolding = useCallback(
    (bookingId: string) => lock?.booking_id === bookingId,
    [lock]
  );

  const value = useMemo<BookingLockContextValue>(
    () => ({
      lock,
      loading,
      refresh,
      setLock,
      clearLock,
      isHolding,
      hasAnyLock: !!lock,
    }),
    [lock, loading, refresh, setLock, clearLock, isHolding]
  );

  return (
    <BookingLockContext.Provider value={value}>
      {children}
    </BookingLockContext.Provider>
  );
};

export const useBookingLock = (): BookingLockContextValue => {
  const ctx = useContext(BookingLockContext);
  if (!ctx) {
    throw new Error('useBookingLock must be used inside <BookingLockProvider>');
  }
  return ctx;
};
