import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingApi, type BookingRecord } from '../../services/bookingApi';
import { MasterTable } from '../MangeMasters/MasterTable';
import { api, type ActiveUser } from '../../services/api';

interface BookingFilters {
  pnr: string;
  customer_name: string;
  phone: string;
  email: string;
  user_agent: string;
  booking_status: string;
  from_date: string;
  to_date: string;
}

const initialFilters: BookingFilters = {
  pnr: '',
  customer_name: '',
  phone: '',
  email: '',
  user_agent: '',
  booking_status: '',
  from_date: '',
  to_date: '',
};

const BOOKING_STATUSES = [
  'Decline for MILES',
  'Decline for HK',
  'Withdrawl limit Exceed',
  'Pick-Up Card',
  'AVS Failure',
  'Do Not Honor',
  'Insufficient Funds',
  'Follow Up',
  'Need Approval fpr TKT',
  'Need Approval for MCO',
  'Escalation',
  'Verbal Auth',
  'No Action taken by Agent',
  'WIP',
  'Missing Details',
  'Under Agent Follow up',
  'Under Follow up',
  'Exchange Not Permitted for Refund',
  'Exchange Not Permitted for Credit',
  'Seats not available',
  'CCD on AL',
  'Changes Denied by AL',
  'Work Done',
  'Work Done Charge MCO',
  'CUX Cancellation',
  'Cancel Due to Decline',
  'Partial Refund',
  'Void',
  'Refund',
  'Re-Run',
  'CCD on AL, Hold MCO',
  'Issue HK + Charge MCO',
  'CCD on AL-Charge MCO',
  'Work Pending Charge MCO',
  'Miles Booking',
  'Mileage + Cash',
  'New Booking with Upgrade',
  'Unable to Process Online',
  'Card Decline Online',
  'Pet Booking',
  'Upgrade',
  'Booking Confirmation',
  'Seat Assignment',
  'New Booking',
  'Exchange with Credit',
  'Change',
  'Add Remark',
];

