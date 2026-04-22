import Icon from "@/components/ui/icon";
import type { TenantType } from "@/components/admin/types";
import type { Tenant } from "@/components/admin/types";

interface TenantModalBasicFieldsProps {
  name: string;
  setName: (v: string) => void;
  inn: string;
  setInn: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  type: TenantType;
  setType: (v: TenantType) => void;
  status: Tenant["status"];
  setStatus: (v: Tenant["status"]) => void;
  isNew: boolean;
  password: string;
  setPassword: (v: string) => void;
  showPass: boolean;
  setShowPass: (v: boolean | ((prev: boolean) => boolean)) => void;
  copiedPass: boolean;
  regeneratePassword: () => void;
  handleCopyPass: () => void;
}

export default function TenantModalBasicFields({
  name, setName,
  inn, setInn,
  email, setEmail,
  type, setType,
  status, setStatus,
  isNew,
  password, setPassword,
  showPass, setShowPass,
  copiedPass,
  regeneratePassword,
  handleCopyPass,
}: TenantModalBasicFieldsProps) {
  return (
    <>
      {/* Основные данные */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2">
          <label className="text-xs text-muted-foreground">Название организации</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder='ООО «Название»' />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">ИНН</label>
          <input value={inn} onChange={(e) => setInn(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="1234567890" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Email администратора</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="admin@org.ru" />
        </div>
      </div>

      {/* Пароль — только при создании */}
      {isNew && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Пароль администратора</label>
            <button
              onClick={regeneratePassword}
              className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline"
            >
              <Icon name="RefreshCw" size={11} />
              Сгенерировать новый
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 px-3 pr-9 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              <button
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name={showPass ? "EyeOff" : "Eye"} size={14} />
              </button>
            </div>
            <button
              onClick={handleCopyPass}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${copiedPass ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"}`}
              title="Скопировать пароль"
            >
              <Icon name={copiedPass ? "Check" : "Copy"} size={14} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Icon name="Info" size={11} className="flex-shrink-0" />
            Пароль будет отправлен на email администратора при создании тенанта
          </p>
        </div>
      )}

      {/* Тип и статус */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Тип тенанта</label>
          <div className="flex gap-2">
            {(["training_center", "organization"] as TenantType[]).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${type === t ? "bg-violet-600 text-white border-violet-600" : "border-border text-muted-foreground hover:bg-muted/60"}`}>
                {t === "training_center" ? "Учебный центр" : "Организация"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Статус</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Tenant["status"])} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
            <option value="active">Активен</option>
            <option value="trial">Пробный</option>
            <option value="suspended">Приостановлен</option>
          </select>
        </div>
      </div>
    </>
  );
}
