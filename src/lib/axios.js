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
        // Don't automatically redirect on 401 errors
        // Just return the error to be handled by the component
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
