// Типы данных для RAG UI

export type Collection = {
  id: string;
  name: string;
  docCount: number;
  createdAt: string;
};

export type DocumentStatus = 'uploaded' | 'parsing' | 'indexing' | 'ready' | 'failed';

export type Document = {
  id: string;
  collectionId: string;
  name: string;
  type: string;
  size: number;
  status: DocumentStatus;
  updatedAt: string;
};

export type CitationRef = {
  id: string;
  sourceId: string;
  position: number; // позиция в тексте
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  contentMd: string;
  createdAt: string;
  citations?: CitationRef[];
  liked?: boolean;
};

export type Source = {
  id: string;
  title: string;
  url?: string;
  score: number;
  snippet: string;
  meta: {
    collectionId: string;
    collectionName: string;
    documentId: string;
    documentName: string;
    chunkIndex?: number;
  };
};

export type ChatRunDebug = {
  topK: number;
  strict: boolean;
  mode: 'brief' | 'detailed';
  retrievalMs: number;
  llmMs: number;
  totalMs: number;
  retrievedChunks: number;
};

export type RequestLogItem = {
  id: string;
  time: string;
  question: string;
  collectionIds: string[];
  latencyMs: number;
  topK: number;
  model: string;
  debug?: ChatRunDebug;
};

export type ChatParams = {
  collections: string[];
  topK: number;
  strict: boolean;
  mode: 'brief' | 'detailed';
};

export type ChatResponse = {
  answerMd: string;
  sources: Source[];
  debug: ChatRunDebug;
};

