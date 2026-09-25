// import axios from 'axios';
// import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
// import type { AuthResponse, LoginCredentials, ChangePasswordData, ForgotPasswordData, ResetPasswordData, User, Role, Module, Submodule } from '../types';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// class ApiService {
//   private api: AxiosInstance;

//   constructor() {
//     this.api = axios.create({
//       baseURL: API_URL,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       withCredentials: true,
//     });

//     // Request interceptor to add token
//     this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//       const token = localStorage.getItem('auth_token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       const lastActivity = localStorage.getItem('last_activity');
//       if (lastActivity) {
//         config.headers['x-last-activity'] = lastActivity;
//       }
//       return config;
//     });

//     // Response interceptor to handle session expiry
//     this.api.interceptors.response.use(
//       (response) => response,
//       (error: AxiosError) => {
//         if (error.response?.status === 401) {
//           const data = error.response?.data as any;
//           if (data?.redirect === '/login') {
//             localStorage.removeItem('auth_token');
//             localStorage.removeItem('user');
//             localStorage.removeItem('last_activity');
//             window.location.href = '/login';
//           }
//         }
//         return Promise.reject(error);
//       }
//     );
//   }

//   setToken(token: string) {
//     localStorage.setItem('auth_token', token);
//     localStorage.setItem('last_activity', Date.now().toString());
//   }

//   clearToken() {
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('last_activity');
//   }

//   // PHP: query.php?action=login
//   async login(credentials: LoginCredentials): Promise<AuthResponse> {
//     const formData = new URLSearchParams();
//     formData.append('uname', credentials.uname);
//     formData.append('password', credentials.password);

//     const response = await this.api.post('/auth/login', formData.toString(), {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     });

//     if (response.data.token) {
//       this.setToken(response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//     }

//     return response.data;
//   }

//   // PHP: query.php?action=logout
//   async logout(): Promise<void> {
//     const user = this.getUser();
//     await this.api.post('/auth/logout', {
//       user_id: user?.user_id || 0,
//       user_role: user?.user_role || '',
//       uhist_id: user?.uhist_id || null,
//     });
//     this.clearToken();
//   }

//   // PHP: Check session
//   async checkSession(): Promise<AuthResponse> {
//     const response = await this.api.get('/auth/session');
//     return response.data;
//   }

//   // PHP: change_password.php
//   async changePassword(data: ChangePasswordData): Promise<{ success: boolean; redirect: string }> {
//     const response = await this.api.post('/password/change-password', data);
//     return response.data;
//   }

//   // PHP: forgot_password.php
//   async forgotPassword(data: ForgotPasswordData): Promise<void> {
//     const formData = new URLSearchParams();
//     formData.append('email_id', data.email_id);

//     await this.api.post('/password/forgot-password', formData.toString(), {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     });
//   }

//   // PHP: user_change_password.php
//   async resetPassword(data: ResetPasswordData): Promise<void> {
//     const formData = new URLSearchParams();
//     formData.append('code', data.code);
//     formData.append('type', data.type);
//     formData.append('new_password', data.new_password);
//     formData.append('confirm_password', data.confirm_password);

//     await this.api.post('/password/reset-password', formData.toString(), {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     });
//   }

//   // PHP: user_change_password.php (GET)
//   async getResetPasswordData(code: string, type: string): Promise<{ success: boolean; code: string; type: string }> {
//     const response = await this.api.get(`/password/reset-password?code=${code}&type=${type}`);
//     return response.data;
//   }

//   async listUsers(): Promise<User[]> { return (await this.api.get('/users')).data.data; }
//   async getUserById(id: number): Promise<User> { return (await this.api.get(`/users/${id}`)).data.data; }
//   async createUser(data: Record<string, unknown>) { return (await this.api.post('/users', data)).data; }
//   async updateUser(id: number, data: Record<string, unknown>) { return (await this.api.put(`/users/${id}`, data)).data; }
//   async deleteUser(id: number) { return (await this.api.delete(`/users/${id}`)).data; }
//   async setUserStatus(id: number, status: string) { return (await this.api.patch(`/users/${id}/status`, { status })).data; }
//   async listRoles(): Promise<Role[]> { return (await this.api.get('/roles')).data.data; }
//   async createRole(data: Record<string, unknown>) { return (await this.api.post('/roles', data)).data; }
//   async updateRole(id: number, data: Record<string, unknown>) { return (await this.api.put(`/roles/${id}`, data)).data; }
//   async deleteRole(id: number) { return (await this.api.delete(`/roles/${id}`)).data; }
//   async setRoleStatus(id: number, status: string) { return (await this.api.patch(`/roles/${id}/status`, { status })).data; }
//   async listModules(): Promise<Module[]> { return (await this.api.get('/modules')).data.data; }
//   async listSubmodules(moduleId?: number): Promise<Submodule[]> { return (await this.api.get('/submodules', { params: moduleId ? { moduleId } : {} })).data.data; }
//   async listPermissions() { return (await this.api.get('/role-permissions')).data.data; }
//   async savePermission(data: Record<string, unknown>) { return (await this.api.post('/role-permissions', data)).data; }

//   getUser(): User | null {
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       return JSON.parse(userStr);
//     }
//     return null;
//   }

