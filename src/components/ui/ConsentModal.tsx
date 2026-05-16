import { useState } from "react";
import Icon from "@/components/ui/icon";

const LICENSE_TEXT = `ЛИЦЕНЗИОННОЕ СОГЛАШЕНИЕ

Настоящее лицензионное соглашение (далее — Соглашение) регулирует условия использования программного обеспечения «Интеллектуальная система подготовки» (далее — Система).

1. ПРЕДМЕТ СОГЛАШЕНИЯ

1.1. Оператор предоставляет Пользователю неисключительное право использования Системы в целях дистанционного обучения, тестирования и получения удостоверений о повышении квалификации.

1.2. Использование Системы допускается исключительно в рамках деятельности организации, от имени которой зарегистрирован Пользователь.

2. ПРАВА И ОБЯЗАННОСТИ ПОЛЬЗОВАТЕЛЯ

2.1. Пользователь вправе:
— получать доступ к учебным материалам и курсам, назначенным администратором;
— проходить тестирование и получать результаты;
— просматривать историю обучения и сведения об удостоверениях.

2.2. Пользователь обязуется:
— не передавать учётные данные третьим лицам;
— не копировать и не распространять учебные материалы без разрешения;
— использовать Систему добросовестно и в соответствии с её назначением;
— своевременно сообщать администратору о технических неполадках.

3. ОГРАНИЧЕНИЯ

3.1. Запрещается:
— попытки несанкционированного доступа к данным других пользователей;
— использование автоматизированных средств для прохождения тестирования;
— воспроизведение, декомпиляция или модификация программного обеспечения.

4. ИНТЕЛЛЕКТУАЛЬНАЯ СОБСТВЕННОСТЬ

4.1. Все учебные материалы, тесты и методические разработки являются интеллектуальной собственностью оператора или правообладателей и охраняются законодательством РФ.

5. ОТВЕТСТВЕННОСТЬ

5.1. Оператор не несёт ответственности за перебои в работе Системы, вызванные обстоятельствами непреодолимой силы, действиями третьих лиц или ненадлежащим использованием Пользователем.

6. СРОК ДЕЙСТВИЯ

6.1. Соглашение вступает в силу с момента первого входа в Систему и действует на весь период использования.

6.2. Оператор вправе в одностороннем порядке изменять условия настоящего Соглашения, уведомив Пользователей через интерфейс Системы.`;

const CONSENT_TEXT = `СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ

Я, субъект персональных данных, в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных», даю своё согласие оператору на обработку следующих персональных данных:

— фамилия, имя, отчество;
— адрес электронной почты;
— должность и место работы;
— сведения о прохождении обучения и тестирования;
— результаты аттестации и проверки знаний.

ЦЕЛИ ОБРАБОТКИ

Персональные данные обрабатываются исключительно в целях:
— организации процесса дистанционного обучения;
— формирования учётной записи и личного кабинета;
— выдачи удостоверений о повышении квалификации;
— формирования отчётности для контролирующих органов.

ДЕЙСТВИЯ С ПЕРСОНАЛЬНЫМИ ДАННЫМИ

Оператор вправе осуществлять следующие действия с персональными данными:
— сбор, запись, систематизация, накопление;
— хранение, уточнение (обновление, изменение);
— извлечение, использование, передача уполномоченным лицам;
— блокирование, удаление, уничтожение.

СРОК ДЕЙСТВИЯ СОГЛАСИЯ

Настоящее согласие действует с момента его предоставления и до истечения сроков хранения персональных данных, установленных законодательством Российской Федерации.

ОТЗЫВ СОГЛАСИЯ

Настоящее согласие может быть отозвано в любой момент путём направления письменного заявления администратору системы. Отзыв согласия влечёт прекращение доступа к системе дистанционного обучения.

ПОДТВЕРЖДЕНИЕ

Настоящим подтверждаю, что данное согласие является свободным, конкретным, информированным и сознательным.`;

