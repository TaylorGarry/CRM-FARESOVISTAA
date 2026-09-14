import mongoose, { Schema, Document } from 'mongoose';

export interface ISaleType extends Document {
  seal_type: string;
  seal_status: 'Enabled' | 'Disabled';
  add_by?: string;
  add_date?: Date;
  update_by?: string;
  update_date?: Date;
  delete_by?: string;
  delete_date?: Date;
  delete_status?: boolean;
}

const SaleTypeSchema = new Schema<ISaleType>(
  {
    seal_type: {
      type: String,
      required: [true, 'Sale type is required'],
      trim: true,
    },
    seal_status: {
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
  { timestamps: true, collection: 'tbl_seal' }
);

SaleTypeSchema.index({ delete_status: 1 });
SaleTypeSchema.index({ seal_type: 1, delete_status: 1 });

export const SaleType = mongoose.model<ISaleType>('SaleType', SaleTypeSchema);