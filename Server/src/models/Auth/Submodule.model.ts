import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmodule extends Document {
  sub_id: number;
  sub_mainid: number;
  sub_name: string;
  sub_page: string;
  sub_status: 'Enabled' | 'Disabled';
  created_at: Date;
  updated_at: Date;
}

const SubmoduleSchema = new Schema<ISubmodule>({
  sub_id: { type: Number, required: true, unique: true },
  sub_mainid: { type: Number, required: true },
  sub_name: { type: String, required: true },
  sub_page: { type: String, required: true },
  sub_status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

SubmoduleSchema.pre('save', async function (this: ISubmodule) {
  if (this.isNew) {
    const last = await Submodule.findOne().sort({ sub_id: -1 });
    this.sub_id = last ? last.sub_id + 1 : 1;
  }
});

export const Submodule = mongoose.model<ISubmodule>('Submodule', SubmoduleSchema);
