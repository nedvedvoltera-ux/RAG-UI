import React from 'react';
import { Send, Sliders, Sparkles } from 'lucide-react';
import { ChatParams } from '../../types';

interface ComposerProps {
  onSend: (question: string, params: ChatParams) => void;
  disabled?: boolean;
  question: string;
  onQuestionChange: (value: string) => void;
  topK: number;
  onTopKChange: (value: number) => void;
  strict: boolean;
  onStrictChange: (value: boolean) => void;
  mode: 'brief' | 'detailed';
  onModeChange: (value: 'brief' | 'detailed') => void;
}

const Composer: React.FC<ComposerProps> = ({
  onSend,
  disabled,
  question,
  onQuestionChange,
  topK,
  onTopKChange,
  strict,
  onStrictChange,
  mode,
  onModeChange,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || disabled) return;

    onSend(question, {
      collections: [], // будет передано из родителя
      topK,
      strict,
      mode,
    });

    onQuestionChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Prompt Controls */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <Sliders size={14} className="text-gray-400" />
          <span className="text-gray-600 dark:text-slate-300">Стиль:</span>
          <div className="flex bg-gray-100 rounded-lg p-0.5 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => onModeChange('brief')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'brief'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                  : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
              }`}
            >
              Кратко
            </button>
            <button
              type="button"
              onClick={() => onModeChange('detailed')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'detailed'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                  : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
              }`}
            >
              Подробно
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-slate-300">Top‑K:</span>
          <input
            type="range"
            min="3"
            max="10"
            value={topK}
            onChange={(e) => onTopKChange(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-gray-900 font-medium w-6 dark:text-slate-100">{topK}</span>
        </div>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={strict}
            onChange={(e) => onStrictChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-600 text-xs dark:text-slate-300">Строго по источникам</span>
        </label>
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
          <Sparkles size={14} className="text-gray-400" />
          Подсказка: Enter — отправить, Shift+Enter — новая строка
        </span>
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Задайте вопрос…"
            rows={2}
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !question.trim()}
          className="shrink-0 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default Composer;

