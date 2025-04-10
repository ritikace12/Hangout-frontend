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
      onlineUsers: [],

      clearAuth: () => {
        set({ authUser: null });
        localStorage.removeItem("token");
      },

      checkAuth: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            set({ authUser: null });
            return false;
          }

          const res = await axiosInstance.get("/auth/check");
          if (res.data) {
            set({ authUser: res.data });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Auth check error:", error);
          set({ authUser: null });
          localStorage.removeItem("token");
          return false;
        }
      },

      signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          if (res.data) {
            set({ authUser: res.data });
            if (res.data.token) {
              localStorage.setItem("token", res.data.token);
            }
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
            if (res.data.token) {
              localStorage.setItem("token", res.data.token);
            }
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
          localStorage.removeItem("token");
        }
      },

      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update-profile", data);
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

