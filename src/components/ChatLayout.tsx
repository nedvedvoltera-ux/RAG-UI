import React, { useState } from 'react';
import { Layers, MessageSquareText, Menu, PanelRight, X } from 'lucide-react';
import CollectionsSidebar from './chat/CollectionsSidebar';
import ChatSessionsSidebar from './chat/ChatSessionsSidebar';
import ChatThread from './chat/ChatThread';
import RightPanel from './chat/RightPanel';

const ChatLayout: React.FC = () => {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'sources' | 'retrieval' | 'session'>('sources');
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [leftTab, setLeftTab] = useState<'chats' | 'collections'>('chats');

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Left Sidebar (desktop): tabs Chats / Collections */}
      <div className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-shrink-0 dark:bg-slate-950 dark:border-slate-800">
        <div className="h-full w-full flex flex-col">
          <div className="p-2 border-b border-gray-200 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLeftTab('chats')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  leftTab === 'chats'
                    ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <MessageSquareText size={16} />
                Чаты
              </button>
              <button
                type="button"
                onClick={() => setLeftTab('collections')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  leftTab === 'collections'
                    ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Layers size={16} />
                Коллекции
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {leftTab === 'chats' ? (
              <ChatSessionsSidebar />
            ) : (
              <CollectionsSidebar selectedCollections={selectedCollections} onSelectionChange={setSelectedCollections} />
            )}
          </div>
        </div>
      </div>

      {/* Center - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile toolbar */}
        <div className="md:hidden border-b border-gray-200 bg-white px-3 py-2 flex items-center justify-between gap-2 dark:bg-slate-950 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCollectionsOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <Menu size={16} />
            <span className="text-xs font-medium">Коллекции</span>
          </button>

          <button
            type="button"
            onClick={() => setRightPanelOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <PanelRight size={16} />
            <span className="text-xs font-medium">Панель</span>
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <ChatThread
            selectedCollections={selectedCollections}
            onTabChange={(tab) => {
              setActiveTab(tab);
              // удобство на мобилке: после перехода к источникам сразу показываем панель
              setRightPanelOpen(true);
            }}
          />
        </div>
      </div>

      {/* Right Panel - Sources/Retrieval/Session (desktop) */}
      {/* w-80 = 20rem; +15% ~= 23rem */}
      <div className="hidden md:flex w-80 lg:w-[23rem] bg-white border-l border-gray-200 flex-shrink-0 dark:bg-slate-950 dark:border-slate-800">
        <RightPanel activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile drawers */}
      {collectionsOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть"
            onClick={() => setCollectionsOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl flex flex-col dark:bg-slate-950">
            <div className="h-12 px-3 border-b border-gray-200 flex items-center justify-between dark:border-slate-800">
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Навигация</div>
              <button
                type="button"
                onClick={() => setCollectionsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-slate-900"
                aria-label="Закрыть"
              >
                <X size={18} className="text-gray-500 dark:text-slate-300" />
              </button>
            </div>
            <div className="p-2 border-b border-gray-200 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLeftTab('chats')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    leftTab === 'chats'
                      ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <MessageSquareText size={16} />
                  Чаты
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab('collections')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    leftTab === 'collections'
                      ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Layers size={16} />
                  Коллекции
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {leftTab === 'chats' ? (
                <ChatSessionsSidebar />
              ) : (
                <CollectionsSidebar selectedCollections={selectedCollections} onSelectionChange={setSelectedCollections} />
              )}
            </div>
          </div>
        </div>
      )}

      {rightPanelOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть"
            onClick={() => setRightPanelOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-96 max-w-[90vw] bg-white shadow-xl flex flex-col dark:bg-slate-950">
            <div className="h-12 px-3 border-b border-gray-200 flex items-center justify-between dark:border-slate-800">
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Панель</div>
              <button
                type="button"
                onClick={() => setRightPanelOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-slate-900"
                aria-label="Закрыть"
              >
                <X size={18} className="text-gray-500 dark:text-slate-300" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <RightPanel activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;

