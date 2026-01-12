import React, { useMemo, useState } from 'react';
import { MessageSquarePlus, Search } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';

const ChatSessionsSidebar: React.FC = () => {
  const { sessions, activeSessionId, setActiveSessionId, createSession } = useChatContext();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => {
      if (s.title.toLowerCase().includes(q)) return true;
      return s.messages.some((m) => m.contentMd.toLowerCase().includes(q));
    });
  }, [query, sessions]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Чаты</h2>
          <button
            type="button"
            onClick={() => createSession()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            title="Новый чат"
          >
            <MessageSquarePlus size={18} />
            <span className="text-sm font-semibold">Новый чат</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Поиск по чатам…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-slate-400">
            Ничего не найдено
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((s) => {
              const isActive = s.id === activeSessionId;
              const last = s.messages[s.messages.length - 1];
              const preview = last?.contentMd?.replace(/\s+/g, ' ').trim() ?? '';

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSessionId(s.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-blue-200 dark:bg-slate-900 dark:border-slate-700'
                      : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 dark:bg-slate-950 dark:hover:bg-slate-900 dark:hover:border-slate-800'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 truncate dark:text-slate-100">
                    {s.title || 'Новый чат'}
                  </div>
                  {preview && (
                    <div className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-slate-400">
                      {preview}
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                    {new Date(s.updatedAt).toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSessionsSidebar;

