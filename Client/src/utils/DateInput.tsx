import React, { useRef } from 'react';

interface DateInputProps {
  value: string;               // stored as "MM/DD/YYYY" (may be partial)
  onChange: (value: string) => void;
  className?: string;          // pass your inputCls styles here
  disabled?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Split "MM/DD/YYYY" (or partial) into three parts
  const [mm = '', dd = '', yyyy = ''] = (value || '').split('/');

  const emit = (m: string, d: string, y: string) => {
    onChange(`${m}/${d}/${y}`);
  };

  const handleMonth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
    emit(digits, dd, yyyy);

    // Auto-advance when 2 digits typed (or a leading 2-9 makes 2-digit month impossible)
    if (digits.length === 2 || (digits.length === 1 && Number(digits) > 1)) {
      dayRef.current?.focus();
      dayRef.current?.select();
    }
  };

  const handleDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
    emit(mm, digits, yyyy);

    if (digits.length === 2 || (digits.length === 1 && Number(digits) > 3)) {
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  };

  const handleYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    emit(mm, dd, digits);
  };

  const handleMonthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mm) {
      e.preventDefault();
      // move backwards out of this input naturally (handled by parent form keyDown)
    }
  };

  const handleDayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !dd) {
      e.preventDefault();
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  };

  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !yyyy) {
      e.preventDefault();
      dayRef.current?.focus();
      dayRef.current?.select();
    }
  };

  // Shared input styles — dashed underline to look like one field
  const baseCls =
    'bg-transparent outline-none text-sm text-slate-800 text-center';

  return (
    <div
      className={`${className} flex items-center gap-0 px-2 h-9`}
      style={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        value={mm}
        onChange={handleMonth}
        onKeyDown={handleMonthKeyDown}
        onFocus={(e) => e.target.select()}
        placeholder="MM"
        maxLength={2}
        disabled={disabled}
        className={`${baseCls} w-8`}
      />
      <span className="text-slate-400 select-none">/</span>
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        value={dd}
        onChange={handleDay}
        onKeyDown={handleDayKeyDown}
        onFocus={(e) => e.target.select()}
        placeholder="DD"
        maxLength={2}
        disabled={disabled}
        className={`${baseCls} w-8`}
      />
      <span className="text-slate-400 select-none">/</span>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        value={yyyy}
        onChange={handleYear}
        onKeyDown={handleYearKeyDown}
        onFocus={(e) => e.target.select()}
        placeholder="YYYY"
        maxLength={4}
        disabled={disabled}
        className={`${baseCls} w-12`}
      />
    </div>
  );
};

export default DateInput;