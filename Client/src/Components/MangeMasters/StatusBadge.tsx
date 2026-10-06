import React from 'react';

interface StatusBadgeProps {
  status: 'Enabled' | 'Disabled';
  onToggle?: () => void;
  showToggle?: boolean;
  toggleStyle?: 'switch' | 'pill';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onToggle,
  showToggle = false,
  toggleStyle = 'switch',
}) => {
  const isEnabled = status === 'Enabled';

  if (showToggle && onToggle) {
    if (toggleStyle === 'pill') {
      return (
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition cursor-pointer ${
            isEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
          aria-label={`Status: ${status}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
          {status}
        </button>
      );
    }

    return (
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 ${
          isEnabled ? 'bg-sky-600' : 'bg-slate-300'
        }`}
        role="switch"
        aria-checked={isEnabled}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isEnabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {status}
    </span>
  );
};
