import { useParams, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import axios from 'axios';

function ProblemPage() {
  const { id } = useParams();
  const { darkMode } = useOutletContext();
  const [problem, setProblem] = useState(null);
  const [hint, setHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/problems/${id}`)
      .then(res => res.json())
      .then(data => setProblem(data))
      .catch(err => console.error(err));
  }, [id]);

  const handleGetHint = async () => {
    if (!problem?.description) return;
    setLoadingHint(true);
    setHint('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/hint`, { problem: problem.description });
      setHint(res.data.hint);
    } catch (err) {
      setHint('Failed to get hint.');
    }
    setLoadingHint(false);
  };

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      <div className={`md:w-1/2 p-6 rounded shadow ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}> 
        {problem ? (
          <>
            <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
            <p className="text-sm text-gray-500 mb-4">Difficulty: {problem.difficulty}</p>
            <p className="whitespace-pre-line">{problem.description}</p>
            {problem.inputFormat && (
              <>
                <h3 className="text-lg font-semibold mt-4">Input Format</h3>
                <div className="mb-2 whitespace-pre-line">{problem.inputFormat}</div>
              </>
            )}
            {problem.outputFormat && (
              <>
                <h3 className="text-lg font-semibold mt-4">Output Format</h3>
                <div className="mb-2 whitespace-pre-line">{problem.outputFormat}</div>
              </>
            )}
            {problem.constraints && (
              <>
                <h3 className="text-lg font-semibold mt-4">Constraints</h3>
                <div className="mb-2 whitespace-pre-line">{problem.constraints}</div>
              </>
            )}
            {problem.example && problem.example.input && (
              <>
                <h3 className="text-lg font-semibold mt-4">Sample 1:</h3>
                <div className="overflow-x-auto mb-2">
                  <table className="min-w-[300px] w-auto border border-gray-600 mb-2">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border">Input</th>
                        <th className="px-4 py-2 border">Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 border">
                          {typeof problem.example.input === 'object' 
                            ? JSON.stringify(problem.example.input, null, 2)
                            : problem.example.input
                          }
                        </td>
                        <td className="px-4 py-2 border">{problem.example.output}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h4 className="font-semibold mb-1">Explanation:</h4>
                <div className="mb-2 whitespace-pre-line">{problem.example.explanation}</div>
              </>
            )}
            <button onClick={handleGetHint} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" disabled={loadingHint}>
              {loadingHint ? 'Getting Hint...' : 'Get Hint'}
            </button>
            {hint && (
              <div className={`mt-4 p-2 rounded border border-purple-400 ${darkMode ? 'bg-gray-900 text-purple-200' : 'bg-purple-50 text-purple-900'}`}>
                <strong>Hint:</strong>
                <pre className="whitespace-pre-wrap break-words">{hint}</pre>
              </div>
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className={`md:w-1/2 p-4 rounded shadow ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <CodeEditor problemId={id} darkMode={darkMode} />
      </div>
    </div>
  );
}

export default ProblemPage;
