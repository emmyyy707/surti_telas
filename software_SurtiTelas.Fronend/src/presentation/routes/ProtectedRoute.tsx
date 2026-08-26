import React from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';

import { useAuth } from '@/app/providers/AppProviders';
import { Spinner } from '@/shared/ui';

const ProtectedLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)]">
    <Spinner size="lg" />
  </div>
);

interface Props {
  children: ReactElement;
  allowedRoles: string[];
  requiredPermissions?: string[];
}

const ADMIN_ROLE = 'admin';

const hasRequiredPermission = (userPermissions: string[] | undefined, required: string[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  return required.some((p) => userPermissions.includes(p));
};

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles, requiredPermissions }) => {
  const { user, isAuthenticated, sessionChecked } = useAuth();

  if (!sessionChecked) {
    return <ProtectedLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === ADMIN_ROLE) {
    return React.cloneElement(children, {
      userRole: user.role,
      userName: user.email?.split('@')[0] || 'Usuario',
      onLogout: () => useAuth.getState().logout(),
    });
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions && !hasRequiredPermission(user.permissions, requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return React.cloneElement(children, {
    userRole: user.role,
    userName: user.email?.split('@')[0] || 'Usuario',
    onLogout: () => useAuth.getState().logout(),
  });
};

export default ProtectedRoute;
