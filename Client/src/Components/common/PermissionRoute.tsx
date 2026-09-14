import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isAdminUser, loadUserPermission, normalizePath } from '../../utils/permissions';

const PermissionRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const checkPermission = async () => {
      if (isAdminUser(user)) {
        if (active) setAllowed(true);
        return;
      }

      try {
        const result = await loadUserPermission(user);
        const path = normalizePath(location.pathname);
        const canAccess = path === '/dashboard'
          ? Boolean(result?.dashboardAllowed)
          : Boolean(result?.allowedPaths.has(path));
        if (active) setAllowed(canAccess);
      } catch (error) {
        console.error('Error checking route permission:', error);
        if (active) setAllowed(false);
      }
    };

    setAllowed(null);
    checkPermission();
    return () => { active = false; };
  }, [location.pathname, user]);

  if (allowed === null) {
    return <div className="min-h-screen" />;
  }

  if (!allowed && location.pathname === '/dashboard') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">
        You do not have permission to access this page.
      </div>
    );
  }

  return allowed ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export default PermissionRoute;
