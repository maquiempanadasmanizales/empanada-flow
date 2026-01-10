import React from 'react';
import { useI18n } from '@/i18n/I18nProvider';

interface StatusBadgeProps {
  status: 'RUNNING' | 'STOPPED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useI18n();
  const isRunning = status === 'RUNNING';
  
  return (
    <div className={`status-badge ${isRunning ? 'status-running' : 'status-stopped'}`}>
      <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-success animate-pulse-glow' : 'bg-danger'}`} />
      <span>{isRunning ? t('status.running') : t('status.stopped')}</span>
    </div>
  );
};
