import mongoose, { Schema, Document } from 'mongoose';
import { hashPassword, isHashedPassword } from '../../utils/password';

export interface IUser extends Document {
  user_id: number;
  user_login: string;
  user_password: string;
  user_email: string;
  user_name: string;
  user_role: string;
  gender?: 'Male' | 'Female';
  user_gender?: 'Male' | 'Female';
  dob?: Date;
  user_dob?: Date;
  mobile?: string;
  address?: string;
  webmail_password?: string;
  user_status: 'Enabled' | 'Disabled';
  delete_status: 'False' | 'True';
  code: string;
  forgot_date: Date;
  created_at: Date;
  updated_at: Date;
  add_by?: string;
  update_by?: string;
  delete_by?: string;
  delete_date?: Date;
}

const UserSchema = new Schema<IUser>({
  user_id: { type: Number, required: true, unique: true },
  user_login: { type: String, required: true, unique: true },
  user_password: { type: String, required: true, select: false },
  user_email: { type: String, required: true, unique: true },
  user_name: { type: String, required: true },
  user_role: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'] },
  user_gender: { type: String, enum: ['Male', 'Female'] },
  dob: { type: Date },
  user_dob: { type: Date },
  mobile: { type: String, default: '' },
  address: { type: String, default: '' },
  webmail_password: { type: String, select: false },
  user_status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
  delete_status: { type: String, enum: ['False', 'True'], default: 'False' },
  code: { type: String, default: '' },
  forgot_date: { type: Date },
  add_by: { type: String, default: '' },
  update_by: { type: String, default: '' },
  delete_by: { type: String, default: '' },
  delete_date: { type: Date },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Auto-increment user_id (PHP: AUTO_INCREMENT)
UserSchema.pre('validate', async function (this: IUser) {
  if (this.isNew && !this.user_id) {
    const lastUser = await User.findOne().sort({ user_id: -1 });

    this.user_id = lastUser ? lastUser.user_id + 1 : 1;
  }
});

UserSchema.pre('save', async function () {
  if (this.isModified('user_password') && this.user_password && !isHashedPassword(this.user_password)) {
    this.user_password = await hashPassword(this.user_password);
  }
  if (this.isModified('webmail_password') && this.webmail_password && !isHashedPassword(this.webmail_password)) {
    this.webmail_password = await hashPassword(this.webmail_password);
  }
});

UserSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as any;

  const hashField = async (target: any) => {
    if (!target) return;
    for (const field of ['user_password', 'webmail_password']) {
      if (target[field] && !isHashedPassword(target[field])) {
        target[field] = await hashPassword(target[field]);
      }
    }
  };

  await hashField(update);
  await hashField(update?.$set);
});

export const User = mongoose.model<IUser>('User', UserSchema);
