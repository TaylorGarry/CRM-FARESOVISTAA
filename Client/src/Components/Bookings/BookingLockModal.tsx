import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi, type BookingRecord } from '../../services/bookingApi';
import { BOOKING_STATUSES } from '../../constants/bookingConstants';

interface Props {
  bookingId: string;
  pnr: string;
  onSaved: () => void;
}

const BookingLockModal: React.FC<Props> = ({ bookingId, pnr, onSaved }) => {
  const [bookingStatus, setBookingStatus] = useState('New Booking');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [, setBooking] = useState<BookingRecord | null>(null);

  /* Prefill current booking status */
  useEffect(() => {
    bookingApi
      .getById(bookingId)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setBooking(res.data.data);
          setBookingStatus(res.data.data.booking_status || 'New Booking');
        }
      })
      .catch(() => {});
  }, [bookingId]);

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      toast.error('Please enter a remark.');
      return;
    }
    setSaving(true);
    try {
      const res = await bookingApi.addRemark(bookingId, {
        remarks: remarks.trim(),
        booking_status: bookingStatus,
      });
      if (res.data.success) {
        toast.success('Remark added. Lock released.');
        onSaved();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add remark');
    } finally {
      setSaving(false);
    }
  };

  return (
    /* No backdrop close, no X button — only exit is submitting a remark */
    <div className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Booking locked to you — PNR {pnr}
            </h3>
            <p className="text-[12px] text-slate-500">
              Add a remark to release this booking and continue.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Current Booking Status
            </label>
            <select
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Why did you open this booking? What did you do?"
              autoFocus
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            You cannot close this window or navigate away until a remark is entered.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !remarks.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-md hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {saving ? 'Saving...' : 'Add Remarks & Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingLockModal;