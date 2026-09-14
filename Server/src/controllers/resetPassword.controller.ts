import { Request, Response } from 'express';
import { User } from '../models/Auth/User.model';
import { AdminSetting } from '../models/Auth/AdminSetting.model';

// PHP: user_change_password.php
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, type, new_password, confirm_password } = req.body;

    // PHP: Check if passwords match
    if (new_password !== confirm_password) {
      res.redirect(`/reset-password?code=${code}&type=${type}&error=Passwords do not match`);
      return;
    }

    // PHP: if($type=='1') - Admin
    if (type === '1') {
      // PHP: UPDATE tbl_settings SET Password='$new_password', pass_real='$new_password' WHERE code='$code'
      const admin = await AdminSetting.findOne({ code: code });
      
      if (!admin) {
        res.redirect('/reset-password-error');
        return;
      }

      await AdminSetting.findOneAndUpdate(
        { code: code },
        {
          Password: new_password,
          pass_real: new_password,
          code: '' // Clear the code after use
        }
      );

      res.redirect('/login?reset=success');
      return;
    } else {
      // PHP: Regular User - UPDATE tbl_users SET user_password='$new_password' WHERE code='$code'
      const user = await User.findOne({ code: code });
      
      if (!user) {
        res.redirect('/reset-password-error');
        return;
      }

      await User.findOneAndUpdate(
        { code: code },
        {
          user_password: new_password,
          code: '' // Clear the code after use
        }
      );

      res.redirect('/login?reset=success');
      return;
    }

  } catch (error) {
    console.error('Reset password error:', error);
    res.redirect('/reset-password-error');
  }
};

// PHP: Display reset password form (GET request)
export const showResetPasswordForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const type = typeof req.query.type === 'string' ? req.query.type : '';

    if (!code || !type) {
      res.redirect('/login');
      return;
    }

    // Check if code exists
    if (type === '1') {
      const admin = await AdminSetting.findOne({ code: code });
      if (!admin) {
        res.redirect('/login');
        return;
      }
    } else {
      const user = await User.findOne({ code: code });
      if (!user) {
        res.redirect('/login');
        return;
      }
    }

    // Render reset password form (will be handled by frontend)
    res.json({
      success: true,
      code: code,
      type: type
    });

  } catch (error) {
    console.error('Show reset form error:', error);
    res.redirect('/login');
  }
};
