import { Request, Response } from "express";
import breakTypeModel from "../../models/Break/breakType.model";
import { verifyToken } from "../../services/token.service";

interface AuthUser {
  user_id: number | string;
  user_login: string;
  user_name: string;
  user_role?: string;
  isAdmin?: boolean;
}

const getUser = (req: Request): AuthUser => {
  const anyReq = req as any;
  const token = req.headers.authorization?.replace('Bearer ', '');
  const u = anyReq.user || (token ? verifyToken(token) : null) || {};

  return {
    user_id: u.userId ?? u.id ?? u._id ?? u.user_id ?? '0',
    user_login: u.user_login ?? u.login ?? 'unknown',
    user_name: u.user_name ?? u.name ?? u.user_login ?? u.login ?? 'unknown',
    user_role: u.user_role,
    isAdmin: u.isAdmin ?? false,
  };
};


export const createBreakType =  async(req: Request, res: Response) : Promise<Response> => {
    try{
        const { break_type_name, status } = req.body;
        const user =  getUser(req);
        if(!break_type_name || !String(break_type_name).trim()){
            return res.status(400).json({success: false, message: 'Break Type Name is required'});
        }
        const exists = await breakTypeModel.findOne({
            break_type_name: String(break_type_name).trim(),
            delete_status: false,
        });

        if(exists) {
            return res.status(409).json({ success:false, message: 'Break Type already exists' });
        }

        const breakData = await breakTypeModel.create({
            break_type_name: String(break_type_name).trim(),
            status: status === 'Disabled' ? 'Disabled' : 'Enabled',
            add_by: String(user.user_id),
            add_date: new Date(),
            update_by: null,
            update_date: null,
            delete_by: null,
            delete_date: null,
            delete_status: false,
        });

        return res.status(201).json({
            success: true,
            message: 'Break Type Created successfully',
            data: breakData,
        });
    } catch(error: any) {
        console.log('CreatedBreakType error :', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Failed to create break type',
        });
    }
};

export const getBreakTypes =  async (req: Request, res: Response): Promise<Response> => {
    try{
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 10));
        const search =  String(req.query.search || '').trim();

        const filter: any = { delete_status: false };

        if(search) {
            filter.break_type_name = { $regex: search, $options: 'i' };
        }

        const [records, total] = await Promise.all([
            breakTypeModel.find(filter)
            .sort({ createdAt: -1})
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        breakTypeModel.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            count: records.length,
            total,
            page,
            limit,
            data: records,
        });
    } catch (error) {
        console.log('getBreakTypes error :', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch break types' });
    }
};

export const updateBreakType = async(req: Request, res: Response) : Promise<Response> => {
    try{
        const { id } = req.params;
        const { break_type_name, status} = req.body;
        const user = getUser(req);

        const breakData = await breakTypeModel.findOne({ _id: id, delete_status: false });
        if(!breakData){
            return res.status(404).json({ success: false, message: 'Break Type not allowed' });
        }

        if(break_type_name !== undefined) {
            const name = String(break_type_name).trim();
            if(!name){
                return res.status(400).json({ success: false, message: 'Break Type cannot be empty' });
            }
            const exists = await breakTypeModel.findOne({
                break_type_name: name,
                delete_status: false,
                _id: { $ne: breakData._id },
            });
            if(exists) {
                return res.status(409).json({success: false, message: 'Break Type already exists'});
            }
            breakData.break_type_name = name;
        }
        if(status !== undefined) {
            breakData.status = status === 'Disabled' ? 'Disabled' : 'Enabled';
        }
        breakData.update_by = String(user.user_id);
        breakData.update_date = new Date();
        await breakData.save();

        return res.status(200).json({
            success: true,
            message: 'Break Type updated successfully',
            data: breakData
        });
    } catch(error:any){
        console.log("updateBreakType error:", error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Failed to update break type',
        });
    }
}

export const toggleBreakTypeStatus =  async (req: Request, res: Response) : Promise<Response> => {
    try{
        const { id } = req.params;
        const user = getUser(req);

        const doc = await breakTypeModel.findOne({ _id: id, delete_status: false});
        if(!doc){
            return res.status(404).json({
                success: false, 
                message: 'Break Type not found'
            });
        }
        doc.status = doc.status === 'Enabled' ? 'Disabled' : 'Enabled';
        doc.update_by = String(user.user_id);
        doc.update_date = new Date();
        await doc.save();

        return res.status(200).json({
            success: true,
            message: `Break Type ${doc.status}`,
            data: doc,
        });
    }catch(error : any){
        console.log('toggleBreakTypeStatus error :',error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Failed to toggle status',
        });
    }
}

export const deleteBreakType = async(req: Request, res: Response) : Promise<Response> => {
    try{
        const { id } = req.params;
        const user =  getUser(req);

        const doc = await breakTypeModel.findOne({ _id: id, delete_status: false });
        if(!doc) {
            return res.status(404).json({
                success : false,
                message: 'Break Type not found'
            });
        }

        doc.delete_status = true;
        doc.delete_by =  String(user.user_id);
        doc.delete_date = new Date();
        await doc.save();

        return res.status(200).json({ success: true, message: 'Break Type deleted successfully' });
    }
    catch(error : any) {
        console.log('deleteBreakType error :', error);
        return res.status(500).json({
            success: false, 
            message: error?.message || 'Failed to delete break type'
        });
    }
}
