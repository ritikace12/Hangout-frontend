import { create } from "zustand"
import axiosInstance from "../lib/axios"
import toast from "react-hot-toast"


export const useChatStore = create((set) => ({
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,
    
    
    getUsers: async () => {
        set({ isUserLoading: true })
        try {
            const res = await axiosInstance.get("/messages/users")
            console.log("Users response:", res.data)
            
            const users = res.data.filteredUsers || res.data || []
            set({ users })
        } catch (error) {
            console.error("Error fetching users:", error)
            toast.error("Failed to fetch users")
            set({ users: [] })
        } finally {
            set({ isUserLoading: false })
        }
    },

    setSelectedUser: (user) => set({ selectedUser: user }),
}))

