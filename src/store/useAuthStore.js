import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set) => ({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: true,
      onlineUsers: [],

      clearAuth: () => {
        set({ authUser: null });
        localStorage.removeItem('auth-storage');
      },

      checkAuth: async () => {
        try {
          const res = await axiosInstance.get("/auth/check");
          if (res.data) {
            set({ authUser: res.data });
            return true;
          }
          set({ authUser: null });
          return false;
        } catch (error) {
          set({ authUser: null });
          return false;
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          if (res.data) {
            set({ authUser: res.data });
            toast.success("Account created successfully");
            return true;
          }
          return false;
        } catch (error) {
          console.error("Signup error:", error);
          toast.error(error.response?.data?.message || "Signup failed");
          return false;
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          if (res.data) {
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            return true;
          }
          return false;
        } catch (error) {
          console.error("Login error:", error);
          toast.error(error.response?.data?.message || "Login failed");
          return false;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ authUser: null });
          localStorage.removeItem('auth-storage');
        }
      },

      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update", data);
          if (res.data) {
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
            return true;
          }
          return false;
        } catch (error) {
          console.error("Update profile error:", error);
          toast.error(error.response?.data?.message || "Failed to update profile");
          return false;
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ authUser: state.authUser }),
    }
  )
);

