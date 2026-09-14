import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  role_id: number;
  role_name: string;
  department_role: string;
  status: 'Enabled' | 'Disabled';
  delete_status: 'False' | 'True';
  add_by?: string;
  update_by?: string;
  delete_by?: string;
  delete_date?: Date;
  created_at: Date;
  updated_at: Date;
}

const RoleSchema = new Schema<IRole>({
  role_id: { type: Number, unique: true },
  role_name: { type: String, required: true, trim: true },
  department_role: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
  delete_status: { type: String, enum: ['False', 'True'], default: 'False' },
  add_by: { type: String, default: '' }, update_by: { type: String, default: '' },
  delete_by: { type: String, default: '' }, delete_date: { type: Date },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

RoleSchema.pre('validate', async function () {
  if (this.isNew && !this.role_id) {
    const last = await Role.findOne().sort({ role_id: -1 });
    this.role_id = last ? last.role_id + 1 : 1;
  }
});

RoleSchema.index({ role_name: 1, delete_status: 1 }, { unique: true, partialFilterExpression: { delete_status: 'False' } });

export const Role = mongoose.model<IRole>('Role', RoleSchema);
