import { useNavigate } from 'react-router-dom';

function ProblemCard({ problem, darkMode, verdict }) {
  const navigate = useNavigate();

  let borderColor = darkMode ? 'border-gray-600' : 'border-gray-300';
  let bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  let textColor = darkMode ? 'text-white' : 'text-black';

  if (verdict === 'AC') {
    borderColor = 'border-green-500';
    bgColor = 'bg-green-200';
    textColor = 'text-green-800';
  } else if (verdict === 'WA' || verdict === 'MLE' || verdict === 'TLE' || verdict === 'RTE' || verdict === 'CE') {
    borderColor = 'border-red-500';
    bgColor = 'bg-red-50';
    textColor = 'text-red-800';
  }

  return (
    <div
      className={`rounded-lg h-32 shadow hover:shadow-md transition-all border p-4 cursor-pointer ${bgColor} ${borderColor} ${textColor}`}
      onClick={() => navigate(`/dashboard/problem/${problem._id}`)}
    >
      <h2 className="font-semibold text-lg mb-1">{problem.title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Difficulty: {problem.difficulty}
      </p>
      {verdict && (
        <span className="text-xs font-bold mt-2 block">
          {verdict === 'AC' ? 'Accepted' : verdict}
        </span>
      )}
    </div>
  );
}

export default ProblemCard;