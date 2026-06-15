import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * RoleRoute component restricts access based on user roles.
 * If the user is not authenticated, they are redirected to /login.
 * If the user does not have one of the allowedRoles, an Access Denied page is shown.
 */
const RoleRoute = ({ allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Authorized – render nested routes
  return <Outlet />;
};

export default RoleRoute;
