import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

function LeaderboardPage() {
  const { darkMode } = useOutletContext();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/submissions/leaderboard')
      .then(res => res.json())
      .then(data => setLeaders(data))
      .catch(() => {});
  }, []);

  return (
    <div className={`max-w-2xl mx-auto mt-10 p-6 rounded-xl shadow-lg ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
    }`}>
      <h2 className="text-2xl font-bold mb-6 text-center">🏆 Leaderboard</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
            <th className={`py-2 px-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Rank</th>
            <th className={`py-2 px-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Username</th>
            <th className={`py-2 px-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Problems Solved</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((user) => (
            <tr key={user.userId} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
              <td className={`py-2 px-4 font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.rank}</td>
              <td className={`py-2 px-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.username}</td>
              <td className={`py-2 px-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.solvedCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {leaders.length === 0 && (
        <div className={`text-center mt-6 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>No data yet.</div>
      )}
    </div>
  );
}

export default LeaderboardPage;
