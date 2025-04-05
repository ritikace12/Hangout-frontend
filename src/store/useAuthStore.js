import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
  authUser: null,
  isLoading: false,
  error: null,

  setAuthUser: (user) => set({ authUser: user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in localStorage");
        set({ authUser: null });
        return false;
      }

      const response = await axiosInstance.get("/api/auth/check");
      console.log("Auth check response:", response.data);
      set({ authUser: response.data.user });
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      if (error.response?.status === 401) {
        // Clear auth state on 401
        set({ authUser: null });
        localStorage.removeItem("token");
      }
      return false;
    }
  },

  signup: async (formData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.post("/api/auth/signup", formData);
      console.log("Signup response:", response.data);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      
      set({ authUser: response.data.user, isLoading: false });
      toast.success("Account created successfully!");
      return response.data;
    } catch (error) {
      console.error("Signup error:", error);
      set({ 
        error: error.response?.data?.message || "Failed to sign up", 
        isLoading: false 
      });
      toast.error(error.response?.data?.message || "Failed to sign up");
      throw error;
    }
  },

  login: async (formData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.post("/api/auth/login", formData);
      console.log("Login response:", response.data);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      
      set({ authUser: response.data.user, isLoading: false });
      toast.success("Logged in successfully!");
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      set({ 
        error: error.response?.data?.message || "Failed to log in", 
        isLoading: false 
      });
      toast.error(error.response?.data?.message || "Failed to log in");
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await axiosInstance.post("/api/auth/logout");
      set({ authUser: null, isLoading: false });
      
      // Clear token from localStorage
      localStorage.removeItem("token");
      
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      set({ 
        error: error.response?.data?.message || "Failed to log out", 
        isLoading: false 
      });
      toast.error(error.response?.data?.message || "Failed to log out");
    }
  },

  updateProfile: async (formData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.put("/api/auth/update-profile", formData);
      set({ authUser: response.data.user, isLoading: false });
      toast.success("Profile updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      set({ 
        error: error.response?.data?.message || "Failed to update profile", 
        isLoading: false 
      });
      toast.error(error.response?.data?.message || "Failed to update profile");
      throw error;
    }
  },
}));

export default useAuthStore;

