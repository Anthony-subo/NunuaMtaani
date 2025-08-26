import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('user'));

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/home" replace />;
  }

  // Authorized
  return children;
}

export default ProtectedRoute;
