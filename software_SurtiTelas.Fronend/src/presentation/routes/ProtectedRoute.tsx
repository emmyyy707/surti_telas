import React from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';

import { useAuth } from '@/app/providers/AppProviders';
import { Spinner } from '@/shared/ui';
import { isAdminRole } from '@/core/stores/authStore';
import { hasRequiredPermission } from './protectedRouteHelpers';

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

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles, requiredPermissions }) => {
  const { user, isAuthenticated, sessionChecked } = useAuth();

  if (!sessionChecked) {
    return <ProtectedLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminRole(user.role)) {
    return React.cloneElement(children, {
      userRole: user.role,
      userName: user.email?.split('@')[0] || 'Usuario',
      onLogout: () => useAuth.getState().logout(),
    });
  }

  const normalizedRole = user.role.toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());

  if (!normalizedAllowedRoles.includes(normalizedRole) && !normalizedAllowedRoles.includes(user.role)) {
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