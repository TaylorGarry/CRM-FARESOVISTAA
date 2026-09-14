import mongoose, { Schema, Document } from 'mongoose';

export interface IRolePermission extends Document {
  roleper_roleid: string;
  roleper_mainmenu: string[];
  roleper_submenu: string[];
  roleper_status: 'Enabled' | 'Disabled';
  cardVerPer?: boolean;
  PayVerPer?: boolean;
  ticketVerPer?: boolean;
  dashboardPer: boolean;
  mcoReport: boolean;
  delete_status: 'False' | 'True';
  add_by?: string;
  update_by?: string;
  delete_by?: string;
  delete_date?: Date;
  created_at: Date;
  updated_at: Date;
}

const RolePermissionSchema = new Schema<IRolePermission>({
  roleper_roleid: { type: String, required: true },
  roleper_mainmenu: { type: [String], default: [] },
  roleper_submenu: { type: [String], default: [] },
  roleper_status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
  cardVerPer: { type: Boolean, default: false },
  PayVerPer: { type: Boolean, default: false },
  ticketVerPer: { type: Boolean, default: false },
  dashboardPer: { type: Boolean, default: false },
  mcoReport: { type: Boolean, default: false },
  delete_status: { type: String, enum: ['False', 'True'], default: 'False' },
  add_by: { type: String, default: '' },
  update_by: { type: String, default: '' },
  delete_by: { type: String, default: '' },
  delete_date: { type: Date },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

RolePermissionSchema.index({ roleper_roleid: 1, delete_status: 1 }, {
  unique: true,
  partialFilterExpression: { delete_status: 'False' },
});

export const RolePermission = mongoose.model<IRolePermission>('RolePermission', RolePermissionSchema);
