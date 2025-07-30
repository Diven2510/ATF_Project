import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/env';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Get API URL safely
    const apiUrl = getApiUrl();
    
    // Debug: Log the API URL
    console.log('API URL:', apiUrl);
    console.log('Full URL:', `${apiUrl}/api/auth/login`);
    
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        if (data.userId) localStorage.setItem('userId', data.userId);
        alert('Login successful');
        navigate('/dashboard');
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed: ' + err.message);
    }
  };


  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-center h-[50px]">Login</h2>
      <input
        type="email"  
        className="w-full px-4 py-4 border rounded-md bg-transparent text-inherit border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full px-4 py-4 border rounded-md bg-transparent text-inherit border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 border rounded-md bg-transparent text-inherit border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Login
      </button>
    </form>
  );
}

export default Login;
