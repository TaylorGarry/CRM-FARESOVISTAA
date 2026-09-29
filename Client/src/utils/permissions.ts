import type { User } from '../types';
import { apiService } from '../services/api';

export interface MenuPermission {
  roleper_roleid: string | number;
  roleper_mainmenu?: Array<string | number> | string;
  roleper_submenu?: Array<string | number> | string;
  roleper_status?: string;
  dashboardPer?: boolean | number;
}

export const isAdminUser = (user: User | null) => Boolean(
  user?.isAdmin || user?.user_role?.trim().toLowerCase() === 'admin'
);

const toIdList = (value?: Array<string | number> | string) => {
  if (Array.isArray(value)) return value.map(String);
  return value ? value.split(',').map(item => item.trim()).filter(Boolean) : [];
};

export const normalizePath = (path: string) => {
  const normalized = path.trim().replace(/^\/+/, '/');
  return normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized;
};

export const hasRoutePermission = (allowedPaths: Set<string>, path: string) => {
  const normalizedPath = normalizePath(path);

  if (allowedPaths.has(normalizedPath)) return true;

  const hasBookingAccess = Array.from(allowedPaths).some(allowedPath =>
    allowedPath === '/bookings' || allowedPath.startsWith('/bookings/')
  );

  if (
    hasBookingAccess &&
    (
      normalizedPath.startsWith('/bookings/view/') ||
      normalizedPath.startsWith('/bookings/edit/') ||
      normalizedPath.startsWith('/bookings/assign/')
    )
  ) {
    return true;
  }

  return false;
};

export const getFirstAllowedPath = (allowedPaths: Set<string>) =>
  Array.from(allowedPaths)[0] || '/dashboard';

export const loadUserPermission = async (user: User | null) => {
  if (!user || isAdminUser(user)) return null;

  const [permissions, submodules] = await Promise.all([
    apiService.listPermissions() as Promise<MenuPermission[]>,
    apiService.listSubmodules()
  ]);
  const permission = permissions.find(item =>
    String(item.roleper_roleid) === String(user.user_role) &&
    item.roleper_status === 'Enabled'
  );

  if (!permission) return null;

  const mainMenuIds = new Set(toIdList(permission.roleper_mainmenu));
  const subMenuIds = new Set(toIdList(permission.roleper_submenu));
  const allowedPaths = new Set(
    submodules
      .filter(submodule =>
        subMenuIds.has(String(submodule.sub_id)) || mainMenuIds.has(String(submodule.sub_mainid))
      )
      .map(submodule => normalizePath(submodule.sub_page))
  );

  return {
    permission,
    allowedPaths,
    dashboardAllowed: Boolean(permission.dashboardPer)
  };
};
