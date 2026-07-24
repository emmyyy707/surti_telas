import React from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';

import { useAuth } from '@/app/providers/AppProviders';

interface Props {
  children: ReactElement;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return React.cloneElement(children, {
    userRole: user.role,
    userName: user.email?.split('@')[0] || 'Usuario',
    onLogout: () => useAuth.getState().logout(),
  });
};

export default ProtectedRoute;



