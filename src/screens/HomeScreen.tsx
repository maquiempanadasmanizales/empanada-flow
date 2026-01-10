import React from 'react';
import { Package, Clock, AlertTriangle, Settings } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge } from '@/components/StatusBadge';
import { AppState } from '@/types/machine';
import { useMetrics } from '@/hooks/useMetrics';
import { Switch } from '@/components/ui/switch';

interface HomeScreenProps {
  state: AppState;
  onToggleDemoMode: () => void;
  onResetData: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ state, onToggleDemoMode, onResetData }) => {
  const { todayProduction, todayOperatingTimeFormatted, todayDowntimeFormatted } = useMetrics(state);

  const lastUpdatedTime = new Date(state.lastUpdated).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="p-4 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Production Pulse</h1>
          <p className="text-sm text-muted-foreground">{state.machine.model}</p>
        </div>
        <StatusBadge status={state.machine.status} />
      </div>

      {/* Main metrics */}
      <div className="space-y-4">
        <MetricCard
          label="Empanadas Today"
          value={todayProduction.toLocaleString()}
          icon={<Package className="w-5 h-5" />}
          highlight
        />

        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            label="Operating Time"
            value={todayOperatingTimeFormatted}
            icon={<Clock className="w-4 h-4" />}
          />
          <MetricCard
            label="Downtime"
            value={todayDowntimeFormatted}
            icon={<AlertTriangle className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Machine info card */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="metric-label">Machine Info</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Serial</span>
            <span className="font-mono text-foreground">{state.machine.serial}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model</span>
            <span className="text-foreground">{state.machine.model}</span>
          </div>
        </div>
      </div>

      {/* Demo controls */}
      <div className="metric-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-foreground">Demo Mode</p>
            <p className="text-xs text-muted-foreground">Auto-generate production data</p>
          </div>
          <Switch checked={state.demoMode} onCheckedChange={onToggleDemoMode} />
        </div>
        <button
          onClick={onResetData}
          className="w-full py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
        >
          Reset Demo Data
        </button>
      </div>

      {/* Last updated */}
      <p className="text-center text-xs text-muted-foreground">
        Last updated: {lastUpdatedTime}
      </p>
    </div>
  );
};
