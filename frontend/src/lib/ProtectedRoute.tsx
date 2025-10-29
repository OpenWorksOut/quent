import { Navigate } from "react-router-dom";
import { useAuth } from "./auth";
import React from "react";

export const ProtectedRoute = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  try {
    const { token } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    return children;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
