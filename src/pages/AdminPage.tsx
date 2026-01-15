import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, X, Database, Zap, Search, Copy, ExternalLink, Shield, FileText, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockService } from '../services/mockService';
import { AuditEntry, RequestLogItem, SecurityPolicy } from '../types';
import { useAuth } from '../contexts/AuthContext';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<RequestLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<RequestLogItem | null>(null);
  const [tab, setTab] = useState<'logs' | 'unanswered' | 'policies' | 'audit'>('logs');
  const [unansweredQuery, setUnansweredQuery] = useState('');
  const [unansweredSort, setUnansweredSort] = useState<'freq' | 'recent'>('freq');
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditQuery, setAuditQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (tab === 'policies' && !policy && !policyLoading) {
      setPolicyLoading(true);
      mockService
        .getSecurityPolicy()
        .then((p) => setPolicy(p))
        .finally(() => setPolicyLoading(false));
    }
    if (tab === 'audit' && audit.length === 0 && !auditLoading) {
      setAuditLoading(true);
      mockService
        .listAudit()
        .then((a) => setAudit(a))
        .finally(() => setAuditLoading(false));
    }
  }, [tab, policy, policyLoading, audit.length, auditLoading]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await mockService.getRequestLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const unanswered = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    const groups = new Map<
      string,
      { question: string; normalized: string; count: number; lastSeen: string; example: RequestLogItem; collectionsCount: number }
    >();

    const unansweredLogs = logs.filter((l) => l.status === 'unanswered');
    for (const l of unansweredLogs) {
      const key = normalize(l.question);
      const prev = groups.get(key);
      if (!prev) {
        groups.set(key, {
          question: l.question,
          normalized: key,
          count: 1,
          lastSeen: l.time,
          example: l,
          collectionsCount: new Set(l.collectionIds).size,
        });
      } else {
        prev.count += 1;
        if (new Date(l.time).getTime() > new Date(prev.lastSeen).getTime()) {
          prev.lastSeen = l.time;
          prev.question = l.question;
          prev.example = l;
        }
        prev.collectionsCount = Math.max(prev.collectionsCount, new Set(l.collectionIds).size);
      }
    }

    const q = unansweredQuery.trim().toLowerCase();
    let items = Array.from(groups.values());
    if (q) {
      items = items.filter((g) => g.question.toLowerCase().includes(q));
    }
    items.sort((a, b) => {
      if (unansweredSort === 'freq') return b.count - a.count;
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });
    return items;
  }, [logs, unansweredQuery, unansweredSort]);

  const unansweredCount = useMemo(() => logs.filter((l) => l.status === 'unanswered').length, [logs]);

  const filteredAudit = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    if (!q) return audit;
    return audit.filter((a) => {
      const s = `${a.actorEmail} ${a.action} ${a.documentId ?? ''} ${a.documentName ?? ''} ${a.details ?? ''}`.toLowerCase();
      return s.includes(q);
    });
  }, [audit, auditQuery]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-slate-950">
      <div className="p-6 border-b border-gray-200 bg-white dark:bg-slate-950 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Админ</h1>
            <p className="text-sm text-gray-500 mt-1 dark:text-slate-400">
              Наблюдаемость, отладка и работа с пробелами в базе знаний
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('logs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'logs'
                  ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Журнал
            </button>
            <button
              type="button"
              onClick={() => setTab('unanswered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                tab === 'unanswered'
                  ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Неотвеченные
              {unansweredCount > 0 && (
                <span className="ml-2 inline-flex min-w-5 h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold items-center justify-center">
                  {unansweredCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab('policies')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'policies'
                  ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Политики
            </button>
            <button
              type="button"
              onClick={() => setTab('audit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'audit'
                  ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Аудит
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tab === 'logs' ? (
          logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 dark:text-slate-400">Пока нет запросов</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Время
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Вопрос
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Коллекции
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Задержка
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Top-K
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Модель
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Детали
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-950 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 cursor-pointer dark:hover:bg-slate-900"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {new Date(log.time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate dark:text-slate-100">
                        {log.question}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {log.collectionIds.length} колл.
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {formatLatency(log.latencyMs)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {log.topK}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {log.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : tab === 'unanswered' ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-slate-950 dark:border-slate-800">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={unansweredQuery}
                    onChange={(e) => setUnansweredQuery(e.target.value)}
                    placeholder="Поиск по вопросам…"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setUnansweredSort('freq')}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      unansweredSort === 'freq'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                        : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
                    }`}
                  >
                    Частота
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnansweredSort('recent')}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      unansweredSort === 'recent'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                        : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
                    }`}
                  >
                    Недавние
                  </button>
                </div>
                <Link
                  to="/knowledge"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                  title="Перейти к знаниям"
                >
                  <ExternalLink size={16} />
                  <span className="text-sm font-medium">Знания</span>
                </Link>
              </div>
            </div>

            {unanswered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 dark:text-slate-400">Нет неотвеченных запросов</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Частота
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Последний раз
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Вопрос
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-950 dark:divide-slate-800">
                    {unanswered.map((u) => (
                      <tr
                        key={u.normalized}
                        className="hover:bg-gray-50 dark:hover:bg-slate-900"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex min-w-8 h-7 px-2 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold items-center justify-center dark:bg-amber-950/40 dark:text-amber-200">
                            {u.count}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {new Date(u.lastSeen).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">
                          <div className="font-medium">{u.question}</div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                            Коллекции в запросах: {u.example.collectionIds.length}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(u.question)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                              title="Скопировать вопрос"
                            >
                              <Copy size={16} />
                              <span className="text-xs font-medium">Копировать</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedLog(u.example)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                              title="Открыть пример запроса"
                            >
                              <ChevronRight size={16} />
                              <span className="text-xs font-semibold">Открыть</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : tab === 'policies' ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-gray-400" />
              <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">Политики безопасности</div>
            </div>

            {policyLoading || !policy ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse dark:bg-slate-900" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Доступ по умолчанию для загруженных документов</div>
                  <div className="text-xs text-gray-500 mt-1 dark:text-slate-400">
                    Используется, если админ не назначил ручные права.
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                      <input
                        type="radio"
                        name="defaultUploadAccess"
                        checked={policy.defaultUploadAccess === 'uploader_and_manager'}
                        onChange={async () => {
                          const next = await mockService.updateSecurityPolicy(
                            { defaultUploadAccess: 'uploader_and_manager' },
                            user?.email ?? 'unknown'
                          );
                          setPolicy(next);
                        }}
                      />
                      Только загрузивший + руководитель
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                      <input
                        type="radio"
                        name="defaultUploadAccess"
                        checked={policy.defaultUploadAccess === 'internal'}
                        onChange={async () => {
                          const next = await mockService.updateSecurityPolicy(
                            { defaultUploadAccess: 'internal' },
                            user?.email ?? 'unknown'
                          );
                          setPolicy(next);
                        }}
                      />
                      Внутренний (все сотрудники)
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 dark:border-slate-800">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={policy.blockConfidentialInRag}
                      onChange={async (e) => {
                        const next = await mockService.updateSecurityPolicy(
                          { blockConfidentialInRag: e.target.checked },
                          user?.email ?? 'unknown'
                        );
                        setPolicy(next);
                      }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Тег “confidential” недоступен в RAG</div>
                      <div className="text-xs text-gray-500 mt-1 dark:text-slate-400">
                        Жёсткий блок: документы с тегом не попадают в источники.
                      </div>
                    </div>
                  </label>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 dark:border-slate-800">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={policy.requireVerifiedEmail}
                      onChange={async (e) => {
                        const next = await mockService.updateSecurityPolicy(
                          { requireVerifiedEmail: e.target.checked },
                          user?.email ?? 'unknown'
                        );
                        setPolicy(next);
                      }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Пользователи без подтверждённого email не видят ничего</div>
                      <div className="text-xs text-gray-500 mt-1 dark:text-slate-400">
                        В демо считается, что email подтверждён.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-slate-950 dark:border-slate-800">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    placeholder="Поиск по аудиту…"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setAuditLoading(true);
                    try {
                      const a = await mockService.listAudit();
                      setAudit(a);
                    } finally {
                      setAuditLoading(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <RefreshCw size={16} />
                  <span className="text-sm font-medium">Обновить</span>
                </button>
              </div>
            </div>

            {auditLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse dark:bg-slate-900" />
                ))}
              </div>
            ) : filteredAudit.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 dark:text-slate-400">Записей аудита пока нет</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Актор</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Событие</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Документ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-950 dark:divide-slate-800">
                    {filteredAudit.slice(0, 200).map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-slate-900">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {new Date(a.time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                          {a.actorEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {a.action}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            <span className="truncate max-w-[28rem]">{a.documentName ?? a.documentId ?? '—'}</span>
                          </div>
                          {a.details && <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">{a.details}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
          <div className="bg-white w-full sm:w-2/3 lg:w-1/2 h-full sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-lg sm:rounded-lg shadow-xl dark:bg-slate-950 dark:border dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between dark:border-slate-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Детали запроса</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Question */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Вопрос</h3>
                <p className="text-sm text-gray-900 dark:text-slate-100">{selectedLog.question}</p>
              </div>

              {/* Collections */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Коллекции</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedLog.collectionIds.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Параметры</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Top-K:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedLog.topK}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Модель:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedLog.model}</span>
                  </div>
                </div>
              </div>

              {/* Timings */}
              {selectedLog.debug && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <Zap size={16} className="mr-1" />
                    Тайминги
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm dark:bg-slate-900">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Поиск:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">
                        {selectedLog.debug.retrievalMs}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">LLM:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">
                        {selectedLog.debug.llmMs}ms
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600 font-medium">Итого:</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-100">
                        {selectedLog.debug.totalMs}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Найдено фрагментов:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">
                        {selectedLog.debug.retrievedChunks}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Debug Info */}
              {selectedLog.debug && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Отладочная информация</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm dark:bg-slate-900">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Стиль:</span>
                      <span className="font-medium text-gray-900 capitalize dark:text-slate-100">
                        {selectedLog.debug.mode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Строго по источникам:</span>
                      <span className="font-medium text-gray-900 dark:text-slate-100">
                        {selectedLog.debug.strict ? 'Да' : 'Нет'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Retrieved Sources (Mock) */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <Database size={16} className="mr-1" />
                  Источники (мок)
                </h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3 border border-gray-200 rounded-lg bg-white text-sm dark:bg-slate-950 dark:border-slate-800"
                    >
                      <div className="font-medium text-gray-900 mb-1 dark:text-slate-100">
                        Источник {i} — Название документа
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Score: {(0.95 - i * 0.1).toFixed(2)} • Коллекция: col{i}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2 dark:text-slate-300">
                        Релевантный фрагмент из документа (демо)…
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Prompt Summary */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Сводка финального промпта</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 font-mono dark:bg-slate-900 dark:text-slate-200">
                  <div className="whitespace-pre-wrap">
                    {`System: You are a helpful assistant. Answer based on the provided context.

Context: [${selectedLog.debug?.retrievedChunks || 0} chunks retrieved]

User: ${selectedLog.question}

Assistant:`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

