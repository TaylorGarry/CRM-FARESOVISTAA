import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingApi, type BookingPax, type BookingPayload } from '../../services/bookingApi';
import RichTextEditor from "./RichTextEditor";
import {
  PAX_TYPES,
  GENDERS,
  TRIP_TYPES,
  CURRENCIES,
  CARD_TYPES,
  EXPIRY_MONTHS,
  EXPIRY_YEARS,
  REASONS_OF_SALE,
  BOOKING_STATUSES,
} from '../../constants/bookingConstants';
import { handleFormKeyDown } from '../../utils/handleFormKeyDown';
import DateInput from '../../utils/DateInput';
import MaskedInput from '../../utils/MaskedInput';

const emptyPax: BookingPax = {
  type: 'Adult',
  gender: 'Male',
  first_name: '',
  middle_name: '',
  last_name: '',
  dob: '',
};

const initialForm = {
  pnr: '',
  airline_pnr: '',
  customer_name: '',
  email: '',
  billing_phone: '',
  alternate_phone: '',
  pax: [{ ...emptyPax }] as BookingPax[],
  trip_type: 'Oneway' as 'Oneway' | 'Roundtrip',
  from: '',
  destination: '',
  departure_date: '',
  return_date: '',
  reason_of_sale: '',
  itinerary_html: '',
  total_amount: '',
  ticket_cost: '',
  airline_fee: '',
  mco: '',
  currency: 'USD' as 'USD' | 'CAD',
  card_number: '',
  card_holder_name: '',
  cvv: '',
  card_type: '',
  card_expiry_month: '',
  card_expiry_year: '',
  billing_address: '',
  booking_status: 'New Booking',
  remarks: '',
};

type FormState = typeof initialForm;

const sectionCls =
  'bg-white rounded-lg border border-slate-200 p-6 mb-6';
