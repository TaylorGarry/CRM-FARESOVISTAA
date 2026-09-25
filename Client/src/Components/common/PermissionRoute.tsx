import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getFirstAllowedPath,
  hasRoutePermission,
  isAdminUser,
  loadUserPermission,
} from '../../utils/permissions';

const PermissionRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [redirectPath, setRedirectPath] = useState('/dashboard');

  useEffect(() => {
    let active = true;
    const checkPermission = async () => {
      if (isAdminUser(user)) {
        if (active) setAllowed(true);
        return;
      }

      try {
        const result = await loadUserPermission(user);
        const canAccess = location.pathname === '/dashboard'
          ? Boolean(result?.dashboardAllowed)
          : Boolean(result && hasRoutePermission(result.allowedPaths, location.pathname));

        if (active) {
          setRedirectPath(result ? getFirstAllowedPath(result.allowedPaths) : '/dashboard');
          setAllowed(canAccess);
        }
      } catch (error) {
        console.error('Error checking route permission:', error);
        if (active) setAllowed(false);
      }
    };

    const timer = window.setTimeout(() => {
      if (active) setAllowed(null);
      checkPermission();
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [location.pathname, user]);

  if (allowed === null) {
    return <div className="min-h-screen" />;
  }

  if (!allowed && location.pathname === '/dashboard' && redirectPath === '/dashboard') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">
        You do not have permission to access this page.
      </div>
    );
  }

  return allowed ? <>{children}</> : <Navigate to={redirectPath} replace />;
};

export default PermissionRoute;
