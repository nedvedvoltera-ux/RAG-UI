import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { ChatMessage, ChatParams, Source } from '../types';
import { mockService } from '../services/mockService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  // Sources
  currentSources: Source[];
  setCurrentSources: (sources: Source[]) => void;
  highlightedSource: string | null;
  setHighlightedSource: (id: string | null) => void;

  // Chat sessions
  sessions: Array<{
    id: string;
    title: string;
    messages: ChatMessage[];
    updatedAt: string;
  }>;
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  createSession: () => string;
  deleteSession: (id: string) => void;

  // Sending / streaming
  isLoading: boolean;
  streamingMessage: string;
  phase: 'searching' | 'generating' | 'streaming';
  sendMessage: (question: string, params: ChatParams, selectedCollections: string[]) => Promise<void>;
  toggleLike: (messageId: string) => boolean;

  // Unread indicator
  unreadReplies: number;
  setChatRouteActive: (active: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentSources, setCurrentSources] = useState<Source[]>([]);
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);

  const initialSessions = useMemo<ChatContextType['sessions']>(() => {
    const now = new Date().toISOString();
    return [
      {
        id: 'chat-1',
        title: 'Как развернуть сервис…',
        updatedAt: now,
        messages: [
          {
            id: 'chat-1-u1',
            role: 'user' as const,
            contentMd: 'Как развернуть сервис и какие нужны переменные окружения?',
            createdAt: now,
          },
          {
            id: 'chat-1-a1',
            role: 'assistant' as const,
            contentMd: 'Демо: для деплоя проверьте переменные окружения и конфиги. (пример)',
            createdAt: now,
            liked: false,
          },
        ] as ChatMessage[],
      },
      {
        id: 'chat-2',
        title: 'Требования по безопасности…',
        updatedAt: now,
        messages: [
          {
            id: 'chat-2-u1',
            role: 'user' as const,
            contentMd: 'Какие требования по безопасности и хранению данных?',
            createdAt: now,
          },
          {
            id: 'chat-2-a1',
            role: 'assistant' as const,
            contentMd: 'Демо: хранение, доступы и аудит зависят от политик. (пример)',
            createdAt: now,
            liked: false,
          },
        ] as ChatMessage[],
      },
      {
        id: 'chat-3',
        title: 'Архитектура системы…',
        updatedAt: now,
        messages: [
          {
            id: 'chat-3-u1',
            role: 'user' as const,
            contentMd: 'Как устроена архитектура и основные компоненты системы?',
            createdAt: now,
          },
        ] as ChatMessage[],
      },
    ];
  }, []);

  const [sessions, setSessions] = useState<ChatContextType['sessions']>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessions[0]?.id ?? 'chat-1');

  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [phase, setPhase] = useState<'searching' | 'generating' | 'streaming'>('searching');

  const [unreadReplies, setUnreadReplies] = useState(0);
  const [chatRouteActive, setChatRouteActiveState] = useState(true);

  const setChatRouteActive = (active: boolean) => {
    setChatRouteActiveState(active);
    if (active) setUnreadReplies(0);
  };

  const deriveTitle = (question: string) => {
    const clean = question.replace(/\s+/g, ' ').trim();
    const words = clean.split(' ').slice(0, 6).join(' ');
    return words.length < clean.length ? `${words}…` : words || 'Новый чат';
  };

  const createSession = () => {
    const id = `chat-${Date.now()}`;
    const now = new Date().toISOString();
    setSessions((prev) => [
      {
        id,
        title: 'Новый чат',
        updatedAt: now,
        messages: [],
      },
      ...prev,
    ]);
    setActiveSessionId(id);
    return id;
  };

  const deleteSession: ChatContextType['deleteSession'] = (id) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);

      if (activeSessionId !== id) return remaining;

      const nextActive = remaining[0]?.id;
      if (nextActive) {
        setActiveSessionId(nextActive);
        return remaining;
      }

      // если удалили последний чат — создаём новый
      const newId = `chat-${Date.now()}`;
      const now = new Date().toISOString();
      setActiveSessionId(newId);
      return [
        {
          id: newId,
          title: 'Новый чат',
          updatedAt: now,
          messages: [],
        },
      ];
    });
  };

  const sendMessage: ChatContextType['sendMessage'] = async (question, params, selectedCollections) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const sessionId = activeSessionId || createSession();
    const nowIso = new Date().toISOString();

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      contentMd: trimmed,
      createdAt: nowIso,
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const nextTitle = s.messages.length === 0 ? deriveTitle(trimmed) : s.title;
        return {
          ...s,
          title: nextTitle,
          updatedAt: nowIso,
          messages: [...s.messages, userMessage],
        };
      })
    );

    setIsLoading(true);
    setStreamingMessage('');
    setPhase('searching');

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPhase('generating');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await mockService.sendChat(trimmed, {
        ...params,
        user: {
          email: user?.email ?? 'unknown',
          role: user?.role ?? 'employee',
          groups: undefined,
          emailVerified: true,
        },
        collections: selectedCollections.length ? selectedCollections : ['col1', 'col2', 'col3', 'col4'],
      });

      setPhase('streaming');

      const answerText = response.answerMd;
      let currentIndex = 0;

      await new Promise<void>((resolve) => {
        const streamInterval = window.setInterval(() => {
          if (currentIndex < answerText.length) {
            const chunk = answerText.slice(0, currentIndex + 3);
            setStreamingMessage(chunk);
            currentIndex += 3;
          } else {
            window.clearInterval(streamInterval);
            resolve();
          }
        }, 30);
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        contentMd: answerText,
        createdAt: new Date().toISOString(),
        citations: response.sources.map((source, idx) => ({
          id: `cit-${idx}`,
          sourceId: source.id,
          position: idx,
        })),
        liked: false,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, updatedAt: assistantMessage.createdAt, messages: [...s.messages, assistantMessage] }
            : s
        )
      );
      setStreamingMessage('');
      setCurrentSources(response.sources);

      if (!chatRouteActive) setUnreadReplies((v) => v + 1);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        contentMd: 'Произошла ошибка при обработке запроса. Попробуйте ещё раз.',
        createdAt: new Date().toISOString(),
        liked: false,
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, updatedAt: errorMessage.createdAt, messages: [...s.messages, errorMessage] } : s))
      );
      setStreamingMessage('');
      if (!chatRouteActive) setUnreadReplies((v) => v + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike: ChatContextType['toggleLike'] = (messageId) => {
    let nextLiked = false;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const msg = s.messages.find((m) => m.id === messageId);
        if (!msg || msg.role !== 'assistant') return s;
        nextLiked = !(msg.liked ?? false);
        return {
          ...s,
          messages: s.messages.map((m) => (m.id === messageId ? { ...m, liked: nextLiked } : m)),
        };
      })
    );
    return nextLiked;
  };

  return (
    <ChatContext.Provider
      value={{
        currentSources,
        setCurrentSources,
        highlightedSource,
        setHighlightedSource,
        sessions,
        activeSessionId,
        setActiveSessionId,
        createSession,
        deleteSession,
        isLoading,
        streamingMessage,
        phase,
        sendMessage,
        toggleLike,
        unreadReplies,
        setChatRouteActive,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

