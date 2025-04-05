import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const PrivateRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  const location = useLocation();

  if (!authUser) {
    // Redirect to login with the current location in state
    // This allows us to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 