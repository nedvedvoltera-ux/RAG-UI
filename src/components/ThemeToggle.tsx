import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
      title={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
    >
      {isDark ? <Moon size={16} className="text-sky-300" /> : <Sun size={16} className="text-amber-500" />}
      <span className="hidden sm:inline text-xs font-medium">{isDark ? 'Ночь' : 'День'}</span>
    </button>
  );
};

export default ThemeToggle;


