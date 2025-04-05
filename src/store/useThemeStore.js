import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "dark", // Can be "light" or "dark"
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === "dark" ? "light" : "dark" 
      })),
    }),
    {
      name: "theme-storage",
    }
  )
);