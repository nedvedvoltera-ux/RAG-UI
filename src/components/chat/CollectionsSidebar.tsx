import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Search, Settings } from 'lucide-react';
import { mockService } from '../../services/mockService';
import { Collection } from '../../types';

interface CollectionsSidebarProps {
  selectedCollections: string[];
  onSelectionChange: (ids: string[]) => void;
}

const CollectionsSidebar: React.FC<CollectionsSidebarProps> = ({
  selectedCollections,
  onSelectionChange,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

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

  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCollection = (id: string) => {
    if (selectedCollections.includes(id)) {
      onSelectionChange(selectedCollections.filter((cid) => cid !== id));
    } else {
      onSelectionChange([...selectedCollections, id]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Коллекции</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Поиск по коллекциям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            {searchQuery ? 'Коллекции не найдены' : 'Коллекций нет'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredCollections.map((collection) => (
              <div
                key={collection.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCollections.includes(collection.id)
                    ? 'bg-blue-50 border border-blue-200 dark:bg-slate-900 dark:border-slate-700'
                    : 'hover:bg-gray-50 border border-transparent dark:hover:bg-slate-900'
                }`}
                onClick={() => toggleCollection(collection.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Database size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate dark:text-slate-100">
                      {collection.name}
                    </span>
                  </div>
                  {selectedCollections.includes(collection.id) && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  {collection.docCount} документов
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          to="/knowledge"
          className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <Settings size={16} />
          <span>Управлять знаниями</span>
        </Link>
      </div>
    </div>
  );
};

export default CollectionsSidebar;

