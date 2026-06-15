import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../utils/constants.js";

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default GuestRoute;
