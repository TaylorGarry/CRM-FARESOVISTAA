import mongoose, { Schema, Document } from 'mongoose';
import { hashPassword, isHashedPassword } from '../../utils/password';

export interface IAdminSetting extends Document {
  id: number;
  username: string;
  pass_real: string;
  Password: string;
  code: string;
  forgot_date: Date;
  email: string;
  last_login: string;
  created_at: Date;
  updated_at: Date;
}

const AdminSettingSchema = new Schema<IAdminSetting>({
  id: { type: Number, required: true, unique: true, default: 1 },
  username: { type: String, required: true, default: 'admin' },
  pass_real: { type: String, required: true, select: false },
  Password: { type: String, required: true, select: false },
  code: { type: String, default: '' },
  forgot_date: { type: Date },
  email: { type: String, required: true },
  last_login: { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

AdminSettingSchema.pre('save', async function () {
  if (this.isModified('pass_real') && this.pass_real && !isHashedPassword(this.pass_real)) {
    this.pass_real = await hashPassword(this.pass_real);
  }

  if (this.isModified('Password') && this.Password && !isHashedPassword(this.Password)) {
    this.Password = await hashPassword(this.Password);
  }
});

AdminSettingSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as any;

  const hashFields = async (target: any) => {
    if (!target) {
      return;
    }

    if (target.pass_real && !isHashedPassword(target.pass_real)) {
      target.pass_real = await hashPassword(target.pass_real);
    }

    if (target.Password && !isHashedPassword(target.Password)) {
      target.Password = await hashPassword(target.Password);
    }
  };

  await hashFields(update);
  await hashFields(update?.$set);
});

export const AdminSetting = mongoose.model<IAdminSetting>('AdminSetting', AdminSettingSchema);
