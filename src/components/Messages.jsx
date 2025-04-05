import { useEffect, useRef, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import LoadingSpinner from "./LoadingSpinner";
import { FiCheck, FiCheckCircle } from "react-icons/fi";

const Message = memo(({ message, isOwnMessage, authUser, isDarkMode }) => {
  // Validate message object
  if (!message || typeof message !== 'object') {
    console.warn("Invalid message object:", message);
    return null;
  }

  // Ensure required properties exist
  const safeMessage = {
    text: message.text || '',
    image: message.image || null,
    senderId: message.senderId || { _id: '', fullName: '', profilePic: '' },
    status: message.status || 'unknown',
    createdAt: message.createdAt || new Date().toISOString()
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <FiCheck className="w-4 h-4" />;
      case 'delivered':
        return <FiCheck className="w-4 h-4" />;
      case 'read':
        return <FiCheckCircle className="w-4 h-4 text-blue-500" />;
      case 'sending':
        return <LoadingSpinner size="sm" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex items-end gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
    >
      <img
        src={isOwnMessage ? authUser.profilePic : safeMessage.senderId.profilePic || "/avatar.jpg"}
        alt={isOwnMessage ? authUser.fullName : safeMessage.senderId.fullName}
        className="w-8 h-8 rounded-full object-cover"
      />

      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
        <div
          className={`flex flex-col gap-2 ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : isDarkMode
              ? "bg-gray-700 text-white"
              : "bg-gray-100 text-gray-900"
          } rounded-lg px-4 py-2`}
        >
          {safeMessage.text && <p>{safeMessage.text}</p>}
          {safeMessage.image && (
            <img
              src={safeMessage.image}
              alt="Message attachment"
              className="max-w-full rounded-lg"
            />
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <span>{formatDistanceToNow(new Date(safeMessage.createdAt), { addSuffix: true })}</span>
          {isOwnMessage && getStatusIcon(safeMessage.status)}
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