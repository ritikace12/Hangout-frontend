import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import Messages from "../components/Messages";
import MessageInput from "../components/MessageInput";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { useThemeStore } from "../store/useThemeStore";

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
      socketRef.current = io(import.meta.env.VITE_API_URL);

      socketRef.current.on("connect", () => {
        socketRef.current.emit("setup", authUser);
      });

      socketRef.current.on("message-received", (newMessage) => {
        // Update last message for the sender
        setLastMessages(prev => ({
          ...prev,
          [newMessage.senderId._id]: newMessage
        }));

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
              className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3 cursor-pointer"
              onClick={() => handleUserSelect(newMessage.senderId)}
            >
              <img 
                src={newMessage.senderId.profilePic || "/avatar.jpg"} 
                alt="sender" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{newMessage.senderId.fullName}</p>
                <p className="text-sm text-gray-500">{newMessage.text}</p>
              </div>
            </div>
          ));
        }
      });

      socketRef.current.on("online-users", (users) => {
        setOnlineUsers(users);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [authUser, selectedUser]);

  // Load initial last messages for all users
  useEffect(() => {
    const loadLastMessages = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/messages/last-messages", {
          credentials: "include"
        });
        const data = await res.json();
        setLastMessages(data);
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
      const res = await fetch(
        `http://localhost:5001/api/messages/${user._id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Send message handler with real-time update
  const handleSendMessage = async (text, image) => {
    if (!selectedUser || (!text.trim() && !image)) return;

    // Optimistically add message to UI
    const tempMessage = {
      _id: Date.now().toString(),
      text,
      image,
      senderId: authUser,
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString(),
      isTemp: true // Flag to identify temporary message
    };

    setMessages(prev => [...prev, tempMessage]);

    setIsLoadingSend(true);
    try {
      const res = await fetch(
        `http://localhost:5001/api/messages/send/${selectedUser._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text, image }),
        }
      );

      const newMessage = await res.json();
      
      // Replace temp message with actual message
      setMessages(prev => 
        prev.map(msg => msg._id === tempMessage._id ? newMessage : msg)
      );

      // Emit socket event for real-time update
      if (socketRef.current) {
        socketRef.current.emit("send-message", {
          ...newMessage,
          receiverId: selectedUser._id,
        });
      }
    } catch (error) {
      // Remove temp message if send failed
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      toast.error("Failed to send message");
    } finally {
      setIsLoadingSend(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="h-screen pt-20 flex items-center justify-center bg-white">
        <div className="animate-spin text-gray-700">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="h-full px-4 py-4">
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
                <Messages
                  messages={messages}
                  isLoadingMessages={isLoadingMessages}
                />
                <MessageInput
                  onSendMessage={handleSendMessage}
                  isLoadingSend={isLoadingSend}
                />
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