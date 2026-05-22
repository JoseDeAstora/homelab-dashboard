import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './App.css';

interface Metrics {
  error?: string;
  os: { platform: string; distro: string; uptime: number; };
  memory: { total: number; used: number; free: number; percentage: string; };
  cpu: { usage: string; cores: string[]; };
  storage: { fs: string; size: number; used: number; use: number; }[];
  docker: { id: string; name: string; image: string; state: string; }[];
}

function App() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMetrics = await fetch('https://gentle-publicity-saint-feof.trycloudflare.com/api/metrics');
        const dataMetrics = await resMetrics.json();
        setMetrics(dataMetrics);

        const resHistory = await fetch('https://gentle-publicity-saint-feof.trycloudflare.com/api/history');
        const dataHistory = await resHistory.json();
        
        const formattedHistory = dataHistory.reverse().map((item: any) => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          cpu: parseFloat(item.cpu.usage),
          ram: parseFloat(item.memory.percentage)
        }));
        setHistory(formattedHistory);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Homelab Dashboard</h1>
      
      {!metrics ? (
        <p className="text-center">Conectando con el servidor...</p>
      ) : metrics.error ? (
        <p className="text-error">Error: {metrics.error}</p>
      ) : (
        <>
          <p className="dashboard-subtitle">
            {metrics.os?.distro} | Uptime: {formatUptime(metrics.os?.uptime || 0)}
          </p>

          <div className="card chart-section">
            <h2 className="card-header">Histórico de Carga (CPU y RAM)</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#a0a0a0" fontSize={12} />
                  <YAxis stroke="#a0a0a0" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="cpu" stroke="#60a5fa" strokeWidth={2} dot={false} name="CPU %" />
                  <Line type="monotone" dataKey="ram" stroke="#4ade80" strokeWidth={2} dot={false} name="RAM %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="metrics-grid">
            
            <div className="card">
              <h2 className="card-header">Memoria RAM</h2>
              <h3 className="metric-value-green">{metrics.memory?.percentage || '0.00'}%</h3>
              <div className="flex-between">
                <span>Total: {formatBytes(metrics.memory?.total || 0)}</span>
                <span>Libre: {formatBytes(metrics.memory?.free || 0)}</span>
              </div>
            </div>

            <div className="card">
              <h2 className="card-header">CPU General</h2>
              <h3 className="metric-value-blue">{metrics.cpu?.usage || '0.00'}%</h3>
              <div className="cores-grid">
                {metrics.cpu?.cores?.map((core, i) => (
                  <div key={i} className="core-item">
                    C{i}: {core}%
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="card-header">Almacenamiento</h2>
              <div className="storage-list">
                {metrics.storage?.map((disk, i) => (
                  <div key={i}>
                    <div className="storage-header">
                      <span className="font-bold">{disk.fs}</span>
                      <span>{disk.use.toFixed(2)}%</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${disk.use}%`, backgroundColor: disk.use > 80 ? '#f87171' : '#c084fc' }}
                      ></div>
                    </div>
                    <p className="storage-info">
                      {formatBytes(disk.used)} / {formatBytes(disk.size)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card docker-section">
              <h2 className="card-header">Contenedores Docker</h2>
              {!metrics.docker || metrics.docker.length === 0 ? (
                <p className="docker-empty">No hay contenedores corriendo en este nodo.</p>
              ) : (
                <div className="docker-grid">
                  {metrics.docker.map(container => (
                    <div key={container.id} className={`docker-item ${container.state === 'running' ? 'docker-item-running' : 'docker-item-stopped'}`}>
                      <p className="docker-name">{container.name}</p>
                      <p className="docker-image">{container.image}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default App;