import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('v.shargaev@corp.example');
  const [password, setPassword] = useState('demo-password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden dark:bg-slate-950 dark:border-slate-800">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800">
            <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">Вход в CorpRAG</div>
            <div className="text-sm text-gray-500 mt-1 dark:text-slate-400">Демо‑авторизация без реального бэкенда</div>
          </div>

          <form
            className="p-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              if (!email.trim() || !password.trim()) {
                setError('Введите корпоративную почту и пароль');
                return;
              }
              try {
                setLoading(true);
                await login(email.trim(), password);
              } catch (err) {
                console.error(err);
                setError('Не удалось войти (демо). Попробуйте ещё раз.');
              } finally {
                setLoading(false);
              }
            }}
          >
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            <label className="block">
              <div className="text-xs font-medium text-gray-600 mb-1 dark:text-slate-300">Корпоративная почта</div>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@corp.example"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="block">
              <div className="text-xs font-medium text-gray-600 mb-1 dark:text-slate-300">Пароль</div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                  autoComplete="current-password"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Входим…' : 'Войти'}
            </button>

            <div className="text-xs text-gray-500 text-center">
              Все кнопки — демо. TODO: заменить mock login на реальный SSO/IdP.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


