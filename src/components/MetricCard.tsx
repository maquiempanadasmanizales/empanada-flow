import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, highlight }) => {
  return (
    <div className={`metric-card ${highlight ? 'glow-primary border-primary/50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="metric-label">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="metric-value">{value}</div>
    </div>
  );
};
