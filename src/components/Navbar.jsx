import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Mail, Menu as MenuIcon, X } from "lucide-react";
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
    // Update the dark mode classes on body
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

  const handleMailTo = () => {
    window.location.href = "mailto:support@babyltailai.com";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-md transition-all">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              BabyTailAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <Link 
                  to="/milestones" 
                  className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Milestones
                </Link>
                <Link 
                  to="/chapters" 
                  className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Chapters
                </Link>
                <Link 
                  to="/images" 
                  className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Images
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {/* Support Email */}
            <button
              onClick={handleMailTo}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Contact support"
            >
              <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            ) : (
              <MenuIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-1 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
            {user ? (
              <>
                <Link
                  to="/milestones"
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Milestones
                </Link>
                <Link
                  to="/chapters"
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Chapters
                </Link>
                <Link
                  to="/images"
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Images
                </Link>
                <button
                  onClick={handleMailTo}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" /> Support
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleMailTo}
                className="flex items-center w-full px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" /> Support
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;