import { FaUserCircle, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ username, darkMode, setDarkMode, toggleSidebar }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    // Close dropdown
    setShowDropdown(false);
    
    // Navigate to home page
    navigate('/');
  };

  return (
    <header className={`h-20 px-6 flex items-center justify-between shadow transition-colors duration-300
      ${darkMode ? 'bg-gray-900 text-white border-b border-gray-700' : 'bg-white text-gray-800 border-b border-gray-200'}`}>

      <div className="flex items-center space-x-4">
        {/* Always visible toggle */}
        <button onClick={toggleSidebar} className="text-2xl focus:outline-none">
          <FaBars />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold">
          👋 Welcome, <span className="text-blue-600 dark:text-blue-400">{username || 'User'}</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <FaUserCircle className="text-3xl text-blue-500 dark:text-blue-400 cursor-pointer" />
          </button>
          
          {showDropdown && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
