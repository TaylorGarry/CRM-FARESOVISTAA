import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi, type BookingRecord } from '../../../services/bookingApi';
import { BOOKING_STATUSES, CURRENCIES, REASONS_OF_SALE } from '../../../constants/bookingConstants';

interface Props {
  booking: BookingRecord;
  readOnly: boolean;
  onSaved: (updated: BookingRecord) => void;
}

const BookingInfoTab: React.FC<Props> = ({ booking, readOnly, onSaved }) => {
  const [form, setForm] = useState({
    booking_status: booking.booking_status || 'New Booking',
    reason_of_sale: booking.reason_of_sale || '',
    pnr: booking.pnr || '',
    gk_pnr: booking.gk_pnr || '',
    hk_pnr: booking.hk_pnr || '',
    airline_pnr: booking.airline_pnr || '',
    airline_name: booking.airline_name || '',

    currency: booking.currency || 'USD',
    ticket_cost: String(booking.ticket_cost ?? 0),
    mco: String(booking.mco ?? 0),
    quoted_fare: String(booking.quoted_fare ?? 0),
    issuance_fee: String(booking.issuance_fee ?? 0),
    arc: booking.arc || '',
    net_mco: String(booking.net_mco ?? 0),
  });
  const [saving, setSaving] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await bookingApi.updateBookingInfo(booking._id, {
        booking_status: form.booking_status,
        reason_of_sale: form.reason_of_sale,
        pnr: form.pnr,
        gk_pnr: form.gk_pnr,
        hk_pnr: form.hk_pnr,
        airline_pnr: form.airline_pnr,
        airline_name: form.airline_name,
        currency: form.currency as 'USD' | 'CAD',
        ticket_cost: Number(form.ticket_cost) || 0,
        mco: Number(form.mco) || 0,
        quoted_fare: Number(form.quoted_fare) || 0,
        issuance_fee: Number(form.issuance_fee) || 0,
        arc: form.arc,
        net_mco: Number(form.net_mco) || 0,
      });
      if (res.data.success) {
        toast.success('Booking info updated');
        onSaved(res.data.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update booking info');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white disabled:bg-slate-50 disabled:text-slate-500';

  const rowCls = 'grid grid-cols-[160px_1fr] items-center gap-3 mb-3';
  const labelCls = 'text-[13px] text-slate-600 font-medium';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Booking Info
      </h2>

      <div className="border-t border-dashed border-slate-300 mb-5" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-1">
        {/* ---------------- LEFT COLUMN ---------------- */}
        <div>
          {/* Booking IP — read-only, from backend */}
          <div className={rowCls}>
            <span className={labelCls}>Booking IP Address :</span>
            <span className="text-[13px] font-semibold text-slate-800 text-right">
              {booking.booking_ip || '-'}
            </span>
          </div>

          {/* Booking Date — read-only */}
          <div className={rowCls}>
            <span className={labelCls}>Booking Date :</span>
            <span className="text-[13px] font-semibold text-slate-800 text-right">
              {booking.booking_date
                ? new Date(booking.booking_date).toLocaleDateString()
                : booking.add_date
                  ? new Date(booking.add_date).toLocaleDateString()
                  : '-'}
            </span>
          </div>

          {/* Booking Status — dropdown */}
          <div className={rowCls}>
            <span className={labelCls}>Booking Status :</span>
            <select
              value={form.booking_status}
              onChange={(e) => update('booking_status', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Reason of Sale — dropdown */}
          <div className={rowCls}>
            <span className={labelCls}>Reason of Sale :</span>
            <select
              value={form.reason_of_sale}
              onChange={(e) => update('reason_of_sale', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            >
              <option value="">Select reason</option>
              {REASONS_OF_SALE.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className={rowCls}>
            <span className={labelCls}>PNR :</span>
            <input
              type="text"
              value={form.pnr}
              onChange={(e) => update('pnr', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div className={rowCls}>
            <span className={labelCls}>GK PNR :</span>
            <input
              type="text"
              value={form.gk_pnr}
              onChange={(e) => update('gk_pnr', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={inputCls}
              placeholder="gk_pnr"
            />
          </div>

          <div className={rowCls}>
            <span className={labelCls}>HK PNR :</span>
            <input
              type="text"
              value={form.hk_pnr}
              onChange={(e) => update('hk_pnr', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={inputCls}
              placeholder="hk_pnr"
            />
          </div>

          <div className={rowCls}>
            <span className={labelCls}>Airline PNR :</span>
            <input
              type="text"
              value={form.airline_pnr}
              onChange={(e) => update('airline_pnr', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div className={rowCls}>
            <span className={labelCls}>Airline Name :</span>
            <input
              type="text"
              value={form.airline_name}
              onChange={(e) => update('airline_name', e.target.value)}
              disabled={readOnly}
              className={inputCls}
              placeholder="Airline Code"
            />
          </div>
        </div>

        {/* ---------------- RIGHT COLUMN ---------------- */}
        <div>
          <div className={rowCls}>
            <span className={labelCls}>Currency :</span>
            <select
              value={form.currency}
              onChange={(e) => update('currency', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={rowCls}>
            <span className={labelCls}>Ticket Cost :</span>
            <input
              type="number"
              step="0.01"
              value={form.ticket_cost}
              onChange={(e) => update('ticket_cost', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div className={rowCls}>
            <span className={labelCls}>MCO :</span>
            <input
              type="number"
              step="0.01"
              value={form.mco}
              onChange={(e) => update('mco', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div className={rowCls}>
            <span className={labelCls}>Quoted Fare :</span>
            <input
              type="number"
              step="0.01"
              value={form.quoted_fare}
              onChange={(e) => update('quoted_fare', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div className={rowCls}>
            <span className={labelCls}>Issuance Fee :</span>
            <input
              type="number"
              step="0.01"
              value={form.issuance_fee}
              onChange={(e) => update('issuance_fee', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div className={rowCls}>
            <span className={labelCls}>ARC :</span>
            <input
              type="text"
              value={form.arc}
              onChange={(e) => update('arc', e.target.value)}
              disabled={readOnly}
              className={inputCls}
              placeholder="arc"
            />
          </div>

          <div className={rowCls}>
            <span className={labelCls}>Net MCO :</span>
            <input
              type="number"
              step="0.01"
              value={form.net_mco}
              onChange={(e) => update('net_mco', e.target.value)}
              disabled={readOnly}
              className={inputCls}
              placeholder="net_mco"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      {!readOnly && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-md hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {saving ? 'Saving...' : 'Update Booking Info'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingInfoTab;