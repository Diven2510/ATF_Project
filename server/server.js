import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import problemRoutes from './routes/problemRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Online Judge Backend'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/submissions', submissionRoutes);
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(' MongoDB connected');
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch((err) => console.error(' MongoDB connection error:', err));
