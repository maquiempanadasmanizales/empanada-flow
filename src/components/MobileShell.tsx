import React from 'react';
import { Home, TrendingUp, AlertTriangle, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n/I18nProvider';

type Tab = 'home' | 'production' | 'downtime' | 'operator';

interface MobileShellProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children, activeTab, onTabChange }) => {
  const { locale, setLocale, t } = useI18n();
  const isSpanish = locale === 'es';
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t('navigation.home'), icon: Home },
    { id: 'production', label: t('navigation.production'), icon: TrendingUp },
    { id: 'downtime', label: t('navigation.downtime'), icon: AlertTriangle },
    { id: 'operator', label: t('navigation.operator'), icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen relative">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="text-xs font-semibold text-foreground">Empanada Pulse</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('language.label')}</span>
            <span className={`text-xs ${isSpanish ? 'text-muted-foreground' : 'text-foreground'}`}>EN</span>
            <Switch checked={isSpanish} onCheckedChange={(checked) => setLocale(checked ? 'es' : 'en')} />
            <span className={`text-xs ${isSpanish ? 'text-foreground' : 'text-muted-foreground'}`}>ES</span>
          </div>
        </div>
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="max-w-md mx-auto flex justify-around py-2 px-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`nav-item flex-1 ${
                  activeTab === id ? 'nav-item-active' : 'nav-item-inactive'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};
