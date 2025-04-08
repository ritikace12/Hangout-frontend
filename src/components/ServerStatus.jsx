import { useState, useEffect } from 'react';
import axiosInstance from '../lib/axios';
import { useThemeStore } from '../store/useThemeStore';
import LoadingSpinner from './LoadingSpinner';
import logo from "../assets/logo.png";

const ServerStatus = ({ children }) => {
  const [isServerUp, setIsServerUp] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    const checkServer = async () => {
      try {
        // Use a simple health check endpoint instead of auth check
        await axiosInstance.get("/health");
        setIsServerUp(true);
      } catch (error) {
        // If we get a response, the server is up
        if (error.response) {
          setIsServerUp(true);
        } else {
          // No response means server is down
          setIsServerUp(false);
        }
      } finally {
        setIsChecking(false);
      }
    };

    const interval = setInterval(checkServer, 5000); // Check every 5 seconds
    checkServer(); // Initial check

    return () => clearInterval(interval);
  }, []);

  if (isChecking || !isServerUp) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="text-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${isDarkMode ? 'bg-teal-500/20' : 'bg-lime-500/20'}`}>
              <img
                src={logo}
                alt="Hangout"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-teal-500' : 'text-lime-500'}`}>
              Hangout
            </h1>
          </div>
          <div className="flex justify-center">
            <LoadingSpinner size="lg" className="w-24 h-24" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              {isChecking ? 'Checking server status...' : 'Server is starting up...'}
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isChecking 
                ? 'Please wait while we check the server status' 
                : 'The server is warming up. This may take 40-50 seconds.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ServerStatus; 