import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  name: String,
  startTime: Date,
  endTime: Date,
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model('Contest', contestSchema);
