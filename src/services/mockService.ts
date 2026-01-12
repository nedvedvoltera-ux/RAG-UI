// Мок-сервис для имитации API запросов
import { Collection, Document, ChatResponse, ChatParams, RequestLogItem, Source } from '../types';

// Мок-данные
const mockCollections: Collection[] = [
  { id: 'col1', name: 'Документация продукта', docCount: 12, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'col2', name: 'Инженерная вики', docCount: 45, createdAt: '2024-01-10T14:30:00Z' },
  { id: 'col3', name: 'Политики компании', docCount: 8, createdAt: '2024-01-05T09:15:00Z' },
  { id: 'col4', name: 'Исследования и статьи', docCount: 23, createdAt: '2024-01-20T16:45:00Z' },
];

const mockDocuments: Document[] = [
  { id: 'doc1', collectionId: 'col1', name: 'Справочник API v2.1.pdf', type: 'application/pdf', size: 2048576, status: 'ready', updatedAt: '2024-01-15T10:05:00Z' },
  { id: 'doc2', collectionId: 'col1', name: 'Руководство пользователя.md', type: 'text/markdown', size: 512000, status: 'ready', updatedAt: '2024-01-15T10:10:00Z' },
  { id: 'doc3', collectionId: 'col1', name: 'Обзор архитектуры.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1536000, status: 'indexing', updatedAt: '2024-01-15T11:00:00Z' },
  { id: 'doc4', collectionId: 'col2', name: 'Гайд по деплою.md', type: 'text/markdown', size: 256000, status: 'ready', updatedAt: '2024-01-10T15:00:00Z' },
  { id: 'doc5', collectionId: 'col2', name: 'Траблшутинг.pdf', type: 'application/pdf', size: 1024000, status: 'ready', updatedAt: '2024-01-10T15:30:00Z' },
  { id: 'doc6', collectionId: 'col3', name: 'Кодекс поведения.pdf', type: 'application/pdf', size: 128000, status: 'ready', updatedAt: '2024-01-05T09:20:00Z' },
  { id: 'doc7', collectionId: 'col4', name: 'ML-исследования 2024.pdf', type: 'application/pdf', size: 3072000, status: 'parsing', updatedAt: '2024-01-20T17:00:00Z' },
];

const mockRequestLogs: RequestLogItem[] = [
  {
    id: 'req1',
    time: '2024-01-25T10:30:15Z',
    question: 'Как развернуть приложение?',
    collectionIds: ['col1', 'col2'],
    latencyMs: 1250,
    topK: 5,
    model: 'gpt-4-turbo',
  },
  {
    id: 'req2',
    time: '2024-01-25T10:28:42Z',
    question: 'Какие требования по безопасности?',
    collectionIds: ['col3'],
    latencyMs: 980,
    topK: 3,
    model: 'gpt-4-turbo',
  },
  {
    id: 'req3',
    time: '2024-01-25T10:25:10Z',
    question: 'Объясни архитектуру системы',
    collectionIds: ['col1', 'col2', 'col4'],
    latencyMs: 2100,
    topK: 7,
    model: 'gpt-4-turbo',
  },
];

// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const randomDelay = () => delay(300 + Math.random() * 600);

// Генерация мок-источников
const generateMockSources = (_question: string, count: number): Source[] => {
  const sources: Source[] = [];
  const collections = mockCollections.filter(c => mockDocuments.some(d => d.collectionId === c.id));
  
  for (let i = 0; i < count; i++) {
    const collection = collections[i % collections.length];
    const doc = mockDocuments.find(d => d.collectionId === collection.id) || mockDocuments[0];
    
    sources.push({
      id: `src${i + 1}`,
      title: doc.name,
      url: `https://docs.example.com/${collection.id}/${doc.id}`,
      score: 0.95 - i * 0.1,
      snippet: `Релевантный фрагмент из «${doc.name}». Здесь описаны ключевые детали и выдержки, на которые опирается ответ.`,
      meta: {
        collectionId: collection.id,
        collectionName: collection.name,
        documentId: doc.id,
        documentName: doc.name,
        chunkIndex: i,
      },
    });
  }
  
  return sources;
};

// Один и тот же “демо-ответ” для любых вопросов (для прототипа UI)
const DEMO_ANSWER_MD_RU = `Ниже — **демо-ответ** (одинаковый для любых вопросов), чтобы можно было прогонять UX и trust-layer.\n\n## Что я нашёл в базе знаний\n\n- Сервис использует **RAG-подход**: сначала поиск по коллекциям, затем генерация ответа.\n- В ответе показываем **цитаты** и даём возможность открыть источники справа.\n\n## Рекомендация\n\n- Уточните, какие коллекции должны быть подключены.\n- Включайте «**Строго по источникам**», если важна проверяемость.\n\n> Примечание: это прототип. TODO: заменить mockService на реальный API.`;

export const mockService = {
  // Collections
  async listCollections(): Promise<Collection[]> {
    await randomDelay();
    return [...mockCollections];
  },

  async createCollection(name: string): Promise<Collection> {
    await randomDelay();
    const newCollection: Collection = {
      id: `col${Date.now()}`,
      name,
      docCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockCollections.push(newCollection);
    return newCollection;
  },

  async deleteCollection(id: string): Promise<void> {
    await randomDelay();
    const index = mockCollections.findIndex(c => c.id === id);
    if (index > -1) {
      mockCollections.splice(index, 1);
    }
  },

  async renameCollection(id: string, newName: string): Promise<Collection> {
    await randomDelay();
    const collection = mockCollections.find(c => c.id === id);
    if (collection) {
      collection.name = newName;
      return { ...collection };
    }
    throw new Error('Collection not found');
  },

  // Documents
  async listDocuments(collectionId: string): Promise<Document[]> {
    await randomDelay();
    return mockDocuments.filter(d => d.collectionId === collectionId);
  },

  async uploadMockDocument(collectionId: string, file: { name: string; size: number; type: string }): Promise<Document> {
    await randomDelay();
    const newDoc: Document = {
      id: `doc${Date.now()}`,
      collectionId,
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploaded',
      updatedAt: new Date().toISOString(),
    };
    mockDocuments.push(newDoc);
    
    // Обновляем счетчик документов
    const collection = mockCollections.find(c => c.id === collectionId);
    if (collection) {
      collection.docCount++;
    }
    
    // Имитация процесса парсинга и индексации
    setTimeout(() => {
      newDoc.status = 'parsing';
      setTimeout(() => {
        newDoc.status = 'indexing';
        setTimeout(() => {
          newDoc.status = 'ready';
        }, 2000);
      }, 1500);
    }, 500);
    
    return newDoc;
  },

  async deleteDocument(id: string): Promise<void> {
    await randomDelay();
    const index = mockDocuments.findIndex(d => d.id === id);
    if (index > -1) {
      const doc = mockDocuments[index];
      mockDocuments.splice(index, 1);
      
      // Обновляем счетчик
      const collection = mockCollections.find(c => c.id === doc.collectionId);
      if (collection) {
        collection.docCount--;
      }
    }
  },

  async reindexDocument(id: string): Promise<void> {
    await randomDelay();
    const doc = mockDocuments.find(d => d.id === id);
    if (doc) {
      doc.status = 'indexing';
      setTimeout(() => {
        doc.status = 'ready';
      }, 2000);
    }
  },

  // Chat
  async sendChat(question: string, params: ChatParams): Promise<ChatResponse> {
    await randomDelay();
    
    const retrievalMs = 200 + Math.random() * 300;
    const llmMs = 500 + Math.random() * 800;
    const totalMs = retrievalMs + llmMs;
    
    const sources = generateMockSources(question, params.topK);
    const answerMd = DEMO_ANSWER_MD_RU;
    
    const debug = {
      topK: params.topK,
      strict: params.strict,
      mode: params.mode,
      retrievalMs: Math.round(retrievalMs),
      llmMs: Math.round(llmMs),
      totalMs: Math.round(totalMs),
      retrievedChunks: sources.length,
    };
    
    // Добавляем в лог
    const logItem: RequestLogItem = {
      id: `req${Date.now()}`,
      time: new Date().toISOString(),
      question,
      collectionIds: params.collections,
      latencyMs: Math.round(totalMs),
      topK: params.topK,
      model: 'gpt-4-turbo',
      debug,
    };
    mockRequestLogs.unshift(logItem);
    
    return {
      answerMd,
      sources,
      debug,
    };
  },

  // Request Logs
  async getRequestLogs(): Promise<RequestLogItem[]> {
    await randomDelay();
    return [...mockRequestLogs];
  },

  async getRequestLogDetails(id: string): Promise<RequestLogItem | null> {
    await randomDelay();
    return mockRequestLogs.find(log => log.id === id) || null;
  },
};

