import mongoose, { Schema, Document } from 'mongoose';

export interface IBreakType extends Document {
    break_type_name: string;
    status: 'Enabled' | 'Disabled';
    add_by: string;
    add_date: Date;
    update_by: string | null;
    update_date: Date | null;
    delete_by: string | null;
    delete_date: Date | null;
    delete_status: boolean;
}

const BreakTypeSchema = new Schema<IBreakType>(
    {
        break_type_name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ['Enabled', 'Disabled'],
            default: 'Enabled',
        },
        add_by: {type: String, default: null },
        add_date: {type: Date, default: Date.now},
        update_by: {type: String, default: null},
        update_date: {type: Date, default: null},
        delete_by: {type: String, default: null},
        delete_date: {type: Date, default: null},
        delete_status: {type: Boolean, default: false},
    },
    {timestamps: true}
);

export default mongoose.model<IBreakType>('BreakType', BreakTypeSchema);
