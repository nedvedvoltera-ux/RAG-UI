import React from 'react';
import { Database, Filter, Hash } from 'lucide-react';

const RetrievalPanel: React.FC = () => {
  // Мок-данные для демонстрации
  const retrievalData = {
    topK: 5,
    filters: {
      collections: ['col1', 'col2'],
      dateRange: null,
    },
    retrievedChunks: [
      { id: 'chunk1', document: 'Справочник API v2.1.pdf', score: 0.95, preview: '…настройка деплоя и переменные окружения…' },
      { id: 'chunk2', document: 'Руководство пользователя.md', score: 0.89, preview: '…инструкции по настройке…' },
      { id: 'chunk3', document: 'Обзор архитектуры.docx', score: 0.82, preview: '…компоненты системы…' },
      { id: 'chunk4', document: 'Гайд по деплою.md', score: 0.78, preview: '…конфигурация окружения…' },
      { id: 'chunk5', document: 'Траблшутинг.pdf', score: 0.71, preview: '…типовые проблемы и решения…' },
    ],
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs font-medium text-gray-500 uppercase mb-3">
        Детали поиска (retrieval)
      </div>

      {/* Parameters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <Hash size={16} className="text-gray-400" />
          <span className="text-gray-600">Top‑K:</span>
          <span className="font-medium text-gray-900">{retrievalData.topK}</span>
        </div>

        <div className="flex items-start space-x-2 text-sm">
          <Filter size={16} className="text-gray-400 mt-0.5" />
          <div className="flex-1">
            <span className="text-gray-600">Фильтры:</span>
            <div className="mt-1 space-y-1">
              {retrievalData.filters.collections.length > 0 && (
                <div className="text-xs text-gray-500">
                  Коллекции: выбрано {retrievalData.filters.collections.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Retrieved Chunks */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Database size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            Найденные фрагменты ({retrievalData.retrievedChunks.length})
          </span>
        </div>
        <div className="space-y-2">
          {retrievalData.retrievedChunks.map((chunk, idx) => (
            <div
              key={chunk.id}
              className="p-3 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-900 dark:text-slate-100">
                  {idx + 1}. {chunk.document}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {chunk.score.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 mt-1 dark:text-slate-300">
                {chunk.preview}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RetrievalPanel;

