import React, { useMemo, useState } from 'react';
import { CalendarDays, LineChart, PieChart } from 'lucide-react';

type Period = 'day' | 'week' | 'month';

const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [from, setFrom] = useState<string>(() => new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString().slice(0, 10));
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const points = useMemo(() => {
    // Мок-активность: количество чатов по датам (7 точек)
    const base =
      period === 'day'
        ? [2, 5, 4, 6, 3, 7, 5]
        : period === 'week'
          ? [18, 22, 17, 25, 19, 28, 21]
          : [70, 84, 92, 78, 96, 105, 88];

    const today = new Date();
    return base.map((count, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (base.length - 1 - i));
      const label = d.toISOString().slice(5, 10); // MM-DD
      return { xLabel: label, count };
    });
  }, [period]);

  const total = useMemo(() => points.reduce((a, b) => a + b.count, 0), [points]);
  const max = useMemo(() => Math.max(...points.map((p) => p.count), 1), [points]);

  const feedback = useMemo(() => {
    // Мок оценок пользователей: помог / не помог (2 варианта)
    const helped = Math.max(1, Math.round(total * 0.78));
    const notHelped = Math.max(1, Math.round(total * 0.22));
    const sum = helped + notHelped;
    const helpedPct = Math.round((helped / sum) * 100);
    const notHelpedPct = Math.max(0, 100 - helpedPct);
    return { helped, notHelped, sum, helpedPct, notHelpedPct };
  }, [total]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-slate-950">
      <div className="p-6 border-b border-gray-200 bg-white dark:bg-slate-950 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Дашборд</h1>
            <p className="text-sm text-gray-500 mt-1 dark:text-slate-400">
              Активность чатов и метрики за выбранный период
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white dark:bg-slate-950 dark:border-slate-800">
              <CalendarDays size={16} className="text-gray-400" />
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="text-sm bg-transparent outline-none text-gray-700 dark:text-slate-200"
              />
              <span className="text-xs text-gray-400">—</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="text-sm bg-transparent outline-none text-gray-700 dark:text-slate-200"
              />
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setPeriod('day')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  period === 'day'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
                }`}
              >
                День
              </button>
              <button
                type="button"
                onClick={() => setPeriod('week')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  period === 'week'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
                }`}
              >
                Неделя
              </button>
              <button
                type="button"
                onClick={() => setPeriod('month')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  period === 'month'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                    : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100'
                }`}
              >
                Месяц
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LineChart size={18} className="text-gray-400" />
                <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Активность чатов (линия)</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                {from} → {to} • всего {total}
              </div>
            </div>

            <div className="h-48">
              <svg viewBox="0 0 700 200" className="w-full h-full">
                {/* grid */}
                <line x1="40" y1="20" x2="40" y2="170" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
                <line x1="40" y1="170" x2="680" y2="170" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
                <line x1="40" y1="120" x2="680" y2="120" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
                <line x1="40" y1="70" x2="680" y2="70" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />

                {/* y labels */}
                <text x="10" y="175" fontSize="10" fill="rgba(100,116,139,0.9)">0</text>
                <text x="6" y="125" fontSize="10" fill="rgba(100,116,139,0.9)">{Math.round(max * 0.33)}</text>
                <text x="6" y="75" fontSize="10" fill="rgba(100,116,139,0.9)">{Math.round(max * 0.66)}</text>
                <text x="6" y="25" fontSize="10" fill="rgba(100,116,139,0.9)">{max}</text>

                {/* line */}
                {(() => {
                  const left = 50;
                  const right = 670;
                  const top = 20;
                  const bottom = 170;
                  const step = (right - left) / Math.max(points.length - 1, 1);
                  const mapY = (v: number) => bottom - ((v / max) * (bottom - top));
                  const d = points
                    .map((p, i) => {
                      const x = left + step * i;
                      const y = mapY(p.count);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ');
                  return (
                    <>
                      <path d={d} fill="none" stroke="#3b82f6" strokeWidth="3" />
                      {points.map((p, i) => {
                        const x = left + step * i;
                        const y = mapY(p.count);
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="4" fill="#3b82f6" />
                            <text x={x} y={190} textAnchor="middle" fontSize="10" fill="rgba(100,116,139,0.9)">
                              {p.xLabel}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              \(x\) — дата, \(y\) — количество чатов
            </div>
          </div>

          {/* Donut (feedback) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={18} className="text-gray-400" />
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Оценка полезности</div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="h-24 w-24 rounded-full"
                style={{
                  background: `conic-gradient(#10b981 0 ${feedback.helpedPct}%, #ef4444 ${feedback.helpedPct}% 100%)`,
                }}
                title="Помог / не помог"
              />
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-700 dark:text-slate-200">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Помог
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{feedback.helped}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-700 dark:text-slate-200">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                    Не помог
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{feedback.notHelped}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-slate-400">
              Моковые метрики для UI. Позже можно подключить реальные данные.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

