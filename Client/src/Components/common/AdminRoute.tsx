import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isAdminUser } from '../../utils/permissions';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  return isAdminUser(user) ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