const POLICY_TEXT = `ПОЛИТИКА ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ

1. ОБЩИЕ ПОЛОЖЕНИЯ

Настоящая политика обработки персональных данных (далее — Политика) разработана в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных».

Политика определяет порядок обработки персональных данных и меры по обеспечению их безопасности, предпринимаемые оператором.

2. СОСТАВ ОБРАБАТЫВАЕМЫХ ПЕРСОНАЛЬНЫХ ДАННЫХ

В рамках деятельности системы обрабатываются следующие персональные данные:
— фамилия, имя, отчество;
— адрес электронной почты;
— должность и место работы;
— сведения о прохождении обучения и результатах тестирования.

3. ЦЕЛИ ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ

Персональные данные обрабатываются в целях:
— организации и проведения обучения;
— формирования учётной записи пользователя;
— выдачи удостоверений и сертификатов по результатам обучения;
— ведения отчётности и статистики.

4. ПРАВОВЫЕ ОСНОВАНИЯ ОБРАБОТКИ

Обработка персональных данных осуществляется на основании:
— согласия субъекта персональных данных;
— требований законодательства Российской Федерации в области промышленной безопасности и охраны труда.

5. СРОКИ ОБРАБОТКИ И ХРАНЕНИЯ

Персональные данные хранятся в течение срока, необходимого для достижения целей обработки, но не менее 5 лет в соответствии с требованиями законодательства.

6. ПРАВА СУБЪЕКТА ПЕРСОНАЛЬНЫХ ДАННЫХ

Субъект персональных данных вправе:
— получать информацию об обработке своих персональных данных;
— требовать уточнения, блокирования или уничтожения персональных данных;
— отозвать согласие на обработку персональных данных.

7. БЕЗОПАСНОСТЬ ПЕРСОНАЛЬНЫХ ДАННЫХ

Оператор принимает необходимые организационные и технические меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.

8. КОНТАКТНАЯ ИНФОРМАЦИЯ

По вопросам, связанным с обработкой персональных данных, обращайтесь к администратору системы.`;

function PolicyDocModal({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[calc(100vh-2rem)]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{text}</pre>
        </div>
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            Ознакомился
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ open, onAccept, onDecline }: ConsentModalProps) {
  const [checkPolicy,  setCheckPolicy]  = useState(false);
  const [checkConsent, setCheckConsent] = useState(false);
  const [policyOpen,   setPolicyOpen]   = useState(false);
  const [consentDocOpen, setConsentDocOpen] = useState(false);
  const [licenseOpen,    setLicenseOpen]    = useState(false);

  if (!open) return null;

  const canAccept = checkPolicy && checkConsent;

  return (
    <>
    {policyOpen && <PolicyDocModal title="Политика обработки персональных данных" text={POLICY_TEXT} onClose={() => setPolicyOpen(false)} />}
    {consentDocOpen && <PolicyDocModal title="Согласие на обработку персональных данных" text={CONSENT_TEXT} onClose={() => setConsentDocOpen(false)} />}
    {licenseOpen && <PolicyDocModal title="Лицензионное соглашение" text={LICENSE_TEXT} onClose={() => setLicenseOpen(false)} />}
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[calc(100vh-2rem)] overflow-y-auto">

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
              <button type="button" className="text-blue-600 underline hover:text-blue-700 font-medium" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPolicyOpen(true); }}>
                политикой
              </button>{" "}
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
              <button type="button" className="text-blue-600 underline hover:text-blue-700 font-medium" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setConsentDocOpen(true); }}>
                обработку
              </button>{" "}
              персональных данных
            </span>
          </label>
        </div>

        {/* Лицензионное соглашение */}
        <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
          Продолжая использовать сайт, вы принимаете{" "}
          <button type="button" className="text-blue-600 underline hover:text-blue-700 font-medium" onClick={() => setLicenseOpen(true)}>
            Лицензионное соглашение.
          </button>
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
    </>
  );
}