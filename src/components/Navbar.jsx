import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { LogOut, Moon, Sun } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Hangout"
              className="w-10 h-10 object-contain"
            />
            <span className={`ml-2 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Hangout</span>
          </Link>

          <div className="flex items-center space-x-4">
            {authUser ? (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <img
                    src={authUser.profilePic || "/avatar.jpg"}
                    alt={authUser.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline">{authUser.fullName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? "bg-teal-500 text-white hover:bg-teal-600"
                      : "bg-lime-500 text-white hover:bg-lime-600"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? "bg-teal-500 text-white hover:bg-teal-600"
                      : "bg-lime-500 text-white hover:bg-lime-600"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-teal-400 hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-lime-600 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;