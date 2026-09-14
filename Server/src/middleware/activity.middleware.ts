import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { BreakDetail } from '../models/Auth/BreakDetail.model';

// PHP: Activity tracking from index.php
export const activityMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // PHP: if($isAdmin != 'Admin') - Admin users are exempt
    if (req.user.isAdmin) {
      next();
      return;
    }

    const page = req.query.page as string || 'dashboard';
    
    // PHP: $pageNew != 'break_traker_details' - Exception for break tracker page
    if (page === 'break_traker_details') {
      next();
      return;
    }

    // PHP: SELECT * FROM tbl_break_details WHERE break_details_status='Enabled' AND add_by='$login_user_id' AND breaktype_details_id='3'
    const activeBreak = await BreakDetail.findOne({
      delete_status: 'False',
      break_details_status: 'Enabled',
      add_by: req.user.user_id,
      breaktype_details_id: 3
    });

    // PHP: if($tot_user_new==0 && $pageNew!='break_traker_details' && $isAdmin !='Admin')
    if (!activeBreak) {
      res.status(403).json({
        success: false,
        message: 'start your activity processing to work!!',
        redirect: '/dashboard?page=break_traker_details&stat=9'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Activity middleware error:', error);
    next(error);
  }
};