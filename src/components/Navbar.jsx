import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  Menu as MenuIcon, 
  FileText, 
  BookOpen, 
  Image,
  Home,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("isDark") === "true";
    }
    return false;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem("isDark", "true");
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem("isDark", "false");
    }
  }, [isDark]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 transition-all h-12 text-xs border-b border-gray-200 dark:border-slate-800">
      <div className="px-2 h-full flex items-center justify-between w-full">
        {/* Logo and Navigation Links */}
        <div className="flex items-center justify-between space-x-4 w-full">
          <Link to="/" className="flex flex-col items-center">
            <Home className="w-4 h-4 text-slate-700 dark:text-white" />
            <span className="font-bold text-slate-700 dark:text-white">
              babytalesai.com
            </span>
          </Link>

          {user && (
            <Link
              to="/milestones"
              className="text-slate-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center"
            >
              <FileText className="w-4 h-4 mb-1" />
              Milestones
            </Link>
          )}

          {user && (
            <Link
              to="/chapters"
              className="text-slate-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center"
            >
              <BookOpen className="w-4 h-4 mb-1" />
              Chapters
            </Link>
          )}

          {user && (
            <Link
              to="/images"
              className="text-slate-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex flex-col items-center"
            >
              <Image className="w-4 h-4 mb-1" />
              Pictures
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="transition-colors flex flex-col items-center text-slate-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-4 h-4" />
            Menu
          </button>
        </div>

        {/* Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-13 right-2 w-48 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg">
            <button
              onClick={() => {
                setIsDark(!isDark);
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-slate-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 mr-2" />
              ) : (
                <Moon className="w-5 h-5 mr-2" />
              )}
              {isDark ? "Light" : "Dark"} Mode
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-slate-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;