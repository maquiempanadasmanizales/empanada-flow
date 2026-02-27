import React, { useMemo, useState } from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import { AppState } from '@/types/machine';
import { useMetrics } from '@/hooks/useMetrics';
import { useI18n } from '@/i18n/I18nProvider';

interface ProductionScreenProps {
  state: AppState;
  onAddProduction: (count: number) => void;
}

type RangeFilter = 'day' | 'week' | 'month';

const startOfDay = (date: Date): number => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
};

export const ProductionScreen: React.FC<ProductionScreenProps> = ({ state, onAddProduction }) => {
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('day');
  const {
    todayProduction,
    todayEarnings,
    last7DaysProduction,
    formatCurrency,
  } = useMetrics(state);
  const { t, intlLocale } = useI18n();

  const pulseData = useMemo(() => {
    const now = new Date();
    if (rangeFilter === 'day') {
      const currentHour = now.getHours();
      return Array.from({ length: currentHour + 1 }, (_, hour) => {
        const start = new Date(now);
        start.setHours(hour, 0, 0, 0);
        const end = new Date(now);
        end.setHours(hour + 1, 0, 0, 0);
        const count = state.productionEvents
          .filter(e => e.timestamp >= start.getTime() && e.timestamp < end.getTime())
          .reduce((sum, e) => sum + e.count, 0);
        return { label: hour.toString().padStart(2, '0'), count };
      });
    }

    const days = rangeFilter === 'week' ? 7 : 30;
    return Array.from({ length: days }, (_, index) => {
      const dayOffset = days - 1 - index;
      const day = new Date(now);
      day.setDate(day.getDate() - dayOffset);
      const start = startOfDay(day);
      const end = start + 24 * 60 * 60 * 1000;
      const count = state.productionEvents
        .filter(e => e.timestamp >= start && e.timestamp < end)
        .reduce((sum, e) => sum + e.count, 0);
      const label = day.toLocaleDateString(intlLocale, { month: 'short', day: 'numeric' });
      return { label, count };
    });
  }, [rangeFilter, state.productionEvents, intlLocale]);

  const maxPulse = Math.max(...pulseData.map(entry => entry.count), 0);
  const hasPulseData = maxPulse > 0;

  return (
    <div className="p-4 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('production.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('production.subtitle')}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{todayProduction.toLocaleString(intlLocale)}</p>
          <p className="text-xs text-muted-foreground">{t('production.todayLabel')}</p>
        </div>
      </div>

      <div className="metric-card">
        <div className="flex items-center justify-between">
          <span className="metric-label">{t('production.earningsToday')}</span>
          <span className="text-2xl font-bold text-foreground">{formatCurrency(todayEarnings)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t('production.profitPerEmpanada', { value: formatCurrency(state.profitPerEmpanada) })}
        </p>
      </div>

      {/* Manual increment buttons */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-muted-foreground" />
          <span className="metric-label">{t('production.manualEntry')}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onAddProduction(1)}
            className="increment-btn bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            +1
          </button>
          <button
            onClick={() => onAddProduction(10)}
            className="increment-btn bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            +10
          </button>
          <button
            onClick={() => onAddProduction(50)}
            className="increment-btn bg-primary text-primary-foreground hover:bg-primary/90"
          >
            +50
          </button>
        </div>
      </div>

      {/* Production pulse */}
      <div className="metric-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
            {(['day', 'week', 'month'] as RangeFilter[]).map((range) => {
              const labelKey = range === 'day'
                ? 'production.rangeDay'
                : range === 'week'
                  ? 'production.rangeWeek'
                  : 'production.rangeMonth';
              const isActive = rangeFilter === range;
              return (
                <button
                  key={range}
                  onClick={() => setRangeFilter(range)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
        {hasPulseData ? (
          <div className="flex items-end gap-1 h-24">
            {pulseData.map((entry, index) => {
              const height = maxPulse > 0 ? Math.max(6, (entry.count / maxPulse) * 96) : 6;
              return (
                <div key={`${entry.label}-${index}`} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-full bg-primary/80 shadow-sm animate-pulse"
                    style={{ height: `${height}px` }}
                    title={`${entry.label}: ${entry.count.toLocaleString(intlLocale)}`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">{t('production.noDataRange')}</p>
        )}
      </div>

      {/* Last 7 days */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-4">
          <span className="metric-label">{t('production.last7Days')}</span>
        </div>
        <div className="space-y-3">
          {last7DaysProduction.map(({ date, count }, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{date}</span>
              <span className="text-lg font-semibold text-foreground">{count.toLocaleString(intlLocale)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
