import { Response } from 'express';
import { User } from '../models/Auth/User.model';
import { AdminSetting } from '../models/Auth/AdminSetting.model';
import { AuthRequest } from '../types';
import { hashPassword } from '../utils/password';

// PHP: change_password.php
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { new_password, confirm_password } = req.body;
    const userId = req.user?.user_id;

    if (userId === undefined) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // PHP: Check if all fields are provided
    if (!new_password || !confirm_password) {
      res.json({ success: false, redirect: '/change-password?stat=5' });
      return;
    }

    // PHP: Check if new_password == confirm_password
    if (new_password !== confirm_password) {
      res.json({ success: false, redirect: '/change-password?stat=4' });
      return;
    }

    const hashedPassword = await hashPassword(new_password);

    if (userId === 0) {
      const admin = await AdminSetting.findOne({ id: 1 });
      if (!admin) {
        res.status(404).json({ success: false, message: 'Admin account not found' });
        return;
      }

      await AdminSetting.findOneAndUpdate(
        { id: 1 },
        { pass_real: hashedPassword, Password: hashedPassword }
      );
    } else {
      const adminUser = await User.findOne({
        user_id: userId,
        user_status: 'Enabled',
        delete_status: 'False'
      });

      if (!adminUser) {
        res.status(404).json({ success: false, message: 'Admin account not found' });
        return;
      }

      await User.findOneAndUpdate(
        { user_id: userId },
        { user_password: hashedPassword }
      );
    }

    res.json({ success: true, redirect: '/change-password?stat=1' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Password change failed' });
  }
};
