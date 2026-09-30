import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingApi, type CcaData } from '../../services/bookingApi';

const fieldClass = 'w-full h-10 px-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500';
const sectionClass = 'bg-white border border-slate-200 rounded-lg p-5';

const CcaPage: React.FC<{ publicMode?: boolean }> = ({ publicMode = false }) => {
  const { id, token } = useParams<{ id?: string; token?: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<CcaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [passengerNames, setPassengerNames] = useState<string[]>([]);
  const [airlinePnr, setAirlinePnr] = useState('');
  const [form, setForm] = useState({ card_type: '', cardholder_name: '', expiration_month: '', expiration_year: '', contact_no: '', billing_address: '', remarks: '' });
  const [documents, setDocuments] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [signed, setSigned] = useState(false);
  const drawing = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = publicMode ? await bookingApi.getPublicCca(token || '') : await bookingApi.getCca(id || '');
        setData(response.data.data);
        const cca = response.data.data.cca;
        const booking = response.data.data.booking;
        setCustomerEmail(cca.customer_email || booking.email || '');
        setPassengerNames(cca.passenger_names?.length ? cca.passenger_names : (booking.pax || []).map((pax) => `${pax.first_name} ${pax.middle_name || ''} ${pax.last_name}`.replace(/\s+/g, ' ').trim()));
        setAirlinePnr(cca.airline_pnr || booking.airline_pnr || booking.pnr || '');
        setForm({ card_type: cca.card_type || booking.card_type || '', cardholder_name: cca.cardholder_name || booking.card_holder_name || '', expiration_month: cca.expiration_month || booking.card_expiry_month || '', expiration_year: cca.expiration_year || booking.card_expiry_year || '', contact_no: cca.contact_no || booking.billing_phone || '', billing_address: cca.billing_address || booking.billing_address || '', remarks: cca.remarks || '' });
      } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to load CCA'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, token, publicMode]);

  const setField = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));
  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); draw(event); };
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect(); const context = canvas.getContext('2d'); if (!context) return;
    context.lineWidth = 2; context.lineCap = 'round'; context.strokeStyle = '#172b4d'; context.lineTo((event.clientX - rect.left) * (canvas.width / rect.width), (event.clientY - rect.top) * (canvas.height / rect.height)); context.stroke(); context.beginPath(); context.moveTo((event.clientX - rect.left) * (canvas.width / rect.width), (event.clientY - rect.top) * (canvas.height / rect.height)); setSigned(true);
  };
  const stopDrawing = () => { drawing.current = false; canvasRef.current?.getContext('2d')?.beginPath(); };
  const clearSignature = () => { const canvas = canvasRef.current; canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height); setSigned(false); };
  const selectDocuments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    const allowed = selected.filter((file) => (file.type.startsWith('image/') || file.type === 'application/pdf') && file.size <= 8 * 1024 * 1024);
    if (allowed.length !== selected.length) toast.error('Only image and PDF files can be uploaded');
    if (documents.length + allowed.length > 5) {
      toast.error('You can upload up to 5 supporting documents');
      return;
    }
    setDocuments((previous) => [...previous, ...allowed]);
    event.currentTarget.value = '';
  };
  const removeDocument = (index: number) => setDocuments((previous) => previous.filter((_, documentIndex) => documentIndex !== index));
  const formatFileSize = (size: number) => size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;

  const send = async () => {
    if (!id) return;
    try { setSubmitting(true); await bookingApi.sendCca(id, { ...form, customer_email: customerEmail, passenger_names: passengerNames, airline_pnr: airlinePnr }); setData((previous) => previous ? { ...previous, cca: { ...previous.cca, ...form, customer_email: customerEmail, passenger_names: passengerNames, airline_pnr: airlinePnr, status: 'SENT' } } : previous); toast.success('CCA link sent to the customer'); } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to send CCA'); } finally { setSubmitting(false); }
  };
  const submit = async () => {
    setSubmitError('');
    if (!token) { setSubmitError('This secure CCA link is missing or invalid.'); return; }
    if (!data) { setSubmitError('CCA data is still loading. Please try again.'); return; }
    if (!canvasRef.current) { setSubmitError('Signature pad is unavailable. Please reload the form.'); return; }
    const missingFields = [
      !cardNumber && 'Card number',
      !cvv && 'CVV number',
      !signed && 'Signature',
      !form.cardholder_name && 'Cardholder name',
      !form.card_type && 'Card type',
      !form.expiration_month && 'Expiration month',
      !form.expiration_year && 'Expiration year',
      !form.contact_no && 'Contact number',
      !form.billing_address && 'Billing address',
    ].filter(Boolean) as string[];
    if (missingFields.length > 0) { setSubmitError(`Please complete: ${missingFields.join(', ')}.`); toast.error('Please complete the required CCA fields'); return; }
    const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, value)); body.append('card_number', cardNumber); body.append('cvv', cvv); body.append('signature_data', canvasRef.current.toDataURL('image/png')); documents.forEach((file) => body.append('documents', file));
    try { setSubmitting(true); await bookingApi.submitPublicCca(token, body); setData((previous) => previous ? { ...previous, cca: { ...previous.cca, status: 'DONE' } } : previous); setSubmitted(true); setCardNumber(''); setCvv(''); setDocuments([]); toast.success('CCA submitted successfully'); } catch (error: any) { const message = error?.response?.data?.message || 'Failed to submit CCA. Please try again.'; setSubmitError(message); toast.error(message); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading CCA...</div>;
  if (!data) return <div className="p-6 text-sm text-slate-500">CCA unavailable.</div>;
  const { booking, cca, content } = data;
  const readOnly = cca.status === 'DONE';

  return <div className="max-w-5xl mx-auto p-6 space-y-5 font-normal tracking-normal">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-sky-600">{publicMode ? 'Customer Secure Form' : 'Booking CCA'}</p><h1 className="text-2xl font-bold text-slate-800">Credit Card Authorization Form</h1></div>{!publicMode && <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">Back</button>}</div>
    <section className={sectionClass}><h2 className="text-sm font-semibold text-slate-800 mb-4">Credit Card Information</h2><div className="grid gap-4 md:grid-cols-2"><div><label className="block text-xs font-normal text-slate-600 mb-1">Passenger&apos;s Name</label><div className="space-y-2">{passengerNames.map((name, index) => <input key={`passenger-${index}`} value={name} readOnly={readOnly} onChange={(event) => setPassengerNames((previous) => previous.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className={fieldClass} />)}</div><span className="text-xs text-slate-400">Add More</span></div><div><label className="block text-xs font-normal text-slate-600 mb-1">Airline PNR</label><input value={airlinePnr} readOnly={readOnly} onChange={(event) => setAirlinePnr(event.target.value)} className={fieldClass} /></div><label className="text-xs font-normal text-slate-600">Customer Email:<input type="email" value={customerEmail} readOnly={readOnly || publicMode} onChange={(event) => setCustomerEmail(event.target.value)} className={`${fieldClass} mt-1`} /></label></div></section>
    <section className={sectionClass}><h2 className="text-sm font-semibold text-slate-800 mb-4">Booking Detail&apos;s</h2><div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3"><p><span className="font-medium text-slate-800">PNR:</span> {booking.pnr}</p><p><span className="font-medium text-slate-800">Route:</span> {booking.from} to {booking.destination}</p><p><span className="font-medium text-slate-800">Fare:</span> {booking.currency} {Number(booking.total_amount || 0).toFixed(2)}</p></div>{booking.itinerary_html ? <div className="prose prose-sm max-w-none mt-4 border-t border-slate-100 pt-4" dangerouslySetInnerHTML={{ __html: booking.itinerary_html }} /> : <p className="mt-4 text-sm text-slate-400">No itinerary available.</p>}</section>
    <section className={sectionClass}><h2 className="text-sm font-semibold text-slate-800 mb-4">Card Type</h2><div className="flex flex-wrap gap-4">{['Master Card', 'VISA', 'Discover', 'AMEX', 'Other'].map((type) => <label key={type} className="inline-flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="card_type" value={type} checked={form.card_type === type} disabled={readOnly} onChange={(event) => setField('card_type', event.target.value)} />{type}</label>)}</div></section>
    <section className={sectionClass}><h2 className="text-sm font-semibold text-slate-800 mb-4">Card Information</h2><div className="grid gap-4 md:grid-cols-2"><label className="text-xs font-normal text-slate-600">Cardholder Name (as shown on card):<input value={form.cardholder_name} readOnly={readOnly} onChange={(event) => setField('cardholder_name', event.target.value)} className={`${fieldClass} mt-1 font-normal`} /></label><label className="text-xs font-normal text-slate-600">Card Number:<input value={publicMode ? cardNumber : (cca.card_last4 ? `•••• •••• •••• ${cca.card_last4}` : '')} readOnly={!publicMode || readOnly} onChange={(event) => setCardNumber(event.target.value)} className={`${fieldClass} mt-1 font-normal ${!publicMode ? 'bg-slate-50' : ''}`} autoComplete="off" placeholder={!publicMode ? 'Completed by customer' : ''} /></label><label className="text-xs font-normal text-slate-600">CVV Number:<input type="password" value={publicMode ? cvv : ''} readOnly={!publicMode || readOnly} onChange={(event) => setCvv(event.target.value)} className={`${fieldClass} mt-1 font-normal ${!publicMode ? 'bg-slate-50' : ''}`} autoComplete="off" placeholder={!publicMode ? 'Entered securely by customer' : ''} /><span className="block mt-1 text-[11px] font-normal text-slate-400">CVV is never stored or preloaded.</span></label><label className="text-xs font-normal text-slate-600">Expiration Date (MM/YY):<div className="flex gap-2 mt-1"><input placeholder="MM" value={form.expiration_month} readOnly={readOnly} onChange={(event) => setField('expiration_month', event.target.value)} className={`${fieldClass} font-normal`} /><input placeholder="YY" value={form.expiration_year} readOnly={readOnly} onChange={(event) => setField('expiration_year', event.target.value)} className={`${fieldClass} font-normal`} /></div></label><label className="text-xs font-normal text-slate-600">Contact No:<input value={form.contact_no} readOnly={readOnly} onChange={(event) => setField('contact_no', event.target.value)} className={`${fieldClass} mt-1 font-normal`} /></label></div></section>
    <section className={sectionClass}><h2 className="text-sm font-semibold text-slate-800 mb-3">Billing Information</h2><label className="text-xs font-normal text-slate-600">Address:<textarea value={form.billing_address} readOnly={readOnly} onChange={(event) => setField('billing_address', event.target.value)} className={`${fieldClass} h-20 mt-1 py-2 font-normal`} /></label><p className="text-sm leading-6 text-slate-600 mt-4 font-normal">{content.billing}</p><label className="block text-xs font-normal text-slate-600 mt-4">Remarks<textarea value={form.remarks} readOnly={readOnly} onChange={(event) => setField('remarks', event.target.value)} className={`${fieldClass} h-20 mt-1 py-2 font-normal`} /></label></section>
    <section className={sectionClass}><h2 className="text-sm font-semibold text-slate-800 mb-3">Supporting Document Notice</h2><p className="text-sm leading-6 text-slate-600">{content.supporting}</p>{publicMode && !readOnly && <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4"><label className="block text-sm font-medium text-slate-700">Choose supporting files<input type="file" multiple accept="image/*,.pdf" onChange={selectDocuments} className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-sky-700" /></label><p className="mt-2 text-xs text-slate-500">PDF or image files, up to 5 documents and 8 MB per file.</p>{documents.length > 0 && <div className="mt-4 space-y-2">{documents.map((file, index) => <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-700">{file.name}</p><p className="text-xs text-slate-400">{formatFileSize(file.size)}</p></div><button type="button" onClick={() => removeDocument(index)} className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800">Remove</button></div>)}</div>}</div>}{cca.supporting_documents && cca.supporting_documents.length > 0 && <div className="mt-4 space-y-2"><p className="text-xs font-medium text-slate-500">Submitted documents</p>{cca.supporting_documents.map((document) => <a key={document.url} href={document.url} target="_blank" rel="noreferrer" className="block text-sm text-sky-700 hover:text-sky-900">{document.name}</a>)}</div>}</section>
    <section className={sectionClass}><h2 className="text-sm font-semibold text-slate-800 mb-3">Terms &amp; Conditions</h2><div className="space-y-4 text-sm leading-6 text-slate-600">{content.terms.map((item) => <p key={item}>{item}</p>)}<h3 className="font-semibold text-slate-800">Travelers Name</h3><p>{content.travelerTerms}</p><h3 className="font-semibold text-slate-800">Fare Policy</h3><p className="whitespace-pre-line">{content.farePolicy}</p><h3 className="font-semibold text-slate-800">Payment Policy</h3><ol className="list-decimal pl-5">{content.paymentPolicy.map((item) => <li key={item}>{item}</li>)}</ol><h3 className="font-semibold text-slate-800">Credit Card Declines</h3><p>{content.creditDeclines}</p><h3 className="font-semibold text-slate-800">Cancellations and Exchanges</h3><p className="whitespace-pre-line">{content.cancellations}</p><p>{content.finalText}</p></div></section>
    {(publicMode || cca.signature_data) && <section className={sectionClass}><h2 className="text-sm font-semibold text-slate-800 mb-3">Signature</h2>{readOnly ? (cca.signature_data ? <img src={cca.signature_data} alt="Customer signature" className="max-w-xs border border-slate-200" /> : <p className="text-sm text-slate-500">CCA submitted successfully.</p>) : <><canvas ref={canvasRef} width={700} height={180} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} className="w-full max-w-2xl h-44 border border-slate-300 rounded-md touch-none bg-white" /><button type="button" onClick={clearSignature} className="mt-2 text-sm text-sky-700 hover:text-sky-900">Clear signature</button></>}</section>}
    {submitted && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">CCA submitted successfully. This secure link can no longer be used.</div>}
    {submitError && !submitted && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{submitError}</div>}
    <div className="flex flex-wrap items-center justify-end gap-3">{!publicMode && cca.status !== 'DONE' && <button type="button" onClick={send} disabled={submitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50">{submitting ? 'Sending...' : 'Send Now'}</button>}{publicMode && !readOnly && <button type="button" onClick={submit} disabled={submitting || submitted} className="px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50">{submitting ? 'Submitting...' : submitted ? 'Submitted' : 'Submit CCA'}</button>}</div>
  </div>;
};

export default CcaPage;
