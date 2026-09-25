import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi, type BookingRecord } from '../../../services/bookingApi';
import DateInput from '../../../utils/DateInput';
import { TRIP_TYPES, REASONS_OF_SALE } from '../../../constants/bookingConstants';

interface Props {
  booking: BookingRecord;
  readOnly: boolean;
  onSaved: (updated: BookingRecord) => void;
}

const UserSearchTab: React.FC<Props> = ({ booking, readOnly, onSaved }) => {
  const [tripType, setTripType] = useState<'Oneway' | 'Roundtrip'>(
    booking.trip_type || 'Oneway'
  );
  const [from, setFrom] = useState(booking.from || '');
  const [destination, setDestination] = useState(booking.destination || '');
  const [departureDate, setDepartureDate] = useState(booking.departure_date || '');
  const [returnDate, setReturnDate] = useState(booking.return_date || '');
  const [reasonOfSale, setReasonOfSale] = useState(booking.reason_of_sale || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!from.trim() || !destination.trim()) {
      toast.error('From and Destination are required');
      return;
    }
    setSaving(true);
    try {
      const res = await bookingApi.updateSearchInfo(booking._id, {
        trip_type: tripType,
        from: from.trim(),
        destination: destination.trim(),
        departure_date: departureDate,
        return_date: tripType === 'Roundtrip' ? returnDate : '',
        reason_of_sale: reasonOfSale,
      });
      if (res.data.success) {
        toast.success('Search info updated');
        onSaved(res.data.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update search info');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        User Search
      </h2>

      <div className="border-t border-dashed border-slate-300 mb-5" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        {/* Trip Type */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-2">
            Trip Type
          </label>
          <div className="flex items-center gap-5 mt-1">
            {TRIP_TYPES.map((t) => (
              <label
                key={t}
                className={`flex items-center gap-2 text-sm text-slate-700 ${
                  readOnly ? 'opacity-70' : 'cursor-pointer'
                }`}
              >
                <input
                  type="radio"
                  name="trip_type"
                  checked={tripType === t}
                  onChange={() => !readOnly && setTripType(t)}
                  disabled={readOnly}
                  className="accent-sky-600 w-4 h-4"
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        {/* From */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            From
          </label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            disabled={readOnly}
            className={inputCls}
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={readOnly}
            className={inputCls}
          />
        </div>

        {/* Departure */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Departure Date
          </label>
          {readOnly ? (
            <input
              type="text"
              value={departureDate}
              disabled
              className={inputCls}
            />
          ) : (
            <DateInput
              className={inputCls}
              value={departureDate}
              onChange={setDepartureDate}
            />
          )}
        </div>

        {/* Return */}
        {tripType === 'Roundtrip' && (
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Return Date
            </label>
            {readOnly ? (
              <input
                type="text"
                value={returnDate}
                disabled
                className={inputCls}
              />
            ) : (
              <DateInput
                className={inputCls}
                value={returnDate}
                onChange={setReturnDate}
              />
            )}
          </div>
        )}

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Reason of Sale
          </label>
          <select
            value={reasonOfSale}
            onChange={(e) => setReasonOfSale(e.target.value)}
            disabled={readOnly}
            className={inputCls}
          >
            <option value="">Select reason</option>
            {REASONS_OF_SALE.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
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
            {saving ? 'Saving...' : 'Update Search Info'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSearchTab;