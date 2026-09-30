import crypto from 'node:crypto';
import { Request, Response } from 'express';
import BookingModel from '../../models/Bookings/bookings.model';
import CcaModel from '../../models/Bookings/cca.model';
import cloudinary from '../../config/cloudinary';
import { sendEmail } from '../../services/email.service';

const FORM_TEXT = {
  billing: 'As per our agreement, we will be processing,, There will be a total charge of $ Tickets are NonRefundable / Non-Transferable, Name changes are not permitted, date and routing changes will be subject to Airline Penalty and Fare Difference if applicable . Fares are not guaranteed until ticketed, for any modification or changes please contact our Travel Consultant on our toll-free number 888-406-2871 Ext No  ( Consolidator Desk )',
  supporting: 'As part of the verification process, you may be required to submit supporting documentation as proof of purchase. Such documentation may include, but is not limited to: (i) a copy of the credit card used for the transaction, clearly displaying only the last four (4) digits of the card number along with the cardholder’s name; and (ii) a valid government-issued photo identification document. All documents must be legible, current, and unaltered. Failure to provide the requested documentation may result in denial of verification and/or services',
};

const terms = [
  'Tickets are Non-Refundable/Non-Transferable and name changes are not permitted.',
  'Date and routing changes will be subject to Airline Penalty and Fare Difference if any',
  'Fares are not guaranteed until ticketed.',
  'For any modification or changes please contact our Travel Consultant on 888-406-2871.',
  'All customers are advised to verify travel documents (transit visa/entry visa) for the country through which they are transiting and/or entering. We will not be responsible if proper travel documents are not available and you are denied entry or transit into a Country. We request you to consult the embassy of the country(s) you are visiting or transiting through.',
  'We value your business and look forward to serving your travel needs in near future.',
  'For any modification or any other query please contact our Travel Consultant on 888-406-2871.',
  'These terms and conditions (“terms of use”) apply to you right the moment you access and use Consolidator Desk: its services, products, and contents. This is a legal agreement between you and Consolidator Desk. You must read all the information carefully as you agree to these terms and conditions while accessing or using any services or products or contents of Consolidator Desk.',
];

const travelerTerms = 'Traveler First name and Last name must be entered during the time of reservation exactly as it appears on your Government issued identification, be it your passport, Driving License or other acceptable forms of identification depending on your type of journey (Domestic/International). Name once entered will not be changed. Some ‘Typo Error’ (Name Correction) however, is allowed, depending on Airline Terms of Use, & charges would be applicable according as per airline policy.';
const farePolicy = 'All Tickets are not guaranteed until ticketed. The fare may alter as revised by the Airline company or dealer anytime even after the confirmation of a reservation. Consolidator Desk will inform you about the fare changes if made without assuming any responsibility –financial or otherwise for any such fare alters made by the supplier.\n\nConsolidator Desk will inform you about the new fares. At that point of time you may- depending on your requirement – either purchase or cancel the product or service at the new cost. You also can cancel the booking at no cost in case there is increase in fare before ticketing and your card being charged. You’ll be charged nothing if you cancel such a booking.';
const paymentPolicy = [
  'Consolidator Desk accepts Debit Cards and Credit Cards',
  'Consolidator Desk may divide your total charge into two parts: Taxes and Airline Base. But, the combined total amount will be the same as authorized and quoted by you at the time of booking.',
  'Ticket fares doesn’t includes baggage fees of airline',
  'Tickets are guaranteed only after the ticketing is completed. The tickets will not be guaranteed upon submission of payment. In case, your credit card payment fails to proceed due to any reason, we will notify you about this within 24 hours.',
  'Third Party and International Credit & Debit Cards Payment',
  'In case you are using an International Debit Card or Credit while purchasing Plane Tickets for personal journey, or for somebody else, you need to have some specific documents for processing passenger ETickets. Documents required for the same have been mentioned below.',
  'A complete ‘Credit Card Authorization Form’',
  'A copy of identity proof issued by Government with front and back side which has photograph and signatures And copy of your card from which you are paying for the booking',
  'Airline Ticket price are not guaranteed until ticketed.',
];
const creditDeclines = 'On Credit Card being declined while processing your transaction, we will alert you about this by emailing you at your valid email id within 24 to 48 hours. In this case, neither the transaction will be processed nor the fare and any other booking details will be guaranteed.';
const cancellations = 'For all cancellation and exchanges, you agree to request at least 24 hours before scheduled departure. All flight tickets bought from us are 100% non-refundable. You, however, reserve the right to entertain refund or exchange if allowed by the airline fare rules associated with the ticket(s) issued to you. Your ticket (s) may be refunded or exchanged for the original purchase price after the deduction of applicable airline penalties, and any fare difference between the original fares paid and the fare associated with the new ticket(s).\n\nFurthermore, Consolidator Desk has the right to charge a Change/Refund fees. Consolidator Desk has no control over airline penalties associated with refunds or exchanges.\n\nIf you travel internationally, you may often be offered to travel in more than one airline. Each airline has formed its own set of fare rules. If more than one set of fare rules are applied to the total fare, the most restrictive rules will be applicable to the entire fare.';

