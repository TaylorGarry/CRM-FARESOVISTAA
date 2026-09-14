import { Router } from 'express';
import { changePassword } from '../controllers/password.controller';
import { forgotPassword } from '../controllers/forgotPassword.controller';
import { resetPassword, showResetPasswordForm } from '../controllers/resetPassword.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// PHP: change_password.php
router.post('/change-password', authMiddleware, adminMiddleware, changePassword);

// PHP: forgot_password.php
router.post('/forgot-password', forgotPassword);

// PHP: user_change_password.php (GET - show form)
router.get('/reset-password', showResetPasswordForm);

// PHP: user_change_password.php (POST - reset password)
router.post('/reset-password', resetPassword);

export default router;
