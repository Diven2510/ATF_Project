import { useEffect, useState } from 'react';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    
    <div className={`min-h-screen transition-colors duration-500 bg-gradient-to-br ${darkMode ? 'from-gray-900 to-gray-800' : 'from-blue-100 via-white to-blue-200'}`}>
  
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-1 rounded shadow hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white/90 dark:bg-gray-900/90 shadow-2xl backdrop-blur-md rounded-xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 transition-all">

          {isLogin ? <Login /> : <Register />}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 text-blue-600 dark:text-blue-300 hover:underline"
          >
            {isLogin ? 'Switch to Register' : 'Switch to Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
