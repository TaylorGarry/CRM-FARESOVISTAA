// import mongoose, { Schema, Document } from 'mongoose';

// export type PaxType = 'Adult' | 'Child' | 'Infant';
// export type Gender = 'Male' | 'Female';
// export type TripType = 'Oneway' | 'Roundtrip';
// export type Currency = 'USD' | 'CAD';
// export type BookingStatusType = 'Enabled' | 'Disabled';

// export interface IPax {
//   type: PaxType;
//   gender: Gender;
//   first_name: string;
//   middle_name?: string;
//   last_name: string;
//   dob?: string; // MM/DD/YYYY
// }

// export interface IBooking extends Document {
//   // Contact
//   pnr: string;
//   airline_pnr?: string;
//   customer_name: string;
//   email?: string;
//   billing_phone?: string;
//   alternate_phone?: string;

//   // PAX
//   pax: IPax[];

//   // Itinerary
//   trip_type: TripType;
//   from: string;
//   destination: string;
//   departure_date?: string;
//   return_date?: string;
//   reason_of_sale?: string;
//   itinerary_html?: string; // rich text HTML from TipTap

//   // Fare
//   total_amount?: number;
//   ticket_cost?: number;
//   airline_fee?: number;
//   mco?: number;
//   currency: Currency;

//   // Payment (only last4 + type + expiry stored — PCI-safe)
//   card_number: string;
//   cvv:string;
//   card_holder_name?: string;
//   card_type?: string;
//   card_expiry_month?: string;
//   card_expiry_year?: string;

//   // Billing
//   billing_address?: string;

//   // Status & remarks
//   booking_status: string;
//   remarks?: string;

//   // Meta
//   add_by?: string | null;
//   add_date?: Date;
//   update_by?: string | null;
//   update_date?: Date | null;
//   delete_by?: string | null;
//   delete_date?: Date | null;
//   delete_status: boolean;

//   createdAt: Date;
//   updatedAt: Date;
// }

// const PaxSchema = new Schema<IPax>(
//   {
//     type: { type: String, enum: ['Adult', 'Child', 'Infant'], required: true },
//     gender: { type: String, enum: ['Male', 'Female'], required: true },
//     first_name: { type: String, required: true, trim: true },
//     middle_name: { type: String, trim: true, default: '' },
//     last_name: { type: String, required: true, trim: true },
//     dob: { type: String, default: '' },
//   },
//   { _id: false }
// );

// const BookingSchema = new Schema<IBooking>(
//   {
//     // Contact
//     pnr: { type: String, required: [true, 'PNR is required'], trim: true, uppercase: true },
//     airline_pnr: { type: String, trim: true, uppercase: true, default: '' },
//     customer_name: { type: String, required: [true, 'Customer name is required'], trim: true },
//     email: { type: String, trim: true, lowercase: true, default: '' },
//     billing_phone: { type: String, trim: true, default: '' },
//     alternate_phone: { type: String, trim: true, default: '' },

//     // PAX
//     pax: {
//       type: [PaxSchema],
//       validate: {
//         validator: (v: IPax[]) => Array.isArray(v) && v.length > 0,
//         message: 'At least one passenger is required',
//       },
//       default: [],
//     },

//     // Itinerary
//     trip_type: { type: String, enum: ['Oneway', 'Roundtrip'], required: true },
//     from: { type: String, required: true, trim: true },
//     destination: { type: String, required: true, trim: true },
//     departure_date: { type: String, default: '' },
//     return_date: { type: String, default: '' },
//     reason_of_sale: { type: String, trim: true, default: '' },
//     itinerary_html: { type: String, default: '' },

//     // Fare
//     total_amount: { type: Number, default: 0 },
//     ticket_cost: { type: Number, default: 0 },
//     airline_fee: { type: Number, default: 0 },
//     mco: { type: Number, default: 0 },
//     currency: { type: String, enum: ['USD', 'CAD'], default: 'USD' },

//     // Payment — only last4 is stored
//     // NOTE: full card_number and CVV are NEVER persisted (PCI-DSS).
//     card_number: { type: String, trim: true, default: '' },
//     cvv: {type: String, trim: true, default: ''},
//     card_holder_name: { type: String, trim: true, default: '' },
//     card_type: { type: String, trim: true, default: '' },
//     card_expiry_month: { type: String, default: '' },
//     card_expiry_year: { type: String, default: '' },

//     // Billing
//     billing_address: { type: String, trim: true, default: '' },

//     // Status & remarks
//     booking_status: { type: String, required: true, trim: true, default: 'New Booking' },
//     remarks: { type: String, default: '' },

//     // Meta
//     add_by: { type: String, ref: 'User', default: null },
//     add_date: { type: Date, default: Date.now },
//     update_by: { type: String, ref: 'User', default: null },
//     update_date: { type: Date, default: null },
//     delete_by: { type: String, ref: 'User', default: null },
//     delete_date: { type: Date, default: null },
//     delete_status: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//     collection: 'Booking_list',
//   }
// );

// BookingSchema.index({ delete_status: 1 });
// BookingSchema.index({ pnr: 1, delete_status: 1 });
// BookingSchema.index({ customer_name: 1 });
// BookingSchema.index({ booking_status: 1 });
// BookingSchema.index({ createdAt: -1 });

// export default mongoose.model<IBooking>('Booking', BookingSchema);





import mongoose, { Schema, Document } from 'mongoose';

export type PaxType = 'Adult' | 'Child' | 'Infant';
export type Gender = 'Male' | 'Female';
export type TripType = 'Oneway' | 'Roundtrip';
export type Currency = 'USD' | 'CAD';

