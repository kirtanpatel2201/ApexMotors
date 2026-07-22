import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Car, Sun, Moon, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full p-4 sm:px-10 flex justify-between items-center bg-gray-50/50 dark:bg-[#0A0A0A]/30 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 z-50 sticky top-0 transition-colors duration-700">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
        <div className="p-1.5 bg-gray-900/5 dark:bg-white/5 border border-gray-900/10 dark:border-white/10 rounded-lg group-hover:bg-gray-900/10 dark:group-hover:bg-white/10 transition-colors">
          <Car size={22} className="text-black dark:text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
            Apex Motors
          </h1>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {isAuthenticated ? (
          <>
            <span className="text-sm font-semibold text-gray-600 dark:text-slate-300 hidden sm:block tracking-wide">
              Welcome, {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-4 py-2 linear-button rounded-md flex items-center gap-2 text-gray-900 dark:text-white"
            >
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : null}

        <div className="flex items-center gap-3 bg-gray-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full shadow-inner">
          <Moon size={14} className={`${theme === 'dark' ? 'text-white' : 'text-gray-400'}`} />
          <button
            onClick={toggleTheme}
            className="relative w-10 h-5 rounded-full bg-gray-300 dark:bg-zinc-700 transition-colors duration-500 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            <div 
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${theme === 'dark' ? 'translate-x-0' : 'translate-x-5'}`}
            ></div>
          </button>
          <Sun size={14} className={`${theme === 'light' ? 'text-yellow-500' : 'text-gray-500'}`} />
        </div>
      </div>
    </header>
  );
};
