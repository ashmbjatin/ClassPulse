import React from 'react';
import { LayoutDashboard, Users, ShieldAlert, BarChart3, Upload, GraduationCap, Radio } from 'lucide-react';

export type TabType = 'overview' | 'table' | 'profile' | 'interventions' | 'analytics' | 'upload';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lastSyncTime?: string;
  isSyncing?: boolean;
  onTriggerSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSyncing = false,
  onTriggerSync
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '1. Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'table', label: '2. Student Risk Table', icon: <Users className="w-4 h-4" /> },
    { id: 'interventions', label: '4. Interventions & Faculty', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'analytics', label: '5. Analytics & Trends', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'upload', label: '6. Data Upload', icon: <Upload className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-950 border border-red-800/60 rounded flex items-center justify-center text-red-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight font-serif text-slate-100">
                CLASS PULSE
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                v2.4 • Fall 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Student Attendance Recovery & Academic Risk Early Warning System
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <div className="flex items-center space-x-2 text-xs bg-slate-850 px-3 py-1.5 rounded border border-slate-700 text-slate-300 font-mono">
            <Radio className={`w-3.5 h-3.5 ${isSyncing ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <span>MAKE WEBHOOK:</span>
            <span className="text-emerald-400 font-semibold">CONNECTED</span>
          </div>

          {onTriggerSync && (
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>{isSyncing ? 'Processing...' : 'Upload & Sync Data'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Main Navigation">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
