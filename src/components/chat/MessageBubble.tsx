import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Source } from '../../types';
import { ThumbsUp, User, Bot } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';

interface MessageBubbleProps {
  message: ChatMessage;
  sources: Source[];
  onCitationClick?: (sourceId: string) => void;
  onToggleLike?: (messageId: string) => void;
  showLikeAck?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sources,
  onCitationClick,
  onToggleLike,
  showLikeAck,
}) => {
  const { setHighlightedSource } = useChatContext();
  const isUser = message.role === 'user';

  // Обработка цитат в тексте
  const renderContentWithCitations = () => {
    if (isUser || !message.citations || message.citations.length === 0) {
      return <ReactMarkdown>{message.contentMd}</ReactMarkdown>;
    }

    // Простая замена: добавляем маркеры цитат
    let content = message.contentMd;
    message.citations.forEach((citation, idx) => {
      const marker = `[${idx + 1}]`;
      // Вставляем маркер в случайные места для демонстрации
      if (idx === 0 && content.includes('.')) {
        content = content.replace('.', `.${marker}`);
      } else {
        content += ` ${marker}`;
      }
    });

    // Разбиваем на части и рендерим с кликабельными цитатами
    const parts = content.split(/(\[\d+\])/g);
    
    return (
      <div>
        {parts.map((part, idx) => {
          const citationMatch = part.match(/\[(\d+)\]/);
          if (citationMatch) {
            const citationIndex = parseInt(citationMatch[1]) - 1;
            const citation = message.citations?.[citationIndex];
            if (citation) {
              const source = sources.find((s) => s.id === citation.sourceId);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setHighlightedSource(citation.sourceId);
                    onCitationClick?.(citation.sourceId);
                  }}
                  className="inline-flex items-center justify-center w-5 h-5 mx-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                  title={source?.title || 'Source'}
                >
                  {citationMatch[1]}
                </button>
              );
            }
          }
          if (part.trim()) {
            return <ReactMarkdown key={idx}>{part}</ReactMarkdown>;
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 sm:gap-3 max-w-full sm:max-w-3xl ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-gray-600" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
          <div
            className={`inline-block px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-900 border border-gray-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800'
            }`}
          >
            <div
              className={`prose prose-sm max-w-none ${
                isUser
                  ? 'prose-invert text-white'
                  : 'prose-gray dark:prose-invert dark:text-slate-100'
              }`}
            >
              {renderContentWithCitations()}
            </div>
          </div>
          <div className={`mt-1 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>

            {!isUser && onToggleLike && message.id !== 'streaming' && (
              <button
                type="button"
                onClick={() => onToggleLike?.(message.id)}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs transition-colors ${
                  message.liked
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900'
                }`}
                title="Ответ корректный"
              >
                <ThumbsUp size={14} className={message.liked ? 'fill-emerald-500 text-emerald-600' : ''} />
                <span className="hidden sm:inline">Ок</span>
              </button>
            )}

            {!isUser && showLikeAck && (
              <span className="text-xs text-emerald-700 dark:text-emerald-200">
                ответ учтён как корректный
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

