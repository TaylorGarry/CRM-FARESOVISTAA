import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignBookingStatus extends Document {
  role_id: string;
  bookingstatusname: string;
  color: string;
  status: 'Enabled' | 'Disabled';
  add_by?: string;
  add_date?: Date;
  update_by?: string;
  update_date?: Date;
  delete_by?: string;
  delete_date?: Date;
  delete_status?: boolean;
}

const AssignBookingStatusSchema = new Schema<IAssignBookingStatus>(
  {
    role_id: {
      type: String,
      required: [true, 'Role/Department is required'],
      ref: 'Role',
    },
    bookingstatusname: {
      type: String,
      required: [true, 'Booking status name is required'],
      trim: true,
    },
    color: {
      type: String,
      default: '#000000',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Enabled', 'Disabled'],
      default: 'Enabled',
    },
    add_by: { type: String, ref: 'User' },
    add_date: { type: Date, default: Date.now },
    update_by: { type: String, ref: 'User' },
    update_date: { type: Date },
    delete_by: { type: String, ref: 'User' },
    delete_date: { type: Date },
    delete_status: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'tb_assign_booking_status' }
);

AssignBookingStatusSchema.index({ delete_status: 1 });
AssignBookingStatusSchema.index({ role_id: 1, bookingstatusname: 1, delete_status: 1 });

export const AssignBookingStatus = mongoose.model<IAssignBookingStatus>(
  'AssignBookingStatus',
  AssignBookingStatusSchema
);