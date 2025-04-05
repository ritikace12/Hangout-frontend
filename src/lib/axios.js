import axios from "axios";
import useAuthStore from "../store/useAuthStore";

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
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Clear auth state in store
                const authStore = useAuthStore.getState();
                authStore.setAuthUser(null);
                
                // Clear token from localStorage
                localStorage.removeItem("token");
                
                // Redirect to login page
                window.location.href = "/login";
            } catch (refreshError) {
                console.error("Error handling 401:", refreshError);
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
