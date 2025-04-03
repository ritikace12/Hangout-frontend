import { useState } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { Image, Send } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = ({ onSendMessage, isLoadingSend }) => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const { isDarkMode } = useThemeStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !image) return;

    console.log("MessageInput: Attempting to send message", { message, image });
    try {
      await onSendMessage(message, image);
      console.log("MessageInput: Message sent successfully");
      setMessage("");
      setImage(null);
    } catch (error) {
      console.error("MessageInput: Failed to send message", error);
      toast.error("Failed to send message");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-center gap-4">
        <label
          htmlFor="image-upload"
          className={`p-2 rounded-lg cursor-pointer transition-colors ${
            isDarkMode 
              ? 'text-white hover:text-teal-400 hover:bg-gray-800' 
              : 'text-black hover:text-lime-600 hover:bg-gray-100'
          }`}
        >
          <Image className="w-5 h-5" />
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isLoadingSend}
          />
        </label>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className={`flex-1 p-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500' 
              : 'bg-white border-gray-200 text-black placeholder-gray-500 focus:ring-lime-500'
          }`}
          disabled={isLoadingSend}
        />

        <button
          type="submit"
          disabled={isLoadingSend || (!message.trim() && !image)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'text-white hover:text-teal-400 hover:bg-gray-800 disabled:text-gray-600' 
              : 'text-black hover:text-lime-600 hover:bg-gray-100 disabled:text-gray-400'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {image && (
        <div className="mt-2 relative">
          <img
            src={image}
            alt="Preview"
            className="max-h-32 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setImage(null)}
            className={`absolute top-1 right-1 p-1 rounded-full ${
              isDarkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            ×
          </button>
        </div>
      )}
    </form>
  );
};

export default MessageInput;
