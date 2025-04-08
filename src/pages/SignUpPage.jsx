import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Eye, EyeOff, Lock, Mail, MessageSquare, User } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import logo from "../assets/logo.png";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(formData);
      navigate("/");
    } catch (error) {
      // Error toast is handled in the auth store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="Hangout"
            className="w-16 h-16 object-contain mb-4"
          />
          <h2 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Create Account
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="text"
                id="fullName"
                className={`w-full p-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500' 
                    : 'bg-white border-gray-200 text-black placeholder-gray-500 focus:ring-lime-500'
                }`}
                placeholder="Bhupindar Jogi"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="email"
                id="email"
                className={`w-full p-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500' 
                    : 'bg-white border-gray-200 text-black placeholder-gray-500 focus:ring-lime-500'
                }`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full p-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500' 
                    : 'bg-white border-gray-200 text-black placeholder-gray-500 focus:ring-lime-500'
                }`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className={`mt-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Already have an account?{" "}
          <Link
            to="/login"
            className={`font-medium transition-colors ${
              isDarkMode 
                ? 'text-teal-400 hover:text-teal-300' 
                : 'text-lime-600 hover:text-lime-500'
            }`}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;