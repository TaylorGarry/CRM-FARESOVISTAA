import React from 'react';
import type { BookingAssignmentRecord } from '../../../services/bookingApi';

interface Props {
  assignments: BookingAssignmentRecord[];
}

const AssignmentHistoryTab: React.FC<Props> = ({ assignments }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Assignment History
      </h2>

      <div className="border-t border-dashed border-slate-300 mb-4" />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-white text-left">
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                Assign By
              </th>
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                To Department
              </th>
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                Assign To
              </th>
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                Remarks
              </th>
              <th className="px-3 py-2 font-semibold text-[12px] uppercase tracking-wide">
                Assign Date
              </th>
            </tr>
          </thead>
          <tbody>
            {!assignments.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-slate-400 text-[13px]"
                >
                  No assignments yet.
                </td>
              </tr>
            )}

            {assignments.map((row) => (
              <tr key={row._id} className="border-b border-slate-200 bg-white">
                <td className="px-3 py-2 text-slate-600 text-[13px]">
                  {row.assign_by_name || row.assign_by_login || '-'}
                </td>
                <td className="px-3 py-2 text-slate-600 text-[13px]">
                  {row.department || '-'}
                </td>
                <td className="px-3 py-2 text-slate-600 text-[13px]">
                  {row.assign_to_name || row.assign_to_login || '-'}
                </td>
                <td className="px-3 py-2 text-slate-700 text-[13px]">
                  {row.remarks || '-'}
                </td>
                <td className="px-3 py-2 text-slate-500 text-[13px] whitespace-nowrap">
                  {row.assign_date
                    ? new Date(row.assign_date).toLocaleString()
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

export default AssignmentHistoryTab;