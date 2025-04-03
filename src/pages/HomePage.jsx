import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import Messages from "../components/Messages";
import MessageInput from "../components/MessageInput";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
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
  const [isUserTyping, setIsUserTyping] = useState(false);
  const socketRef = useRef(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const { isDarkMode } = useThemeStore();
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (authUser?._id) {
      getUsers();
    }
  }, [authUser, getUsers]);

  const handleUserSelect = useCallback(async (user) => {
    setSelectedUser(user);
    setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));

    setIsLoadingMessages(true);
    try {
      const res = await axiosInstance.get(`/messages/${user._id}`);
      const uniqueMessages = res.data.reduce((acc, current) => {
        const exists = acc.find(item => item._id === current._id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      setMessages(Array.isArray(uniqueMessages) ? uniqueMessages : []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [scrollToBottom]);

  // Improved socket initialization
  const initializeSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(import.meta.env.VITE_API_URL, {
      auth: {
        token: localStorage.getItem("token")
      },
      query: {
        userId: authUser._id,
        connectionId: Date.now().toString()
      }
    });

    // Connection events
    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      socketRef.current.emit("setup", {
        userId: authUser._id,
        connectionId: socketRef.current.id
      });
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection error. Attempting to reconnect...");
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        socketRef.current.connect();
      }
    });

    // Message events
    socketRef.current.on("message-received", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        scrollToBottom();
      }
    });

    socketRef.current.on("message-sent", (newMessage) => {
      if (selectedUser && newMessage.receiverId === selectedUser._id) {
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        scrollToBottom();
      }
    });

    socketRef.current.on("message-status", ({ messageId, status, receiverId }) => {
      setMessages(prev => prev.map(msg => {
        if (msg._id === messageId) {
          return { ...msg, status };
        }
        return msg;
      }));

      if (status === "queued") {
        toast("Message will be delivered when the user comes online", {
          icon: 'ℹ️',
          duration: 3000,
        });
      }
    });

    // User status events
    socketRef.current.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    socketRef.current.on("typing-status", ({ userId, isTyping }) => {
      if (selectedUser?._id === userId) {
        setIsUserTyping(isTyping);
      }
    });

    // Error handling
    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      toast.error("An error occurred. Please refresh the page.");
    });

  }, [authUser, selectedUser]);

  useEffect(() => {
    if (authUser) {
      initializeSocket();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [authUser, initializeSocket]);

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

  // Improved message sending
  const handleSendMessage = async (tempMessage, formData, tempMessageId) => {
    try {
      // Update messages state with temporary message
      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();

      // Send the actual message to the server
      const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newMessage = response.data;
      
      // Update messages state with the actual message from server
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessageId ? newMessage : msg
      ));
      
      // Emit message through socket
      if (socketRef.current?.connected) {
        socketRef.current.emit("send-message", newMessage);
      } else {
        toast.error("Connection lost. Message will be sent when reconnected.");
      }
      
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessageId ? { ...msg, status: "failed" } : msg
      ));
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
    <div className="h-full w-full overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full w-full">
        {/* Users Sidebar */}
        <div className={`${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden flex flex-col w-full h-full`}>
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Users</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className={`
                  flex items-center gap-3 p-4 cursor-pointer transition-colors w-full
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
                  <h3 className="font-medium truncate text-left">{user.fullName}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate text-left`}>
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
        <div className={`md:col-span-2 ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden flex flex-col w-full h-full`}>
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
              <div className="flex-1 overflow-hidden flex flex-col w-full h-full">
                <div className="flex-1 overflow-y-auto">
                  <Messages
                    messages={messages}
                    isLoadingMessages={isLoadingMessages}
                  />
                </div>
                <div className="flex-shrink-0">
                  <MessageInput
                    selectedUser={selectedUser}
                    onSendMessage={handleSendMessage}
                    isLoadingSend={isLoadingSend}
                    socket={socketRef.current}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center w-full">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;