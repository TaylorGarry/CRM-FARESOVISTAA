import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi, type CcaData } from '../../../services/bookingApi';

const CcaSummaryTab: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const [data, setData] = useState<CcaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await bookingApi.getCca(bookingId);
        if (active) setData(response.data.data);
      } catch (error: any) {
        if (active) toast.error(error?.response?.data?.message || 'Failed to load CCA details');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [bookingId]);

  if (loading) return <div className="bg-white border border-slate-200 rounded-lg p-5 text-sm text-slate-500">Loading CCA details...</div>;
  if (!data) return <div className="bg-white border border-slate-200 rounded-lg p-5 text-sm text-slate-500">CCA details unavailable.</div>;

  const { cca } = data;
  return (
    <div className="space-y-4">
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Credit Card Authorization</h2>
            <p className="mt-1 text-xs text-slate-500">Sensitive card data is masked for employee viewing.</p>
          </div>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${cca.status === 'DONE' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : cca.status === 'SENT' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            {cca.status}
          </span>
        </div>
        <div className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
          <p><span className="font-medium text-slate-800">Cardholder:</span> {cca.cardholder_name || '-'}</p>
          <p><span className="font-medium text-slate-800">Card type:</span> {cca.card_type || '-'}</p>
          <p><span className="font-medium text-slate-800">Card:</span> {cca.card_last4 ? `Ending in ${cca.card_last4}` : '-'}</p>
          <p><span className="font-medium text-slate-800">Expiration:</span> {cca.expiration_month && cca.expiration_year ? `${cca.expiration_month}/${cca.expiration_year}` : '-'}</p>
          <p><span className="font-medium text-slate-800">Contact:</span> {cca.contact_no || '-'}</p>
          <p><span className="font-medium text-slate-800">Customer email:</span> {cca.customer_email || data.booking.email || '-'}</p>
        </div>
        {cca.billing_address && <p className="mt-4 text-sm text-slate-600"><span className="font-medium text-slate-800">Billing address:</span> {cca.billing_address}</p>}
        {cca.remarks && <p className="mt-4 text-sm text-slate-600"><span className="font-medium text-slate-800">Remarks:</span> {cca.remarks}</p>}
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-800">Supporting Documents</h2>
        {cca.supporting_documents && cca.supporting_documents.length > 0 ? (
          <div className="mt-4 space-y-2">
            {cca.supporting_documents.map((document) => (
              <a key={document.url} href={document.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-sky-700 hover:bg-slate-50">
                <span className="truncate">{document.name}</span>
                <span className="shrink-0 text-xs text-slate-400">Open</span>
              </a>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-slate-500">No supporting documents uploaded.</p>}
      </section>

      {cca.signature_data && <section className="bg-white border border-slate-200 rounded-lg p-5"><h2 className="text-sm font-semibold text-slate-800">Customer Signature</h2><img src={cca.signature_data} alt="Customer signature" className="mt-4 max-w-xs border border-slate-200" /></section>}
    </div>
  );
};

export default CcaSummaryTab;
