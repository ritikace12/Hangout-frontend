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
        // Handle 401 errors
        if (error.response && error.response.status === 401) {
            // Clear auth state on 401
            const authStore = useAuthStore.getState();
            authStore.clearAuth();
            
            // Don't redirect here - let components handle it
            console.log("Authentication failed, cleared auth state");
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
