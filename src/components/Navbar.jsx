import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { LogOut, Moon, Sun } from "lucide-react";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              theme === 'dark' 
                ? 'bg-teal-500 group-hover:bg-teal-600' 
                : 'bg-lime-500 group-hover:bg-lime-600'
            }`}>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-white'}`}>H</span>
            </div>
            <span className={`ml-2 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Hangout</span>
          </Link>

          <div className="flex items-center space-x-4">
            {authUser ? (
              <>
                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-teal-400 hover:bg-gray-800' 
                      : 'text-gray-700 hover:text-lime-600 hover:bg-gray-100'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-teal-400 hover:bg-gray-800' 
                      : 'text-gray-700 hover:text-lime-600 hover:bg-gray-100'
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-teal-400 hover:bg-gray-800' 
                      : 'text-gray-700 hover:text-lime-600 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-teal-400 hover:bg-gray-800' 
                      : 'text-gray-700 hover:text-lime-600 hover:bg-gray-100'
                  }`}
                >
                  Sign up
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-teal-400 hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-lime-600 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;