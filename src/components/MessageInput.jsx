import { useState, useRef, memo } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import { FiSend, FiImage } from "react-icons/fi";
import axiosInstance from "../lib/axios";

const MessageInput = memo(({ selectedUser, onSendMessage, socket }) => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { isDarkMode } = useThemeStore();
  const { authUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !image) return;

    let tempMessageId = null;
    try {
      setIsUploading(true);
      const formData = new FormData();
      if (message.trim()) formData.append("message", message.trim());
      if (image) formData.append("image", image);

      const tempMessage = {
        _id: Date.now().toString(),
        text: message.trim(),
        image: image ? URL.createObjectURL(image) : null,
        senderId: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic,
        },
        receiverId: selectedUser._id,
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      tempMessageId = tempMessage._id;
      
      // Validate socket connection before sending
      if (socket && !socket.connected) {
        toast.error("Connection lost. Please refresh the page.");
        return;
      }

      onSendMessage(tempMessage, formData, tempMessageId);
      setMessage("");
      setImage(null);

      if (socket?.connected) {
        try {
          socket.emit("typing", { receiverId: selectedUser._id, isTyping: false });
        } catch (socketError) {
          console.error("Socket error:", socketError);
          // Don't show error toast for socket typing event as it's not critical
        }
      }
    } catch (error) {
      console.error("Error preparing message:", error);
      toast.error("Failed to prepare message");
      if (tempMessageId) {
        onSendMessage({ ...tempMessage, status: "failed" }, null, tempMessageId);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`
            flex-1 p-2 rounded-lg border text-left
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }
            focus:outline-none focus:ring-2 focus:ring-teal-500
          `}
          disabled={isUploading}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`
            p-2 rounded-lg
            ${isDarkMode 
              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }
            transition-colors duration-200
          `}
          disabled={isUploading}
        >
          <FiImage size={20} />
        </button>
        <button
          type="submit"
          disabled={(!message.trim() && !image) || isUploading}
          className={`
            p-2 rounded-lg
            ${(!message.trim() && !image) || isUploading
              ? 'text-gray-400 cursor-not-allowed'
              : isDarkMode
                ? 'text-teal-400 hover:text-teal-300'
                : 'text-teal-500 hover:text-teal-600'
            }
            transition-colors duration-200
          `}
        >
          <FiSend size={20} />
        </button>
      </div>
      {image && (
        <div className="mt-2 relative">
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="max-h-32 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setImage(null)}
            className={`
              absolute top-1 right-1 p-1 rounded-full
              ${isDarkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-white text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            ×
          </button>
        </div>
      )}
    </form>
  );
});

export default MessageInput;
