import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: String,
  tags: [String],
  inputFormat: String,
  outputFormat: String,
  constraints: String,
  example: {
    input: String,
    output: String,
    explanation: String
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    description: String
  }],
  // ...other fields
});

export default mongoose.model('Problem', ProblemSchema);
