import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi, type BookingRecord } from '../../../services/bookingApi';
import { BOOKING_STATUSES } from '../../../constants/bookingConstants';

interface Props {
  booking: BookingRecord;
  readOnly: boolean;
  isLockHolder: boolean;
  onSaved: () => void;
}

const AddRemarksTab: React.FC<Props> = ({
  booking,
  readOnly,
  isLockHolder,
  onSaved,
}) => {
  const [bookingStatus, setBookingStatus] = useState<string>(
    booking.booking_status || 'New Booking'
  );
  const [remarks, setRemarks] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!remarks.trim()) {
      toast.error('Please enter a remark before saving.');
      return;
    }

    setSaving(true);
    try {
      const res = await bookingApi.addRemark(booking._id, {
        remarks: remarks.trim(),
        booking_status: bookingStatus,
      });

      if (res.data.success) {
        toast.success('Remark added. Lock released.');
        onSaved();
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to add remark'
      );
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------------------------------------- */
  /* Read-only view (locked by someone else, or already released)    */
  /* --------------------------------------------------------------- */
  if (readOnly) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
          Update Status
        </h2>

        <div className="border-t border-dashed border-slate-300 mb-4" />

        <div className="text-[13px] text-slate-600 space-y-2">
          <p>
            <span className="font-semibold">Current Booking Status:</span>{' '}
            {booking.booking_status || '-'}
          </p>
          <p>
            <span className="font-semibold">Last Remark:</span>{' '}
            {booking.remarks || '-'}
          </p>
        </div>

        <p className="mt-4 text-[12px] text-slate-400 italic">
          You cannot add a remark for a booking that is locked by another user.
        </p>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Update Status
      </h2>

      <div className="border-t border-dashed border-slate-300 mb-4" />

      {isLockHolder && (
        <div className="mb-5 p-3 rounded-md bg-amber-50 border border-amber-200 text-[12px] text-amber-800">
          This booking is locked to you. Adding a remark below will release the
          lock and let you navigate freely.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
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
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={8}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Write the reason for opening / working on this booking..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            A remark is required. Saving will also release the lock.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !remarks.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-md hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {saving ? 'Saving...' : 'Add Remarks'}
        </button>
      </div>
    </div>
  );
};

export default AddRemarksTab;