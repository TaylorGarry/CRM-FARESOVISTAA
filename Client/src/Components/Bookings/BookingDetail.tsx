import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  bookingApi,
  type BookingRecord,
  type BookingHistoryRecord,
  type BookingAssignmentRecord,
} from '../../services/bookingApi';
import { useBookingLock } from "./BookingLockContext";

/* Tabs */
import UserSearchTab from "./tabs/UserSearchTab";
import BookingInfoTab from "./tabs/BookingInfoTab";
import ItineraryTab from "./tabs/ItineraryTab";
import ContactInfoTab from "./tabs/ContactInfoTab";
import PassengerInfoTab from "./tabs/PassengerInfoTab";
import PaymentInfoTab from "./tabs/PaymentInfoTab";
import AddRemarksTab from "./tabs/AddRemarksTab";
import StatusHistoryTab from "./tabs/StatusHistoryTab";
import AssignmentHistoryTab from"./tabs/AssignmentHistoryTab";

/* ------------------------------------------------------------------ */
/* Tab definitions                                                     */
/* ------------------------------------------------------------------ */

type TabKey =
  | 'user-search'
  | 'booking-info'
  | 'itinerary'
  | 'contact-info'
  | 'passenger-info'
  | 'payment-info'
  | 'add-remarks'
  | 'status-history'
  | 'assignment-history';

interface TabDef {
  key: TabKey;
  label: string;
}

const TABS: TabDef[] = [
  { key: 'user-search',         label: 'USER SEARCH' },
  { key: 'booking-info',        label: 'BOOKING INFO' },
  { key: 'itinerary',           label: 'ITINERARY' },
  { key: 'contact-info',        label: 'CONTACT INFO' },
  { key: 'passenger-info',      label: 'PASSENGER INFO' },
  { key: 'payment-info',        label: 'PAYMENT INFO' },
  { key: 'add-remarks',         label: 'ADD REMARKS' },
  { key: 'status-history',      label: 'REMARKS & STATUS HISTORY' },
  { key: 'assignment-history',  label: 'ASSIGNMENT HISTORY' },
];

const displayLockHolder = (value?: string) => {
  const name = String(value || '').trim();
  return name && name.toLowerCase() !== 'unknown' ? name : 'another user';
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const BookingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { setLock, clearLock, refresh: refreshLock } = useBookingLock();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [history, setHistory] = useState<BookingHistoryRecord[]>([]);
  const [assignments, setAssignments] = useState<BookingAssignmentRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('user-search');

  /**
   * Three modes:
   *  - 'edit'      → user holds the lock, can edit everything
   *  - 'readonly'  → locked by someone else OR lock couldn't be acquired
   *  - 'loading'   → still figuring out
   */
  const [mode, setMode] = useState<'loading' | 'edit' | 'readonly'>('loading');
  const [lockedByName, setLockedByName] = useState<string>('');

  /* --------------------------------------------------------------- */
  /* Fetch booking + history + acquire lock                          */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        // 1. Fetch the booking
        const res = await bookingApi.getById(id);
        if (!res.data.success || !res.data.data) {
          toast.error('Booking not found');
          navigate('/bookings/all');
          return;
        }
        if (cancelled) return;
        const b = res.data.data;
        setBooking(b);

        // 2. Try to acquire (or detect) the lock
        const lockRes = await bookingApi.lock(id);
        if (cancelled) return;

        if (lockRes.data.success && lockRes.data.locked) {
          // We own the lock
          setMode('edit');
          setLock({
            booking_id: String(b._id),
            pnr: b.pnr,
            locked_at: lockRes.data.locked_at || new Date().toISOString(),
            session_id: lockRes.data.session_id || '',
          });
        } else if (lockRes.data.success && !lockRes.data.locked) {
          // Held by someone else
          setMode('readonly');
          setLockedByName(
            displayLockHolder(
              lockRes.data.locked_by_name || lockRes.data.locked_by_login
            )
          );
        } else {
          // Fallback (shouldn't normally happen)
          setMode('readonly');
        }

        // 3. Load history + assignments
        const [histRes, assignRes] = await Promise.all([
          bookingApi.getHistory(id).catch(() => null),
          bookingApi.getAssignments(id).catch(() => null),
        ]);
        if (cancelled) return;
        if (histRes?.data?.success) setHistory(histRes.data.data || []);
        if (assignRes?.data?.success) setAssignments(assignRes.data.data || []);
      } catch (err: any) {
        if (cancelled) return;
        const code = err?.response?.data?.code;
        if (code === 'OTHER_LOCK_ACTIVE') {
          const otherPnr = err?.response?.data?.other_lock?.pnr;
          toast.error(
            `You already have an open booking (${otherPnr || ''}). Add a remark to release it first.`,
            { duration: 5000 }
          );
          // Redirect to the other lock
          const otherId = err?.response?.data?.other_lock?.booking_id;
          if (otherId) {
            navigate(`/bookings/view/${otherId}`, { replace: true });
            return;
          }
          navigate('/bookings/all', { replace: true });
          return;
        }
        toast.error('Failed to load booking');
        navigate('/bookings/all');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* --------------------------------------------------------------- */
  /* If user holds the lock on this booking, default to Add Remarks  */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    if (mode === 'edit') {
      setActiveTab('add-remarks');
    } else if (mode === 'readonly') {
      setActiveTab('user-search');
    }
  }, [mode]);

  /* --------------------------------------------------------------- */
  /* Callbacks passed to tabs                                        */
  /* --------------------------------------------------------------- */

  const onBookingUpdated = (updated: BookingRecord) => {
    setBooking(updated);
  };

  const refreshHistory = async () => {
    if (!id) return;
    try {
      const res = await bookingApi.getHistory(id);
      if (res.data.success) setHistory(res.data.data || []);
    } catch {
      /* silent */
    }
  };

  const handleRemarkSaved = async () => {
    // Lock is released server-side by addRemark; clear locally too
    clearLock();
    setMode('readonly');
    setLockedByName('');
    await refreshHistory();
    await refreshLock();
    toast.success('Remark added. You can now navigate freely.');
    navigate('/bookings/all', { replace: true });
  };

  /* --------------------------------------------------------------- */
  /* Guard: no id                                                     */
  /* --------------------------------------------------------------- */
  if (!id) {
    navigate('/bookings/all', { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) return null;



  return (
    <div className="-m-4 lg:-m-8 bg-slate-50 min-h-full pt-11 ">
      {/* ---------- Read-only banner ---------- */}
      {mode === 'readonly' && lockedByName && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-[13px] text-amber-800 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>
            This booking is being edited by <strong>{lockedByName}</strong>. You can
            view but not save changes.
          </span>
        </div>
      )}

      {/* ---------- Tab bar ---------- */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex items-stretch overflow-x-auto overflow-y-hidden">
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            const isRemarks = t.key === 'add-remarks';
            const isHistory = t.key === 'status-history' || t.key === 'assignment-history';

            // In edit mode, keep Add Remarks visually highlighted
            const accent = isRemarks && mode === 'edit' ? 'text-amber-600' : '';

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`
                  relative flex-shrink-0 px-5 py-2 text-[12px] font-semibold tracking-wide whitespace-nowrap
                  transition-colors
                  ${isActive
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'}
                  ${accent}
                  ${isHistory ? '' : ''}
                `}
              >
                {t.label}
                {isActive && (
                  <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Tab content ---------- */}
      <div className="p-2">
        {activeTab === 'user-search' && (
          <UserSearchTab
            booking={booking}
            readOnly={mode === 'readonly'}
            onSaved={onBookingUpdated}
          />
        )}

        {activeTab === 'booking-info' && (
          <BookingInfoTab
            booking={booking}
            readOnly={mode === 'readonly'}
            onSaved={onBookingUpdated}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryTab
            booking={booking}
            readOnly={mode === 'readonly'}
            onSaved={onBookingUpdated}
          />
        )}

        {activeTab === 'contact-info' && (
          <ContactInfoTab
            booking={booking}
            readOnly={mode === 'readonly'}
            onSaved={onBookingUpdated}
          />
        )}

        {activeTab === 'passenger-info' && (
          <PassengerInfoTab
            booking={booking}
            readOnly={mode === 'readonly'}
            onSaved={onBookingUpdated}
          />
        )}

        {activeTab === 'payment-info' && (
          <PaymentInfoTab
            booking={booking}
            readOnly={mode === 'readonly'}
            onSaved={onBookingUpdated}
          />
        )}

        {activeTab === 'add-remarks' && (
          <AddRemarksTab
            booking={booking}
            readOnly={mode === 'readonly'}
            isLockHolder={mode === 'edit'}
            onSaved={handleRemarkSaved}
          />
        )}

        {activeTab === 'status-history' && (
          <StatusHistoryTab history={history} />
        )}

        {activeTab === 'assignment-history' && (
          <AssignmentHistoryTab assignments={assignments} />
        )}
      </div>
    </div>
  );
};

export default BookingDetail;
