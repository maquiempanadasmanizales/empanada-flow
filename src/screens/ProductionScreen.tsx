import React from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import { AppState } from '@/types/machine';
import { useMetrics } from '@/hooks/useMetrics';
import { useI18n } from '@/i18n/I18nProvider';

interface ProductionScreenProps {
  state: AppState;
  onAddProduction: (count: number) => void;
}

export const ProductionScreen: React.FC<ProductionScreenProps> = ({ state, onAddProduction }) => {
  const { todayProduction, productionByHour, last7DaysProduction } = useMetrics(state);
  const { t, intlLocale } = useI18n();

  const maxHourly = Math.max(...productionByHour.map(h => h.count), 1);

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

      {/* Hourly production */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="metric-label">{t('production.todayByHour')}</span>
        </div>
        <div className="space-y-2">
          {productionByHour.map(({ hour, count }) => (
            <div key={hour} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">
                {hour.toString().padStart(2, '0')}:00
              </span>
              <div className="flex-1 h-6 bg-secondary rounded-md overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(count / maxHourly) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground w-12 text-right">
                {count}
              </span>
            </div>
          ))}
          {productionByHour.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t('production.noDataToday')}</p>
          )}
        </div>
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
