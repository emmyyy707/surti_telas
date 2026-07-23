import React from "react";
import { Navigate } from "react-router-dom";
import { ReactElement } from "react";

import { useAuth } from "../contexts/AuthContext";

interface Props {
  children: ReactElement;
  allowedRoles: string[];
}

const ProtectedRoute = ({
  children,
  allowedRoles,
}: Props) => {
  const { user, loading, logout } =
    useAuth();

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" />;
  }

  return React.cloneElement(children, { userRole: user.role, userName: user.email?.split('@')[0] || 'Usuario', onLogout: logout });
};

export default ProtectedRoute;