const BookingsList: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<BookingFilters>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<BookingRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchData = async (
    nextPage = page,
    nextLimit = perPage,
    nextSearch = search,
    nextFilters = filters
  ) => {
    try {
      setLoading(true);

      const res = await bookingApi.getAll({
        page: nextPage,
        limit: nextLimit,
        search: nextSearch.trim() || undefined,

        pnr: nextFilters.pnr.trim() || undefined,
        customer_name: nextFilters.customer_name.trim() || undefined,
        phone: nextFilters.phone.trim() || undefined,
        email: nextFilters.email.trim() || undefined,
        user_agent: nextFilters.user_agent || undefined,
        booking_status: nextFilters.booking_status || undefined,
        from_date: nextFilters.from_date || undefined,
        to_date: nextFilters.to_date || undefined,
      });

      if (res.data.success) {
        setData(res.data.data);
        setTotal(Number(res.data.total || 0));
      }
    } catch {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, perPage, '', initialFilters);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, perPage, search, filters);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        setUsersLoading(true);

        const users = await api.listActiveUsers();

        setActiveUsers(users);
      } catch (error) {
        console.error('Failed to fetch active users:', error);
        toast.error('Failed to load active users');
      } finally {
        setUsersLoading(false);
      }
    };

    fetchActiveUsers();
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, pageCount);

  const firstVisible = total ? (currentPage - 1) * perPage + 1 : 0;
  const lastVisible = Math.min(currentPage * perPage, total);

  const updateFilter = (
    key: keyof BookingFilters,
    value: string
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchData(1, perPage, search, filters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearch('');
    setPage(1);
    fetchData(1, perPage, '', initialFilters);
  };

  const openDeleteModal = (record: BookingRecord) => {
    setDeleteTarget(record);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      const res = await bookingApi.delete(deleteTarget._id);

      if (res.data.success) {
        toast.success('Deleted successfully');
        setDeleteTarget(null);
        await fetchData(currentPage, perPage, search, filters);
      }
    } catch {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'pnr',
      label: 'PNR',
      render: (v: string) => (
        <span className="font-semibold text-slate-800">
          {v || '-'}
        </span>
      ),
    },
    {
      key: 'airline_pnr',
      label: 'Airline PNR',
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (v: string) => (
        <span className="font-medium text-slate-800">
          {v || '-'}
        </span>
      ),
    },
    {
      key: 'trip_type',
      label: 'Trip',
      render: (v: string) => (
        <span className="text-slate-700">
          {v || '-'}
        </span>
      ),
    },
    {
      key: 'from',
      label: 'From → To',
      render: (_: any, r: BookingRecord) => (
        <span className="text-slate-700">
          {r.from} → {r.destination}
        </span>
      ),
    },
    {
      key: 'departure_date',
      label: 'Departure',
      render: (v: string) =>
        v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (v: number, r: BookingRecord) => (
        <span className="text-slate-700">
          {r.currency} {Number(v || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'booking_status',
      label: 'Status',
      render: (v: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
          {v || '-'}
        </span>
      ),
    },
    {
      key: 'add_date',
      label: 'Add Date',
      render: (v: string) =>
        v ? new Date(v).toLocaleDateString() : '-',
    },
  ];

  const actions = (record: BookingRecord) => (
  <div className="relative flex justify-end group">
    {/* Trigger — always visible, compact */}
    <button
      type="button"
      className="text-slate-500 hover:text-slate-800 transition p-1 rounded-full hover:bg-slate-100"
      title="Actions"
      aria-label="Actions"
    >
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
          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
        />
      </svg>
    </button>

    {/* Popover — appears above the row, does NOT affect table layout */}
    <div
      className="
        absolute right-0 bottom-full mb-2 z-50
        flex items-center gap-2
        px-3 py-2 rounded-lg
        bg-white border border-slate-200 shadow-lg
        whitespace-nowrap
        opacity-0 invisible translate-y-1
        group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
        transition-all duration-200 ease-out
      "
    >
      {/* View — eye */}
      <button
        type="button"
        onClick={() => navigate(`/bookings/view/${record._id}`)}
        className="text-slate-600 hover:text-sky-700 transition"
        title="View"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {/* CCA */}
      <button
        type="button"
        className="px-1.5 py-0.5 text-[11px] font-semibold rounded text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
        title="CCA"
      >
        CCA
      </button>

      {/* Ticketing */}
      <button
        type="button"
        className="px-1.5 py-0.5 text-[11px] font-semibold rounded text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
        title="Ticketing"
      >
        Ticketing
      </button>

      {/* Assign */}
      <button
        type="button"
        className="px-1.5 py-0.5 text-[11px] font-semibold rounded text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
        title="Assign"
      >
        Assign
      </button>

      {/* Email — envelope */}
      <button
        type="button"
        className="text-slate-600 hover:text-sky-700 transition"
        title="Email"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Divider */}
      <span className="w-px h-4 bg-slate-200" />

      {/* Edit */}
      <button
        onClick={() => navigate(`/bookings/edit/${record._id}`)}
        className="text-sky-600 hover:text-sky-800 transition"
        title="Edit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {/* Delete */}
      <button
        onClick={() => openDeleteModal(record)}
        className="text-red-600 hover:text-red-800 transition"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-800">
          All Bookings
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PNR, customer, email..."
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-64"
          />

          <button
            type="button"
            onClick={() => setIsFilterOpen((previous) => !previous)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
          >
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
                d="M3 4h18M6 12h12M10 20h4"
              />
            </svg>

            {isFilterOpen ? 'Hide Filters' : 'Filters'}
          </button>

          <button
            onClick={() => navigate('/bookings/new')}
            className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition"
          >
            Add New
          </button>
        </div>
      </div>

      {/* Animated Filter Panel */}
      <div
        className={`overflow-hidden transition-all ease-in-out ${
          isFilterOpen
            ? 'max-h-225 opacity-100 mb-5 duration-700'
            : 'max-h-0 opacity-0 mb-0 duration-500'
        }`}
      >
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-slate-800 mb-5">
            Advance Search
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* PNR */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                Pnr
              </label>

              <input
                type="text"
                value={filters.pnr}
                onChange={(e) => updateFilter('pnr', e.target.value)}
                placeholder="Search by pnr"
                className="w-full h-9.5 px-2 text-sm border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                Customer name
              </label>

              <input
                type="text"
                value={filters.customer_name}
                onChange={(e) =>
                  updateFilter('customer_name', e.target.value)
                }
                placeholder="Search by name"
                className="w-full h-9.5 px-2 text-sm border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                Phone
              </label>

              <input
                type="text"
                value={filters.phone}
                onChange={(e) => updateFilter('phone', e.target.value)}
                placeholder="Search by phone"
                className="w-full h-9.5 px-2 text-sm border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                Email
              </label>

              <input
                type="email"
                value={filters.email}
                onChange={(e) => updateFilter('email', e.target.value)}
                placeholder="Search by email"
                className="w-full h-9.5 px-2 text-sm border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* User Agent */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                <span className="text-red-600">*</span>
                Select user agent
              </label>

              <select
                value={filters.user_agent}
                onChange={(e) =>
                  updateFilter('user_agent', e.target.value)
                }
                disabled={usersLoading}
                className="w-full h-9.5 px-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {usersLoading ? 'Loading users...' : 'Select All Agent'}
                </option>

                {activeUsers.map((user) => (
                  <option
                    key={user.user_id}
                    value={user.user_login}
                  >
                    {user.user_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Booking Status */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                BOOKING STATUS
              </label>

              <select
                value={filters.booking_status}
                onChange={(e) =>
                  updateFilter('booking_status', e.target.value)
                }
                className="w-full h-9.5 px-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Select Status</option>

                {BOOKING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                <span className="text-red-600">*</span>From Date
              </label>

              <input
                type="date"
                value={filters.from_date}
                onChange={(e) =>
                  updateFilter('from_date', e.target.value)
                }
                placeholder="From Date"
                className="w-full h-9.5 px-2 text-sm text-slate-700 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                <span className="text-red-600">*</span>To Date
              </label>

              <input
                type="date"
                value={filters.to_date}
                onChange={(e) =>
                  updateFilter('to_date', e.target.value)
                }
                placeholder="To Date"
                className="w-full h-9.5 px-2 text-sm text-slate-700 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={applyFilters}
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <MasterTable
        columns={columns}
        data={data}
        loading={loading}
        actions={actions}
        emptyMessage="No bookings found."
      />

      {!loading && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 px-4 py-3 bg-white border border-slate-200 rounded-lg mt-4">
          <div className="text-[13px] text-slate-500">
            Showing{' '}
            <span className="font-medium text-slate-700">
              {firstVisible}
            </span>{' '}
            to{' '}
            <span className="font-medium text-slate-700">
              {lastVisible}
            </span>{' '}
            of{' '}
            <span className="font-medium text-slate-700">
              {total}
            </span>{' '}
            records
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextPage = currentPage - 1;
                  setPage(nextPage);
                  fetchData(nextPage, perPage, search, filters);
                }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              <button
                type="button"
                className="min-w-8.5 h-8 px-3 rounded-md bg-sky-500 text-white text-[13px] font-semibold"
              >
                {currentPage}
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setPage(nextPage);
                  fetchData(nextPage, perPage, search, filters);
                }}
                disabled={currentPage === pageCount}
                className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-500">
                Rows:
              </span>

              <select
                value={perPage}
                onChange={(e) => {
                  const nextLimit = Number(e.target.value);
                  setPerPage(nextLimit);
                  setPage(1);
                  fetchData(1, nextLimit, search, filters);
                }}
                className="pl-3 pr-8 py-1.5 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {[5,10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

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
              Delete Booking
            </h3>

            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete booking{' '}
              <span className="font-medium text-slate-700">
                {deleteTarget.pnr}
              </span>{' '}
              for{' '}
              <span className="font-medium text-slate-700">
                {deleteTarget.customer_name}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
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

export default BookingsList;