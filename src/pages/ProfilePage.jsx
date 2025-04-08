import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const ProfilePage = () => {
  const { authUser, updateProfile } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    profilePic: authUser?.profilePic || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.fullName.trim()) {
        toast.error("Full name is required");
        return;
      }

      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <LoadingSpinner />
        </div>
      ) : (
        <div className={`max-w-2xl mx-auto p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Profile Settings
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-teal-500 text-white hover:bg-teal-600' 
                    : 'bg-lime-500 text-white hover:bg-lime-600'
                }`}
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={formData.profilePic || "/avatar.jpg"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4"
                />
                {isEditing && (
                  <label
                    htmlFor="profile-pic"
                    className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 text-white hover:bg-gray-700' 
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      id="profile-pic"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={!isEditing}
                className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500 disabled:bg-gray-700' 
                    : 'bg-white border-gray-200 text-black placeholder-gray-500 focus:ring-lime-500 disabled:bg-gray-100'
                }`}
              />
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={authUser?.email || ""}
                disabled
                className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-teal-500 disabled:bg-gray-700' 
                    : 'bg-white border-gray-200 text-black placeholder-gray-500 focus:ring-lime-500 disabled:bg-gray-100'
                }`}
              />
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-teal-500 text-white hover:bg-teal-600 disabled:bg-gray-700' 
                      : 'bg-lime-500 text-white hover:bg-lime-600 disabled:bg-gray-300'
                  }`}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: authUser?.fullName || "",
                      profilePic: authUser?.profilePic || "",
                    });
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;