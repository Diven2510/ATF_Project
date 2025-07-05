import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  tags: [String],
  type: { type: String, enum: ['rated', 'practice', 'contest'], default: 'practice' },
  points: Number,
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
  testCases: [testCaseSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Problem', problemSchema);
