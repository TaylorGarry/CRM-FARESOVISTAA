import { Request, Response } from 'express';
import { User } from '../models/Auth/User.model';
import { AdminSetting } from '../models/Auth/AdminSetting.model';
import { generateResetCode, getDateTimeSQL } from '../services/token.service';
import { sendEmail, buildResetEmail } from '../services/email.service';
import { env } from '../config/env';

// PHP: forgot_password.php
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email_id } = req.body;
    
    // PHP: $email = htmlentities(trim($_POST['email_id']))
    const email = email_id?.trim();

    if (!email) {
      res.redirect('/forgot-password?error=Email required');
      return;
    }

    // PHP: $code = rand(1000,9999)
    const code = generateResetCode();
    const forgotDate = getDateTimeSQL();

    // PHP: if($email=='sanjayniist@gmail.com')
    if (email === 'sanjayniist@gmail.com') {
      // PHP: Admin - UPDATE tbl_settings SET code='$code', forgot_date='...' WHERE email='$email'
      await AdminSetting.findOneAndUpdate(
        { email: email },
        { 
          code: code,
          forgot_date: new Date()
        }
      );
      
      // PHP: $type=1 (Admin)
      const resetLink = `${env.APP_URL}/reset-password?code=${code}&type=1`;
      const emailHtml = buildResetEmail(email, code, resetLink);
      
      const sent = await sendEmail({
        to: email,
        subject: 'Change Your Password',
        html: emailHtml
      });

      if (sent) {
        res.redirect('/forgot-password-success');
      } else {
        res.redirect('/forgot-password-error');
      }
      return;
    } else {
      // PHP: Regular User - UPDATE tbl_users SET code='$code', forgot_date='...' WHERE user_email='$email'
      const user = await User.findOne({ user_email: email });
      
      if (!user) {
        // PHP: User not found - redirect to error
        res.redirect('/forgot-password-error');
        return;
      }

      await User.findOneAndUpdate(
        { user_email: email },
        {
          code: code,
          forgot_date: new Date()
        }
      );

      // PHP: $type=2 (Regular User)
      const resetLink = `${env.APP_URL}/reset-password?code=${code}&type=2`;
      const emailHtml = buildResetEmail(email, code, resetLink);
      
      const sent = await sendEmail({
        to: email,
        subject: 'Change Your Password',
        html: emailHtml
      });

      if (sent) {
        res.redirect('/forgot-password-success');
      } else {
        res.redirect('/forgot-password-error');
      }
      return;
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.redirect('/forgot-password-error');
  }
};