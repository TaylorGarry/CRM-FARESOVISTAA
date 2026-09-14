import { Request } from 'express';
import { User } from '../models/Auth/User.model';
import { AdminSetting } from '../models/Auth/AdminSetting.model';

// PHP: getUserIP function
export const getUserIP = (req: Request): string => {
  // Get real visitor IP behind CloudFlare network
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  if (cfConnectingIP) {
    return cfConnectingIP as string;
  }
  
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.socket.remoteAddress ||
                   'unknown';
  
  if (Array.isArray(clientIP)) {
    return clientIP[0];
  }
  
  return clientIP.replace('::ffff:', '');
};

// PHP: addByName function
export const getUserNameById = async (userId: number): Promise<string> => {
  if (userId === 0) {
    return 'Admin';
  }
  
  const user = await User.findOne({ user_id: userId });
  if (user) {
    return user.user_name;
  }
  return 'User not Found';
};

// PHP: getvalue function
export const getValueFromTable = async (field: string, table: string, condition: string): Promise<string> => {
  // Implementation will depend on the specific model
  // This is a generic version
  try {
    let result;
    switch(table) {
      case 'tbl_users':
        const user = await User.findOne({ $where: condition } as any);
        result = user ? (user as any)[field] : '';
        break;
      case 'tbl_settings':
        const settings = await AdminSetting.findOne({ $where: condition } as any);
        result = settings ? (settings as any)[field] : '';
        break;
      default:
        result = '';
    }
    return result || '';
  } catch (error) {
    return '';
  }
};
