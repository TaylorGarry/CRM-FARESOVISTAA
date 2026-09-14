import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

export const isHashedPassword = (value: string | null | undefined): boolean =>
  typeof value === 'string' && BCRYPT_HASH_PATTERN.test(value);

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const verifyPassword = async (
  plainPassword: string,
  storedPassword: string
): Promise<boolean> => {
  if (isHashedPassword(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  return plainPassword === storedPassword;
};
