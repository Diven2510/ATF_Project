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
    input: mongoose.Schema.Types.Mixed, // Allow both string and object
    output: String,
    explanation: String
  },
  testCases: [{
    input: mongoose.Schema.Types.Mixed, // Allow both string and object
    expectedOutput: String,
    description: String
  }],
  // ...other fields
});

export default mongoose.model('Problem', ProblemSchema);
