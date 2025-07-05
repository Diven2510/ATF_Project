import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
  code: String,
  language: String,
  verdict: {
    type: String,
    enum: ['AC', 'WA', 'TLE', 'MLE', 'RTE', 'CE']
  },
  score: Number,
  time: Number,
  memory: Number,
  status: { type: String, enum: ['Pending', 'Running', 'Evaluated'], default: 'Pending' },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Submission', submissionSchema);
