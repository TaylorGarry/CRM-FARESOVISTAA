// PHP: check_email function
export const isValidEmail = (email: string): boolean => {
  const pattern = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  return !!(email && pattern.test(email));
};

// PHP: check_mobile function
export const isValidMobile = (mobile: string): boolean => {
  return !!(mobile && /^[0-9]{10}$/.test(mobile));
};

// PHP: check_full_name function
export const isValidFullName = (name: string): boolean => {
  return !!(name && /^[a-zA-Z ]+$/.test(name));
};

// PHP: validate_date function (dd-mm-yyyy)
export const isValidDate = (date: string): boolean => {
  const parts = date.split('-');
  if (parts.length !== 3) return false;
  if (parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) return false;
  return true;
};