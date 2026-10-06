import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi, type BookingRecord } from '../../../services/bookingApi';
import { cardTypeApi } from '../../../services/masterApi';
import { type CardType } from '../../../types/master';
import MaskedInput from '../../../utils/MaskedInput';
import { EXPIRY_MONTHS, EXPIRY_YEARS } from '../../../constants/bookingConstants';

interface Props {
  booking: BookingRecord;
  readOnly: boolean;
  onSaved: (updated: BookingRecord) => void;
}

// ---------- Icons ----------
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

// ---------- Reusable per-field reveal wrapper ----------
interface RevealFieldProps {
  label: string;
  value: string;
  maskedValue?: string;
  visible: boolean;
  onToggle: () => void;
  inputCls: string;
  labelCls: string;
}

const RevealField: React.FC<RevealFieldProps> = ({
  label,
  value,
  maskedValue,
  visible,
  onToggle,
  inputCls,
  labelCls,
}) => {
  const display = value || '-';
  const shown = visible ? display : maskedValue ?? display;

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input
          type="text"
          value={shown}
          disabled
          className={`${inputCls} pr-10`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 hover:text-slate-700 transition"
          title={visible ? `Hide ${label}` : `Show ${label}`}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? (
            <EyeOffIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

// ---------- Mask helpers ----------
const maskCardNumber = (num?: string) => {
  if (!num) return 'XXX';
  const digits = String(num).replace(/\D/g, '');
  return `•••• •••• •••• ${digits.slice(-4)}`;
};

const maskCvv = (cvv?: string) => {
  if (!cvv) return 'XXX';
  return '•'.repeat(String(cvv).length);
};

const maskName = (name?: string) => {
  if (!name) return '-';
  return '•'.repeat(Math.max(name.length, 6));
};

const maskYear = (year?: string) => {
  if (!year) return '-';
  return '••••';
};

const maskMonth = (month?: string) => {
  if (!month) return '-';
  return '••';
};

// ---------- Main Component ----------
type FieldKey =
  | 'card_holder_name'
  | 'card_number'
  | 'cvv'
  | 'card_expiry_year'
  | 'card_expiry_month';

const PaymentInfoTab: React.FC<Props> = ({ booking, readOnly, onSaved }) => {
  // Draft for the "new card" section
  const [draft, setDraft] = useState({
    card_number: '',
    card_holder_name: '',
    cvv: '',
    card_type: '',
    card_expiry_year: '',
    card_expiry_month: '',
  });
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchCardTypes = async () => {
      try {
        const res = await cardTypeApi.getAll();
        if (active && res.data.success) {
          setCardTypes(res.data.data.filter((cardType) => cardType.card_type_status === 'Enabled' && cardType.card_type_name.trim()));
        }
      } catch {
        if (active) toast.error('Failed to load card types');
      }
    };

    fetchCardTypes();
    return () => { active = false; };
  }, []);

  // Per-field visibility state — all start hidden (masked)
  const [visible, setVisible] = useState<Record<FieldKey, boolean>>({
    card_holder_name: false,
    card_number: false,
    cvv: false,
    card_expiry_year: false,
    card_expiry_month: false,
  });

  const toggle = (key: FieldKey) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  const update = (key: keyof typeof draft, value: string) =>
    setDraft((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    const hasAny = Object.values(draft).some((v) => String(v).trim() !== '');
    if (!hasAny) {
      toast('No new card entered — nothing to save.', { icon: 'ℹ️' });
      return;
    }

    if (!draft.card_number.trim() || !draft.card_holder_name.trim()) {
      toast.error('Card number and holder name are required for a new card');
      return;
    }

    setSaving(true);
    try {
      const res = await bookingApi.updatePaymentInfo(booking._id, {
        card_number: draft.card_number.trim(),
        card_holder_name: draft.card_holder_name.trim(),
        cvv: draft.cvv.trim(),
        card_type: draft.card_type,
        card_expiry_month: draft.card_expiry_month,
        card_expiry_year: draft.card_expiry_year,
      });
      if (res.data.success) {
        toast.success('Card info updated');
        setDraft({
          card_number: '',
          card_holder_name: '',
          cvv: '',
          card_type: '',
          card_expiry_year: '',
          card_expiry_month: '',
        });
        onSaved(res.data.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update payment info');
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
        Payment Info
      </h2>

      <div className="border-t border-dashed border-slate-300 mb-5" />

      {/* ---------- CURRENT CARD ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* Card Brand — always visible, no toggle */}
        <div>
          <label className={labelCls}>Card Brand</label>
          <input
            type="text"
            value={booking.card_type || '-'}
            disabled
            className={inputCls}
          />
        </div>

        <RevealField
          label="Card Holder"
          value={booking.card_holder_name || ''}
          maskedValue={maskName(booking.card_holder_name)}
          visible={visible.card_holder_name}
          onToggle={() => toggle('card_holder_name')}
          inputCls={inputCls}
          labelCls={labelCls}
        />
        <RevealField
          label="Card Number"
          value={booking.card_number || ''}
          maskedValue={maskCardNumber(booking.card_number)}
          visible={visible.card_number}
          onToggle={() => toggle('card_number')}
          inputCls={inputCls}
          labelCls={labelCls}
        />
        <RevealField
          label="Security Code"
          value={booking.cvv || ''}
          maskedValue={maskCvv(booking.cvv)}
          visible={visible.cvv}
          onToggle={() => toggle('cvv')}
          inputCls={inputCls}
          labelCls={labelCls}
        />
        <RevealField
          label="Card Expiry Year"
          value={booking.card_expiry_year || ''}
          maskedValue={maskYear(booking.card_expiry_year)}
          visible={visible.card_expiry_year}
          onToggle={() => toggle('card_expiry_year')}
          inputCls={inputCls}
          labelCls={labelCls}
        />
        <RevealField
          label="Card Expiry Month"
          value={booking.card_expiry_month || ''}
          maskedValue={maskMonth(booking.card_expiry_month)}
          visible={visible.card_expiry_month}
          onToggle={() => toggle('card_expiry_month')}
          inputCls={inputCls}
          labelCls={labelCls}
        />
      </div>

      {/* ---------- NEW CARD ---------- */}
      {!readOnly && (
        <>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold px-3 py-2 rounded mb-5">
            Add New Card OR Left empty
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className={labelCls}>Card Brand</label>
              <select
                value={draft.card_type}
                onChange={(e) => update('card_type', e.target.value)}
                className={inputCls}
              >
                <option value="">Select Card</option>
                {cardTypes.map((cardType) => (
                  <option key={cardType._id} value={cardType.card_type_name}>{cardType.card_type_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Card Holder</label>
              <input
                type="text"
                value={draft.card_holder_name}
                onChange={(e) => update('card_holder_name', e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Card Number</label>
              <MaskedInput
                className={inputCls}
                value={draft.card_number}
                onChange={(v) => update('card_number', v)}
                placeholder="Card Number"
                digitsOnly
                maxLength={19}
              />
            </div>

            <div>
              <label className={labelCls}>Security Code</label>
              <MaskedInput
                className={inputCls}
                value={draft.cvv}
                onChange={(v) => update('cvv', v)}
                placeholder="CVV"
                digitsOnly
                maxLength={4}
              />
            </div>

            <div>
              <label className={labelCls}>Card Expiry Year</label>
              <select
                value={draft.card_expiry_year}
                onChange={(e) => update('card_expiry_year', e.target.value)}
                className={inputCls}
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
                value={draft.card_expiry_month}
                onChange={(e) => update('card_expiry_month', e.target.value)}
                className={inputCls}
              >
                <option value="">Select Expiry Month</option>
                {EXPIRY_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

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
              {saving ? 'Saving...' : 'Update Card Info'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentInfoTab;
