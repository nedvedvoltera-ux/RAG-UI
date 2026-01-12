import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Edit2, Upload, RefreshCw, X } from 'lucide-react';
import { mockService } from '../services/mockService';
import { Collection, Document } from '../types';

const KnowledgePage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState<{
    active: boolean;
    total: number;
    done: number;
    startedAt: number;
    currentName?: string;
  }>({ active: false, total: 0, done: 0, startedAt: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadDocuments(selectedCollection);
    } else {
      setDocuments([]);
    }
  }, [selectedCollection]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await mockService.listCollections();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (collectionId: string) => {
    setDocumentsLoading(true);
    try {
      const data = await mockService.listDocuments(collectionId);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      const newCollection = await mockService.createCollection(newCollectionName);
      setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm('Удалить коллекцию?')) return;
    try {
      await mockService.deleteCollection(id);
      setCollections(collections.filter((c) => c.id !== id));
      if (selectedCollection === id) {
        setSelectedCollection(null);
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };

  const handleRenameCollection = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const updated = await mockService.renameCollection(id, editName);
      setCollections(collections.map((c) => (c.id === id ? updated : c)));
      setEditingCollection(null);
      setEditName('');
    } catch (error) {
      console.error('Failed to rename collection:', error);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !selectedCollection) return;

    // чтобы повторно выбрать тот же файл
    e.target.value = '';

    const startedAt = Date.now();
    setUploading({ active: true, total: files.length, done: 0, startedAt, currentName: files[0]?.name });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploading((cur) => ({ ...cur, currentName: file.name, done: i }));
        await mockService.uploadMockDocument(selectedCollection, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
        setUploading((cur) => ({ ...cur, done: i + 1 }));
      }
      loadDocuments(selectedCollection);
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploading((cur) => ({ ...cur, active: false, currentName: undefined }));
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Удалить документ?')) return;
    try {
      await mockService.deleteDocument(id);
      if (selectedCollection) {
        loadDocuments(selectedCollection);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleReindex = async (id: string) => {
    try {
      await mockService.reindexDocument(id);
      if (selectedCollection) {
        loadDocuments(selectedCollection);
      }
    } catch (error) {
      console.error('Failed to reindex document:', error);
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'uploaded':
      case 'parsing':
      case 'indexing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Document['status']) => {
    switch (status) {
      case 'uploaded':
        return 'загружен';
      case 'parsing':
        return 'разбор';
      case 'indexing':
        return 'индексация';
      case 'ready':
        return 'готов';
      case 'failed':
        return 'ошибка';
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (!uploading.active) return;
    const t = window.setInterval(() => setNowTick(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [uploading.active]);

  const elapsedMs = useMemo(() => nowTick - uploading.startedAt, [nowTick, uploading.startedAt]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Collections */}
      <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col dark:bg-slate-950 dark:border-slate-800">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Коллекции</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Создать коллекцию"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Пока нет коллекций
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedCollection === collection.id
                      ? 'bg-blue-50 border-blue-200 dark:bg-slate-900 dark:border-slate-700'
                      : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  {editingCollection === collection.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameCollection(collection.id);
                          } else if (e.key === 'Escape') {
                            setEditingCollection(null);
                            setEditName('');
                          }
                        }}
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleRenameCollection(collection.id)}
                          className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => {
                            setEditingCollection(null);
                            setEditName('');
                          }}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="cursor-pointer"
                        onClick={() => setSelectedCollection(collection.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {collection.name}
                          </h3>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {collection.docCount} documents
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <button
                          onClick={() => {
                            setEditingCollection(collection.id);
                            setEditName(collection.name);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
                          title="Переименовать"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors dark:text-slate-400 dark:hover:text-red-300"
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Content - Documents */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-slate-950">
        {selectedCollection ? (
          <>
            <div className="p-6 border-b border-gray-200 bg-white dark:bg-slate-950 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {collections.find((c) => c.id === selectedCollection)?.name}
              </h2>
            </div>

            {/* Upload Area */}
            <div className="p-6 border-b border-gray-200 bg-white dark:bg-slate-950 dark:border-slate-800">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 dark:bg-slate-900 dark:border-slate-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Нажмите, чтобы загрузить</span> или перетащите файл
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX, MD, TXT (демо)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUploadFile}
                  accept=".pdf,.docx,.md,.txt"
                  multiple
                />
              </label>

              {uploading.active && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:bg-slate-950 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        Загрузка файлов: {uploading.done}/{uploading.total}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 dark:text-slate-400">
                        Прошло: {formatElapsed(elapsedMs)}
                        {uploading.currentName ? ` • Сейчас: ${uploading.currentName}` : ''}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {uploading.total > 0 ? Math.round((uploading.done / uploading.total) * 100) : 0}%
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded bg-gray-100 overflow-hidden dark:bg-slate-900">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 transition-all"
                      style={{
                        width: `${uploading.total > 0 ? Math.round((uploading.done / uploading.total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-gray-500 dark:text-slate-400">
                    После загрузки документ будет проходить стадии “разбор/индексация” в фоне.
                  </div>
                </div>
              )}
            </div>

            {/* Documents Table */}
            <div className="flex-1 overflow-y-auto p-6">
              {documentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500 dark:text-slate-400">В этой коллекции пока нет документов</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-slate-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Имя
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Тип
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Размер
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Обновлено
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-950 dark:divide-slate-800">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-slate-900">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                            {doc.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                            {doc.type.split('/').pop()?.toUpperCase() || doc.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                            {formatFileSize(doc.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                doc.status
                              )}`}
                            >
                              {getStatusLabel(doc.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            {doc.status === 'ready' && (
                              <button
                                onClick={() => handleReindex(doc.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Переиндексировать"
                              >
                                <RefreshCw size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Удалить"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 mb-2">
                Выберите коллекцию
              </p>
              <p className="text-sm text-gray-500">
                Слева выберите коллекцию, чтобы увидеть документы
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 dark:bg-slate-950 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Создать коллекцию</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollectionName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Название коллекции"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCollection();
                } else if (e.key === 'Escape') {
                  setShowCreateModal(false);
                  setNewCollectionName('');
                }
              }}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateCollection}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Создать
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollectionName('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgePage;