//   isAuthenticated(): boolean {
//     return !!localStorage.getItem('auth_token');
//   }
// }

// export const apiService = new ApiService();



import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, LoginCredentials, ChangePasswordData, ForgotPasswordData, ResetPasswordData, User, Role, Module, Submodule } from '../types';

export interface ActiveUser {
  user_id: number;
  user_login: string;
  user_name: string;
  user_email: string;
  user_role: string;
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      withCredentials: true,
    });

    // Request interceptor to add token
    // this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    //   const token = localStorage.getItem('auth_token');
    //   if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    //   }
    //   const lastActivity = localStorage.getItem('last_activity');
    //   if (lastActivity) {
    //     config.headers['x-last-activity'] = lastActivity;
    //   }
    //   return config;
    // });
  this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lastActivity = localStorage.getItem('last_activity');
    if (lastActivity) {
      config.headers['x-last-activity'] = lastActivity;
    }
    return config;
  });
    // Response interceptor to handle session expiry
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          const data = error.response?.data as any;
          if (data?.redirect === '/login') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('last_activity');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('last_activity', Date.now().toString());
  }

  clearToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('last_activity');
  }

  // PHP: query.php?action=login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('uname', credentials.uname);
    formData.append('password', credentials.password);

    const response = await this.api.post('/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  // PHP: query.php?action=logout
  async logout(): Promise<void> {
    const user = this.getUser();
    await this.api.post('/auth/logout', {
      user_id: user?.user_id || 0,
      user_role: user?.user_role || '',
      uhist_id: user?.uhist_id || null,
    });
    this.clearToken();
  }

  // PHP: Check session
  async checkSession(): Promise<AuthResponse> {
    const response = await this.api.get('/auth/session');
    return response.data;
  }

  // PHP: change_password.php
  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; redirect: string }> {
    const response = await this.api.post('/password/change-password', data);
    return response.data;
  }

  // PHP: forgot_password.php
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const formData = new URLSearchParams();
    formData.append('email_id', data.email_id);

    await this.api.post('/password/forgot-password', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  // PHP: user_change_password.php
  async resetPassword(data: ResetPasswordData): Promise<void> {
    const formData = new URLSearchParams();
    formData.append('code', data.code);
    formData.append('type', data.type);
    formData.append('new_password', data.new_password);
    formData.append('confirm_password', data.confirm_password);

    await this.api.post('/password/reset-password', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  // PHP: user_change_password.php (GET)
  async getResetPasswordData(code: string, type: string): Promise<{ success: boolean; code: string; type: string }> {
    const response = await this.api.get(`/password/reset-password?code=${code}&type=${type}`);
    return response.data;
  }

  async listUsers(): Promise<User[]> { return (await this.api.get('/users')).data.data; }
  async listActiveUsers(): Promise<ActiveUser[]> {
  const response = await this.api.get<{
    success: boolean;
    data: ActiveUser[];
    count: number;
  }>('/auth/active-users');

  return response.data.data;
}
  async getUserById(id: number): Promise<User> { return (await this.api.get(`/users/${id}`)).data.data; }
  async createUser(data: Record<string, unknown>) { return (await this.api.post('/users', data)).data; }
  async updateUser(id: number, data: Record<string, unknown>) { return (await this.api.put(`/users/${id}`, data)).data; }
  async deleteUser(id: number) { return (await this.api.delete(`/users/${id}`)).data; }
  async setUserStatus(id: number, status: string) { return (await this.api.patch(`/users/${id}/status`, { status })).data; }
  async listRoles(): Promise<Role[]> { return (await this.api.get('/roles')).data.data; }
  async createRole(data: Record<string, unknown>) { return (await this.api.post('/roles', data)).data; }
  async updateRole(id: number, data: Record<string, unknown>) { return (await this.api.put(`/roles/${id}`, data)).data; }
  async deleteRole(id: number) { return (await this.api.delete(`/roles/${id}`)).data; }
  async setRoleStatus(id: number, status: string) { return (await this.api.patch(`/roles/${id}/status`, { status })).data; }
  async listModules(): Promise<Module[]> { return (await this.api.get('/modules')).data.data; }
  async listSubmodules(moduleId?: number): Promise<Submodule[]> { return (await this.api.get('/submodules', { params: moduleId ? { moduleId } : {} })).data.data; }
  async listPermissions() { return (await this.api.get('/role-permissions')).data.data; }
  async savePermission(data: Record<string, unknown>) { return (await this.api.post('/role-permissions', data)).data; }

  // ============================================================
  // Generic HTTP helpers (used by masterApi.ts and other modules)
  // These delegate to the same axios instance, so interceptors,
  // base URL and auth headers are all reused — no duplication.
  // ============================================================
  get<T = any>(url: string, config?: any) { return this.api.get<T>(url, config); }
  post<T = any>(url: string, data?: any, config?: any) { return this.api.post<T>(url, data, config); }
  put<T = any>(url: string, data?: any, config?: any) { return this.api.put<T>(url, data, config); }
  patch<T = any>(url: string, data?: any, config?: any) { return this.api.patch<T>(url, data, config); }
  delete<T = any>(url: string, config?: any) { return this.api.delete<T>(url, config); }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const apiService = new ApiService();

export const api = apiService;