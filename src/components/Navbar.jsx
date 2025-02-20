import { Link } from "react-router-dom";
import { Menu, Moon, Sun, MenuIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const {user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
      <h1 className="font-bold">BabyTailAI</h1>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link className="text-sm" to="/milestones">Milestones</Link>
            <Link className="text-sm" to="/chapters">Chapters</Link>
            <Link className="text-sm" to="/images">Images</Link>
            {/* <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun /> : <Moon />}
            </button> */}
            <button onClick={logout} className="p-2 rounded bg-red-500 text-white">
              Logout
            </button>
            {/* <Menu /> */}
          </>
        ) : (
          <>
          {/* <Link to="/milestones">Milestones</Link>
            <div>
              <MenuIcon />
            </div> */}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
