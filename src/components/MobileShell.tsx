import React from 'react';
import { Home, TrendingUp, AlertTriangle, User } from 'lucide-react';

type Tab = 'home' | 'production' | 'downtime' | 'operator';

interface MobileShellProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'production', label: 'Production', icon: TrendingUp },
  { id: 'downtime', label: 'Downtime', icon: AlertTriangle },
  { id: 'operator', label: 'Operator', icon: User },
];

export const MobileShell: React.FC<MobileShellProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen relative">
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
