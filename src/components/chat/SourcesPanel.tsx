import React, { useMemo, useState } from 'react';
import { Copy, ExternalLink, FileText, X } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { Source } from '../../types';

const SourcesPanel: React.FC = () => {
  const { currentSources, highlightedSource, setHighlightedSource } = useChatContext();
  const sources = currentSources;
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);

  const openSource = useMemo(() => sources.find((s) => s.id === openSourceId) ?? null, [openSourceId, sources]);

  const handleCopyCitation = (source: Source) => {
    const citation = `[${source.id}] ${source.title}`;
    navigator.clipboard.writeText(citation);
    // Можно добавить toast уведомление
  };

  if (sources.length === 0) {
    return (
      <div className="p-6 text-center">
        <FileText className="mx-auto text-gray-300 mb-3" size={32} />
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Источники появятся здесь после вопроса
        </p>
      </div>
    );
  }

  // Показываем только top 3-5 источников
  const topSources = sources.slice(0, 5);

  return (
    <div className="p-4 space-y-3">
      <div className="text-xs font-medium text-gray-500 uppercase mb-2">
        Топ {topSources.length} источников
      </div>
      {topSources.map((source, idx) => (
        <div
          key={source.id}
          className={`p-3 border rounded-lg transition-colors cursor-pointer ${
            highlightedSource === source.id
              ? 'border-blue-500 bg-blue-50 dark:border-sky-400 dark:bg-slate-900'
              : 'border-gray-200 hover:border-gray-300 bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700'
          }`}
          onClick={() => {
            setHighlightedSource(source.id);
            setOpenSourceId(source.id);
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {idx + 1}
                </span>
                {idx === 0 && (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full dark:text-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900">
                    Лучшее совпадение
                  </span>
                )}
                <h4 className="text-sm font-medium text-gray-900 truncate dark:text-slate-100">
                  {source.title}
                </h4>
              </div>
              <div className="text-xs text-gray-500 mb-2 dark:text-slate-400">
                {source.meta.collectionName} • {source.meta.documentName}
              </div>
              {source.score && (
                <div className="text-xs text-gray-400 dark:text-slate-400">
                  Оценка: {source.score.toFixed(2)}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyCitation(source);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
                title="Скопировать цитату"
              >
                <Copy size={14} />
              </button>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
                  title="Открыть источник"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-600 line-clamp-3 dark:text-slate-300">{source.snippet}</p>
        </div>
      ))}

      {/* Source popup */}
      {openSource && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть"
            onClick={() => setOpenSourceId(null)}
          />
          <div className="relative w-full sm:w-[42rem] max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:bg-slate-950 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3 dark:border-slate-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm font-semibold text-gray-900 truncate dark:text-slate-100">{openSource.title}</div>
                  {topSources[0]?.id === openSource.id && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full dark:text-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900">
                      Лучшее совпадение
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  {openSource.meta.collectionName} • {openSource.meta.documentName}
                  {typeof openSource.meta.chunkIndex === 'number' ? ` • chunk ${openSource.meta.chunkIndex + 1}` : ''}
                  {openSource.score ? ` • score ${openSource.score.toFixed(2)}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCitation(openSource)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                  title="Скопировать цитату"
                >
                  <Copy size={16} />
                  <span className="text-xs font-medium">Скопировать</span>
                </button>
                {openSource.url && (
                  <a
                    href={openSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                    title="Перейти по ссылке"
                  >
                    <ExternalLink size={16} />
                    <span className="text-xs font-medium">Открыть</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setOpenSourceId(null)}
                  className="p-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-slate-900"
                  aria-label="Закрыть"
                >
                  <X size={18} className="text-gray-500 dark:text-slate-300" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto max-h-[calc(85vh-4rem)]">
              <div className="text-xs font-medium text-gray-500 uppercase">Фрагмент</div>
              <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap dark:text-slate-200">
                {openSource.snippet}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourcesPanel;

