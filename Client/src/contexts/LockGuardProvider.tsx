import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBookingLock } from '../Components/Bookings/BookingLockContext';
import BookingLockModal from '../Components/Bookings/BookingLockModal';

const isBookingsRoute = (path: string) =>
  path === '/bookings' || path.startsWith('/bookings/');

const LockGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lock, loading, clearLock, refresh } = useBookingLock();
  const navigate = useNavigate();
  const location = useLocation();

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const lockedPath = lock ? `/bookings/view/${lock.booking_id}` : null;
  const currentTarget = `${location.pathname}${location.search}${location.hash}`;

  const openRemarkGate = useCallback(
    (targetPath: string) => {
      if (!lock || !lockedPath) return;

      setPendingPath((current) => current || targetPath);
      setModalOpen(true);

      if (location.pathname !== lockedPath) {
        navigate(lockedPath, { replace: true });
      }

      toast.error(
        `You have an open booking (${lock.pnr}). Add a remark to continue.`,
        { id: 'lock-guard-toast' }
      );
    },
    [lock, lockedPath, location.pathname, navigate]
  );

  useEffect(() => {
    if (loading || !lock || !lockedPath) return;

    if (modalOpen && location.pathname !== lockedPath) {
      navigate(lockedPath, { replace: true });
      return;
    }

    if (isBookingsRoute(location.pathname)) {
      return;
    }

    const timer = window.setTimeout(() => {
      openRemarkGate(currentTarget);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    loading,
    lock,
    lockedPath,
    modalOpen,
    location.pathname,
    currentTarget,
    navigate,
    openRemarkGate,
  ]);

  useEffect(() => {
    if (!lock) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [lock]);

  const lockRef = useRef(lock);
  useEffect(() => {
    lockRef.current = lock;
  }, [lock]);

  useEffect(() => {
    const onPopState = () => {
      const current = lockRef.current;
      if (!current) return;

      const currentPath = window.location.pathname;
      if (isBookingsRoute(currentPath)) return;

      const target = `/bookings/view/${current.booking_id}`;
      const attemptedPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      navigate(target, { replace: true });
      setPendingPath((currentPending) => currentPending || attemptedPath);
      setModalOpen(true);
      toast.error(
        `You have an open booking (${current.pnr}). Add a remark to continue.`,
        { id: 'lock-guard-toast' }
      );
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate]);

  const handleRemarkSaved = async () => {
    setModalOpen(false);
    clearLock();
    await refresh();

    const next = pendingPath;
    setPendingPath(null);
    if (next) {
      navigate(next, { replace: true });
    }
  };

  return (
    <>
      {children}

      {modalOpen && lock && (
        <BookingLockModal
          bookingId={lock.booking_id}
          pnr={lock.pnr}
          onSaved={handleRemarkSaved}
        />
      )}
    </>
  );
};

export default LockGuardProvider;
