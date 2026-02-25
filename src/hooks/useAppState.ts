import { useState, useEffect, useCallback } from 'react';
import { AppState, ProductionEvent, DowntimeEvent, OperatorSession } from '@/types/machine';

const STORAGE_KEY = 'empanada-machine-demo';

const createDemoProductionEvents = (): ProductionEvent[] => {
  const now = new Date();
  const events: ProductionEvent[] = [];
  const hoursBack = 8;
  for (let offset = hoursBack; offset >= 0; offset--) {
    const hourStart = new Date(now);
    hourStart.setHours(now.getHours() - offset, 0, 0, 0);
    const eventCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < eventCount; i++) {
      const timestamp = hourStart.getTime() + Math.floor(Math.random() * 60 * 60 * 1000);
      const count = Math.floor(Math.random() * 5) + 2;
      events.push({
        id: `demo-${timestamp}-${i}`,
        timestamp,
        count,
      });
    }
  }
  return events;
};

const getInitialState = (): AppState => ({
  machine: {
    id: 'machine-001',
    serial: 'EMP-2024-001',
    model: 'EmpanadaPro X500',
    status: 'RUNNING',
  },
  productionEvents: [],
  downtimeEvents: [],
  operators: [
    { id: 'op-1', name: 'Carlos García' },
    { id: 'op-2', name: 'María López' },
    { id: 'op-3', name: 'Juan Rodríguez' },
  ],
  operatorSessions: [],
  demoMode: true,
  profitPerEmpanada: 1,
  lastUpdated: Date.now(),
});

const loadState = (): AppState => {
  const initialState = getInitialState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppState>;
      const nextState: AppState = {
        ...initialState,
        ...parsed,
        machine: {
          ...initialState.machine,
          ...parsed.machine,
        },
      };
      if (nextState.demoMode && nextState.productionEvents.length === 0) {
        nextState.productionEvents = createDemoProductionEvents();
      }
      return nextState;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {
    ...initialState,
    productionEvents: initialState.demoMode ? createDemoProductionEvents() : [],
  };
};

const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const newState = updater(prev);
      return { ...newState, lastUpdated: Date.now() };
    });
  }, []);

  const addProduction = useCallback((count: number) => {
    updateState(prev => ({
      ...prev,
      productionEvents: [
        ...prev.productionEvents,
        {
          id: `prod-${Date.now()}`,
          timestamp: Date.now(),
          count,
        },
      ],
    }));
  }, [updateState]);

  const startDowntime = useCallback((reason: string = '') => {
    updateState(prev => ({
      ...prev,
      machine: { ...prev.machine, status: 'STOPPED' },
      downtimeEvents: [
        ...prev.downtimeEvents,
        {
          id: `down-${Date.now()}`,
          startTime: Date.now(),
          endTime: null,
          reason,
        },
      ],
    }));
  }, [updateState]);

  const endDowntime = useCallback(() => {
    updateState(prev => {
      const events = [...prev.downtimeEvents];
      const activeIndex = events.findIndex(e => e.endTime === null);
      if (activeIndex !== -1) {
        events[activeIndex] = { ...events[activeIndex], endTime: Date.now() };
      }
      return {
        ...prev,
        machine: { ...prev.machine, status: 'RUNNING' },
        downtimeEvents: events,
      };
    });
  }, [updateState]);

  const startOperatorSession = useCallback((operatorId: string) => {
    updateState(prev => ({
      ...prev,
      operatorSessions: [
        ...prev.operatorSessions,
        {
          id: `session-${Date.now()}`,
          operatorId,
          startTime: Date.now(),
          endTime: null,
        },
      ],
    }));
  }, [updateState]);

  const endOperatorSession = useCallback(() => {
    updateState(prev => {
      const sessions = [...prev.operatorSessions];
      const activeIndex = sessions.findIndex(s => s.endTime === null);
      if (activeIndex !== -1) {
        sessions[activeIndex] = { ...sessions[activeIndex], endTime: Date.now() };
      }
      return { ...prev, operatorSessions: sessions };
    });
  }, [updateState]);

  const toggleDemoMode = useCallback(() => {
    updateState(prev => ({ ...prev, demoMode: !prev.demoMode }));
  }, [updateState]);

  const resetData = useCallback(() => {
    setState(getInitialState());
  }, []);

  const getActiveDowntime = useCallback((): DowntimeEvent | null => {
    return state.downtimeEvents.find(e => e.endTime === null) || null;
  }, [state.downtimeEvents]);

  const getActiveSession = useCallback((): OperatorSession | null => {
    return state.operatorSessions.find(s => s.endTime === null) || null;
  }, [state.operatorSessions]);

  return {
    state,
    addProduction,
    startDowntime,
    endDowntime,
    startOperatorSession,
    endOperatorSession,
    toggleDemoMode,
    resetData,
    getActiveDowntime,
    getActiveSession,
  };
};
