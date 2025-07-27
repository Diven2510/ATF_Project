import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const BOILERPLATES = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}`,
  python: `# Write your code here\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // your code goes here\n    }\n}`
};

function CodeEditor({ problemId, darkMode }) {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(BOILERPLATES['cpp']);
  const [output, setOutput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [fileInputRef] = useState(useRef(null));
  const [submissionResults, setSubmissionResults] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    // Fetch problem details to get test cases
    fetch(`http://localhost:5000/api/problems/${problemId}`)
      .then(res => res.json())
      .then(data => setProblem(data))
      .catch(err => console.error(err));

    // Fetch last submission for this user/problem/language
    const userId = localStorage.getItem('userId');
    if (userId) {
      axios.get('http://localhost:5000/api/submissions/last', {
        params: { userId, problemId, language }
      })
        .then(res => {
          if (res.data.code) setCode(res.data.code);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line
  }, [problemId, language]);

  const saveUserSubmission = async (codeToSave, status, verdict) => {
    console.log('saveUserSubmission called', { codeToSave, status, verdict });
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.log('No userId in localStorage');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/submissions/save', {
        userId,
        problemId,
        code: codeToSave,
        language,
        status,
        verdict
      });
    } catch (err) {
      // Ignore errors for now
    }
  };

  const runCode = async () => {
    try {
      const res = await axios.post('http://56.228.22.181:7000/run', {
        language,
        code,
        problemId,
        input: customInput
      });
      setOutput(res.data.output);
      saveUserSubmission(code, "Pending", null); // status: Pending, verdict: null
    } catch (err) {
      console.error(err);
      setOutput('Error running code');
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    if (code === BOILERPLATES[language] || code === '// write your code here') {
      setCode(BOILERPLATES[newLang]);
    }
    setLanguage(newLang);
  };

  const handleExplain = async () => {
    setLoadingExplain(true);
    setExplanation('');
    try {
      const res = await axios.post('http://localhost:5000/api/ai/explain', { code });
      setExplanation(res.data.explanation);
    } catch (err) {
      setExplanation('Failed to get explanation.');
    }
    setLoadingExplain(false);
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setCode(content);
        
        // Auto-detect language based on file extension
        const extension = file.name.split('.').pop().toLowerCase();
        if (extension === 'cpp' || extension === 'cc' || extension === 'cxx') {
          setLanguage('cpp');
        } else if (extension === 'py') {
          setLanguage('python');
        } else if (extension === 'java') {
          setLanguage('java');
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!problem || !problem.testCases || problem.testCases.length === 0) {
      setOutput('No test cases available for this problem.');
      return;
    }

    setLoadingSubmit(true);
    setSubmissionResults(null);
    setOutput('');

    try {
      const res = await axios.post('http://56.228.22.181:7000/submit', {
        language,
        code,
        testCases: problem.testCases
      });

      setSubmissionResults(res.data);
      setOutput(`Verdict: ${res.data.verdict}\nPassed: ${res.data.passedTests}/${res.data.totalTests} test cases`);
      // Save as Evaluated, verdict: AC if all passed, else WA
      const verdict = res.data.verdict === "Accepted" ? "AC" : "WA";
      saveUserSubmission(code, "Evaluated", verdict);
    } catch (err) {
      console.error(err);
      setOutput('Error during submission');
    }
    setLoadingSubmit(false);
  };

  // Map language names to Monaco editor language IDs
  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'cpp': return 'cpp';
      case 'python': return 'python';
      case 'java': return 'java';
      default: return 'cpp';
    }
  };

  return (
    <div className="space-y-4">
      <select 
        value={language} 
        onChange={handleLanguageChange} 
        className={`p-2 rounded border transition-colors ${
          darkMode 
            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
      >
        <option value="cpp" className={darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>C++</option>
        <option value="python" className={darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Python</option>
        <option value="java" className={darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Java</option>
      </select>
      
      {/* Monaco Editor */}
      <div className="border rounded overflow-hidden" style={{ height: '500px' }}>
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          theme={darkMode ? 'vs-dark' : 'light'}
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 18,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            selectOnLineNumbers: true,
            renderLineHighlight: 'all',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            }
          }}
        />
      </div>

      {/* Custom Input Section */}
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Custom Input:
        </label>
        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Enter your custom input here..."
          rows={3}
          className={`w-full p-3 border rounded-lg transition-colors resize-none ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        />
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".cpp,.cc,.cxx,.py,.java,.txt"
        style={{ display: 'none' }}
      />

      <div className="flex gap-2">
        <button onClick={runCode} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          ▶️ Run Code
        </button>
        <button 
          onClick={handleSubmit} 
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          disabled={loadingSubmit}
        >
          {loadingSubmit ? 'Submitting...' : '📤 Submit'}
        </button>
        <button onClick={triggerFileInput} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          📁 Import
        </button>
        <button onClick={handleExplain} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={loadingExplain}>
          {loadingExplain ? 'Explaining...' : 'Explain Code'}
        </button>
      </div>
      
      <div className={`p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}>
        <strong>Output:</strong>
        <pre>{output}</pre>
      </div>

      {/* Test Case Results */}
      {submissionResults && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Test Case Results
          </h3>
          <div className={`mb-3 p-3 rounded ${submissionResults.verdict === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <strong>Verdict:</strong> {submissionResults.verdict} ({submissionResults.passedTests}/{submissionResults.totalTests} passed)
          </div>
          <div className="space-y-3">
            {submissionResults.results
              .slice() // copy array
              .sort((a, b) => a.testCase - b.testCase)
              .map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} ${darkMode ? 'text-gray-900 font-semibold' : 'text-gray-800'}`}
                  style={darkMode ? { backgroundColor: '#1f2937', color: '#fff', borderColor: result.passed ? '#bbf7d0' : '#fecaca' } : {}}
                >
                  <span className="font-semibold">Test Case {result.testCase}</span>
                  <span className={`px-2 py-1 rounded text-sm font-bold ${result.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{result.passed ? 'PASSED' : 'FAILED'}</span>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {explanation && (
        <div className={`p-2 rounded border border-green-400 ${darkMode ? 'bg-gray-900 text-green-200' : 'bg-green-50 text-green-900'}`}>
          <strong>Explanation:</strong>
          <pre className="whitespace-pre-wrap break-words">{explanation}</pre>
        </div>
      )}
    </div>
  );
}

export default CodeEditor;
