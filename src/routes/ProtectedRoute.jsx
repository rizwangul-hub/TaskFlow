import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../utils/constants.js";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !token || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
