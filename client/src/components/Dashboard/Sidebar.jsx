import { NavLink } from 'react-router-dom';

function Sidebar({ darkMode }) {
  // Define shared styles and active class handling
  const linkClass = ({ isActive }) =>
    `block px-6 py-3 rounded transition-colors duration-200 ${
      isActive
        ? 'font-bold text-blue-600 dark:text-blue-400'
        : 'hover:text-blue-500'
    }`;

  return (
    <aside
      className={`w-64 h-full shadow-md transition-all duration-300
      ${darkMode ? 'bg-gray-900 text-gray-100 border-r border-gray-700' : 'bg-white text-gray-800 border-r border-gray-200'}`}
    >
      {/* Title */}
      <div className="p-6 font-bold text-xl border-b border-gray-200 dark:border-gray-700">
        Online Judge
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-2 text-base">
        <NavLink to="/dashboard" end className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/dashboard/leaderboard" className={linkClass}>
          Leaderboard
        </NavLink>
        <NavLink to="/dashboard/friends" className={linkClass}>
          Friends
        </NavLink>
        <NavLink to="/dashboard/contest" className={linkClass}>
          Contest
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
