import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole, useAuth } from '../contexts/AuthContext';

const roleOptions: Array<{ value: UserRole; label: string; desc: string }> = [
  { value: 'employee', label: 'Сотрудник', desc: 'Базовый доступ: просмотр чата и знаний.' },
  { value: 'manager', label: 'Менеджер', desc: 'Расширенный доступ: наблюдаемость и управление коллекциями.' },
  { value: 'guru', label: 'Гуру', desc: 'Максимальный доступ: экспертные настройки и debug.' },
];

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, displayName, initials, roleLabel, setRole, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [rightsOpen, setRightsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        title="Профиль"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 text-white flex items-center justify-center text-xs font-semibold">
          {initials ?? '??'}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <div className="text-sm font-medium text-gray-900">{displayName ?? 'Профиль'}</div>
          <div className="text-xs text-gray-500">{roleLabel ?? '—'}</div>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 dark:bg-slate-950 dark:border-slate-800">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <UserIcon size={18} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  {user?.lastName} {user?.firstName}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">Роль: {roleLabel}</div>
                <div className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">{user?.email}</div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                setRightsOpen(true);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm dark:hover:bg-slate-900"
            >
              <span className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                <Shield size={16} className="text-gray-400" />
                Права пользователя
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">посмотреть / сменить</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm dark:hover:bg-slate-900"
            >
              <span className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                <LogOut size={16} className="text-gray-400" />
                Выйти
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">демо</span>
            </button>
          </div>
        </div>
      )}

      {rightsOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between dark:border-slate-800">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">Права пользователя</div>
                <div className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">
                  Для демо можно переключать роль — UI будет показывать выбранный уровень.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRightsOpen(false)}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Закрыть
              </button>
            </div>

            <div className="p-6 space-y-3">
              {roleOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`block p-4 rounded-xl border cursor-pointer transition-colors ${
                    user?.role === opt.value ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={user?.role === opt.value}
                      onChange={() => setRole(opt.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{opt.label}</div>
                      <div className="text-xs text-gray-600 mt-1 dark:text-slate-300">{opt.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Сейчас выбрано: <span className="font-semibold text-gray-900 dark:text-slate-100">{roleLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;


