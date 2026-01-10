import React, { useState } from 'react';
import { User, Play, Square, Clock, Package } from 'lucide-react';
import { AppState, OperatorSession } from '@/types/machine';
import { useMetrics } from '@/hooks/useMetrics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OperatorScreenProps {
  state: AppState;
  activeSession: OperatorSession | null;
  onStartSession: (operatorId: string) => void;
  onEndSession: () => void;
}

export const OperatorScreen: React.FC<OperatorScreenProps> = ({
  state,
  activeSession,
  onStartSession,
  onEndSession,
}) => {
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const { productionByOperator } = useMetrics(state);

  const activeOperator = activeSession
    ? state.operators.find(op => op.id === activeSession.operatorId)
    : null;

  const handleStartSession = () => {
    if (selectedOperator) {
      onStartSession(selectedOperator);
      setSelectedOperator('');
    }
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
          <h1 className="text-2xl font-bold text-foreground">Operator</h1>
          <p className="text-sm text-muted-foreground">Manage sessions</p>
        </div>
        {activeOperator && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-sm font-medium text-success">{activeOperator.name}</span>
          </div>
        )}
      </div>

      {/* Session control */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="metric-label">Current Session</span>
        </div>

        {activeSession ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-lg font-semibold text-foreground mb-2">{activeOperator?.name}</p>
              <p className="text-sm text-muted-foreground">
                Started at {formatTime(activeSession.startTime)}
              </p>
            </div>
            <button onClick={onEndSession} className="action-btn-danger flex items-center justify-center gap-2">
              <Square className="w-5 h-5" />
              End Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Select value={selectedOperator} onValueChange={setSelectedOperator}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {state.operators.map((op) => (
                  <SelectItem key={op.id} value={op.id}>
                    {op.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={handleStartSession}
              disabled={!selectedOperator}
              className="action-btn-success flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              Start Session
            </button>
          </div>
        )}
      </div>

      {/* Operator stats */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-4">
          <span className="metric-label">Today's Performance</span>
        </div>

        <div className="space-y-4">
          {productionByOperator.map(({ operator, production, time, timeMs }) => (
            <div
              key={operator.id}
              className={`p-4 rounded-lg transition-colors ${
                activeSession?.operatorId === operator.id
                  ? 'bg-primary/20 border border-primary/30'
                  : 'bg-secondary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">{operator.name}</span>
                {activeSession?.operatorId === operator.id && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                    Active
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-lg font-bold text-foreground">{production}</p>
                    <p className="text-xs text-muted-foreground">Empanadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-bold text-foreground">{timeMs > 0 ? time : '0m'}</p>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
