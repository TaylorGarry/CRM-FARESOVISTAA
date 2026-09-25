import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  bookingApi,
  type BookingRecord,
  type BookingPax,
} from '../../../services/bookingApi';
import DateInput from '../../../utils/DateInput';
import { PAX_TYPES, GENDERS } from '../../../constants/bookingConstants';

interface Props {
  booking: BookingRecord;
  readOnly: boolean;
  onSaved: (updated: BookingRecord) => void;
}

const emptyPax: BookingPax = {
  type: 'Adult',
  gender: 'Male',
  first_name: '',
  middle_name: '',
  last_name: '',
  dob: '',
  passport_number: '',
  pid: '',
  ped: '',
};

const PassengerInfoTab: React.FC<Props> = ({ booking, readOnly, onSaved }) => {
  const [pax, setPax] = useState<BookingPax[]>(
    booking.pax?.length ? booking.pax.map((p) => ({ ...emptyPax, ...p })) : [{ ...emptyPax }]
  );
  const [saving, setSaving] = useState(false);

  const addPax = () =>
    setPax((prev) => [...prev, { ...emptyPax }]);

  const removePax = (index: number) =>
    setPax((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );

  const updatePax = <K extends keyof BookingPax>(
    index: number,
    key: K,
    value: BookingPax[K]
  ) =>
    setPax((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [key]: value } : p))
    );

  const handleSave = async () => {
    const valid = pax.filter((p) => p.first_name.trim() && p.last_name.trim());
    if (!valid.length) {
      toast.error('At least one passenger with first and last name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await bookingApi.updatePaxInfo(booking._id, valid);
      if (res.data.success) {
        toast.success('Passenger info updated');
        onSaved(res.data.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update pax info');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-2 py-1.5 text-[13px] border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Passenger Info
      </h2>

      <div className="border-t border-dashed border-slate-300 mb-5" />

      {!readOnly && (
        <button
          type="button"
          onClick={addPax}
          className="mb-3 px-3 py-1.5 text-[12px] font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          ADD PAX
        </button>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border border-slate-300 text-[13px]">
          <thead className="bg-slate-100">
            <tr className="text-left text-[11px] font-semibold text-slate-600 uppercase">
              <th className="px-2 py-2 border border-slate-300">Type</th>
              <th className="px-2 py-2 border border-slate-300">Gender</th>
              <th className="px-2 py-2 border border-slate-300">FName</th>
              <th className="px-2 py-2 border border-slate-300">MName</th>
              <th className="px-2 py-2 border border-slate-300">LName</th>
              <th className="px-2 py-2 border border-slate-300">DOB (MM/DD/YYYY)</th>
              <th className="px-2 py-2 border border-slate-300">Passport Number</th>
              <th className="px-2 py-2 border border-slate-300">PID</th>
              <th className="px-2 py-2 border border-slate-300">PED</th>
              {!readOnly && (
                <th className="px-2 py-2 border border-slate-300">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {pax.map((p, idx) => (
              <tr key={idx}>
                <td className="px-1 py-1 border border-slate-300">
                  <select
                    value={p.type}
                    onChange={(e) =>
                      updatePax(idx, 'type', e.target.value as BookingPax['type'])
                    }
                    disabled={readOnly}
                    className={inputCls}
                  >
                    {PAX_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-1 border border-slate-300">
                  <select
                    value={p.gender}
                    onChange={(e) =>
                      updatePax(idx, 'gender', e.target.value as BookingPax['gender'])
                    }
                    disabled={readOnly}
                    className={inputCls}
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-1 border border-slate-300">
                  <input
                    type="text"
                    value={p.first_name}
                    onChange={(e) => updatePax(idx, 'first_name', e.target.value)}
                    disabled={readOnly}
                    className={inputCls}
                  />
                </td>
                <td className="px-1 py-1 border border-slate-300">
                  <input
                    type="text"
                    value={p.middle_name || ''}
                    onChange={(e) => updatePax(idx, 'middle_name', e.target.value)}
                    disabled={readOnly}
                    className={inputCls}
                  />
                </td>
                <td className="px-1 py-1 border border-slate-300">
                  <input
                    type="text"
                    value={p.last_name}
                    onChange={(e) => updatePax(idx, 'last_name', e.target.value)}
                    disabled={readOnly}
                    className={inputCls}
                  />
                </td>
                <td className="px-1 py-1 border border-slate-300">
                  {readOnly ? (
                    <input
                      type="text"
                      value={p.dob || ''}
                      disabled
                      className={inputCls}
                    />
                  ) : (
                    <DateInput
                      className={inputCls}
                      value={p.dob || ''}
                      onChange={(v) => updatePax(idx, 'dob', v)}
                    />
                  )}
                </td>
                <td className="px-1 py-1 border border-slate-300">
                  <input
                    type="text"
                    value={p.passport_number || ''}
                    onChange={(e) =>
                      updatePax(idx, 'passport_number', e.target.value)
                    }
                    disabled={readOnly}
                    className={inputCls}
                  />
                </td>
                <td className="px-1 py-1 border border-slate-300">
                  {readOnly ? (
                    <input
                      type="text"
                      value={p.pid || ''}
                      disabled
                      className={inputCls}
                    />
                  ) : (
                    <DateInput
                      className={inputCls}
                      value={p.pid || ''}
                      onChange={(v) => updatePax(idx, 'pid', v)}
                    />
                  )}
                </td>
                <td className="px-1 py-1 border border-slate-300">
                  {readOnly ? (
                    <input
                      type="text"
                      value={p.ped || ''}
                      disabled
                      className={inputCls}
                    />
                  ) : (
                    <DateInput
                      className={inputCls}
                      value={p.ped || ''}
                      onChange={(v) => updatePax(idx, 'ped', v)}
                    />
                  )}
                </td>
                {!readOnly && (
                  <td className="px-1 py-1 border border-slate-300 text-center">
                    <button
                      type="button"
                      onClick={() => removePax(idx)}
                      disabled={pax.length === 1}
                      className="px-3 py-1 text-[12px] rounded border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            {saving ? 'Saving...' : 'Update Pax Info'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PassengerInfoTab;