const signedDocumentUrl = (document: { url: string; public_id?: string; resource_type?: string }) => {
  let publicId = document.public_id;
  let resourceType = document.resource_type || 'raw';

  if (!publicId) {
    const match = document.url.match(/\/((?:image|raw|video))\/upload\/(?:v\d+\/)?(.+)$/);
    if (match) {
      resourceType = match[1];
      publicId = decodeURIComponent(match[2]);
    }
  }

  if (!publicId) return document.url;
  return cloudinary.url(publicId, { secure: true, sign_url: true, type: 'upload', resource_type: resourceType });
};
const finalText = 'Thanks for spending your valuable time and using Consolidator Desk. For using the website, you are authorized to agree with the aforementioned ‘Terms of Use’. If you are reluctant or don’t agree with any of the conditions.';

const safeBooking = (booking: any) => ({
  _id: booking._id,
  pnr: booking.pnr,
  airline_pnr: booking.airline_pnr,
  customer_name: booking.customer_name,
  email: booking.email,
  billing_phone: booking.billing_phone,
  customer_email: booking.email,
  card_type: booking.card_type,
  card_holder_name: booking.card_holder_name,
  card_expiry_month: booking.card_expiry_month,
  card_expiry_year: booking.card_expiry_year,
  card_last4: String(booking.card_number || '').replace(/\D/g, '').slice(-4),
  pax: booking.pax,
  trip_type: booking.trip_type,
  from: booking.from,
  destination: booking.destination,
  departure_date: booking.departure_date,
  return_date: booking.return_date,
  itinerary_html: booking.itinerary_html,
  total_amount: booking.total_amount,
  currency: booking.currency,
  billing_address: booking.billing_address || booking.address,
});

const responseData = (booking: any, cca: any, includePrivate = false) => ({
  booking: safeBooking(booking),
  cca: {
    _id: cca?._id,
    status: cca?.status || 'DRAFT',
    card_type: cca?.card_type || booking.card_type || '',
    customer_email: cca?.customer_email || booking.email || '',
    passenger_names: cca?.passenger_names?.length ? cca.passenger_names : (booking.pax || []).map((pax: any) => `${pax.first_name || ''} ${pax.middle_name || ''} ${pax.last_name || ''}`.replace(/\s+/g, ' ').trim()),
    airline_pnr: cca?.airline_pnr || booking.airline_pnr || booking.pnr || '',
    cardholder_name: cca?.cardholder_name || booking.card_holder_name || '',
    card_last4: cca?.card_last4 || String(booking.card_number || '').replace(/\D/g, '').slice(-4),
    expiration_month: cca?.expiration_month || booking.card_expiry_month || '',
    expiration_year: cca?.expiration_year || booking.card_expiry_year || '',
    contact_no: cca?.contact_no || booking.billing_phone || '',
    billing_address: cca?.billing_address || booking.billing_address || booking.address || '',
    remarks: cca?.remarks || '',
    signature_data: includePrivate ? cca?.signature_data || '' : undefined,
    supporting_documents: (cca?.supporting_documents || []).map((document: any) => ({ ...document, url: signedDocumentUrl(document) })),
    sent_at: cca?.sent_at,
    completed_at: cca?.completed_at,
  },
  content: { billing: FORM_TEXT.billing, supporting: FORM_TEXT.supporting, terms, travelerTerms, farePolicy, paymentPolicy, creditDeclines, cancellations, finalText },
});

export const getCca = async (req: Request, res: Response) => {
  try {
    const booking = await BookingModel.findById(req.params.id).lean();
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const cca = await CcaModel.findOne({ booking_id: String(booking._id) }).lean();
    return res.json({ success: true, data: responseData(booking, cca, true) });
  } catch { return res.status(500).json({ success: false, message: 'Failed to load CCA' }); }
};

