import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface RequireAuthProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const userRoles: string[] = Array.isArray(user?.roles)
          ? user.roles
          : user?.role
          ? [user.role]
          : [];

        const hasRole = userRoles.some((role) => allowedRoles.includes(role));

        if (!hasRole) {
          return <Navigate to="/" replace />;
        }
      }
    } catch (error) {
      console.warn("Failed to parse user roles", error);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default RequireAuth;
