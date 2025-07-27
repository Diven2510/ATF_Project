import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import User from '../models/User.js'; // Add this import at the top

// Save or update the latest code for a user/problem/language
export const saveSubmission = async (req, res) => {
  let { userId, problemId, code, language, status, verdict } = req.body;
  if (!userId || !problemId || !code || !language) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    userId = new mongoose.Types.ObjectId(userId);
    problemId = new mongoose.Types.ObjectId(problemId);
    const update = { code, submittedAt: new Date() };
    if (status) update.status = status;
    if (verdict) update.verdict = verdict;
    const submission = await Submission.findOneAndUpdate(
      { userId, problemId, language },
      update,
      { new: true, upsert: true }
    );
    res.status(200).json({ message: 'Submission saved', submission });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get the latest code for a user/problem/language
export const getLastSubmission = async (req, res) => {
  const { userId, problemId, language } = req.query;
  if (!userId || !problemId || !language) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const submission = await Submission.findOne({ userId, problemId, language }).sort({ submittedAt: -1 });
    if (!submission) {
      return res.status(404).json({ message: 'No submission found' });
    }
    res.status(200).json({ code: submission.code });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getUserProblemVerdicts = async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });
  try {
    const submissions = await Submission.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { submittedAt: -1 } },
      {
        $group: {
          _id: '$problemId',
          verdict: { $first: '$verdict' }
        }
      }
    ]);
    const verdicts = {};
    submissions.forEach(sub => {
      verdicts[sub._id.toString()] = sub.verdict;
    });
    res.json(verdicts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    // Only count AC (Accepted) verdicts, and only one per problem per user
    const solved = await Submission.aggregate([
      { $match: { verdict: 'AC' } },
      { $group: { _id: { userId: '$userId', problemId: '$problemId' } } },
      { $group: { _id: '$_id.userId', solvedCount: { $sum: 1 } } },
      { $sort: { solvedCount: -1 } },
      { $limit: 10 }
    ]);
    // Get usernames for the userIds
    const userIds = solved.map(s => s._id);
    const users = await User.find({ _id: { $in: userIds } }).select('username');
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u.username; });
    const leaderboard = solved.map((s, i) => ({
      rank: i + 1,
      userId: s._id,
      username: userMap[s._id.toString()] || 'Unknown',
      solvedCount: s.solvedCount
    }));
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 