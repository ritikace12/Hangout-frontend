import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const PrivateRoute = ({ children }) => {
  const { authUser } = useAuthStore();

  // If not authenticated, redirect to login
  if (!authUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute; 