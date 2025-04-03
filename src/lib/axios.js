import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Only redirect to login if we're not already on the login page
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login')) {
                // Clear auth state
                useAuthStore.getState().clearAuth();
                // Redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Add a request interceptor to ensure cookies are sent
axiosInstance.interceptors.request.use(
    (config) => {
        // Ensure credentials are included
        config.withCredentials = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
