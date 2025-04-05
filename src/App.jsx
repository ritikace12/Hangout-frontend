import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import ServerStatus from "./components/ServerStatus";
import { useEffect, useState } from "react";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      setIsInitialized(true);
    };
    initialize();
  }, [checkAuth]);

  // Show loading state while checking auth
  if (!isInitialized || isCheckingAuth) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-gray-500">Please wait while we check your authentication status</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not already on login or signup page, redirect to login
  if (!authUser && location.pathname !== '/login' && location.pathname !== '/signup') {
    return <Navigate to="/login" replace />;
  }

  return (
    <ServerStatus>
      <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <Navbar />
        <main className="flex-1 w-full pt-16 overflow-hidden">
          <div className="w-full h-full p-4 overflow-hidden">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              {/* Redirect any unknown routes to login if not authenticated, home if authenticated */}
              <Route
                path="*"
                element={
                  authUser ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </div>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </ServerStatus>
  );
};

export default App;