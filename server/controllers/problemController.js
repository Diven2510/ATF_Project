// controllers/problemController.js
import Problem from '../models/Problem.js';

export const createProblem = async (req, res) => {
  const { title, description, difficulty, tags, inputFormat, outputFormat, constraints, example, testCases } = req.body;

  console.log('Received problem data:', {
    title,
    description: description ? `${description.substring(0, 100)}...` : 'undefined',
    difficulty,
    tags,
    inputFormat: inputFormat ? `${inputFormat.substring(0, 50)}...` : 'undefined',
    outputFormat: outputFormat ? `${outputFormat.substring(0, 50)}...` : 'undefined',
    constraints: constraints ? `${constraints.substring(0, 50)}...` : 'undefined',
    example: example ? 'present' : 'undefined',
    testCases: testCases ? `${testCases.length} test cases` : 'undefined'
  });

  try {
    const problem = new Problem({ 
      title, 
      description, 
      difficulty, 
      tags, 
      inputFormat, 
      outputFormat, 
      constraints, 
      example,
      testCases 
    });

    console.log('Problem object created:', {
      _id: problem._id,
      title: problem.title,
      hasTestCases: problem.testCases && problem.testCases.length > 0
    });

    const savedProblem = await problem.save();
    console.log('Problem saved successfully:', {
      _id: savedProblem._id,
      title: savedProblem.title,
      testCasesCount: savedProblem.testCases ? savedProblem.testCases.length : 0
    });

    res.status(201).json({ 
      message: 'Problem created successfully',
      problemId: savedProblem._id,
      testCasesCount: savedProblem.testCases ? savedProblem.testCases.length : 0
    });
  } catch (err) {
    console.error('Error creating problem:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      keyValue: err.keyValue
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      details: err.name === 'ValidationError' ? Object.keys(err.errors) : null
    });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    console.log(`Retrieved ${problems.length} problems from database`);
    res.json(problems);
  } catch (err) {
    console.error('Error fetching problems:', err);
    res.status(500).json({ message: 'Fetch error', error: err.message });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      console.log(`Problem not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Problem not found' });
    }
    console.log(`Retrieved problem: ${problem.title} with ${problem.testCases ? problem.testCases.length : 0} test cases`);
    res.json(problem);
  } catch (err) {
    console.error('Error fetching problem by ID:', err);
    res.status(500).json({ message: 'Fetch error', error: err.message });
  }
};

export const updateProblem = async (req, res) => {
  const { id } = req.params;
  const { title, description, difficulty, tags, inputFormat, outputFormat, constraints, example, testCases } = req.body;

  console.log('Updating problem:', id);
  console.log('Update data:', {
    title,
    description: description ? `${description.substring(0, 100)}...` : 'undefined',
    difficulty,
    tags,
    inputFormat: inputFormat ? `${inputFormat.substring(0, 50)}...` : 'undefined',
    outputFormat: outputFormat ? `${outputFormat.substring(0, 50)}...` : 'undefined',
    constraints: constraints ? `${constraints.substring(0, 50)}...` : 'undefined',
    example: example ? 'present' : 'undefined',
    testCases: testCases ? `${testCases.length} test cases` : 'undefined'
  });

  try {
    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      { 
        title, 
        description, 
        difficulty, 
        tags, 
        inputFormat, 
        outputFormat, 
        constraints, 
        example,
        testCases 
      },
      { new: true, runValidators: true }
    );

    if (!updatedProblem) {
      console.log(`Problem not found for update with ID: ${id}`);
      return res.status(404).json({ message: 'Problem not found' });
    }

    console.log('Problem updated successfully:', {
      _id: updatedProblem._id,
      title: updatedProblem.title,
      testCasesCount: updatedProblem.testCases ? updatedProblem.testCases.length : 0
    });

    res.json({ 
      message: 'Problem updated successfully',
      problem: updatedProblem
    });
  } catch (err) {
    console.error('Error updating problem:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;

  console.log('Deleting problem:', id);

  try {
    const deletedProblem = await Problem.findByIdAndDelete(id);
    
    if (!deletedProblem) {
      console.log(`Problem not found for deletion with ID: ${id}`);
      return res.status(404).json({ message: 'Problem not found' });
    }

    console.log('Problem deleted successfully:', {
      _id: deletedProblem._id,
      title: deletedProblem.title
    });

    res.json({ 
      message: 'Problem deleted successfully',
      deletedProblem: {
        _id: deletedProblem._id,
        title: deletedProblem.title
      }
    });
  } catch (err) {
    console.error('Error deleting problem:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

