import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  interest: {
    type: String,
    required: true,
    enum: ['programming', 'math', 'science', 'language']
  },
  members: {
    type: Number,
    default: 1
  },
  lastActive: {
    type: String,
    default: 'Just now'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Group || mongoose.model('Group', groupSchema);