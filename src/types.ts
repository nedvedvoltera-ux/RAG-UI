// Типы данных для RAG UI

export type Collection = {
  id: string;
  name: string;
  docCount: number;
  createdAt: string;
};

export type DocumentStatus = 'uploaded' | 'parsing' | 'indexing' | 'ready' | 'failed';

export type DocumentSourceType = 'upload' | 'confluence' | 'sharepoint';

export type AccessPrincipal =
  | { kind: 'user'; email: string }
  | { kind: 'group'; name: string }
  | { kind: 'role'; role: 'employee' | 'manager' | 'guru' }
  | { kind: 'all_employees' };

export type DocumentAccessMode = 'source' | 'auto' | 'manual';

export type DocumentAccess = {
  mode: DocumentAccessMode;
  // Для manual/auto:
  internalPublic?: boolean; // "Все сотрудники"
  principals?: AccessPrincipal[];
  // Для source:
  sourceManaged?: boolean;
  lastSyncedAt?: string;
  sourceNote?: string;
};

export type Document = {
  id: string;
  collectionId: string;
  name: string;
  type: string;
  size: number;
  status: DocumentStatus;
  updatedAt: string;
  sourceType?: DocumentSourceType;
  uploadedBy?: string; // email
  tags?: string[];
  access?: DocumentAccess;
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
  status?: 'answered' | 'unanswered';
};

export type ChatParams = {
  collections: string[];
  topK: number;
  strict: boolean;
  mode: 'brief' | 'detailed';
  user?: {
    email: string;
    role: 'employee' | 'manager' | 'guru';
    groups?: string[];
    emailVerified?: boolean;
  };
};

export type ChatResponse = {
  answerMd: string;
  sources: Source[];
  debug: ChatRunDebug;
};

export type SecurityPolicy = {
  defaultUploadAccess: 'uploader_and_manager' | 'internal';
  blockConfidentialInRag: boolean;
  requireVerifiedEmail: boolean;
};

export type AuditEntry = {
  id: string;
  time: string;
  actorEmail: string;
  action: 'rag_source_used' | 'doc_access_changed' | 'doc_resynced';
  documentId?: string;
  documentName?: string;
  details?: string;
};

