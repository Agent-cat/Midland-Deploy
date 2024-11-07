import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, loggedIn, authRoute = false }) => {
  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  if (authRoute && loggedIn) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
