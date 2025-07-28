import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import ProblemCard from '../components/Dashboard/ProblemCard';

function HomePage() {
  const { darkMode } = useOutletContext();
  const [problems, setProblems] = useState([]);
  const [verdicts, setVerdicts] = useState({});

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/problems/all`)
      .then(res => setProblems(res.data))
      .catch(err => console.error('Fetch error:', err));
    const userId = localStorage.getItem('userId');
    if (userId) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/submissions/user-problem-verdicts`, { params: { userId } })
        .then(res => setVerdicts(res.data))
        .catch(() => {});
    }
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {problems.map((problem) => (
        <ProblemCard
          key={problem._id}
          problem={problem}
          darkMode={darkMode}
          verdict={verdicts[problem._id]}
        />
      ))}
    </div>
  );
}
export default HomePage;