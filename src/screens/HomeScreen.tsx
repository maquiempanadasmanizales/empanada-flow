import React, { useMemo, useState } from 'react';
import { Package, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge } from '@/components/StatusBadge';
import { AppState } from '@/types/machine';
import { useMetrics } from '@/hooks/useMetrics';
import { useI18n } from '@/i18n/I18nProvider';

interface HomeScreenProps {
  state: AppState;
}

type PulseRange = 'second' | 'minute' | 'hour';

const RANGE_CONFIG: Record<PulseRange, { buckets: number; unitMs: number; labelEvery: number }> = {
  second: { buckets: 60, unitMs: 1000, labelEvery: 10 },
  minute: { buckets: 60, unitMs: 60 * 1000, labelEvery: 10 },
  hour: { buckets: 24, unitMs: 60 * 60 * 1000, labelEvery: 3 },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ state }) => {
  const [pulseRange, setPulseRange] = useState<PulseRange>('second');
  const {
    todayProduction,
    todayEarnings,
    todayOperatingTimeFormatted,
    todayDowntimeFormatted,
    formatCurrency,
  } = useMetrics(state);
  const { t, intlLocale } = useI18n();

  const lastUpdatedTime = new Date(state.lastUpdated).toLocaleTimeString(intlLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const pulseBuckets = useMemo(() => {
    const config = RANGE_CONFIG[pulseRange];
    const now = Date.now();
    const startTime = now - config.buckets * config.unitMs;
    const buckets = Array.from({ length: config.buckets }, (_, index) => ({
      index,
      count: 0,
    }));

    state.productionEvents.forEach((event) => {
      if (event.timestamp < startTime) {
        return;
      }
      const offset = Math.floor((event.timestamp - startTime) / config.unitMs);
      if (offset >= 0 && offset < config.buckets) {
        buckets[offset].count += event.count;
      }
    });

    return buckets;
  }, [pulseRange, state.productionEvents]);

  const barMaxHeight = 96;
  const maxPulse = Math.max(...pulseBuckets.map(entry => entry.count), 0);
  const hasPulseData = maxPulse > 0;
  const yAxisMax = Math.max(1, maxPulse);
  const yAxisMid = Math.ceil(yAxisMax / 2);

  return (
    <div className="p-4 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('home.title')}</h1>
          <p className="text-sm text-muted-foreground">{state.machine.model}</p>
        </div>
        <StatusBadge status={state.machine.status} />
      </div>

      {/* Production pulse */}
      <div className="metric-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
            {(['second', 'minute', 'hour'] as PulseRange[]).map((range) => {
              const labelKey = range === 'second'
                ? 'home.rangeSecond'
                : range === 'minute'
                  ? 'home.rangeMinute'
                  : 'home.rangeHour';
              const isActive = pulseRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setPulseRange(range)}
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
          <div className="flex gap-2">
            <div className="flex flex-col items-end justify-between h-24">
              <span className="text-[10px] text-muted-foreground">{yAxisMax.toLocaleString(intlLocale)}</span>
              <span className="text-[10px] text-muted-foreground">{yAxisMid.toLocaleString(intlLocale)}</span>
              <span className="text-[10px] text-muted-foreground">0</span>
            </div>
            <div className="flex-1">
              <div className="grid grid-flow-col auto-cols-fr items-end gap-1 h-24">
                {pulseBuckets.map((entry) => {
                  const height = maxPulse > 0 ? Math.max(4, (entry.count / maxPulse) * barMaxHeight) : 4;
                  return (
                    <div key={entry.index} className="flex items-end">
                      <div
                        className="w-full rounded-md bg-primary/80 shadow-sm"
                        style={{ height: `${height}px` }}
                        title={`${entry.count.toLocaleString(intlLocale)}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-flow-col auto-cols-fr gap-1 mt-2">
                {pulseBuckets.map((entry, index) => {
                  const { labelEvery, buckets } = RANGE_CONFIG[pulseRange];
                  const showLabel = index % labelEvery === 0 || index === buckets - 1;
                  return (
                    <span key={`label-${entry.index}`} className="text-[10px] text-muted-foreground text-center">
                      {showLabel ? `${index}` : ''}
                    </span>
                  );
                })}
              </div>
              <div className="mt-1 flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {pulseRange === 'second'
                    ? t('home.axisSeconds')
                    : pulseRange === 'minute'
                      ? t('home.axisMinutes')
                      : t('home.axisHours')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">{t('home.noProductionToday')}</p>
        )}
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label={t('home.empanadasToday')}
          value={todayProduction.toLocaleString(intlLocale)}
          highlight
        />
        <MetricCard
          label={t('home.earningsToday')}
          value={formatCurrency(todayEarnings)}
        />
        <MetricCard
          label={t('home.operatingTime')}
          value={todayOperatingTimeFormatted}
        />
        <MetricCard
          label={t('home.downtime')}
          value={todayDowntimeFormatted}
        />
      </div>

      {/* Last updated */}
      <p className="text-center text-xs text-muted-foreground">
        {t('home.lastUpdated', { time: lastUpdatedTime })}
      </p>
    </div>
  );
};
