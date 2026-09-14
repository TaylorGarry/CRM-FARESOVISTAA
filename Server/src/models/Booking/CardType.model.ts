import mongoose, { Schema, Document } from 'mongoose';

export interface ICardType extends Document {
  card_type_name: string;
  card_type_status: 'Enabled' | 'Disabled';
  add_by?: string;
  add_date?: Date;
  update_by?: string;
  update_date?: Date;
  delete_by?: string;
  delete_date?: Date;
  delete_status?: boolean;
}

const CardTypeSchema = new Schema<ICardType>(
  {
    card_type_name: {
      type: String,
      required: [true, 'Card type name is required'],
      trim: true,
    },
    card_type_status: {
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
  { timestamps: true, collection: 'tbl_cardtype' }
);

CardTypeSchema.index({ delete_status: 1 });
CardTypeSchema.index({ card_type_name: 1, delete_status: 1 });

export const CardType = mongoose.model<ICardType>('CardType', CardTypeSchema);