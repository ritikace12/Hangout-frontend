import { Routes, Route, Navigate } from "react-router-dom";
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

const App = () => {
  const { authUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();

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
              {/* Redirect any unknown routes to home if authenticated, login if not */}
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