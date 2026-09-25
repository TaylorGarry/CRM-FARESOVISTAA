import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingHistory extends Document {
  booking_id: string;         // Booking._id
  pnr: string;
  booking_status: string;
  remarks: string;
  update_by: string;          // String(user_id)
  update_by_login: string;
  update_by_name: string;
  is_system: boolean;         // true for auto-generated entries ("Booking opened by X")
  created_at: Date;
  updated_at: Date;
}

const BookingHistorySchema = new Schema<IBookingHistory>(
  {
    booking_id: {
      type: String,
      required: true,
      index: true,
    },
    pnr: { type: String, trim: true, default: '' },
    booking_status: { type: String, trim: true, default: '' },
    remarks: { type: String, default: '' },
    update_by: { type: String, default: '' },
    update_by_login: { type: String, default: '' },
    update_by_name: { type: String, default: '' },
    is_system: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'Booking_history',
  }
);

BookingHistorySchema.index({ booking_id: 1, created_at: -1 });

export default mongoose.model<IBookingHistory>(
  'BookingHistory',
  BookingHistorySchema
);