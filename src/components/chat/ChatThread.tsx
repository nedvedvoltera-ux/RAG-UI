import React, { useState, useEffect, useMemo, useRef } from 'react';
import MessageBubble from './MessageBubble';
import Composer from './Composer';
import { useChatContext } from '../../contexts/ChatContext';

interface ChatThreadProps {
  selectedCollections: string[];
  onTabChange: (tab: 'sources' | 'retrieval' | 'session') => void;
}

type LoadingPhase = 'searching' | 'generating' | 'streaming';

const PhaseLoader: React.FC<{ phase: LoadingPhase }> = ({ phase }) => {
  const title = phase === 'searching' ? 'Ищу в базе знаний…' : phase === 'generating' ? 'Формирую ответ…' : 'Генерирую…';
  const subtitle =
    phase === 'searching'
      ? 'Подбираю релевантные фрагменты и источники'
      : 'Собираю итоговый ответ на основе найденного контекста';

  return (
    <div className="flex justify-start">
      <div className="max-w-3xl w-full">
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="relative mt-1">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm" />
              <div className="absolute -inset-0.5 rounded-full border border-blue-200 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{title}</div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 dark:text-slate-400">{subtitle}</div>
              <div className="mt-3 space-y-2">
                <div className="h-2 rounded bg-gray-100 overflow-hidden dark:bg-slate-900">
                  <div className="h-2 w-2/3 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 rounded-lg bg-gray-100 animate-pulse dark:bg-slate-900" />
                  <div className="h-8 rounded-lg bg-gray-100 animate-pulse dark:bg-slate-900" />
                  <div className="h-8 rounded-lg bg-gray-100 animate-pulse dark:bg-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatThread: React.FC<ChatThreadProps> = ({ selectedCollections, onTabChange }) => {
  const { sessions, activeSessionId, currentSources, isLoading, streamingMessage, phase, sendMessage, toggleLike: toggleLikeInStore } = useChatContext();
  const [draftQuestion, setDraftQuestion] = useState('');
  const [topK, setTopK] = useState(5);
  const [strict, setStrict] = useState(false);
  const [mode, setMode] = useState<'brief' | 'detailed'>('detailed');
  const [likeAckMessageId, setLikeAckMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeSession = useMemo(() => sessions.find((s) => s.id === activeSessionId), [sessions, activeSessionId]);
  const messages = activeSession?.messages ?? [];

  const demoQuestions = [
    'Как развернуть сервис и какие нужны переменные окружения?',
    'Какие требования по безопасности и хранению данных?',
    'Как устроена архитектура и основные компоненты системы?',
    'Как добавить документы в базу знаний и переиндексировать?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const toggleLike = (messageId: string) => {
    const nextLiked = toggleLikeInStore(messageId);
    if (nextLiked) {
      setLikeAckMessageId(messageId);
      window.setTimeout(() => {
        setLikeAckMessageId((cur) => (cur === messageId ? null : cur));
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Начните диалог
              </h3>
              <p className="text-sm text-gray-500">
                Выберите коллекции слева и задайте вопрос
              </p>

              {/* IVR / quick questions inside chat body */}
              <div className="mt-5 max-w-xl mx-auto">
                <div className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 flex items-center justify-center gap-2">
                  Быстрые вопросы (IVR)
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {demoQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setDraftQuestion(q);
                        sendMessage(
                          q,
                          {
                          collections: [],
                          topK,
                          strict,
                          mode,
                          },
                          selectedCollections
                        ).then(() => onTabChange('sources'));
                        setDraftQuestion('');
                      }}
                      className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                      title="Отправить быстрый вопрос"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            sources={currentSources}
            onCitationClick={(sourceId) => {
              onTabChange('sources');
            }}
            onToggleLike={(messageId) => {
              toggleLike(messageId);
            }}
            showLikeAck={likeAckMessageId === message.id}
          />
        ))}

        {isLoading && streamingMessage && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              contentMd: streamingMessage,
              createdAt: new Date().toISOString(),
            }}
            sources={[]}
          />
        )}

        {isLoading && !streamingMessage && <PhaseLoader phase={phase} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-950">
        <Composer
          onSend={(question, params) => sendMessage(question, params, selectedCollections).then(() => onTabChange('sources'))}
          disabled={isLoading}
          question={draftQuestion}
          onQuestionChange={setDraftQuestion}
          topK={topK}
          onTopKChange={setTopK}
          strict={strict}
          onStrictChange={setStrict}
          mode={mode}
          onModeChange={setMode}
        />
      </div>
    </div>
  );
};

export default ChatThread;

