import mongoose, { Schema, Document } from 'mongoose';

export interface IpRestriction extends Document {
    user_ip: string;
    username: string;
    status: 'Enabled' | 'Disabled';

    add_by?: string | null;
    add_date?: Date;

    update_by?: string | null;
    update_date?: Date | null;

    delete_by?: string | null;
    delete_date?: Date | null;

    delete_status: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const AllowedIpForUserSchema = new Schema<IpRestriction>(
    {
        user_ip: {
            type: String,
            required: [true, 'User IP is required'],
            trim: true,
            lowercase: true,
        },

        username: {
            type: String,
            required: [true, 'User name is required'],
            trim: true,
        },

        status: {
            type: String,
            enum: ['Enabled', 'Disabled'],
            default: 'Enabled',
        },

        add_by: {
            type: String,
            ref: 'User',
            default: null,
        },

        add_date: {
            type: Date,
            default: Date.now,
        },

        update_by: {
            type: String,
            ref: 'User',
            default: null,
        },

        update_date: {
            type: Date,
            default: null,
        },

        delete_by: {
            type: String,
            ref: 'User',
            default: null,
        },

        delete_date: {
            type: Date,
            default: null,
        },

        delete_status: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        collection: 'Ip_Restriction_list',
    }
);

AllowedIpForUserSchema.index({
    delete_status: 1,
});

AllowedIpForUserSchema.index({
    username: 1,
    user_ip: 1,
});

AllowedIpForUserSchema.index(
    {
        username: 1,
        user_ip: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            delete_status: false,
        },
    }
);

export default mongoose.model<IpRestriction>(
    'AllowedIpForUser',
    AllowedIpForUserSchema
);