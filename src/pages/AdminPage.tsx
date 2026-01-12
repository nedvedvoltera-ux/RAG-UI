import React, { useState, useEffect } from 'react';
import { ChevronRight, X, Database, Zap } from 'lucide-react';
import { mockService } from '../services/mockService';
import { RequestLogItem } from '../types';

const AdminPage: React.FC = () => {
  const [logs, setLogs] = useState<RequestLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<RequestLogItem | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

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

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-slate-950">
      <div className="p-6 border-b border-gray-200 bg-white dark:bg-slate-950 dark:border-slate-800">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Журнал запросов</h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-slate-400">Наблюдаемость и отладка RAG‑запросов</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
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

