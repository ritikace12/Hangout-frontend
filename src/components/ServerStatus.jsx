import { useState, useEffect } from 'react';
import axios from 'axios';
import { useThemeStore } from '../store/useThemeStore';
import LoadingSpinner from './LoadingSpinner';

const ServerStatus = ({ children }) => {
  const [isServerUp, setIsServerUp] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    const checkServer = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check`);
        setIsServerUp(true);
      } catch (error) {
        // If we get a 401, it means the server is up but we're not authenticated
        // This is fine, we just need the server to be responding
        if (error.response?.status === 401) {
          setIsServerUp(true);
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
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-4 text-2xl font-bold">
            {isChecking ? 'Checking server status...' : 'Server is starting up...'}
          </h2>
          <p className="mt-2 text-gray-500">
            {isChecking 
              ? 'Please wait while we check the server status' 
              : 'The server is warming up. This may take 40-50 seconds.'}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ServerStatus; 