import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Database, Settings, Menu, X, BarChart3 } from 'lucide-react';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import { useChatContext } from '../contexts/ChatContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { unreadReplies, setChatRouteActive } = useChatContext();

  const navItems = [
    { path: '/chat', label: 'Чат', icon: MessageSquare },
    { path: '/knowledge', label: 'Знания', icon: Database },
    { path: '/dashboard', label: 'Активность', icon: BarChart3 },
    { path: '/admin', label: 'Админ', icon: Settings },
  ];

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setChatRouteActive(location.pathname === '/chat');
  }, [location.pathname, setChatRouteActive]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 dark:bg-slate-950 dark:border-slate-800">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 sm:gap-8 min-w-0">
              <button
                type="button"
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-slate-900"
                aria-label="Открыть меню"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu size={20} className="text-gray-700 dark:text-slate-200" />
              </button>

              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate dark:text-slate-100">CorpRAG UI</h1>

              <nav className="hidden sm:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="relative">
                        {item.label}
                        {item.path === '/chat' && unreadReplies > 0 && (
                          <span className="absolute -top-2 -right-4 min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold flex items-center justify-center">
                            {unreadReplies}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline-flex px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Демо‑режим
              </span>
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть меню"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-xl dark:bg-slate-950 dark:border-slate-800">
            <div className="h-16 px-4 flex items-center justify-between">
              <div className="text-base font-semibold text-gray-900 dark:text-slate-100">Меню</div>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-slate-900"
                aria-label="Закрыть"
                onClick={() => setMobileNavOpen(false)}
              >
                <X size={20} className="text-gray-700 dark:text-slate-200" />
              </button>
            </div>
            <div className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-sky-200'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{item.label}</span>
                    {item.path === '/chat' && unreadReplies > 0 && (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold flex items-center justify-center">
                        {unreadReplies}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;

