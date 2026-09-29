import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { bookingApi, type BookingRecord } from '../../services/bookingApi';
import { BOOKING_STATUSES } from '../../constants/bookingConstants';
import RichTextEditor from './RichTextEditor';

interface DepartmentOption {
  id: string;
  name: string;
}

const AssignmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [department, setDepartment] = useState('');
  const [bookingStatus, setBookingStatus] = useState('New Booking');
  const [remarks, setRemarks] = useState('');
  const [itineraryHtml, setItineraryHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const [bookingResponse, roles] = await Promise.all([
          bookingApi.getById(id),
          api.listRoles(),
        ]);

        if (!bookingResponse.data.success || !bookingResponse.data.data) {
          toast.error('Booking not found');
          navigate('/bookings/all');
          return;
        }

        const departmentOptions = roles
          .filter((role) => role.status === 'Enabled' && role.delete_status !== 'True')
          .map((role) => ({
            id: role._id || String(role.role_id),
            name: role.role_name?.trim() || role.department_role?.trim() || String(role.role_id),
          }))
          .filter((option, index, options) => options.findIndex(item => item.id === option.id) === index)
          .sort((left, right) => left.name.localeCompare(right.name));

        setBooking(bookingResponse.data.data);
        setDepartments(departmentOptions);
        setDepartment(departmentOptions[0]?.id || '');
        setItineraryHtml(bookingResponse.data.data.itinerary_html || '');
      } catch {
        toast.error('Failed to load assignment form');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !department || !bookingStatus) return;

    try {
      setSaving(true);
      await bookingApi.createAssignment({
        booking_id: id,
        department,
        booking_status: bookingStatus,
        remarks,
        itinerary_html: itineraryHtml,
      });
      toast.success('Booking assigned successfully');
      navigate('/bookings/assignments');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to assign booking');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-16 text-slate-500">Loading...</div>;
  }

  if (!booking) return null;

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assign Booking</h1>
          <p className="text-sm text-slate-500 mt-1">PNR: {booking.pnr}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Department
            <select
              required
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Select department</option>
              {departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Booking Status
            <select
              required
              value={bookingStatus}
              onChange={(event) => setBookingStatus(event.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {BOOKING_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Remark
          <textarea
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            rows={5}
            placeholder="Add a remark"
            className="px-3 py-2 border border-slate-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </label>

        <section className="border-t border-slate-200 pt-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
            Itineraries / Screenshots
          </h2>
          <RichTextEditor
            value={itineraryHtml}
            onChange={setItineraryHtml}
          />
        </section>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !departments.length}
            className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;
