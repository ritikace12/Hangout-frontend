import { useThemeStore } from "../store/useThemeStore";

const LoadingSpinner = ({ size = "md", className = "" }) => {
  const { isDarkMode } = useThemeStore();
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-[spin_1s_linear_infinite] ${
        isDarkMode ? 'border-teal-500' : 'border-lime-500'
      }`} />
      <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-[spin_1s_linear_infinite] delay-300 ${
        isDarkMode ? 'border-teal-400' : 'border-lime-400'
      }`} />
    </div>
  );
};

export default LoadingSpinner; 