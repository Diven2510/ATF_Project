import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import ProblemCard from '../components/Dashboard/ProblemCard';

function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true); // toggle for all sizes

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    setDarkMode(stored === 'true');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
  }, []);

  return (
    <div className={`flex min-h-screen transition-colors duration-500 bg-gradient-to-br ${darkMode ? 'from-gray-900 to-gray-800' : 'from-blue-100 via-white to-blue-200'}`}>
      
      {/* Collapsible Sidebar for all screen sizes */}
      {sidebarOpen && (
        <div className="w-64 min-h-screen shadow-lg">
          <Sidebar darkMode={darkMode} />
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex flex-col">
        <Header
          username={username}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-6">
          {/* Render 6 placeholder cards */}
          
          <Outlet context={{ darkMode }} />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
