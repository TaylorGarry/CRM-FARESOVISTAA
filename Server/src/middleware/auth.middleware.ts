import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../services/token.service';
import { env } from '../config/env';

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('AUTH HIT:::::', req.method, req.path);
    // PHP: if(isset($_SESSION['user_id']) && $_SESSION['user_id']!='')
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized',
        redirect: '/login'
      });
      return;
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        redirect: '/login'
      });
      return;
    }

    // PHP: Session timeout check
    const lastActivity = req.headers['x-last-activity'];
    if (lastActivity) {
      const timeSince = Date.now() - parseInt(lastActivity as string);
      // PHP: if ($t - $_SESSION['logged'] > 18000)
      if (timeSince > env.SESSION_TIMEOUT * 1000) {
        res.status(401).json({ 
          success: false, 
          message: 'Session expired',
          redirect: '/login'
        });
        return;
      }
    }

    // Set user in request
    req.user = {
      user_id: decoded.user_id,
      user_login: decoded.user_login,
      user_name: (decoded as any).user_name ?? decoded.user_login,
      user_role: decoded.user_role,
      isAdmin: decoded.isAdmin
    };

    // PHP: $_SESSION['logged'] = time()
    res.setHeader('x-last-activity', Date.now().toString());
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed',
      redirect: '/login'
    });
  }
};