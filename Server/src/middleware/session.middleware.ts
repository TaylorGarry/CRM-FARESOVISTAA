import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AuthRequest } from '../types';

// PHP: Session timeout from index.php
export const sessionMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      next();
      return;
    }

    const lastActivity = req.headers['x-last-activity'];
    
    if (lastActivity) {
      const timeSince = Date.now() - parseInt(lastActivity as string);
      
      // PHP: if (isset($_SESSION['logged']) && ($t - $_SESSION['logged'] > 18000))
      if (timeSince > env.SESSION_TIMEOUT * 1000) {
        res.status(401).json({ 
          success: false, 
          message: 'Session expired',
          redirect: '/login'
        });
        return;
      }
    }
    
    // PHP: $_SESSION['logged'] = time()
    res.setHeader('x-last-activity', Date.now().toString());
    next();
  } catch (error) {
    next(error);
  }
};