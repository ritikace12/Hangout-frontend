import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import LoadingSpinner from "./LoadingSpinner";

const Messages = ({ messages = [], isLoadingMessages }) => {
  const { authUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Just now";
    }
  };

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!Array.isArray(messages)) {
    console.error("Messages is not an array:", messages);
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No messages to display</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.senderId._id === authUser._id;

          return (
            <div
              key={message._id}
              className={`flex items-end gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
            >
              <img
                src={isOwnMessage ? authUser.profilePic : message.senderId.profilePic || "/avatar.jpg"}
                alt={isOwnMessage ? authUser.fullName : message.senderId.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />

              <div
                className={`
                  max-w-[70%] rounded-lg p-3
                  ${isOwnMessage 
                    ? isDarkMode 
                      ? 'bg-teal-500 text-white rounded-tr-none' 
                      : 'bg-lime-500 text-white rounded-tr-none'
                    : isDarkMode
                      ? 'bg-gray-800 text-white rounded-tl-none'
                      : 'bg-gray-100 text-black rounded-tl-none'
                  }
                `}
              >
                {message.text && (
                  <p className="text-sm">{message.text}</p>
                )}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Shared"
                    className="max-w-full rounded-lg mt-2"
                  />
                )}
                <span className={`text-xs mt-1 block ${isOwnMessage ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages; 