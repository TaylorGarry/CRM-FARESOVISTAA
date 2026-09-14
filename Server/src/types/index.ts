import { Request } from 'express';

export interface AuthUser {
  user_id: number;
  user_login: string;
  user_role: string;
  isAdmin: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

