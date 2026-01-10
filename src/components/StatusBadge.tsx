import React from 'react';

interface StatusBadgeProps {
  status: 'RUNNING' | 'STOPPED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isRunning = status === 'RUNNING';
  
  return (
    <div className={`status-badge ${isRunning ? 'status-running' : 'status-stopped'}`}>
      <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-success animate-pulse-glow' : 'bg-danger'}`} />
      <span>{status}</span>
    </div>
  );
};
