import React from 'react';
import { Clock, MessageSquare, Database } from 'lucide-react';

const SessionPanel: React.FC = () => {
  // Мок-данные для демонстрации
  const sessionData = {
    messageCount: 3,
    collections: ['Документация продукта', 'Инженерная вики'],
    startedAt: new Date().toISOString(),
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs font-medium text-gray-500 uppercase mb-3">
        Сведения о сессии
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <MessageSquare size={16} className="text-gray-400" />
          <span className="text-gray-600">Сообщений:</span>
          <span className="font-medium text-gray-900">{sessionData.messageCount}</span>
        </div>

        <div className="flex items-start space-x-2 text-sm">
          <Database size={16} className="text-gray-400 mt-0.5" />
          <div className="flex-1">
            <span className="text-gray-600">Коллекции:</span>
            <div className="mt-1 space-y-1">
              {sessionData.collections.map((col, idx) => (
                <div key={idx} className="text-xs text-gray-500">
                  • {col}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-600">Начало:</span>
          <span className="font-medium text-gray-900">
            {new Date(sessionData.startedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
          Очистить сессию
        </button>
      </div>
    </div>
  );
};

export default SessionPanel;

