import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    tags: '',
  });
  const [message, setMessage] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [example, setExample] = useState({ input: '', output: '', explanation: '' });
  const [testCases, setTestCases] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [problems, setProblems] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);

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

  // Fetch problems on mount and after create/update/delete
  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/problems/all`);
    setProblems(res.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutoGenerate = async () => {
    if (!formData.description.trim()) {
      setMessage('❌ Please enter a problem description first');
      return;
    }

    try {
      console.log('Sending description to AI:', formData.description);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate-metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: formData.description })
      });
      
      console.log('AI response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('AI API error:', errorText);
        setMessage(`❌ AI API error: ${res.status} - ${errorText}`);
        return;
      }
      
      const data = await res.json();
      console.log('AI response data:', data);
      
      if (data.error) {
        console.error('AI returned error:', data.error);
        setMessage(`❌ AI Error: ${data.error}`);
        return;
      }
      
      setInputFormat(data.inputFormat || '');
      setOutputFormat(data.outputFormat || '');
      setConstraints(
        Array.isArray(data.constraints)
          ? data.constraints.join('\n')
          : data.constraints || ''
      );
      setExample(data.example || { input: '', output: '', explanation: '' });
      setTestCases(data.testCases || []);
      
      console.log('Set inputFormat:', data.inputFormat);
      console.log('Set outputFormat:', data.outputFormat);
      console.log('Set constraints:', data.constraints);
      console.log('Set example:', data.example);
      console.log('Set testCases count:', data.testCases ? data.testCases.length : 0);
      
      setMessage('✅ AI metadata and test cases generated successfully!');
    } catch (err) {
      console.error('Error in handleAutoGenerate:', err);
      setMessage(`❌ Failed to generate metadata: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Submitting problem with data:', {
      formData,
      inputFormat,
      outputFormat,
      constraints,
      example,
      testCases
    });
    
    const payload = {
      ...formData,
      inputFormat,
      outputFormat,
      constraints,
      example,
      testCases,
      tags: formData.tags.split(',').map(tag => tag.trim())
    };

    console.log('Final payload:', payload);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/problems/create`, payload);
      console.log('Problem creation response:', response.data);
      setMessage('✅ Problem created!');
      setFormData({ title: '', description: '', difficulty: 'Easy', tags: '' });
      setInputFormat('');
      setOutputFormat('');
      setConstraints('');
      setExample({ input: '', output: '', explanation: '' });
      setTestCases([]);
      fetchProblems(); // Refresh problems after creation
    } catch (err) {
      console.error('Error creating problem:', err);
      console.error('Error response:', err.response?.data);
      setMessage(`❌ Failed to create problem: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags.join(', ')
    });
    setInputFormat(problem.inputFormat || '');
    setOutputFormat(problem.outputFormat || '');
    setConstraints(problem.constraints || '');
    setExample(problem.example || { input: '', output: '', explanation: '' });
    setTestCases(problem.testCases || []);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProblem) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/problems/${editingProblem._id}`, {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()),
        inputFormat, outputFormat, constraints, example, testCases
      });
      setEditingProblem(null);
      setFormData({ title: '', description: '', difficulty: 'Easy', tags: '' });
      setInputFormat('');
      setOutputFormat('');
      setConstraints('');
      setExample({ input: '', output: '', explanation: '' });
      setTestCases([]);
      fetchProblems(); // Refresh problems after update
      setMessage('✅ Problem updated!');
    } catch (err) {
      console.error('Error updating problem:', err);
      console.error('Error response:', err.response?.data);
      setMessage(`❌ Failed to update problem: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this problem?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/problems/${id}`);
        fetchProblems();
        setMessage('✅ Problem deleted!');
      } catch (err) {
        console.error('Error deleting problem:', err);
        console.error('Error response:', err.response?.data);
        setMessage(`❌ Failed to delete problem: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-gradient-to-br ${darkMode ? 'from-gray-900 to-gray-800' : 'from-blue-100 via-white to-blue-200'}`}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🛠️ Admin Dashboard
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Create and manage coding problems
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              } shadow-lg`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('isAdmin');
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg shadow-lg ${
            message.includes('✅') 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Form Card */}
        <div className={`rounded-xl shadow-2xl p-8 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {editingProblem ? 'Edit Problem' : 'Create New Problem'}
          </h2>
          
          <form onSubmit={editingProblem ? handleUpdate : handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Problem Title
              </label>
              <input
                name="title"
                placeholder="Enter problem title..."
                value={formData.title}
                onChange={handleChange}
                required
                className={`w-full p-3 border rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Problem Description
              </label>
              <textarea
                name="description"
                placeholder="Describe the problem in detail..."
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className={`w-full p-3 border rounded-lg transition-colors resize-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Difficulty and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  placeholder="e.g., arrays, strings, dynamic-programming"
                  value={formData.tags}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>

            {/* Hidden AI-generated fields */}
            <textarea
              name="inputFormat"
              placeholder="Input Format"
              value={inputFormat}
              onChange={e => setInputFormat(e.target.value)}
              className="hidden"
            />
            <textarea
              name="outputFormat"
              placeholder="Output Format"
              value={outputFormat}
              onChange={e => setOutputFormat(e.target.value)}
              className="hidden"
            />
            <textarea
              name="constraints"
              placeholder="Constraints"
              value={constraints}
              onChange={e => setConstraints(e.target.value)}
              className="hidden"
            />
            <input type="hidden" name="exampleInput" value={example.input} />
            <input type="hidden" name="exampleOutput" value={example.output} />
            <input type="hidden" name="exampleExplanation" value={example.explanation} />
            <input type="hidden" name="testCases" value={JSON.stringify(testCases)} />

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleAutoGenerate}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg font-medium"
              >
                🤖 Auto-generate Metadata
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg font-medium"
              >
                {editingProblem ? '✨ Update Problem' : '✨ Create Problem'}
              </button>
            </div>
          </form>
        </div>

        {/* Manage Problems Section */}
        <div className={`mt-12 rounded-xl shadow-2xl p-8 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Manage Problems
          </h2>
          <div className="space-y-4">
            {problems.map(problem => (
              <div key={problem._id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{problem.title}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{problem.description}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Difficulty: {problem.difficulty}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tags: {problem.tags.join(', ')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(problem)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(problem._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
