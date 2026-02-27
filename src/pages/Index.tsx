import React, { useState, useEffect } from 'react';
import { MobileShell } from '@/components/MobileShell';
import { HomeScreen } from '@/screens/HomeScreen';
import { ProductionScreen } from '@/screens/ProductionScreen';
import { DowntimeScreen } from '@/screens/DowntimeScreen';
import { OperatorScreen } from '@/screens/OperatorScreen';
import { useAppState } from '@/hooks/useAppState';

type Tab = 'home' | 'production' | 'downtime' | 'operator';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const {
    state,
    addProduction,
    startDowntime,
    endDowntime,
    startOperatorSession,
    endOperatorSession,
    getActiveDowntime,
    getActiveSession,
  } = useAppState();

  // Demo mode auto-production simulation
  useEffect(() => {
    if (state.machine.status !== 'RUNNING') {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 2500) + 1500; // 1.5-4 seconds
      timeoutId = setTimeout(() => {
        const randomCount = Math.floor(Math.random() * 3) + 1; // 1-3 empanadas
        addProduction(randomCount);
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => clearTimeout(timeoutId);
  }, [state.demoMode, state.machine.status, addProduction]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            state={state}
          />
        );
      case 'production':
        return (
          <ProductionScreen
            state={state}
            onAddProduction={addProduction}
          />
        );
      case 'downtime':
        return (
          <DowntimeScreen
            state={state}
            activeDowntime={getActiveDowntime()}
            onStartDowntime={startDowntime}
            onEndDowntime={endDowntime}
          />
        );
      case 'operator':
        return (
          <OperatorScreen
            state={state}
            activeSession={getActiveSession()}
            onStartSession={startOperatorSession}
            onEndSession={endOperatorSession}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MobileShell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderScreen()}
    </MobileShell>
  );
};

export default Index;
