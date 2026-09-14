import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
  tamplate_name: string;
  Template_Type: 'New booking' | 'Changing';
  email_sub: string;
  email_body: string;
  status: 'Enabled' | 'Disabled';
  add_by?: string;
  add_date?: Date;
  update_by?: string;
  update_date?: Date;
  delete_by?: string;
  delete_date?: Date;
  delete_status?: boolean;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    tamplate_name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    Template_Type: {
      type: String,
      enum: ['New booking', 'Cancellation', "Ticket Change"],
      required: [true, 'Template type is required'],
    },
    email_sub: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
    },
    email_body: {
      type: String,
      required: [true, 'Email body is required'],
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
  { timestamps: true, collection: 'tbl_email_tamplate' }
);

EmailTemplateSchema.index({ delete_status: 1 });
EmailTemplateSchema.index({ tamplate_name: 1, delete_status: 1 });

export const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);