export const sendCca = async (req: Request, res: Response) => {
  try {
    const booking = await BookingModel.findById(req.params.id).lean();
    const recipientEmail = String(req.body.customer_email || booking?.email || '').trim().toLowerCase();
    if (!booking || !recipientEmail) return res.status(400).json({ success: false, message: 'Customer email is required' });
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const cca = await CcaModel.findOneAndUpdate(
      { booking_id: String(booking._id) },
      {
        $set: {
          status: 'SENT',
          token_hash: tokenHash,
          token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          sent_at: new Date(),
          customer_email: recipientEmail,
          ...(Array.isArray(req.body.passenger_names) ? { passenger_names: req.body.passenger_names.map((name: unknown) => String(name)) } : {}),
          ...(req.body.airline_pnr !== undefined ? { airline_pnr: String(req.body.airline_pnr) } : {}),
          ...(req.body.card_type !== undefined ? { card_type: String(req.body.card_type) } : {}),
          ...(req.body.cardholder_name !== undefined ? { cardholder_name: String(req.body.cardholder_name) } : {}),
          ...(req.body.expiration_month !== undefined ? { expiration_month: String(req.body.expiration_month) } : {}),
          ...(req.body.expiration_year !== undefined ? { expiration_year: String(req.body.expiration_year) } : {}),
          ...(req.body.contact_no !== undefined ? { contact_no: String(req.body.contact_no) } : {}),
          ...(req.body.billing_address !== undefined ? { billing_address: String(req.body.billing_address) } : {}),
          ...(req.body.remarks !== undefined ? { remarks: String(req.body.remarks) } : {}),
        },
      },
      { upsert: true, new: true }
    );
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const link = `${baseUrl}/cca/${token}`;
    const sent = await sendEmail({ to: recipientEmail, subject: 'Credit Card Authorization Form', html: `<p>Please complete your Credit Card Authorization Form for booking <strong>${booking.pnr}</strong>.</p><p><a href="${link}">Complete the Credit Card Authorization Form</a></p>` });
    if (!sent) return res.status(502).json({ success: false, message: 'CCA was created but the email could not be sent' });
    return res.json({ success: true, message: 'CCA link sent', data: responseData(booking, cca, true) });
  } catch { return res.status(500).json({ success: false, message: 'Failed to send CCA' }); }
};

const loadPublicCca = async (token: string) => {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const cca = await CcaModel.findOne({ token_hash: hash, token_expires_at: { $gt: new Date() } }).lean();
  if (!cca) return null;
  const booking = await BookingModel.findById(cca.booking_id).lean();
  return booking ? { booking, cca } : null;
};

export const getPublicCca = async (req: Request, res: Response) => {
  try {
    const result = await loadPublicCca(String(req.params.token));
    if (!result) return res.status(404).json({ success: false, message: 'This CCA link is invalid or expired' });
    return res.json({ success: true, data: responseData(result.booking, result.cca) });
  } catch { return res.status(500).json({ success: false, message: 'Failed to load CCA' }); }
};

export const submitPublicCca = async (req: Request, res: Response) => {
  try {
    const result = await loadPublicCca(String(req.params.token));
    if (!result) return res.status(404).json({ success: false, message: 'This CCA link is invalid or expired' });
    if (result.cca.status === 'DONE') return res.status(409).json({ success: false, message: 'This CCA has already been submitted' });
    const cardNumber = String(req.body.card_number || '').replace(/\D/g, '');
    if (cardNumber.length < 12 || !req.body.signature_data) return res.status(400).json({ success: false, message: 'Card number and signature are required' });
    const documents: { name: string; url: string; public_id?: string; resource_type?: string }[] = [];
    for (const file of ((req.files as Express.Multer.File[]) || [])) {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
      const upload = await cloudinary.uploader.upload(dataUri, { folder: 'faresovista/cca', resource_type: resourceType, type: 'upload' });
      documents.push({ name: file.originalname, url: upload.secure_url, public_id: upload.public_id, resource_type: upload.resource_type });
    }
    await CcaModel.updateOne(
      { _id: result.cca._id },
      {
        $set: { status: 'DONE', card_type: String(req.body.card_type || ''), cardholder_name: String(req.body.cardholder_name || ''), card_last4: cardNumber.slice(-4), expiration_month: String(req.body.expiration_month || ''), expiration_year: String(req.body.expiration_year || ''), contact_no: String(req.body.contact_no || ''), billing_address: String(req.body.billing_address || ''), remarks: String(req.body.remarks || ''), signature_data: String(req.body.signature_data), supporting_documents: documents, completed_at: new Date() },
        $unset: { token_hash: 1, token_expires_at: 1 },
      }
    );
    const completedHtml = `<p>Your Credit Card Authorization Form for booking <strong>${result.booking.pnr}</strong> has been completed.</p><p>Card type: ${String(req.body.card_type || '')}<br>Cardholder: ${String(req.body.cardholder_name || '')}<br>Card ending in: ${cardNumber.slice(-4)}</p><p>${FORM_TEXT.supporting}</p>`;
    await sendEmail({ to: result.cca.customer_email || result.booking.email || '', cc: process.env.CCA_CC_EMAIL || 'taylorgarry798@gmail.com', subject: 'Completed Credit Card Authorization Form', html: completedHtml });
    return res.json({ success: true, message: 'CCA submitted successfully' });
  } catch { return res.status(500).json({ success: false, message: 'Failed to submit CCA' }); }
};
