export interface User {
  user_id: number;
  user_login: string;
  user_email?: string;
  user_password?: string;
  user_name?: string;
  user_role: string;
  isAdmin: boolean;
  last_login?: string;
  uhist_id?: number;
  gender?: 'Male' | 'Female';
  dob?: string;
  mobile?: string;
  address?: string;
  user_status?: 'Enabled' | 'Disabled';
  delete_status?: 'False' | 'True';
  created_at?: string;
  add_by?: string;
}

export interface Role { role_id: number; role_name: string; department_role: string; status: 'Enabled' | 'Disabled'; delete_status: 'False' | 'True'; created_at?: string; add_by?: string; }
export interface Module { id: number; name: string; status: 'Enabled' | 'Disabled'; }
export interface Submodule { sub_id: number; sub_mainid: number; sub_name: string; sub_page: string; sub_status: 'Enabled' | 'Disabled'; }

export interface LoginCredentials {
  uname: string;
  password: string;
}

export interface ChangePasswordData {
  new_password: string;
  confirm_password: string;
}

export interface ForgotPasswordData {
  email_id: string;
}

export interface ResetPasswordData {
  code: string;
  type: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  redirect?: string;
  user?: User;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  redirect?: string;
}
