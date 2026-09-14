import React, { type ReactNode } from 'react';

interface MasterFormProps {
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export const MasterForm: React.FC<MasterFormProps> = ({
  title, children, onSubmit, onCancel, submitLabel = 'Save', isSubmitting = false, isEdit = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        {isEdit ? `Edit ${title}` : `Add New ${title}`}
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};