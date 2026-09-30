import mongoose, { Document, Schema } from 'mongoose';

export type CcaStatus = 'DRAFT' | 'SENT' | 'DONE';

export interface ICCA extends Document {
  booking_id: string;
  status: CcaStatus;
  token_hash?: string;
  token_expires_at?: Date | null;
  card_type?: string;
  customer_email?: string;
  passenger_names: string[];
  airline_pnr?: string;
  cardholder_name?: string;
  card_last4?: string;
  expiration_month?: string;
  expiration_year?: string;
  contact_no?: string;
  billing_address?: string;
  remarks?: string;
  signature_data?: string;
  supporting_documents: { name: string; url: string; public_id?: string; resource_type?: string }[];
  sent_at?: Date | null;
  completed_at?: Date | null;
}

const CcaSchema = new Schema<ICCA>(
  {
    booking_id: { type: String, required: true, index: true },
    status: { type: String, enum: ['DRAFT', 'SENT', 'DONE'], default: 'DRAFT', index: true },
    token_hash: { type: String, index: true, sparse: true },
    token_expires_at: { type: Date, default: null },
    card_type: { type: String, default: '' },
    customer_email: { type: String, default: '' },
    passenger_names: { type: [String], default: [] },
    airline_pnr: { type: String, default: '' },
    cardholder_name: { type: String, default: '' },
    card_last4: { type: String, default: '' },
    expiration_month: { type: String, default: '' },
    expiration_year: { type: String, default: '' },
    contact_no: { type: String, default: '' },
    billing_address: { type: String, default: '' },
    remarks: { type: String, default: '' },
    signature_data: { type: String, default: '' },
    supporting_documents: {
      type: [{ name: String, url: String, public_id: String, resource_type: String }],
      default: [],
    },
    sent_at: { type: Date, default: null },
    completed_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'credit_card_authorizations' }
);

export default mongoose.model<ICCA>('CreditCardAuthorization', CcaSchema);
