import { useEffect, useState } from 'react';
import './App.css';

interface Metrics {
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: string;
  };
  cpu: {
    uptime: number;
    loadAvg: number[];
  };
}

function App() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1>Homelab Dashboard</h1>
      {!metrics ? (
        <p>Conectando con el servidor...</p>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <div style={{ border: '1px solid #555', padding: '1rem', borderRadius: '8px' }}>
            <h2>Memoria RAM</h2>
            <h3 style={{ color: '#646cff' }}>{metrics.memory.percentage}%</h3>
            <p>Total: {(metrics.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB</p>
            <p>Libre: {(metrics.memory.free / 1024 / 1024 / 1024).toFixed(2)} GB</p>
          </div>
          <div style={{ border: '1px solid #555', padding: '1rem', borderRadius: '8px' }}>
            <h2>CPU</h2>
            <h3 style={{ color: '#646cff' }}>Uptime</h3>
            <p>{(metrics.cpu.uptime / 3600).toFixed(2)} horas</p>
            <p>Carga: {metrics.cpu.loadAvg[0].toFixed(2)}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;