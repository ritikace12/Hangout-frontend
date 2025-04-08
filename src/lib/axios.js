import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to ensure cookies are sent
axiosInstance.interceptors.request.use(
    (config) => {
        // Ensure credentials are included
        config.withCredentials = true;
        
        // Get token from localStorage if available
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Clear auth state
            const authStore = useAuthStore.getState();
            authStore.clearAuth();
            
            // If we're not already on the login page, redirect to login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
