import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { currencyApi } from '../../services/masterApi';
import { type Currency } from '../../types/master';
import { MasterForm } from './MasterForm';
import { MasterTable } from './MasterTable';
import { StatusBadge } from './StatusBadge';

interface FormData {
  currency_name: string;
  crency_symbol: string;
  currency_status: 'Enabled' | 'Disabled';
}

const initialFormData: FormData = { currency_name: '', crency_symbol: '', currency_status: 'Enabled' };

export const Currencies: React.FC = () => {
  const [data, setData] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Currency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await currencyApi.getAll();
      if (res.data.success) setData(res.data.data);
    } catch {
      toast.error('Failed to fetch currencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [data.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = editingId
        ? await currencyApi.update(editingId, formData)
        : await currencyApi.create(formData);
      if (res.data.success) {
        toast.success(editingId ? 'Updated successfully' : 'Created successfully');
        resetForm();
        await fetchData();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (r: Currency) => {
    setEditingId(r._id);
    setFormData({
      currency_name: r.currency_name,
      crency_symbol: r.crency_symbol,
      currency_status: r.currency_status,
    });
    setShowForm(true);
  };

  // ===== Delete modal =====
  const openDeleteModal = (record: Currency) => setDeleteTarget(record);
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await currencyApi.delete(deleteTarget._id);
      if (res.data.success) {
        toast.success('Deleted successfully');
        setDeleteTarget(null);
        await fetchData();
      }
    } catch {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const res = await currencyApi.toggleStatus(id, currentStatus);
      if (res.data.success) {
        toast.success('Status updated');
        await fetchData();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  // ===== Pagination computation =====
  const pageCount = Math.max(1, Math.ceil(data.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, data.length);
  const visibleData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  );
  const firstVisible = data.length ? startIndex + 1 : 0;
  const lastVisible = endIndex;

  const columns = [
    {
      key: 'currency_name',
      label: 'Currency Name',
      render: (v: string) => <span className="font-medium text-slate-800">{v}</span>,
    },
    {
      key: 'crency_symbol',
      label: 'Symbol',
      render: (v: string) => <span className="text-slate-700">{v || '-'}</span>,
    },
    {
      key: 'add_by',
      label: 'Added By',
      render: (v: any) => {
        if (!v) return <span className="text-slate-400">-</span>;
        if (typeof v === 'object' && v !== null) {
          return <span className="text-slate-700">{v.user_name || v.name || v.email || '-'}</span>;
        }
        if (v === '0' || v === 0) return <span className="text-slate-700">Admin</span>;
        return <span className="text-slate-700">{String(v)}</span>;
      },
    },
    {
      key: 'add_date',
      label: 'Add Date',
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : '-'),
    },
    {
      key: 'currency_status',
      label: 'Status',
      render: (v: string, r: Currency) => (
        <StatusBadge
          status={v as 'Enabled' | 'Disabled'}
          onToggle={() => handleToggleStatus(r._id, v)}
          showToggle
        />
      ),
    },
  ];

  const actions = (r: Currency) => (
    <>
      <button
        onClick={() => handleEdit(r)}
        className="text-sky-600 hover:text-sky-800 transition"
        title="Edit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={() => openDeleteModal(r)}
        className="text-red-600 hover:text-red-800 transition"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Currency Specification</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition"
        >
          {showForm ? '✕' : 'Add New'}
        </button>
      </div>

      {showForm && (
        <MasterForm title="Currency" onSubmit={handleSubmit} onCancel={resetForm} isSubmitting={isSubmitting} isEdit={!!editingId}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency Name *</label>
              <input
                required
                type="text"
                value={formData.currency_name}
                onChange={(e) => setFormData({ ...formData, currency_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g., US Dollar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency Symbol *</label>
              <input
                required
                type="text"
                value={formData.crency_symbol}
                onChange={(e) => setFormData({ ...formData, crency_symbol: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g., $"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.currency_status}
                onChange={(e) => setFormData({ ...formData, currency_status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>
        </MasterForm>
      )}

      <MasterTable
        columns={columns}
        data={visibleData}
        loading={loading}
        actions={actions}
        emptyMessage="No currencies found."
      />

      {/* ===== Pagination ===== */}
      {!loading && data.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 px-4 py-3 bg-white border border-slate-200 rounded-lg mt-4">
          <div className="text-[13px] text-slate-500">
            Showing <span className="font-medium text-slate-700">{firstVisible}</span> to{' '}
            <span className="font-medium text-slate-700">{lastVisible}</span> of{' '}
            <span className="font-medium text-slate-700">{data.length}</span> records
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                type="button"
                className="min-w-[34px] h-8 px-3 rounded-md bg-sky-500 text-white text-[13px] font-semibold"
              >
                {currentPage}
              </button>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-500">Rows:</span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] text-slate-700 bg-white
                             border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ▾
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation Modal ===== */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Delete Currency
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-slate-700">
                {deleteTarget.currency_name}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium
                           hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold
                           hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};