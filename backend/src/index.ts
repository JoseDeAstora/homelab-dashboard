import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import os from 'os';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/api/metrics', (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercentage = ((usedMem / totalMem) * 100).toFixed(2);

  res.json({
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      percentage: memUsagePercentage
    },
    cpu: {
      uptime: os.uptime(),
      loadAvg: os.loadavg()
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});