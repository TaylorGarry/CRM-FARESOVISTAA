import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const isAdminRequest = (req: AuthRequest): boolean => Boolean(
  req.user?.isAdmin || req.user?.user_role?.trim().toLowerCase() === 'admin'
);

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!isAdminRequest(req)) {
    res.status(403).json({ success: false, message: 'Only administrators can change passwords' });
    return;
  }

  next();
};
