import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  memory: {
    total: Number,
    used: Number,
    free: Number,
    percentage: String
  },
  cpu: {
    usage: String,
    cores: [String]
  }
});

metricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

export const Metric = mongoose.model('Metric', metricSchema);