import React from 'react';
import { FileText, Database, Clock } from 'lucide-react';
import SourcesPanel from './SourcesPanel';
import RetrievalPanel from './RetrievalPanel';
import SessionPanel from './SessionPanel';

interface RightPanelProps {
  activeTab: 'sources' | 'retrieval' | 'session';
  onTabChange: (tab: 'sources' | 'retrieval' | 'session') => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'sources' as const, label: 'Источники', icon: FileText },
    { id: 'retrieval' as const, label: 'Поиск', icon: Database },
    { id: 'session' as const, label: 'Сессия', icon: Clock },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`min-w-0 h-14 lg:h-16 flex flex-col items-center justify-center gap-1 px-2 py-2 text-[12px] lg:text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'text-blue-600 border-blue-600 bg-white dark:bg-slate-950 dark:text-sky-200 dark:border-sky-400'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon size={16} />
                <span className="line-clamp-2 text-center leading-tight px-1">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {/* overflow-y-scroll: фиксируем ширину (скроллбар не “прыгает” между вкладками) */}
      <div className="flex-1 overflow-y-scroll">
        {activeTab === 'sources' && <SourcesPanel />}
        {activeTab === 'retrieval' && <RetrievalPanel />}
        {activeTab === 'session' && <SessionPanel />}
      </div>
    </div>
  );
};

export default RightPanel;

