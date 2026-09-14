import { Request, Response } from 'express';

import IpRestrictionModel from '../../models/IPRestriction/IpRestriction.model';



const getUserId = (req: Request): string => {
  const anyReq = req as any;
  return anyReq.user?.userId || anyReq.user?.id || anyReq.user?._id || '0';
};

/**
 * Create IP Restriction
 */
export const allowIprestriction = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const {
            user_ip,
            username,
            user_name,
            status = 'Enabled',
        } = req.body;

        const finalUsername = username || user_name;

        if (!user_ip || !finalUsername) {
            return res.status(400).json({
                success: false,
                message: 'User IP and user name are required',
            });
        }

        if (!['Enabled', 'Disabled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be Enabled or Disabled',
            });
        }

        const normalizedIp = String(user_ip).trim().toLowerCase();
        const normalizedUsername = String(finalUsername).trim();

        /**
         * Check whether an active record already exists.
         */
        const existing = await IpRestrictionModel.findOne({
            user_ip: normalizedIp,
            username: normalizedUsername,
            delete_status: false,
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This IP restriction already exists for this user',
            });
        }

        /**
         * If a previously deleted record exists, restore it.
         */
        const deletedRecord = await IpRestrictionModel.findOne({
            user_ip: normalizedIp,
            username: normalizedUsername,
            delete_status: true,
        });

        const loggedInUserId = getUserId(req);

        if (deletedRecord) {
            deletedRecord.status = status;
            deletedRecord.delete_status = false;
            deletedRecord.delete_by = null;
            deletedRecord.delete_date = null;
            deletedRecord.update_by = loggedInUserId;
            deletedRecord.update_date = new Date();

            await deletedRecord.save();

            return res.status(200).json({
                success: true,
                message: 'IP restriction restored successfully',
                data: deletedRecord,
            });
        }

        const newIpRestriction = await IpRestrictionModel.create({
            user_ip: normalizedIp,
            username: normalizedUsername,
            status,
            add_by: loggedInUserId,
            add_date: new Date(),
            update_by: null,
            update_date: null,
            delete_by: null,
            delete_date: null,
            delete_status: false,
        });

        return res.status(201).json({
            success: true,
            message: 'IP restriction created successfully',
            data: newIpRestriction,
        });
    } catch (error) {
        console.error('Create IP restriction error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to create IP restriction',
        });
    }
};

/**
 * Get all active IP Restrictions
 */
export const getIpRestrictions = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const records = await IpRestrictionModel.find({
            delete_status: false,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        console.error('Get IP restrictions error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch IP restrictions',
        });
    }
};

/**
 * Edit IP Restriction
 */
export const editIpRestriction = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;

        const {
            user_ip,
            username,
            user_name,
            status,
        } = req.body;

        const finalUsername = username || user_name;

        if (!user_ip || !finalUsername || !status) {
            return res.status(400).json({
                success: false,
                message: 'User IP, user name and status are required',
            });
        }

        if (!['Enabled', 'Disabled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be Enabled or Disabled',
            });
        }

        const normalizedIp = String(user_ip).trim().toLowerCase();
        const normalizedUsername = String(finalUsername).trim();

        const existingRecord = await IpRestrictionModel.findOne({
            _id: id,
            delete_status: false,
        });

        if (!existingRecord) {
            return res.status(404).json({
                success: false,
                message: 'IP restriction not found',
            });
        }

        /**
         * Prevent duplicate active records when editing.
         */
        const duplicate = await IpRestrictionModel.findOne({
            _id: { $ne: id },
            user_ip: normalizedIp,
            username: normalizedUsername,
            delete_status: false,
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: 'This IP restriction already exists for this user',
            });
        }

        const loggedInUserId = getUserId(req);

        existingRecord.user_ip = normalizedIp;
        existingRecord.username = normalizedUsername;
        existingRecord.status = status;
        existingRecord.update_by = loggedInUserId;
        existingRecord.update_date = new Date();

        await existingRecord.save();

        return res.status(200).json({
            success: true,
            message: 'IP restriction updated successfully',
            data: existingRecord,
        });
    } catch (error) {
        console.error('Edit IP restriction error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update IP restriction',
        });
    }
};

/**
 * Soft Delete IP Restriction
 */
export const deleteIpRestriction = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;

        const existingRecord = await IpRestrictionModel.findOne({
            _id: id,
            delete_status: false,
        });

        if (!existingRecord) {
            return res.status(404).json({
                success: false,
                message: 'IP restriction not found',
            });
        }

        const loggedInUserId = getUserId(req);

        existingRecord.delete_status = true;
        existingRecord.delete_by = loggedInUserId;
        existingRecord.delete_date = new Date();

        await existingRecord.save();

        return res.status(200).json({
            success: true,
            message: 'IP restriction deleted successfully',
        });
    } catch (error) {
        console.error('Delete IP restriction error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to delete IP restriction',
        });
    }
};