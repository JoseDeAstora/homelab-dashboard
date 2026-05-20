import { useEffect, useState } from 'react';
import './App.css';

interface Metrics {
  error?: string;
  os: {
    platform: string;
    distro: string;
    uptime: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: string;
  };
  cpu: {
    usage: string;
    cores: string[];
  };
  storage: {
    fs: string;
    size: number;
    used: number;
    use: number;
  }[];
  docker: {
    id: string;
    name: string;
    image: string;
    state: string;
  }[];
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
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', margin: '-2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#ffffff' }}>Homelab Dashboard</h1>
      
      {!metrics ? (
        <p style={{ textAlign: 'center' }}>Conectando con el servidor...</p>
      ) : metrics.error ? (
        <p style={{ textAlign: 'center', color: '#f87171' }}>Error: {metrics.error}</p>
      ) : (
        <>
          <p style={{ textAlign: 'center', color: '#a0a0a0', marginBottom: '2rem' }}>
            {metrics.os?.distro} | Uptime: {formatUptime(metrics.os?.uptime || 0)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            
            <div style={{ backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
              <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginTop: 0 }}>Memoria RAM</h2>
              <h3 style={{ fontSize: '2.5rem', margin: '1rem 0', color: '#4ade80' }}>{metrics.memory?.percentage || '0.00'}%</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a0a0a0' }}>
                <span>Total: {formatBytes(metrics.memory?.total || 0)}</span>
                <span>Libre: {formatBytes(metrics.memory?.free || 0)}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
              <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginTop: 0 }}>CPU General</h2>
              <h3 style={{ fontSize: '2.5rem', margin: '1rem 0', color: '#60a5fa' }}>{metrics.cpu?.usage || '0.00'}%</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {metrics.cpu?.cores?.map((core, i) => (
                  <div key={i} style={{ backgroundColor: '#2d2d2d', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', fontSize: '0.875rem' }}>
                    C{i}: {core}%
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
              <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginTop: 0 }}>Almacenamiento</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {metrics.storage?.map((disk, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{disk.fs}</span>
                      <span>{disk.use.toFixed(2)}%</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#2d2d2d', borderRadius: '4px', height: '8px' }}>
                      <div style={{ width: `${disk.use}%`, backgroundColor: disk.use > 80 ? '#f87171' : '#c084fc', height: '100%', borderRadius: '4px' }}></div>
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#a0a0a0', textAlign: 'right' }}>
                      {formatBytes(disk.used)} / {formatBytes(disk.size)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', gridColumn: '1 / -1' }}>
              <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginTop: 0 }}>Contenedores Docker</h2>
              {!metrics.docker || metrics.docker.length === 0 ? (
                <p style={{ color: '#a0a0a0', marginTop: '1rem' }}>No hay contenedores corriendo en este nodo.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {metrics.docker.map(container => (
                    <div key={container.id} style={{ backgroundColor: '#2d2d2d', padding: '1rem', borderRadius: '8px', borderLeft: container.state === 'running' ? '4px solid #4ade80' : '4px solid #f87171' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{container.name}</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#a0a0a0' }}>{container.image}</p>
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