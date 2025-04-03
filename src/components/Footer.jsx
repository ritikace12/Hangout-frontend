import { Github, Twitter } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const Footer = () => {
  const { isDarkMode } = useThemeStore();

  return (
    <footer className={`${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-t`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © {new Date().getFullYear()} Hangout. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                isDarkMode 
                  ? 'text-teal-400 hover:text-teal-300' 
                  : 'text-lime-600 hover:text-lime-500'
              }`}
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                isDarkMode 
                  ? 'text-teal-400 hover:text-teal-300' 
                  : 'text-lime-600 hover:text-lime-500'
              }`}
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 