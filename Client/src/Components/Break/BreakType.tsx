import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { breakTypeApi, type BreakTypeRecord } from '../../services/breakTypeApi';

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white disabled:bg-slate-50 disabled:text-slate-500';

const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

const BreakType: React.FC = () => {
  /* ---------- form state ---------- */
  const [breakTypeName, setBreakTypeName] = useState('');
  const [status, setStatus] = useState<'Enabled' | 'Disabled'>('Enabled');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ---------- list state ---------- */
  const [rows, setRows] = useState<BreakTypeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  /* ---------- fetch ---------- */
  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await breakTypeApi.list({ page, limit, search });
      if (res.data.success) {
        setRows(res.data.data);
        setTotal(res.data.total);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load break types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  /* ---------- submit (create / update) ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!breakTypeName.trim()) {
      toast.error('Break Type Name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await breakTypeApi.update(editingId, {
          break_type_name: breakTypeName.trim(),
          status,
        });
        if (res.data.success) {
          toast.success('Break Type updated');
          resetForm();
          fetchRows();
        }
      } else {
        const res = await breakTypeApi.create({
          break_type_name: breakTypeName.trim(),
          status,
        });
        if (res.data.success) {
          toast.success('Break Type created');
          resetForm();
          fetchRows();
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setBreakTypeName('');
    setStatus('Enabled');
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setBreakTypeName('');
    setStatus('Enabled');
    setEditingId(null);
    setShowForm(true);
  };

  /* ---------- edit ---------- */
  const handleEdit = (row: BreakTypeRecord) => {
    setEditingId(row._id);
    setBreakTypeName(row.break_type_name);
    setStatus(row.status);
    setShowForm(true);
  };

  /* ---------- delete ---------- */
  const handleDelete = async (row: BreakTypeRecord) => {
    const ok = window.confirm(`Delete break type "${row.break_type_name}"?`);
    if (!ok) return;

    try {
      const res = await breakTypeApi.remove(row._id);
      if (res.data.success) {
        toast.success('Break Type deleted');
        if (editingId === row._id) resetForm();
        fetchRows();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  /* ---------- toggle status ---------- */
  const handleToggleStatus = async (row: BreakTypeRecord) => {
    try {
      const res = await breakTypeApi.toggleStatus(row._id);
      if (res.data.success) {
        toast.success(res.data.message || 'Status updated');
        fetchRows();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Status update failed');
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '-';
    const date = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Break Type</h1>
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-[#0084D1] text-white hover:bg-[#0073b8] shadow-sm hover:shadow-md cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Break Type
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? 'Edit Break Type' : 'Add New Break Type'}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingId ? 'Update break type details' : 'Create a new break type'}
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close form"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className={labelCls}>
                  Type of Break <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={breakTypeName}
                  onChange={(e) => setBreakTypeName(e.target.value)}
                  placeholder="Enter Type of Break Name"
                  className={inputCls}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Enabled' | 'Disabled')}
                  className={inputCls}
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0084D1] text-white rounded-lg text-sm font-medium hover:bg-[#0073b8] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingId ? 'Update Break Type' : 'Create Break Type'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Table card ---------- */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded-md text-sm"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>records per page</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Search:</span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Break Type Name</th>
                <th className="px-4 py-3">Add Date</th>
                <th className="px-4 py-3">Add By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No break types found
                  </td>
                </tr>
              )}

              {!loading && rows.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.break_type_name}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(row.add_date)}</td>
                  <td className="px-4 py-3 text-slate-600">{row.add_by}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(row)}
                      title="Toggle status"
                      className={`inline-flex items-center justify-center w-3 h-3 rounded-full transition ${
                        row.status === 'Enabled'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Status: ${row.status}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(row)}
                        title="Edit"
                        className="text-sky-600 hover:text-sky-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 text-sm text-slate-600">
          <span>
            Showing {rows.length === 0 ? 0 : (page - 1) * limit + 1} to{' '}
            {(page - 1) * limit + rows.length} of {total} records
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 bg-sky-600 text-white rounded-md font-semibold">{page}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BreakType;
