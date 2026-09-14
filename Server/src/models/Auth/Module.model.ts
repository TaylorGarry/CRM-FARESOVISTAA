import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
  id: number;
  name: string;
  icon: string;
  status: 'Enabled' | 'Disabled';
  created_at: Date;
  updated_at: Date;
}

const ModuleSchema = new Schema<IModule>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: '' },
  status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

ModuleSchema.pre('save', async function (this: IModule) {
  if (this.isNew) {
    const last = await Module.findOne().sort({ id: -1 });
    this.id = last ? last.id + 1 : 1;
  }
});

export const Module = mongoose.model<IModule>('Module', ModuleSchema);
