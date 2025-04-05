import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        
        // Add token to Authorization header if it exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Ensure withCredentials is set to true for all requests
        config.withCredentials = true;
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            console.error("Authentication error:", error);
            
            // Clear auth state in store
            const authStore = useAuthStore.getState();
            authStore.setAuthUser(null);
            
            // Clear token from localStorage
            localStorage.removeItem("token");
            
            // Don't redirect automatically - let components handle it
            // This prevents redirect loops and allows components to show appropriate UI
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
