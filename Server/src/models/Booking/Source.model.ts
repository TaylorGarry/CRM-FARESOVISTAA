import mongoose, { Schema, Document } from 'mongoose';

export interface ISource extends Document {
  source_name: string;
  source_status: 'Enabled' | 'Disabled';
  add_by?: string;
  add_date?: Date;
  update_by?: string;
  update_date?: Date;
  delete_by?: string;
  delete_date?: Date;
  delete_status?: boolean;
}

const SourceSchema = new Schema<ISource>(
  {
    source_name: {
      type: String,
      required: [true, 'Source name is required'],
      trim: true,
    },
    source_status: {
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
  { timestamps: true, collection: 'tbl_source' }
);

SourceSchema.index({ delete_status: 1 });
SourceSchema.index({ source_name: 1, delete_status: 1 });

export const Source = mongoose.model<ISource>('Source', SourceSchema);