const sectionTitleCls =
  'text-sm font-bold text-slate-700 uppercase tracking-wide mb-4';
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1';
const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white';

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchOne = async () => {
      setLoading(true);
      try {
        const res = await bookingApi.getById(id);
        if (res.data.success) {
          const b = res.data.data;
          setForm({
            pnr: b.pnr || '',
            airline_pnr: b.airline_pnr || '',
            customer_name: b.customer_name || '',
            email: b.email || '',
            billing_phone: b.billing_phone || '',
            alternate_phone: b.alternate_phone || '',
            pax: b.pax?.length ? b.pax : [{ ...emptyPax }],
            trip_type: b.trip_type || 'Oneway',
            from: b.from || '',
            destination: b.destination || '',
            departure_date: b.departure_date || '',
            return_date: b.return_date || '',
            reason_of_sale: b.reason_of_sale || '',
            itinerary_html: b.itinerary_html || '',
            total_amount: String(b.total_amount ?? ''),
            ticket_cost: String(b.ticket_cost ?? ''),
            airline_fee: String(b.airline_fee ?? ''),
            mco: String(b.mco ?? ''),
            currency: b.currency || 'USD',
            card_number: b.card_number || '',
            cvv: b.cvv || '',
            card_holder_name: b.card_holder_name || '',
            card_type: b.card_type || '',
            card_expiry_month: b.card_expiry_month || '',
            card_expiry_year: b.card_expiry_year || '',
            billing_address: b.billing_address || '',
            booking_status: b.booking_status || 'New Booking',
            remarks: b.remarks || '',
          });
        }
      } catch {
        toast.error('Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id, isEdit]);

  // Auto-calculate MCO whenever the contributing fields change
  useEffect(() => {
    const total = Number(form.total_amount) || 0;
    const ticket = Number(form.ticket_cost) || 0;
    const fee = Number(form.airline_fee) || 0;
    const computed = total - (ticket + fee);

    const next = computed === 0 ? '' : String(computed);
    setForm((prev) => (prev.mco === next ? prev : { ...prev, mco: next }));
  }, [form.total_amount, form.ticket_cost, form.airline_fee]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addPax = () =>
    setForm((prev) => ({ ...prev, pax: [...prev.pax, { ...emptyPax }] }));

  const removePax = (index: number) =>
    setForm((prev) => ({
      ...prev,
      pax: prev.pax.length > 1 ? prev.pax.filter((_, i) => i !== index) : prev.pax,
    }));

  const updatePax = <K extends keyof BookingPax>(index: number, key: K, value: BookingPax[K]) =>
    setForm((prev) => ({
      ...prev,
      pax: prev.pax.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.pnr.trim() || !form.customer_name.trim() || !form.from.trim() || !form.destination.trim()) {
      toast.error('PNR, Customer Name, From and Destination are required');
      return;
    }
    const validPax = form.pax.filter((p) => p.first_name.trim() && p.last_name.trim());
    if (!validPax.length) {
      toast.error('At least one passenger with first and last name is required');
      return;
    }

    setSaving(true);
    try {
      // Defensive: recompute MCO at submit time so it always matches the formula
      const computedMco =
        (Number(form.total_amount) || 0) -
        ((Number(form.ticket_cost) || 0) + (Number(form.airline_fee) || 0));

      const payload: BookingPayload = {
        pnr: form.pnr.trim(),
        airline_pnr: form.airline_pnr.trim(),
        customer_name: form.customer_name.trim(),
        email: form.email.trim(),
        billing_phone: form.billing_phone.trim(),
        alternate_phone: form.alternate_phone.trim(),
        pax: validPax,
        trip_type: form.trip_type,
        from: form.from.trim(),
        destination: form.destination.trim(),
        departure_date: form.departure_date,
        return_date: form.return_date,
        reason_of_sale: form.reason_of_sale,
        itinerary_html: form.itinerary_html,
        total_amount: Number(form.total_amount) || 0,
        ticket_cost: Number(form.ticket_cost) || 0,
        airline_fee: Number(form.airline_fee) || 0,
        mco: computedMco,
        currency: form.currency,
        card_number: form.card_number.trim(),
        cvv: form.cvv.trim(),
        card_holder_name: form.card_holder_name.trim(),
        card_type: form.card_type,
        card_expiry_month: form.card_expiry_month,
        card_expiry_year: form.card_expiry_year,
        billing_address: form.billing_address.trim(),
        booking_status: form.booking_status,
        remarks: form.remarks,
      };

      const res = isEdit && id
        ? await bookingApi.update(id, payload)
        : await bookingApi.create(payload);

      if (res.data.success) {
        toast.success(isEdit ? 'Booking updated' : 'Booking created');
        navigate('/bookings/all');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save booking');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {isEdit ? 'Edit Booking' : 'Add Booking'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/bookings/all')}
          className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
        >
          ← Back To Booking
        </button>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
        {/* CONTACT INFORMATION */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>PNR *</label>
              <input
                className={inputCls}
                value={form.pnr}
                onChange={(e) => update('pnr', e.target.value.toUpperCase())}
                placeholder="PNR"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Airline PNR</label>
              <input
                className={inputCls}
                value={form.airline_pnr}
                onChange={(e) => update('airline_pnr', e.target.value.toUpperCase())}
                placeholder="Airline PNR"
              />
            </div>
            <div>
              <label className={labelCls}>Customer Name *</label>
              <input
                className={inputCls}
                value={form.customer_name}
                onChange={(e) => update('customer_name', e.target.value)}
                placeholder="Customer Name"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="Email"
              />
            </div>
            <div>
              <label className={labelCls}>Billing Phone Number</label>
              <input
                className={inputCls}
                value={form.billing_phone}
                onChange={(e) => update('billing_phone', e.target.value)}
                placeholder="Billing Phone Number"
              />
            </div>
            <div>
              <label className={labelCls}>Alternate Phone</label>
              <input
                className={inputCls}
                value={form.alternate_phone}
                onChange={(e) => update('alternate_phone', e.target.value)}
                placeholder="Alternate Phone"
              />
            </div>
          </div>
        </div>

        {/* PAX INFORMATION */}
        <div className={sectionCls}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`${sectionTitleCls} mb-0`}>Pax Information</h2>
            <button
              type="button"
              onClick={addPax}
              className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition"
            >
              Add Pax
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold text-slate-600 uppercase">
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Gender</th>
                  <th className="px-3 py-2">Fname</th>
                  <th className="px-3 py-2">Mname</th>
                  <th className="px-3 py-2">Lname</th>
                  <th className="px-3 py-2">DOB (MM/DD/YYYY)</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {form.pax.map((p, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2">
                      <select
                        className={inputCls}
                        value={p.type}
                        onChange={(e) => updatePax(idx, 'type', e.target.value as BookingPax['type'])}
                      >
                        {PAX_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className={inputCls}
                        value={p.gender}
                        onChange={(e) => updatePax(idx, 'gender', e.target.value as BookingPax['gender'])}
                      >
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className={inputCls}
                        value={p.first_name}
                        onChange={(e) => updatePax(idx, 'first_name', e.target.value)}
                        placeholder="First name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className={inputCls}
                        value={p.middle_name || ''}
                        onChange={(e) => updatePax(idx, 'middle_name', e.target.value)}
                        placeholder="Middle name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className={inputCls}
                        value={p.last_name}
                        onChange={(e) => updatePax(idx, 'last_name', e.target.value)}
                        placeholder="Last name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <DateInput
                        className={inputCls}
                        value={p.dob || ''}
                        onChange={(v) => updatePax(idx, 'dob', v)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removePax(idx)}
                        disabled={form.pax.length === 1}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ITINERARY DETAILS */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Itinerary Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Trip Type *</label>
              <div className="flex items-center gap-5 mt-2">
                {TRIP_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="trip_type"
                      checked={form.trip_type === t}
                      onChange={() => update('trip_type', t)}
                      className="accent-sky-600"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>From *</label>
              <input
                className={inputCls}
                value={form.from}
                onChange={(e) => update('from', e.target.value)}
                placeholder="Enter origin"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Destination *</label>
              <input
                className={inputCls}
                value={form.destination}
                onChange={(e) => update('destination', e.target.value)}
                placeholder="Enter destination"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Reason of Sale</label>
              <select
                className={inputCls}
                value={form.reason_of_sale}
                onChange={(e) => update('reason_of_sale', e.target.value)}
              >
                <option value="">Select reason of sale</option>
                {REASONS_OF_SALE.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Departure Date</label>
              <DateInput
                className={inputCls}
                value={form.departure_date}
                onChange={(v) => update('departure_date', v)}
              />
            </div>
            {form.trip_type === 'Roundtrip' && (
              <div>
                <label className={labelCls}>Return Date</label>
                <DateInput
                  className={inputCls}
                  value={form.return_date}
                  onChange={(v) => update('return_date', v)}
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className={labelCls}>Itinerary</label>
            <RichTextEditor
              value={form.itinerary_html}
              onChange={(html) => update('itinerary_html', html)}
            />
          </div>
        </div>

        {/* FARE INFORMATION */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Fare Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Total Amount</label>
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={form.total_amount}
                onChange={(e) => update('total_amount', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelCls}>Ticket Cost</label>
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={form.ticket_cost}
                onChange={(e) => update('ticket_cost', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelCls}>Airline Fee</label>
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={form.airline_fee}
                onChange={(e) => update('airline_fee', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelCls}>MCO</label>
              <input
                type="number"
                step="0.01"
                className={`${inputCls} bg-slate-50 text-slate-600 cursor-not-allowed`}
                value={form.mco}
                readOnly
                tabIndex={-1}
                placeholder="0.00"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Total Amount − (Ticket Cost + Airline Fee)
              </p>
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select
                className={inputCls}
                value={form.currency}
                onChange={(e) => update('currency', e.target.value as 'USD' | 'CAD')}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Payment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Card Number</label>
              <MaskedInput
                className={inputCls}
                value={form.card_number}
                onChange={(v) => update('card_number', v)}
                placeholder="Card Number"
                digitsOnly
                maxLength={19}
              />
            </div>
            <div>
              <label className={labelCls}>Card Holder Name</label>
              <input
                className={inputCls}
                value={form.card_holder_name}
                onChange={(e) => update('card_holder_name', e.target.value)}
                placeholder="Card Holder Name"
              />
            </div>
            <div>
              <label className={labelCls}>Card Security Code (CVV)</label>
              <MaskedInput
                className={inputCls}
                value={form.cvv}
                onChange={(v) => update('cvv', v)}
                placeholder="CVV"
                digitsOnly
                maxLength={4}
              />
            </div>
            <div>
              <label className={labelCls}>Select Card</label>
              <select
                className={inputCls}
                value={form.card_type}
                onChange={(e) => update('card_type', e.target.value)}
              >
                <option value="">Select Card</option>
                {CARD_TYPES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Card Expiry Year</label>
              <select
                className={inputCls}
                value={form.card_expiry_year}
                onChange={(e) => update('card_expiry_year', e.target.value)}
              >
                <option value="">Select Expiry Year</option>
                {EXPIRY_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Card Expiry Month</label>
              <select
                className={inputCls}
                value={form.card_expiry_month}
                onChange={(e) => update('card_expiry_month', e.target.value)}
              >
                <option value="">Select Expiry Month</option>
                {EXPIRY_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* BILLING ADDRESS + STATUS */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Billing Address &amp; Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Billing Address</label>
              <textarea
                className={inputCls}
                rows={3}
                value={form.billing_address}
                onChange={(e) => update('billing_address', e.target.value)}
                placeholder="Billing Address"
              />
            </div>
            <div>
              <label className={labelCls}>Booking Status *</label>
              <select
                className={inputCls}
                value={form.booking_status}
                onChange={(e) => update('booking_status', e.target.value)}
                required
              >
                <option value="">Select Booking status</option>
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Remarks</label>
              <textarea
                className={inputCls}
                rows={3}
                value={form.remarks}
                onChange={(e) => update('remarks', e.target.value)}
                placeholder="Remarks"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Booking' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/bookings/all')}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;