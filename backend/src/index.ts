import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import si from 'systeminformation';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/metrics', async (req, res) => {
  try {
    const mem = await si.mem();
    const currentLoad = await si.currentLoad();
    const osInfo = await si.osInfo();
    const time = si.time();
    const fsSize = await si.fsSize();
    
    let dockerData: { id: string; name: string; image: string; state: string }[] = [];
    try {
      const docker = await si.dockerContainers();
      dockerData = docker.map(container => ({
        id: container.id,
        name: container.name,
        image: container.image,
        state: container.state
      }));
    } catch (e) {}

    const memUsagePercentage = ((mem.active / mem.total) * 100).toFixed(2);

    res.json({
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        uptime: time.uptime
      },
      memory: {
        total: mem.total,
        used: mem.active,
        free: mem.available,
        percentage: memUsagePercentage
      },
      cpu: {
        usage: currentLoad.currentLoad ? currentLoad.currentLoad.toFixed(2) : "0.00",
        cores: currentLoad.cpus ? currentLoad.cpus.map(c => c.load.toFixed(2)) : []
      },
      storage: fsSize.map(disk => ({
        fs: disk.fs,
        size: disk.size,
        used: disk.used,
        use: disk.use
      })),
      docker: dockerData
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor leyendo metricas' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});