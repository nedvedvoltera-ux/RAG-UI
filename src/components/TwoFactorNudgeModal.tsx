import React, { useMemo, useState } from 'react';
import { ShieldCheck, LockKeyhole, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  title: string;
  body: string;
  icon: React.ElementType;
  Illustration: React.FC;
};

const SvgFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:bg-slate-950 dark:border-slate-800">
    <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center px-3 gap-2 dark:bg-slate-900 dark:border-slate-800">
      <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
      <div className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
      <div className="h-2.5 w-2.5 rounded-full bg-green-300" />
      <div className="ml-2 text-xs text-gray-500 dark:text-slate-400">CorpRAG UI</div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const IlloChatSources: React.FC = () => (
  <SvgFrame>
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-2 space-y-2">
        <div className="h-8 w-1/2 bg-gray-100 rounded-lg" />
        <div className="space-y-2">
          <div className="h-10 bg-blue-50 border border-blue-100 rounded-xl" />
          <div className="h-16 bg-gray-50 border border-gray-100 rounded-xl relative">
            <div className="absolute right-3 top-3 flex gap-1">
              <div className="h-5 w-5 rounded bg-blue-100" />
              <div className="h-5 w-5 rounded bg-blue-100" />
              <div className="h-5 w-5 rounded bg-blue-100" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-6 w-2/3 bg-gray-100 rounded-lg" />
        <div className="h-14 bg-white border border-gray-200 rounded-xl" />
        <div className="h-14 bg-white border border-gray-200 rounded-xl" />
        <div className="h-14 bg-white border border-gray-200 rounded-xl" />
      </div>
    </div>
  </SvgFrame>
);

const IlloTwoFactor: React.FC = () => (
  <SvgFrame>
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
        <ShieldCheck className="text-green-600" size={18} />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-5 w-2/3 bg-gray-100 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-11/12 bg-gray-100 rounded" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-9 rounded-lg bg-blue-600/10 border border-blue-200" />
          <div className="h-9 rounded-lg bg-gray-50 border border-gray-200" />
        </div>
      </div>
    </div>
  </SvgFrame>
);

const IlloLogin: React.FC = () => (
  <SvgFrame>
    <div className="max-w-sm mx-auto space-y-3">
      <div className="h-7 w-1/2 bg-gray-100 rounded-lg mx-auto" />
      <div className="h-10 bg-white border border-gray-200 rounded-lg" />
      <div className="h-10 bg-white border border-gray-200 rounded-lg" />
      <div className="h-10 bg-blue-600 rounded-lg" />
      <div className="h-3 w-2/3 bg-gray-100 rounded mx-auto" />
    </div>
  </SvgFrame>
);

const slides: Slide[] = [
  {
    title: 'Зачем нужна 2FA',
    body: 'Двухфакторная аутентификация защищает аккаунт даже если пароль утёк. Это особенно важно для корпоративных данных и баз знаний.',
    icon: ShieldCheck,
    Illustration: IlloTwoFactor,
  },
  {
    title: 'Как это выглядит в CorpRAG',
    body: 'В чате ответы сопровождаются источниками. 2FA помогает сохранить доверие к данным и предотвращает несанкционированный доступ.',
    icon: FileText,
    Illustration: IlloChatSources,
  },
  {
    title: 'Что нужно сделать',
    body: 'Установите 2FA в течение 7 дней. В демо эта кнопка не выполняет реальных действий — только показывает UX.',
    icon: LockKeyhole,
    Illustration: IlloLogin,
  },
];

const Dot: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-2.5 w-2.5 rounded-full transition-colors ${active ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
    aria-label="Перейти к слайду"
  />
);

const TwoFactorNudgeModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onPrimary?: () => void;
}> = ({ open, onClose, onPrimary }) => {
  const [idx, setIdx] = useState(0);
  const slide = slides[idx];

  const deadlineText = useMemo(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString();
  }, []);

  if (!open) return null;

  const Icon = slide.icon;
  const Illustration = slide.Illustration;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden dark:bg-slate-950 dark:border dark:border-slate-800">
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 dark:border-slate-800">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">Обязательная 2FA в течение 7 дней</div>
            <div className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">
              Рекомендуемый дедлайн: <span className="font-medium text-gray-700 dark:text-slate-200">{deadlineText}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Закрыть
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Icon size={18} className="text-blue-700" />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold text-gray-900 dark:text-slate-100">{slide.title}</div>
                <div className="text-sm text-gray-600 mt-1 dark:text-slate-300">{slide.body}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIdx((v) => Math.max(0, v - 1))}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                  disabled={idx === 0}
                >
                  <span className="inline-flex items-center gap-1">
                    <ChevronLeft size={16} />
                    Назад
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((v) => Math.min(slides.length - 1, v + 1))}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                  disabled={idx === slides.length - 1}
                >
                  <span className="inline-flex items-center gap-1">
                    Вперёд
                    <ChevronRight size={16} />
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <Dot key={i} active={i === idx} onClick={() => setIdx(i)} />
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  onPrimary?.();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Установить 2FA сейчас (демо)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Напомнить позже (демо)
              </button>
            </div>
          </div>

          <div className="lg:pt-1">
            <Illustration />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorNudgeModal;


