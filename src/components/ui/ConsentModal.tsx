import { useState } from "react";
import Icon from "@/components/ui/icon";

interface ConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ open, onAccept, onDecline }: ConsentModalProps) {
  const [checkPolicy,  setCheckPolicy]  = useState(false);
  const [checkConsent, setCheckConsent] = useState(false);

  if (!open) return null;

  const canAccept = checkPolicy && checkConsent;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">

        {/* Шапка */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <Icon name="ShieldCheck" size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Обработка персональных данных</h2>
            <p className="text-xs text-gray-500 mt-0.5">Требуется ваше согласие для входа в систему</p>
          </div>
        </div>

        {/* Чекбоксы */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={checkPolicy}
                onChange={(e) => setCheckPolicy(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${checkPolicy ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white group-hover:border-blue-400"}`}>
                {checkPolicy && <Icon name="Check" size={12} className="text-white" />}
              </div>
            </div>
            <span className="text-sm text-gray-700 leading-snug">
              Подтверждаю ознакомление с{" "}
              <a href="#" className="text-blue-600 underline hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
                политикой
              </a>{" "}
              по обработке персональных данных
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={checkConsent}
                onChange={(e) => setCheckConsent(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${checkConsent ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white group-hover:border-blue-400"}`}>
                {checkConsent && <Icon name="Check" size={12} className="text-white" />}
              </div>
            </div>
            <span className="text-sm text-gray-700 leading-snug">
              Даю своё согласие на{" "}
              <a href="#" className="text-blue-600 underline hover:text-blue-700" onClick={(e) => e.stopPropagation()}>
                обработку
              </a>{" "}
              персональных данных
            </span>
          </label>
        </div>

        {/* Лицензионное соглашение */}
        <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
          Продолжая использовать сайт, вы принимаете{" "}
          <a href="#" className="text-blue-600 underline hover:text-blue-700">
            Лицензионное соглашение.
          </a>
        </p>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            Отказаться
          </button>
          <button
            onClick={onAccept}
            disabled={!canAccept}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300"
          >
            Принять и войти
          </button>
        </div>
      </div>
    </div>
  );
}
