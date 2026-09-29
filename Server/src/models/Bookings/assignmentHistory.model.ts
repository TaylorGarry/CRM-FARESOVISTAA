import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentHistory extends Document {
  booking_id: string;
  pnr: string;
  assign_by: string;
  assign_by_login: string;
  assign_by_name: string;
  department_id?: string;
  department: string;
  assign_to: string;
  assign_to_login: string;
  assign_to_name: string;
  booking_status: string;
  remarks: string;
  done_by?: string;
  done_by_login?: string;
  done_by_name?: string;
  handled: boolean;
  handled_at?: Date | null;
  itinerary_html?: string;
  screenshot_url?: string;
  assign_date: Date;
  created_at: Date;
  updated_at: Date;
}

const AssignmentHistorySchema = new Schema<IAssignmentHistory>(
  {
    booking_id: { type: String, required: true, index: true },
    pnr: { type: String, trim: true, default: '' },
    assign_by: { type: String, default: '' },
    assign_by_login: { type: String, default: '' },
    assign_by_name: { type: String, default: '' },
    department_id: { type: String, default: '' },
    department: { type: String, default: '' },
    assign_to: { type: String, default: '' },
    assign_to_login: { type: String, default: '' },
    assign_to_name: { type: String, default: '' },
    booking_status: { type: String, trim: true, default: 'New Booking' },
    remarks: { type: String, default: '' },
    done_by: { type: String, default: '' },
    done_by_login: { type: String, default: '' },
    done_by_name: { type: String, default: '' },
    handled: { type: Boolean, default: false },
    handled_at: { type: Date, default: null },
    itinerary_html: { type: String, default: '' },
    screenshot_url: { type: String, default: '' },
    assign_date: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'Assignment_history',
  }
);

AssignmentHistorySchema.index({ booking_id: 1, assign_date: -1 });

export default mongoose.model<IAssignmentHistory>(
  'AssignmentHistory',
  AssignmentHistorySchema
);