export interface IPax {
  type: PaxType;
  gender: Gender;
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob?: string;              // MM/DD/YYYY
  passport_number?: string;
  pid?: string;              // passport issue date (MM/DD/YYYY)
  ped?: string;              // passport expiry date (MM/DD/YYYY)
}

export interface IBooking extends Document {
  // Contact
  pnr: string;
  airline_pnr?: string;
  customer_name: string;
  email?: string;
  billing_phone?: string;
  alternate_phone?: string;

  // PAX
  pax: IPax[];

  // Itinerary
  trip_type: TripType;
  from: string;
  destination: string;
  departure_date?: string;
  return_date?: string;
  reason_of_sale?: string;
  itinerary_html?: string;

  // Fare
  total_amount?: number;
  ticket_cost?: number;
  airline_fee?: number;
  mco?: number;
  currency: Currency;

  // Payment (raw storage)
  card_number?: string;
  cvv?: string;
  card_holder_name?: string;
  card_type?: string;
  card_expiry_month?: string;
  card_expiry_year?: string;

  // Billing address (legacy single-string, kept for backward compat)
  billing_address?: string;

  // Structured address (new – for Contact Info tab)
  address?: string;
  address1?: string;
  country_code?: string;
  state?: string;
  city?: string;
  pincode?: string;

  // Booking Info tab extras
  booking_ip?: string;
  booking_date?: Date | null;
  gk_pnr?: string;
  hk_pnr?: string;
  airline_name?: string;
  quoted_fare?: number;
  issuance_fee?: number;
  arc?: string;
  net_mco?: number;

  // Status & remarks (remarks here is the *latest* remark, not history)
  booking_status: string;
  remarks?: string;

  // Lock (hard lock across sessions/devices – released only by adding a remark)
  locked_by?: string | null;        // String(user_id)
  locked_by_login?: string | null;
  locked_by_name?: string | null;
  locked_at?: Date | null;
  lock_session_id?: string | null;

  // Meta
  add_by?: string | null;
  add_date?: Date;
  update_by?: string | null;
  update_date?: Date | null;
  delete_by?: string | null;
  delete_date?: Date | null;
  delete_status: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const PaxSchema = new Schema<IPax>(
  {
    type: { type: String, enum: ['Adult', 'Child', 'Infant'], required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    first_name: { type: String, required: true, trim: true },
    middle_name: { type: String, trim: true, default: '' },
    last_name: { type: String, required: true, trim: true },
    dob: { type: String, default: '' },
    passport_number: { type: String, trim: true, default: '' },
    pid: { type: String, trim: true, default: '' },
    ped: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    pnr: { type: String, required: [true, 'PNR is required'], trim: true, uppercase: true },
    airline_pnr: { type: String, trim: true, uppercase: true, default: '' },
    customer_name: { type: String, required: [true, 'Customer name is required'], trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    billing_phone: { type: String, trim: true, default: '' },
    alternate_phone: { type: String, trim: true, default: '' },

    pax: {
      type: [PaxSchema],
      validate: {
        validator: (v: IPax[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one passenger is required',
      },
      default: [],
    },

    trip_type: { type: String, enum: ['Oneway', 'Roundtrip'], required: true },
    from: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    departure_date: { type: String, default: '' },
    return_date: { type: String, default: '' },
    reason_of_sale: { type: String, trim: true, default: '' },
    itinerary_html: { type: String, default: '' },

    total_amount: { type: Number, default: 0 },
    ticket_cost: { type: Number, default: 0 },
    airline_fee: { type: Number, default: 0 },
    mco: { type: Number, default: 0 },
    currency: { type: String, enum: ['USD', 'CAD'], default: 'USD' },

    card_number: { type: String, trim: true, default: '' },
    cvv: { type: String, trim: true, default: '' },
    card_holder_name: { type: String, trim: true, default: '' },
    card_type: { type: String, trim: true, default: '' },
    card_expiry_month: { type: String, default: '' },
    card_expiry_year: { type: String, default: '' },

    billing_address: { type: String, trim: true, default: '' },

    address: { type: String, trim: true, default: '' },
    address1: { type: String, trim: true, default: '' },
    country_code: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },

    booking_ip: { type: String, trim: true, default: '' },
    booking_date: { type: Date, default: null },
    gk_pnr: { type: String, trim: true, default: '' },
    hk_pnr: { type: String, trim: true, default: '' },
    airline_name: { type: String, trim: true, default: '' },
    quoted_fare: { type: Number, default: 0 },
    issuance_fee: { type: Number, default: 0 },
    arc: { type: String, trim: true, default: '' },
    net_mco: { type: Number, default: 0 },

    booking_status: { type: String, required: true, trim: true, default: 'New Booking' },
    remarks: { type: String, default: '' },

    locked_by: { type: String, default: null },
    locked_by_login: { type: String, default: null },
    locked_by_name: { type: String, default: null },
    locked_at: { type: Date, default: null },
    lock_session_id: { type: String, default: null },

    add_by: { type: String, default: null },
    add_date: { type: Date, default: Date.now },
    update_by: { type: String, default: null },
    update_date: { type: Date, default: null },
    delete_by: { type: String, default: null },
    delete_date: { type: Date, default: null },
    delete_status: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'Booking_list',
  }
);

BookingSchema.index({ delete_status: 1 });
BookingSchema.index({ pnr: 1, delete_status: 1 });
BookingSchema.index({ customer_name: 1 });
BookingSchema.index({ booking_status: 1 });
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ locked_by: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);