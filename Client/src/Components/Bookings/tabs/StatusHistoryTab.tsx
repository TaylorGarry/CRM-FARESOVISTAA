import React from 'react';
import type { BookingHistoryRecord } from '../../../services/bookingApi';

interface Props {
  history: BookingHistoryRecord[];
}

const StatusHistoryTab: React.FC<Props> = ({ history }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Booking Update Status History
      </h2>

      <div className="border-t border-dashed border-slate-300 mb-4" />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-white text-left">
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                PNR
              </th>
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                Booking Status
              </th>
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                Remarks
              </th>
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                Update By
              </th>
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                Status Change Date
              </th>
            </tr>
          </thead>
          <tbody>
            {!history.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-slate-400 text-[13px]"
                >
                  No history yet.
                </td>
              </tr>
            )}

            {history.map((row) => (
              <tr
                key={row._id}
                className={`border-b border-slate-200 ${
                  row.is_system ? 'bg-slate-50/60' : 'bg-white'
                }`}
              >
                <td className="px-3 py-2 text-slate-600 text-[13px]">
                  {row.pnr || '-'}
                </td>
                <td className="px-3 py-2 text-slate-700 text-[13px]">
                  {row.booking_status || '-'}
                </td>
                <td
                  className={`px-3 py-2 text-[13px] ${
                    row.is_system
                      ? 'text-slate-500 italic'
                      : 'text-slate-800'
                  }`}
                >
                  {row.remarks || '-'}
                </td>
                <td className="px-3 py-2 text-slate-600 text-[13px]">
                  {row.update_by_name || row.update_by_login || '-'}
                </td>
                <td className="px-3 py-2 text-slate-500 text-[13px] whitespace-nowrap">
                  {row.created_at
                    ? new Date(row.created_at).toLocaleString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatusHistoryTab;
