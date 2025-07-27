import express from 'express';
import { saveSubmission, getLastSubmission, getUserProblemVerdicts, getLeaderboard } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/save', saveSubmission);
router.get('/last', getLastSubmission);
router.get('/user-problem-verdicts', getUserProblemVerdicts);
router.get('/leaderboard', getLeaderboard);

export default router; 