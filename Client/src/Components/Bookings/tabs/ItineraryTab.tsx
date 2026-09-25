import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi, type BookingRecord } from '../../../services/bookingApi';
import RichTextEditor from "../../../Components/Bookings/RichTextEditor"

interface Props {
  booking: BookingRecord;
  readOnly: boolean;
  onSaved: (updated: BookingRecord) => void;
}

const ItineraryTab: React.FC<Props> = ({ booking, readOnly, onSaved }) => {
  const [html, setHtml] = useState<string>(booking.itinerary_html || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await bookingApi.updateItinerary(booking._id, html);
      if (res.data.success) {
        toast.success('Itinerary updated');
        onSaved(res.data.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update itinerary');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Itinerary
      </h2>

      <div className="border-t border-dashed border-slate-300 mb-5" />

      {readOnly ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html || '<p class="text-slate-400">No itinerary.</p>' }} />
      ) : (
        <RichTextEditor value={html} onChange={setHtml} />
      )}

      {!readOnly && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-md hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {saving ? 'Saving...' : 'Update Itinerary Info'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ItineraryTab;