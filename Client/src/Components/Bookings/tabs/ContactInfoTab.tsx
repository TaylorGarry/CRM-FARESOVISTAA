import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi, type BookingRecord } from '../../../services/bookingApi';

interface Props {
  booking: BookingRecord;
  readOnly: boolean;
  onSaved: (updated: BookingRecord) => void;
}

const ContactInfoTab: React.FC<Props> = ({ booking, readOnly, onSaved }) => {
  const [form, setForm] = useState({
    customer_name: booking.customer_name || '',
    billing_phone: booking.billing_phone || '',
    alternate_phone: booking.alternate_phone || '',
    email: booking.email || '',

    address: booking.address || booking.billing_address || '',
    address1: booking.address1 || '',
    country_code: booking.country_code || '',
    state: booking.state || '',
    city: booking.city || '',
    pincode: booking.pincode || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!form.customer_name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await bookingApi.updateContactInfo(booking._id, form);
      if (res.data.success) {
        toast.success('Contact info updated');
        onSaved(res.data.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update contact info');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white disabled:bg-slate-50 disabled:text-slate-500';
  const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Contact
      </h2>

      <div className="border-t border-dashed border-slate-300 mb-5" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
        {/* ---------- LEFT: person ---------- */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Customer Name :</label>
            <input
              type="text"
              value={form.customer_name}
              onChange={(e) => update('customer_name', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Phone :</label>
            <input
              type="text"
              value={form.billing_phone}
              onChange={(e) => update('billing_phone', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Alternate Phone :</label>
            <input
              type="text"
              value={form.alternate_phone}
              onChange={(e) => update('alternate_phone', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Email :</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            />
          </div>
        </div>

        {/* ---------- RIGHT: address ---------- */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Address :</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              disabled={readOnly}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Address1 :</label>
            <input
              type="text"
              value={form.address1}
              onChange={(e) => update('address1', e.target.value)}
              disabled={readOnly}
              className={inputCls}
              placeholder="address1"
            />
          </div>

          <div>
            <label className={labelCls}>Country Code :</label>
            <input
              type="text"
              value={form.country_code}
              onChange={(e) => update('country_code', e.target.value)}
              disabled={readOnly}
              className={inputCls}
              placeholder="country"
            />
          </div>

          <div>
            <label className={labelCls}>State :</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              disabled={readOnly}
              className={inputCls}
              placeholder="state"
            />
          </div>

          <div>
            <label className={labelCls}>City :</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              disabled={readOnly}
              className={inputCls}
              placeholder="city"
            />
          </div>

          <div>
            <label className={labelCls}>Pincode :</label>
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => update('pincode', e.target.value)}
              disabled={readOnly}
              className={inputCls}
              placeholder="pincode"
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
            {saving ? 'Saving...' : 'Update Contact Info'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactInfoTab;