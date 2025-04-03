import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import Messages from "../components/Messages";
import MessageInput from "../components/MessageInput";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { useThemeStore } from "../store/useThemeStore";
import axiosInstance from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";

const HomePage = () => {
  const { authUser } = useAuthStore();
  const { users, getUsers, isUserLoading } = useChatStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages
  const [lastMessages, setLastMessages] = useState({}); // Track last message for each user
  const { isDarkMode } = useThemeStore();

  // Debug logs
  useEffect(() => {
    console.log("Current authUser:", authUser);
    console.log("Current users:", users);
  }, [authUser, users]);

  useEffect(() => {
    if (authUser?._id) {
      getUsers();
    }
  }, [authUser, getUsers]);

  // Initialize socket connection with unread message handling
  useEffect(() => {
    if (authUser?._id) {
      console.log("Initializing socket connection to:", import.meta.env.VITE_API_URL);
      socketRef.current = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        path: '/socket.io/',
        secure: true,
        rejectUnauthorized: false
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected successfully");
        socketRef.current.emit("setup", authUser);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        toast.error("Connection error. Please try again.");
      });

      socketRef.current.on("error", (error) => {
        console.error("Socket error:", error);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          // Server initiated disconnect, try to reconnect
          socketRef.current.connect();
        }
      });

      socketRef.current.on("message-received", (newMessage) => {
        console.log("Message received:", newMessage);
        
        // Update last message for the sender
        setLastMessages(prev => ({
          ...prev,
          [newMessage.senderId._id]: newMessage
        }));

        // If the message is from the selected user, add it to messages
        if (selectedUser?._id === newMessage.senderId._id) {
          setMessages(prev => [...prev, newMessage]);
        } else {
          // Increment unread count for sender
          setUnreadCounts(prev => ({
            ...prev,
            [newMessage.senderId._id]: (prev[newMessage.senderId._id] || 0) + 1
          }));

          // Show notification
          toast.custom((t) => (
            <div 
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg flex items-center gap-3 cursor-pointer`}
              onClick={() => handleUserSelect(newMessage.senderId)}
            >
              <img 
                src={newMessage.senderId.profilePic || "/avatar.jpg"} 
                alt="sender" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{newMessage.senderId.fullName}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{newMessage.text}</p>
              </div>
            </div>
          ));
        }
      });

      socketRef.current.on("message-sent", (newMessage) => {
        console.log("Message sent:", newMessage);
        if (selectedUser?._id === newMessage.receiverId) {
          setMessages(prev => [...prev, newMessage]);
        }
      });

      socketRef.current.on("message-status", (status) => {
        console.log("Message status:", status);
        if (status.status === "offline") {
          toast.error("User is offline. Message will be delivered when they come online.");
        }
      });

      socketRef.current.on("online-users", (users) => {
        console.log("Online users updated:", users);
        setOnlineUsers(users);
      });

      return () => {
        if (socketRef.current) {
          console.log("Cleaning up socket connection");
          socketRef.current.disconnect();
        }
      };
    }
  }, [authUser, selectedUser]);

  // Load initial last messages for all users
  useEffect(() => {
    const loadLastMessages = async () => {
      try {
        const res = await axiosInstance.get("/messages/last-messages");
        setLastMessages(res.data);
      } catch (error) {
        console.error("Error loading last messages:", error);
      }
    };

    if (authUser?._id) {
      loadLastMessages();
    }
  }, [authUser]);

  // Handle user selection
  const handleUserSelect = useCallback(async (user) => {
    setSelectedUser(user);
    // Clear unread count for selected user
    setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));

    setIsLoadingMessages(true);
    try {
      const res = await axiosInstance.get(`/messages/${user._id}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Send message handler with real-time update
  const handleSendMessage = async (message, tempMessageId = null) => {
    if (!selectedUser) {
      console.log("No user selected");
      return;
    }

    if (tempMessageId) {
      // Remove temporary message
      setMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
      return;
    }

    if (!message) {
      console.log("No message to send");
      return;
    }

    // Add message to UI
    setMessages(prev => [...prev, message]);

    setIsLoadingSend(true);
    try {
      const formData = new FormData();
      if (message.text) formData.append("message", message.text);
      if (message.image) formData.append("image", message.image);

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newMessage = res.data;
      
      // Replace temp message with actual message
      setMessages(prev => 
        prev.map(msg => msg._id === message._id ? newMessage : msg)
      );

      // Emit socket event for real-time update
      if (socketRef.current?.connected) {
        socketRef.current.emit("send-message", {
          ...newMessage,
          receiverId: selectedUser._id,
        });
      } else {
        console.warn("Socket not connected, attempting to reconnect");
        socketRef.current?.connect();
        // Wait a bit and try to emit again
        setTimeout(() => {
          if (socketRef.current?.connected) {
            socketRef.current.emit("send-message", {
              ...newMessage,
              receiverId: selectedUser._id,
            });
          } else {
            console.error("Failed to reconnect socket");
            toast.error("Message sent but real-time updates may be delayed");
          }
        }, 1000);
      }
    } catch (error) {
      // Remove temp message if send failed
      setMessages(prev => prev.filter(msg => msg._id !== message._id));
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsLoadingSend(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="h-full p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Users Sidebar */}
          <div className={`${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden flex flex-col`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Users</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`
                    flex items-center gap-3 p-4 cursor-pointer transition-colors
                    ${selectedUser?._id === user._id 
                      ? isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                      : isDarkMode 
                        ? 'hover:bg-gray-800 hover:text-teal-400' 
                        : 'hover:bg-gray-100 hover:text-lime-600'
                    }
                    ${isDarkMode ? 'text-white' : 'text-black'}
                  `}
                >
                  <div className="relative">
                    <img
                      src={user.profilePic || "/avatar.jpg"}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    {onlineUsers.includes(user._id) && (
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isDarkMode ? 'bg-teal-500' : 'bg-lime-500'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{user.fullName}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </p>
                  </div>
                  {unreadCounts[user._id] > 0 && (
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-teal-500 text-white' : 'bg-lime-500 text-white'
                    }`}>
                      {unreadCounts[user._id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`md:col-span-2 ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden flex flex-col`}>
            {selectedUser ? (
              <>
                <div className={`p-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={selectedUser.profilePic || "/avatar.jpg"}
                        alt={selectedUser.fullName}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      {onlineUsers.includes(selectedUser._id) && (
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isDarkMode ? 'bg-teal-500' : 'bg-lime-500'
                        }`} />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedUser.fullName}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                  <Messages
                    messages={messages}
                    isLoadingMessages={isLoadingMessages}
                  />
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    isLoadingSend={isLoadingSend}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Select a user to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;