import { useEffect, useRef, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import LoadingSpinner from "./LoadingSpinner";
import { FiCheck, FiCheckCircle } from "react-icons/fi";

const Message = memo(({ message, isOwnMessage, authUser, isDarkMode }) => {
  return (
    <div
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
            loading="lazy"
          />
        )}
        <div className="flex items-center justify-between mt-1">
          <p className={`text-xs ${
            message.senderId._id === authUser._id
              ? isDarkMode
                ? 'text-blue-200'
                : 'text-blue-100'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-gray-500'
          }`}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </p>
          {message.senderId._id === authUser._id && (
            <div className="flex items-center ml-2">
              {message.status === "sending" && (
                <span className="text-xs">Sending...</span>
              )}
              {message.status === "sent" && (
                <FiCheck className="w-3 h-3" />
              )}
              {message.status === "delivered" && (
                <FiCheck className="w-3 h-3" />
              )}
              {message.status === "read" && (
                <FiCheckCircle className="w-3 h-3 text-blue-300" />
              )}
              {message.status === "failed" && (
                <span className="text-xs text-red-500">Failed</span>
              )}
              {message.status === "queued" && (
                <span className="text-xs text-gray-400">Queued</span>
              )}
              {message.status === "offline" && (
                <span className="text-xs text-gray-400">Will deliver when online</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

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

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!Array.isArray(messages)) {
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
        messages.map((message) => (
          <Message
            key={message._id}
            message={message}
            isOwnMessage={message.senderId._id === authUser._id}
            authUser={authUser}
            isDarkMode={isDarkMode}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages; 