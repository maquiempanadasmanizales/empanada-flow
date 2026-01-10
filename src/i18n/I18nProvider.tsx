import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Locale = 'en' | 'es';

const translations = {
  en: {
    'company.name': 'Pulse',
    'company.logoAlt': 'Pulse logo',
    'language.label': 'Language',
    'navigation.home': 'Home',
    'navigation.production': 'Production',
    'navigation.downtime': 'Downtime',
    'navigation.operator': 'Operator',
    'home.title': 'Production Pulse',
    'home.empanadasToday': 'Empanadas Today',
    'home.operatingTime': 'Operating Time',
    'home.downtime': 'Downtime',
    'home.machineInfo': 'Machine Info',
    'home.serial': 'Serial',
    'home.model': 'Model',
    'home.demoMode': 'Demo Mode',
    'home.demoDescription': 'Auto-generate production data',
    'home.resetDemoData': 'Reset Demo Data',
    'home.lastUpdated': 'Last updated: {time}',
    'production.title': 'Production',
    'production.subtitle': 'Track your output',
    'production.todayLabel': 'TODAY',
    'production.manualEntry': 'Manual Entry',
    'production.todayByHour': 'Today by Hour',
    'production.noDataToday': 'No data yet today',
    'production.last7Days': 'Last 7 Days',
    'downtime.title': 'Downtime',
    'downtime.subtitle': 'Manage stops',
    'downtime.machineStatus': 'Machine Status',
    'downtime.machineStopped': 'Machine is STOPPED',
    'downtime.since': 'Since {time}',
    'downtime.endStop': 'End Stop',
    'downtime.reasonPlaceholder': 'Reason (optional)',
    'downtime.startStop': 'Start Stop',
    'downtime.totalToday': 'Total Downtime Today',
    'downtime.todaysEvents': "Today's Events",
    'downtime.noStopsToday': 'No stops today',
    'downtime.ongoing': 'Ongoing',
    'operator.title': 'Operator',
    'operator.subtitle': 'Manage sessions',
    'operator.currentSession': 'Current Session',
    'operator.startedAt': 'Started at {time}',
    'operator.endSession': 'End Session',
    'operator.selectOperator': 'Select operator',
    'operator.startSession': 'Start Session',
    'operator.todayPerformance': "Today's Performance",
    'operator.active': 'Active',
    'operator.empanadas': 'Empanadas',
    'operator.time': 'Time',
    'status.running': 'RUNNING',
    'status.stopped': 'STOPPED',
    'notFound.message': 'Oops! Page not found',
    'notFound.returnHome': 'Return to Home',
    'duration.hoursShort': 'h',
    'duration.minutesShort': 'm',
  },
  es: {
    'company.name': 'Pulse',
    'company.logoAlt': 'Logo de Pulse',
    'language.label': 'Idioma',
    'navigation.home': 'Inicio',
    'navigation.production': 'Produccion',
    'navigation.downtime': 'Paradas',
    'navigation.operator': 'Operador',
    'home.title': 'Pulso de Produccion',
    'home.empanadasToday': 'Empanadas de hoy',
    'home.operatingTime': 'Tiempo operando',
    'home.downtime': 'Paradas',
    'home.machineInfo': 'Informacion de la maquina',
    'home.serial': 'Serie',
    'home.model': 'Modelo',
    'home.demoMode': 'Modo demo',
    'home.demoDescription': 'Generar datos de produccion automaticamente',
    'home.resetDemoData': 'Reiniciar datos demo',
    'home.lastUpdated': 'Ultima actualizacion: {time}',
    'production.title': 'Produccion',
    'production.subtitle': 'Sigue tu produccion',
    'production.todayLabel': 'HOY',
    'production.manualEntry': 'Ingreso manual',
    'production.todayByHour': 'Hoy por hora',
    'production.noDataToday': 'Sin datos hoy',
    'production.last7Days': 'Ultimos 7 dias',
    'downtime.title': 'Paradas',
    'downtime.subtitle': 'Gestiona paradas',
    'downtime.machineStatus': 'Estado de la maquina',
    'downtime.machineStopped': 'La maquina esta DETENIDA',
    'downtime.since': 'Desde {time}',
    'downtime.endStop': 'Finalizar parada',
    'downtime.reasonPlaceholder': 'Motivo (opcional)',
    'downtime.startStop': 'Iniciar parada',
    'downtime.totalToday': 'Total de paradas hoy',
    'downtime.todaysEvents': 'Eventos de hoy',
    'downtime.noStopsToday': 'Sin paradas hoy',
    'downtime.ongoing': 'En curso',
    'operator.title': 'Operador',
    'operator.subtitle': 'Gestiona turnos',
    'operator.currentSession': 'Turno actual',
    'operator.startedAt': 'Inicio a las {time}',
    'operator.endSession': 'Finalizar turno',
    'operator.selectOperator': 'Selecciona operador',
    'operator.startSession': 'Iniciar turno',
    'operator.todayPerformance': 'Rendimiento de hoy',
    'operator.active': 'Activo',
    'operator.empanadas': 'Empanadas',
    'operator.time': 'Tiempo',
    'status.running': 'EN MARCHA',
    'status.stopped': 'DETENIDA',
    'notFound.message': 'Ups, pagina no encontrada',
    'notFound.returnHome': 'Volver al inicio',
    'duration.hoursShort': 'h',
    'duration.minutesShort': 'min',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

const STORAGE_KEY = 'empanada-flow-locale';

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'es') {
    return stored;
  }

  const language = window.navigator.language.toLowerCase();
  return language.startsWith('es') ? 'es' : 'en';
};

type I18nContextValue = {
  locale: Locale;
  intlLocale: string;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const interpolate = (template: string, vars?: Record<string, string | number>) => {
  if (!vars) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const entry = translations[locale][key] ?? translations.en[key];
      return interpolate(entry, vars);
    },
    [locale],
  );

  const intlLocale = locale === 'es' ? 'es-ES' : 'en-US';

  const value = useMemo(
    () => ({
      locale,
      intlLocale,
      setLocale,
      t,
    }),
    [locale, intlLocale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
