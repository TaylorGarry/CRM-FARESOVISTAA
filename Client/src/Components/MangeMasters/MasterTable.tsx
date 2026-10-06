import { type ReactNode } from 'react';

interface Column<T = any> {
  key: keyof T | string;
  label: string;
  render?: (value: any, record: T) => ReactNode;
  className?: string;
}

interface MasterTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  actions?: (record: T) => ReactNode;
}

export const MasterTable = <T extends Record<string, any>>({
  columns, data, loading = false, emptyMessage = 'No records found', actions,
}: MasterTableProps<T>) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((record, index) => (
            <tr key={index} className="hover:bg-slate-50 transition">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-slate-700">
                  {col.render ? col.render(record[col.key as keyof T], record) : record[col.key as keyof T] ?? '-'}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">{actions(record)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
