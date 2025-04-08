import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, authUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (authUser) {
      navigate("/");
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(formData);
      if (success) {
        navigate("/");
      }
    } catch (error) {
      // Error toast is handled in the auth store
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center mb-5 justify-center px-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <div className={`w-full max-w-md mb-5 p-6 sm:p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="Hangout"
            className="w-16 h-16 object-contain mb-4"
          />
          <h2 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Welcome Back
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500' 
                  : 'bg-white border-gray-200 text-black placeholder-gray-500 focus:ring-lime-500'
              }`}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500' 
                    : 'bg-white border-gray-200 text-black placeholder-gray-500 focus:ring-lime-500'
                }`}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <Eye className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isDarkMode 
                ? 'bg-teal-500 text-white hover:bg-teal-600 disabled:bg-gray-700' 
                : 'bg-lime-500 text-white hover:bg-lime-600 disabled:bg-gray-300'
            }`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p className={`m-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            className={`font-medium transition-colors ${
              isDarkMode 
                ? 'text-teal-400 hover:text-teal-300' 
                : 'text-lime-600 hover:text-lime-500'
            }`}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;