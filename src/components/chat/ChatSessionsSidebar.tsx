import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquarePlus, MoreVertical, Search, Trash2, X } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';

const ChatSessionsSidebar: React.FC = () => {
  const { sessions, activeSessionId, setActiveSessionId, createSession, deleteSession } = useChatContext();
  const [query, setQuery] = useState('');
  const [menuForId, setMenuForId] = useState<string | null>(null);
  const [confirmForId, setConfirmForId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => {
      if (s.title.toLowerCase().includes(q)) return true;
      return s.messages.some((m) => m.contentMd.toLowerCase().includes(q));
    });
  }, [query, sessions]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuForId(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const confirmSession = useMemo(() => sessions.find((s) => s.id === confirmForId) ?? null, [confirmForId, sessions]);

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
                <div
                  key={s.id}
                  className={`group relative w-full text-left p-3 rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-blue-200 dark:bg-slate-900 dark:border-slate-700'
                      : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 dark:bg-slate-950 dark:hover:bg-slate-900 dark:hover:border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSessionId(s.id)}
                    className="w-full text-left pr-10"
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

                  {/* Kebab menu trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuForId((cur) => (cur === s.id ? null : s.id));
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    title="Действия"
                    aria-label="Действия"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown */}
                  {menuForId === s.id && (
                    <div
                      ref={menuRef}
                      className="absolute z-50 top-10 right-3 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden dark:bg-slate-950 dark:border-slate-800"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuForId(null);
                          setConfirmForId(s.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-slate-900"
                      >
                        <Trash2 size={16} />
                        Удалить чат
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmSession && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть"
            onClick={() => setConfirmForId(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between dark:border-slate-800">
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Удалить чат?</div>
              <button
                type="button"
                onClick={() => setConfirmForId(null)}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-slate-900"
                aria-label="Закрыть"
              >
                <X size={18} className="text-gray-500 dark:text-slate-300" />
              </button>
            </div>
            <div className="p-5">
              <div className="text-sm text-gray-700 dark:text-slate-200">
                Чат <span className="font-semibold">“{confirmSession.title || 'Новый чат'}”</span> будет удалён. Это действие нельзя отменить.
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmForId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteSession(confirmSession.id);
                    setConfirmForId(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSessionsSidebar;

