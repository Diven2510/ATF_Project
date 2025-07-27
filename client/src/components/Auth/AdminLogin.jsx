import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Attempting admin login...');
      const res = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      console.log('Admin login response:', data);
      
      if (res.ok) {
        console.log('Admin login successful, setting tokens...');
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('isAdmin', 'true');
        console.log('Tokens set, navigating to /admin...');
        window.location.href = '/admin';
      } else {
        console.log('Admin login failed:', data.msg);
        setError(data.msg || 'Admin login failed');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Admin login failed');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-gradient-to-br ${darkMode ? 'from-gray-900 to-gray-800' : 'from-blue-100 via-white to-blue-200'}`}>
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className={`w-full max-w-md rounded-xl shadow-2xl p-8 border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🔐 Admin Access
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter your admin credentials
            </p>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } shadow-lg`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Admin Email
              </label>
              <input
                type="email"  
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-500'
                } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Admin Password
              </label>
              <input
                type="password"
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-500'
                } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg font-medium"
            >
              🔐 Admin Login
            </button>
          </form>

          {/* Back to Main */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className={`text-sm hover:underline ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
            >
              ← Back to Main Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 