const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

const BOILERPLATES = {
  cpp: {
    ext: 'cpp',
    compile: (filename) => `g++ ${filename} -o ${filename}.out`,
    run: (filename) => `${filename}.out`
  },
  python: {
    ext: 'py',
    run: (filename) => `python3 ${filename}`
  },
  java: {
    ext: 'java',
    compile: (filename) => `javac ${filename}`,
    run: (filename) => `java -cp ${path.dirname(filename)} Main`
  }
};

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    languages: Object.keys(BOILERPLATES)
  });
});

app.post('/run', async (req, res) => {
  const { language, code, input = '' } = req.body;
  if (!BOILERPLATES[language]) return res.status(400).json({ output: 'Unsupported language' });

  const ext = BOILERPLATES[language].ext;
  const filename = path.join(TMP_DIR, `Main_${Date.now()}.${ext}`);
  fs.writeFileSync(filename, code);

  const compileCmd = BOILERPLATES[language].compile ? BOILERPLATES[language].compile(filename) : null;
  const runCmd = BOILERPLATES[language].run(filename);

  // Updated runProcess to use spawn and handle input
  const runProcess = (cmd, input, cb) => {
    const [program, ...args] = cmd.split(' ');
    const child = spawn(program, args, {
      cwd: TMP_DIR,
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'] // Enable piping for stdin
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0 && stderr) {
        cb(new Error(stderr), null, stderr);
      } else {
        cb(null, stdout, stderr);
      }
    });

    child.on('error', (err) => {
      cb(err, null, err.message);
    });

    // Send input to the program
    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end(); // End stdin to signal no more input
  };

  if (compileCmd) {
    const [compileProgram, ...compileArgs] = compileCmd.split(' ');
    const compileProcess = spawn(compileProgram, compileArgs, { cwd: TMP_DIR });

    compileProcess.on('close', (code) => {
      if (code !== 0) {
        return res.json({ output: 'Compilation error' });
      }

      runProcess(runCmd, input, (err, stdout, stderr) => { // Pass input here
        res.json({ output: err ? stderr || err.message : stdout });
        // Clean up files
        fs.rmSync(filename, { force: true });
        if (language === 'cpp') fs.rmSync(`${filename}.out`, { force: true });
        if (language === 'java') {
          fs.rmSync(filename.replace('.java', '.class'), { force: true });
        }
      });
    });
  } else {
    runProcess(runCmd, input, (err, stdout, stderr) => { // Pass input here
      res.json({ output: err ? stderr || err.message : stdout });
      fs.rmSync(filename, { force: true });
    });
  }
});

// New endpoint for submissions with test case evaluation
app.post('/submit', async (req, res) => {
  const { language, code, testCases } = req.body;
  if (!BOILERPLATES[language]) return res.status(400).json({ output: 'Unsupported language' });

  const ext = BOILERPLATES[language].ext;
  const filename = path.join(TMP_DIR, `Main_${Date.now()}.${ext}`);
  fs.writeFileSync(filename, code);

  const compileCmd = BOILERPLATES[language].compile ? BOILERPLATES[language].compile(filename) : null;
  const runCmd = BOILERPLATES[language].run(filename);

  const runProcess = (cmd, input, cb) => {
    const [program, ...args] = cmd.split(' ');
    const child = spawn(program, args, {
      cwd: TMP_DIR,
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0 && stderr) {
        cb(new Error(stderr), null, stderr);
      } else {
        cb(null, stdout.trim(), stderr);
      }
    });

    child.on('error', (err) => {
      cb(err, null, err.message);
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  };

  const results = [];
  let passedTests = 0;
  let totalTests = testCases.length;

  const runTestCases = async () => {
    if (compileCmd) {
      const [compileProgram, ...compileArgs] = compileCmd.split(' ');
      const compileProcess = spawn(compileProgram, compileArgs, { cwd: TMP_DIR });

      compileProcess.on('close', (code) => {
        if (code !== 0) {
          res.json({
            verdict: 'Compilation Error',
            results: [],
            passedTests: 0,
            totalTests: 0
          });
          return;
        }

        // Run all test cases
        testCases.forEach((testCase, index) => {
          runProcess(runCmd, testCase.input, (err, stdout, stderr) => {
            const expectedOutput = testCase.expectedOutput.trim();
            const actualOutput = stdout.trim();
            const passed = actualOutput === expectedOutput;

            if (passed) passedTests++;

            results.push({
              testCase: index + 1,
              input: testCase.input,
              expectedOutput: expectedOutput,
              actualOutput: actualOutput,
              passed: passed,
              error: err ? stderr || err.message : null
            });

            // Check if all test cases are processed
            if (results.length === totalTests) {
              const verdict = passedTests === totalTests ? 'Accepted' : 'Wrong Answer';
              res.json({
                verdict: verdict,
                results: results,
                passedTests: passedTests,
                totalTests: totalTests
              });

              // Clean up files
              fs.rmSync(filename, { force: true });
              if (language === 'cpp') fs.rmSync(`${filename}.out`, { force: true });
              if (language === 'java') {
                fs.rmSync(filename.replace('.java', '.class'), { force: true });
              }
            }
          });
        });
      });
    } else {
      // For interpreted languages like Python
      testCases.forEach((testCase, index) => {
        runProcess(runCmd, testCase.input, (err, stdout, stderr) => {
          const expectedOutput = testCase.expectedOutput.trim();
          const actualOutput = stdout.trim();
          const passed = actualOutput === expectedOutput;

          if (passed) passedTests++;

          results.push({
            testCase: index + 1,
            input: testCase.input,
            expectedOutput: expectedOutput,
            actualOutput: actualOutput,
            passed: passed,
            error: err ? stderr || err.message : null
          });

          // Check if all test cases are processed
          if (results.length === totalTests) {
            const verdict = passedTests === totalTests ? 'Accepted' : 'Wrong Answer';
            res.json({
              verdict: verdict,
              results: results,
              passedTests: passedTests,
              totalTests: totalTests
            });

            // Clean up files
            fs.rmSync(filename, { force: true });
          }
        });
      });
    }
  };

  runTestCases();
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Compiler server running on port ${PORT}`);
});