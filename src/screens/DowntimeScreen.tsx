import React, { useState } from 'react';
import { AlertTriangle, Clock, Play, Square } from 'lucide-react';
import { AppState, DowntimeEvent } from '@/types/machine';
import { useMetrics } from '@/hooks/useMetrics';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';

interface DowntimeScreenProps {
  state: AppState;
  activeDowntime: DowntimeEvent | null;
  onStartDowntime: (reason: string) => void;
  onEndDowntime: () => void;
}

export const DowntimeScreen: React.FC<DowntimeScreenProps> = ({
  state,
  activeDowntime,
  onStartDowntime,
  onEndDowntime,
}) => {
  const [reason, setReason] = useState('');
  const { todayDowntimeEvents, todayDowntimeFormatted, formatDuration } = useMetrics(state);

  const handleStartStop = () => {
    onStartDowntime(reason);
    setReason('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Downtime</h1>
          <p className="text-sm text-muted-foreground">Manage stops</p>
        </div>
        <StatusBadge status={state.machine.status} />
      </div>

      {/* Current status card */}
      <div className={`metric-card ${activeDowntime ? 'border-danger/50' : 'border-success/50'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="metric-label">Machine Status</span>
        </div>

        {activeDowntime ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-danger font-semibold mb-2">Machine is STOPPED</p>
              <p className="text-sm text-muted-foreground">
                Since {formatTime(activeDowntime.startTime)}
                {activeDowntime.reason && ` • ${activeDowntime.reason}`}
              </p>
            </div>
            <button onClick={onEndDowntime} className="action-btn-success flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              End Stop
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-secondary border-border"
            />
            <button onClick={handleStartStop} className="action-btn-danger flex items-center justify-center gap-2">
              <Square className="w-5 h-5" />
              Start Stop
            </button>
          </div>
        )}
      </div>

      {/* Today's summary */}
      <div className="metric-card">
        <div className="flex items-center justify-between">
          <span className="metric-label">Total Downtime Today</span>
          <span className="text-2xl font-bold text-danger">{todayDowntimeFormatted}</span>
        </div>
      </div>

      {/* Downtime events list */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          <span className="metric-label">Today's Events</span>
        </div>

        <div className="space-y-3">
          {todayDowntimeEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No stops today</p>
          ) : (
            todayDowntimeEvents.map((event) => {
              const duration = event.endTime 
                ? formatDuration(event.endTime - event.startTime)
                : 'Ongoing';
              
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatTime(event.startTime)}
                      {event.endTime && ` - ${formatTime(event.endTime)}`}
                    </p>
                    {event.reason && (
                      <p className="text-xs text-muted-foreground">{event.reason}</p>
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${event.endTime ? 'text-muted-foreground' : 'text-danger'}`}>
                    {duration}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
