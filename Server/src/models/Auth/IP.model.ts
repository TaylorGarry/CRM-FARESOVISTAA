import mongoose, { Schema, Document } from 'mongoose';

export interface IIP extends Document {
  ip_id: number;
  pcip_no: string;
  created_at: Date;
}

const IPSchema = new Schema<IIP>({
  ip_id: { type: Number, required: true, unique: true },
  pcip_no: { type: String, required: true, unique: true },
}, {
  timestamps: { createdAt: 'created_at' }
});

IPSchema.pre('save', async function (this: IIP) {
  if (this.isNew) {
    const lastIP = await IP.findOne().sort({ ip_id: -1 });
    this.ip_id = lastIP ? lastIP.ip_id + 1 : 1;
  }
});

export const IP = mongoose.model<IIP>('IP', IPSchema);
