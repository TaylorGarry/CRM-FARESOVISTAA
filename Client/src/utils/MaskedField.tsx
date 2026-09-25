import React, { useState } from 'react';

interface MaskedFieldProps {
  value?: string;
  masked?: string;             // e.g. "•••• •••• •••• 1234"
  placeholder?: string;
  className?: string;
  defaultRevealed?: boolean;
}

const MaskedField: React.FC<MaskedFieldProps> = ({
  value = '',
  masked,
  placeholder = '-',
  className = '',
  defaultRevealed = false,
}) => {
  const [revealed, setRevealed] = useState(defaultRevealed);

  const raw = String(value || '');
  const displayed = revealed
    ? raw || placeholder
    : masked ?? (raw ? '•'.repeat(Math.min(raw.length, 16)) : placeholder);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="font-mono text-slate-700">
        {displayed}
      </span>
      {raw && (
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          title={revealed ? 'Hide' : 'Show'}
          className="text-slate-400 hover:text-slate-700 transition"
        >
          {revealed ? (
            // eye-off icon
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            // eye icon
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
          )}
        </button>
      )}
    </span>
  );
};

export default MaskedField;


export const maskCardNumber = (cardNumber?: string): string => {
  const digits = String(cardNumber || '').replace(/\D/g, '');
  if (!digits) return '';
  const last4 = digits.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

export const maskCvv = (_?: string): string => '•••';