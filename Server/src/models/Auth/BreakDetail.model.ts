import mongoose, { Schema, Document } from 'mongoose';

export interface IBreakDetail extends Document {
  break_details_id: number;
  break_details_status: 'Enabled' | 'Disabled';
  breaktype_details_id: number;
  add_by: number;
  update_date: Date;
  update_by: number;
  delete_status: 'False' | 'True';
  created_at: Date;
}

const BreakDetailSchema = new Schema<IBreakDetail>({
  break_details_id: { type: Number, required: true, unique: true },
  break_details_status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
  breaktype_details_id: { type: Number, default: 3 },
  add_by: { type: Number, required: true },
  update_date: { type: Date },
  update_by: { type: Number },
  delete_status: { type: String, enum: ['False', 'True'], default: 'False' },
}, {
  timestamps: { createdAt: 'created_at' }
});

BreakDetailSchema.pre('save', async function (this: IBreakDetail) {
  if (this.isNew) {
    const last = await BreakDetail.findOne().sort({ break_details_id: -1 });
    this.break_details_id = last ? last.break_details_id + 1 : 1;
  }
});

export const BreakDetail = mongoose.model<IBreakDetail>('BreakDetail', BreakDetailSchema);
