import { useMemo } from 'react';
import { AppState, ProductionEvent, DowntimeEvent, OperatorSession } from '@/types/machine';

const startOfDay = (date: Date = new Date()): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const isToday = (timestamp: number): boolean => {
  return timestamp >= startOfDay();
};

const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const useMetrics = (state: AppState) => {
  const todayProduction = useMemo(() => {
    return state.productionEvents
      .filter(e => isToday(e.timestamp))
      .reduce((sum, e) => sum + e.count, 0);
  }, [state.productionEvents]);

  const todayDowntime = useMemo(() => {
    const now = Date.now();
    return state.downtimeEvents
      .filter(e => isToday(e.startTime))
      .reduce((sum, e) => {
        const end = e.endTime || now;
        return sum + (end - e.startTime);
      }, 0);
  }, [state.downtimeEvents]);

  const todayDowntimeFormatted = useMemo(() => formatDuration(todayDowntime), [todayDowntime]);

  const todayOperatingTime = useMemo(() => {
    const dayStart = startOfDay();
    const now = Date.now();
    const totalTime = now - dayStart;
    return totalTime - todayDowntime;
  }, [todayDowntime]);

  const todayOperatingTimeFormatted = useMemo(() => formatDuration(todayOperatingTime), [todayOperatingTime]);

  const productionByHour = useMemo(() => {
    const hourlyMap: Record<number, number> = {};
    state.productionEvents
      .filter(e => isToday(e.timestamp))
      .forEach(e => {
        const hour = new Date(e.timestamp).getHours();
        hourlyMap[hour] = (hourlyMap[hour] || 0) + e.count;
      });
    
    const result: { hour: number; count: number }[] = [];
    for (let h = 0; h <= new Date().getHours(); h++) {
      result.push({ hour: h, count: hourlyMap[h] || 0 });
    }
    return result;
  }, [state.productionEvents]);

  const last7DaysProduction = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = startOfDay(date);
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      const count = state.productionEvents
        .filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd)
        .reduce((sum, e) => sum + e.count, 0);
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        count,
      });
    }
    return days;
  }, [state.productionEvents]);

  const todayDowntimeEvents = useMemo(() => {
    return state.downtimeEvents
      .filter(e => isToday(e.startTime))
      .sort((a, b) => b.startTime - a.startTime);
  }, [state.downtimeEvents]);

  const productionByOperator = useMemo(() => {
    const operatorProduction: Record<string, { production: number; time: number }> = {};
    
    state.operators.forEach(op => {
      operatorProduction[op.id] = { production: 0, time: 0 };
    });

    const todaySessions = state.operatorSessions.filter(s => isToday(s.startTime));
    const todayEvents = state.productionEvents.filter(e => isToday(e.timestamp));
    const now = Date.now();

    todayEvents.forEach(event => {
      const activeSession = todaySessions.find(s => {
        const sessionEnd = s.endTime || now;
        return event.timestamp >= s.startTime && event.timestamp <= sessionEnd;
      });
      
      if (activeSession) {
        operatorProduction[activeSession.operatorId].production += event.count;
      }
    });

    todaySessions.forEach(session => {
      const sessionEnd = session.endTime || now;
      operatorProduction[session.operatorId].time += sessionEnd - session.startTime;
    });

    return state.operators.map(op => ({
      operator: op,
      production: operatorProduction[op.id].production,
      time: formatDuration(operatorProduction[op.id].time),
      timeMs: operatorProduction[op.id].time,
    }));
  }, [state.operators, state.operatorSessions, state.productionEvents]);

  return {
    todayProduction,
    todayDowntime,
    todayDowntimeFormatted,
    todayOperatingTime,
    todayOperatingTimeFormatted,
    productionByHour,
    last7DaysProduction,
    todayDowntimeEvents,
    productionByOperator,
    formatDuration,
  };
};
