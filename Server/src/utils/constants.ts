// PHP Constants
export const CONSTANTS = {
  SESSION_TIMEOUT: 18000, // 5 hours in seconds
  ADMIN_USERNAME: 'admin',
  ADMIN_USER_ID: 0,
  BREAK_TYPE_ACTIVITY: 3,
  STATUS_ENABLED: 'Enabled',
  STATUS_DISABLED: 'Disabled',
  DELETE_FALSE: 'False',
  DELETE_TRUE: 'True',
  
  // Status codes from change_password.php
  PASSWORD_STATUS: {
    SUCCESS: '1',
    OLD_PASSWORD_WRONG: '3',
    PASSWORDS_DONT_MATCH: '4',
    FIELDS_MANDATORY: '5'
  }
} as const;

// PHP: getvalue function equivalent
export const getValue = <T>(obj: any, key: string, defaultValue: T): T => {
  return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultValue;
};

// PHP: totalrows function equivalent
export const countRows = (data: any[]): number => {
  return data ? data.length : 0;
};

// PHP: selected function equivalent
export const isSelected = (val1: any, val2: any): boolean => {
  return val1 == val2;
};

// PHP: checked function equivalent
export const isChecked = (val1: any, val2: any): boolean => {
  return val1 == val2;
};