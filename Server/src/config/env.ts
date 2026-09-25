// import { CONSTANTS } from '../utils/constants';

// export const env = {
//   JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
//   JWT_EXPIRY: process.env.JWT_EXPIRY || '1d',
//   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
//   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
//   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
//   SESSION_TIMEOUT: Number(process.env.SESSION_TIMEOUT || CONSTANTS.SESSION_TIMEOUT),
//   ADMIN_USERNAME: process.env.ADMIN_USERNAME || CONSTANTS.ADMIN_USERNAME,
//   ADMIN_USER_ID: Number(process.env.ADMIN_USER_ID || CONSTANTS.ADMIN_USER_ID),
//   APP_URL: process.env.APP_URL || 'http://localhost:3000',
// } as const;






import { CONSTANTS } from '../utils/constants';

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d',

  // Cloudinary — fail fast if missing
  CLOUDINARY_CLOUD_NAME: required('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: required('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: required('CLOUDINARY_API_SECRET'),

  SESSION_TIMEOUT: Number(process.env.SESSION_TIMEOUT || CONSTANTS.SESSION_TIMEOUT),
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || CONSTANTS.ADMIN_USERNAME,
  ADMIN_USER_ID: Number(process.env.ADMIN_USER_ID || CONSTANTS.ADMIN_USER_ID),
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
} as const;