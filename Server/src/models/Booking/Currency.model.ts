import mongoose, { Schema, Document } from 'mongoose';

export interface ICurrency extends Document {
  currency_name: string;
  crency_symbol: string;
  currency_status: 'Enabled' | 'Disabled';
  add_by?: string;
  add_date?: Date;
  update_by?: string;
  update_date?: Date;
  delete_by?: string;
  delete_date?: Date;
  delete_status?: boolean;
}

const CurrencySchema = new Schema<ICurrency>(
  {
    currency_name: {
      type: String,
      required: [true, 'Currency name is required'],
      trim: true,
    },
    crency_symbol: {
      type: String,
      required: [true, 'Currency symbol is required'],
      trim: true,
    },
    currency_status: {
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
  { timestamps: true, collection: 'tbl_currency' }
);

CurrencySchema.index({ delete_status: 1 });
CurrencySchema.index({ currency_name: 1, delete_status: 1 });

export const Currency = mongoose.model<ICurrency>('Currency', CurrencySchema);