import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingApi, type BookingAssignmentRecord } from '../../services/bookingApi';
import { BOOKING_STATUSES } from '../../constants/bookingConstants';

const AssignmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<BookingAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [handleTarget, setHandleTarget] = useState<BookingAssignmentRecord | null>(null);
  const [handleStatus, setHandleStatus] = useState('');
  const [handleRemarks, setHandleRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!previewImage) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [previewImage]);

  const load = async (nextPage = page) => {
    try {
      setLoading(true);
      const response = await bookingApi.listAssignments({ page: nextPage, limit: 10 });
      if (response.data.success) {
        setRows(response.data.data || []);
        setTotal(Number(response.data.total || 0));
      }
    } catch {
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const openHandle = (row: BookingAssignmentRecord) => {
    setHandleTarget(row);
    setHandleStatus(row.booking_status || 'New Booking');
    setHandleRemarks(row.remarks || '');
  };

  const saveHandle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!handleTarget) return;

    try {
      setSaving(true);
      await bookingApi.handleAssignment(handleTarget._id, {
        booking_status: handleStatus,
        remarks: handleRemarks,
        handled: true,
      });
      toast.success('Assignment updated');
      setHandleTarget(null);
      await load(page);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update assignment');
    } finally {
      setSaving(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assignments</h1>
          <p className="text-sm text-slate-500 mt-1">Booking assignment history</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
        <table className="w-full min-w-[1050px] text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['PNR', 'Assign By', 'To Department', 'Done By', 'Booking Status', 'Remarks', 'Screenshot / Itinerary', 'Assign Date', 'Actions'].map((label) => (
                <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading && <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">Loading...</td></tr>}
            {!loading && !rows.length && <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">No assignments found.</td></tr>}
            {!loading && rows.map((row) => (
              <tr key={row._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{row.pnr || row.booking?.pnr || '-'}</td>
                <td className="px-4 py-3 text-slate-700">{row.assign_by_name || row.assign_by_login || '-'}</td>
                <td className="px-4 py-3 text-slate-700">{row.department || '-'}</td>
                <td className="px-4 py-3 text-slate-700">{row.done_by_name || row.done_by_login || 'N/A'}</td>
                <td className="px-4 py-3 text-slate-700">{row.booking_status || '-'}</td>
                <td className="px-4 py-3 text-slate-700 max-w-[220px] truncate" title={row.remarks || ''}>{row.remarks || '-'}</td>
                <td className="px-4 py-3 text-slate-700">
                  {row.itinerary_html || row.booking?.itinerary_html ? (
                    <details>
                      <summary className="cursor-pointer text-sky-700 font-medium">View</summary>
                      <div
                        className="prose prose-sm max-w-xs mt-2 [&_img]:cursor-zoom-in"
                        onClick={(event) => {
                          const target = event.target;
                          if (target instanceof HTMLImageElement) {
                            setPreviewImage(target.src);
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: row.itinerary_html || row.booking?.itinerary_html || '' }}
                      />
                    </details>
                  ) : 'N/A'}
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.assign_date ? new Date(row.assign_date).toLocaleString() : '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => navigate(`/bookings/view/${row.booking_id}`)} className="text-slate-600 hover:text-sky-700" title="View" aria-label="View">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button type="button" onClick={() => navigate(`/bookings/assign/${row.booking_id}`)} className="text-sky-600 hover:text-sky-800 text-xs font-semibold" title="Assign">Assign</button>
                    {!row.handled && <button type="button" onClick={() => openHandle(row)} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold" title="Handle">Handle</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && total > 0 && (
        <div className="flex items-center justify-between pt-4 text-sm text-slate-500">
          <span>Page {page} of {pageCount}</span>
          <div className="flex gap-3">
            <button type="button" disabled={page === 1} onClick={() => { const next = page - 1; setPage(next); load(next); }} className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-40">Previous</button>
            <button type="button" disabled={page === pageCount} onClick={() => { const next = page + 1; setPage(next); load(next); }} className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {handleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={saveHandle} className="w-full max-w-lg rounded-lg bg-white border border-slate-200 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">Handle Assignment</h2>
            <p className="text-sm text-slate-500 mt-1">PNR: {handleTarget.pnr}</p>
            <label className="flex flex-col gap-2 mt-5 text-sm font-medium text-slate-700">Booking Status
              <select value={handleStatus} onChange={(event) => setHandleStatus(event.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg">
                {BOOKING_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 mt-4 text-sm font-medium text-slate-700">Remark
              <textarea value={handleRemarks} onChange={(event) => setHandleRemarks(event.target.value)} rows={4} className="px-3 py-2 border border-slate-300 rounded-lg" />
            </label>
            <div className="flex justify-end gap-3 mt-5">
              <button type="button" onClick={() => setHandleTarget(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Mark Handled'}</button>
            </div>
          </form>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Itinerary preview"
            className="max-h-[92vh] max-w-[92vw] object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default AssignmentsList;
