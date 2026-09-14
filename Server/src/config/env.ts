import { CONSTANTS } from '../utils/constants';

export const env = {
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d',
  SESSION_TIMEOUT: Number(process.env.SESSION_TIMEOUT || CONSTANTS.SESSION_TIMEOUT),
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || CONSTANTS.ADMIN_USERNAME,
  ADMIN_USER_ID: Number(process.env.ADMIN_USER_ID || CONSTANTS.ADMIN_USER_ID),
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
} as const;
