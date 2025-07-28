import { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      alert(data.msg);
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };


  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-center h-[50px]">Register</h2>
      <input
        type="text"
        className="w-full px-4 py-4 border rounded-md bg-transparent text-inherit border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" 
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
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
        Register
      </button>
    </form>
  );
}

export default Register;
