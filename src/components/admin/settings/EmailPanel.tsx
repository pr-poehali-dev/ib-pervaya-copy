import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { EmailSettings, emailTemplates } from "./types";

interface EmailPanelProps {
  emailSettings: EmailSettings;
  onEmailSettingsChange: (settings: EmailSettings) => void;
  onBack: () => void;
}

export default function EmailPanel({ emailSettings, onEmailSettingsChange, onBack }: EmailPanelProps) {
  const [emailSaved, setEmailSaved] = useState(false);
  const [smtpSaved, setSmtpSaved] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSubject, setTestSubject] = useState("Тест SMTP");
  const [testSent, setTestSent] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const set = (key: keyof EmailSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailSettingsChange({ ...emailSettings, [key]: e.target.value });
  };

  const toggle = (key: keyof EmailSettings) => {
    onEmailSettingsChange({ ...emailSettings, [key]: !emailSettings[key] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <Icon name="ChevronLeft" size={16} />
          Настройки
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Настройка электронной почты</span>
      </div>

      {/* Секция 1: Email уведомлений */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h3 className="font-bold text-base">Настройки email уведомлений</h3>

        <div className="space-y-1.5">
          <Label>Email отдела кадров (HR)</Label>
          <Input className="rounded-xl" value={emailSettings.hrEmail} onChange={set("hrEmail")} />
          <p className="text-xs text-emerald-600 dark:text-emerald-400">На этот адрес будут приходить все критичные уведомления</p>
        </div>

        <div className="space-y-1.5">
          <Label>Email отправителя</Label>
          <Input className="rounded-xl" value={emailSettings.senderEmail} onChange={set("senderEmail")} />
          <p className="text-xs text-muted-foreground">От имени этого адреса отправляются уведомления</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggle("copyToAdmin")}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${emailSettings.copyToAdmin ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailSettings.copyToAdmin ? "translate-x-5" : ""}`} />
          </button>
          <div>
            <p className="text-sm font-medium">Копия администратору</p>
            <p className="text-xs text-muted-foreground">Отправлять копию всех уведомлений администратору системы</p>
          </div>
        </div>

        <div className="border-t border-border pt-5 space-y-3">
          <h4 className="font-semibold text-sm">Шаблоны писем</h4>
          <div className="border border-border rounded-xl overflow-hidden">
            {emailTemplates.map((t, i) => (
              <div key={t.id} className={`flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors ${i > 0 ? "border-t border-border" : ""}`}>
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <button
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setEditingTemplate(t.id)}
                >
                  <Icon name="SquarePen" size={14} />
                  Изменить
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
          onClick={() => { setEmailSaved(true); setTimeout(() => setEmailSaved(false), 2000); }}
        >
          {emailSaved ? <Icon name="Check" size={15} /> : <Icon name="Save" size={15} />}
          {emailSaved ? "Сохранено!" : "Сохранить настройки"}
        </Button>
      </div>

      {/* Секция 2: SMTP */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h3 className="font-bold text-base">Исходящая почта (SMTP)</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>SMTP-хост</Label>
            <Input className="rounded-xl" value={emailSettings.smtpHost} onChange={set("smtpHost")} />
          </div>
          <div className="space-y-1.5">
            <Label>SMTP-порт</Label>
            <Input className="rounded-xl" value={emailSettings.smtpPort} onChange={set("smtpPort")} />
          </div>
          <div className="space-y-1.5">
            <Label>Пользователь SMTP</Label>
            <Input className="rounded-xl" value={emailSettings.smtpUser} onChange={set("smtpUser")} />
          </div>
          <div className="space-y-1.5">
            <Label>Пароль SMTP</Label>
            <div className="relative">
              <Input className="rounded-xl pr-10" type={showSmtpPassword ? "text" : "password"} value={emailSettings.smtpPassword} onChange={set("smtpPassword")} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowSmtpPassword((p) => !p)}>
                <Icon name={showSmtpPassword ? "EyeOff" : "Eye"} size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email отправителя</Label>
            <Input className="rounded-xl" value={emailSettings.smtpFromEmail} onChange={set("smtpFromEmail")} />
          </div>
          <div className="space-y-1.5">
            <Label>Таймаут (сек.)</Label>
            <Input className="rounded-xl" value={emailSettings.smtpTimeout} onChange={set("smtpTimeout")} />
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: "useTls" as const, label: "Использовать TLS", desc: "TLS применяется для шифрования соединения." },
            { key: "useSsl" as const, label: "Использовать SSL", desc: "При включённом SSL TLS не используется автоматически." },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggle(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${emailSettings[item.key] ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailSettings[item.key] ? "translate-x-5" : ""}`} />
              </button>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
          onClick={() => { setSmtpSaved(true); setTimeout(() => setSmtpSaved(false), 2000); }}
        >
          {smtpSaved ? <Icon name="Check" size={15} /> : <Icon name="Save" size={15} />}
          {smtpSaved ? "Сохранено!" : "Сохранить настройки"}
        </Button>

        {/* Тестовое письмо */}
        <div className="border-t border-border pt-5 space-y-4">
          <div>
            <h4 className="font-semibold text-sm">Тестовое письмо</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Отправьте пробное письмо, чтобы проверить SMTP-настройки.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email получателя</Label>
              <Input className="rounded-xl" placeholder="test@company.ru" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Тема (опционально)</Label>
              <Input className="rounded-xl" placeholder="Тест SMTP" value={testSubject} onChange={(e) => setTestSubject(e.target.value)} />
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={() => { setTestSent(true); setTimeout(() => setTestSent(false), 3000); }}
          >
            {testSent ? <Icon name="CheckCircle" size={15} className="text-emerald-500" /> : <Icon name="Send" size={15} />}
            {testSent ? "Письмо отправлено!" : "Отправить тестовое письмо"}
          </Button>
        </div>
      </div>

      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingTemplate(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-base mb-2">{emailTemplates.find((t) => t.id === editingTemplate)?.title}</p>
            <p className="text-sm text-muted-foreground mb-4">Редактирование шаблона пока недоступно.</p>
            <Button variant="outline" className="rounded-xl" onClick={() => setEditingTemplate(null)}>Закрыть</Button>
          </div>
        </div>
      )}
    </div>
  );
}
