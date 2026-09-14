import mongoose, { Schema, Document } from 'mongoose';

export interface IUserHistory extends Document {
  uhist_id: number;
  uhist_userid: number;
  uhist_logindate: string;
  uhist_logintime: string;
  uhist_udept: string;
  uhist_logouttime: string;
  uhist_ip: string;
  created_at: Date;
}

const UserHistorySchema = new Schema<IUserHistory>({
  uhist_id: { type: Number, required: true, unique: true },
  uhist_userid: { type: Number, required: true },
  uhist_logindate: { type: String, required: true },
  uhist_logintime: { type: String, required: true },
  uhist_udept: { type: String, required: true },
  uhist_logouttime: { type: String, default: '' },
  uhist_ip: { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at' }
});

UserHistorySchema.pre('validate', async function (this: IUserHistory) {
  if (this.isNew && !this.uhist_id) {
    const last = await UserHistory.findOne().sort({ uhist_id: -1 });
    this.uhist_id = last ? last.uhist_id + 1 : 1;
  }
});

export const UserHistory = mongoose.model<IUserHistory>(
  'UserHistory',
  UserHistorySchema
);