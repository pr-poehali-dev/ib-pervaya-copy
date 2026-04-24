import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { BrandingSettings } from "./types";

interface BrandingPanelProps {
  branding: BrandingSettings;
  onSave: (b: BrandingSettings) => void;
  onBack: () => void;
}

export default function BrandingPanel({ branding, onSave, onBack }: BrandingPanelProps) {
  const [logoUrl,      setLogoUrl]      = useState<string | null>(branding.logoUrl);
  const [customDomain, setCustomDomain] = useState(branding.customDomain);
  const [domainError,  setDomainError]  = useState("");
  const [saved,        setSaved]        = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    setLogoUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function validateDomain(v: string) {
    if (!v) return "";
    const re = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return re.test(v) ? "" : "Введите корректный домен, например: edu.company.ru";
  }

  function handleDomainChange(v: string) {
    setCustomDomain(v);
    setDomainError(validateDomain(v));
  }

  function handleSave() {
    const err = validateDomain(customDomain);
    if (err) { setDomainError(err); return; }
    onSave({ logoUrl, customDomain });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={onBack} className="hover:text-foreground transition-colors flex items-center gap-1.5">
          <Icon name="ArrowLeft" size={15} />
          Настройки
        </button>
        <Icon name="ChevronRight" size={14} />
        <span className="text-foreground font-medium">Брендирование</span>
      </div>

      {/* Логотип */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
            <Icon name="Image" size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">Логотип организации</h3>
            <p className="text-muted-foreground text-sm">Заменит дефолтный логотип системы для всех пользователей тенанта</p>
          </div>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          {/* Превью */}
          <div className="w-32 h-16 rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Логотип" className="max-w-full max-h-full object-contain p-1" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Icon name="ImageOff" size={20} />
                <span className="text-[10px]">Нет логотипа</span>
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
            >
              <Icon name="Upload" size={14} />
              Загрузить логотип
            </Button>
            {logoUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleRemoveLogo}
              >
                <Icon name="Trash2" size={14} />
                Удалить
              </Button>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <p className="text-xs text-muted-foreground">PNG, JPG, SVG или WebP — до 2 МБ. Рекомендуемый размер: 200×80 пикселей</p>
      </div>

      {/* Домен */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Icon name="Globe" size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">Свой домен</h3>
            <p className="text-muted-foreground text-sm">Платформа будет доступна по вашему адресу</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customDomain">Домен</Label>
          <Input
            id="customDomain"
            placeholder="edu.company.ru"
            value={customDomain}
            onChange={(e) => handleDomainChange(e.target.value)}
            className={domainError ? "border-destructive" : ""}
          />
          {domainError && (
            <p className="text-xs text-destructive">{domainError}</p>
          )}
        </div>

        <div className="bg-muted/60 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Инструкция по подключению</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Добавьте CNAME-запись в DNS вашего домена</li>
            <li>Укажите значение: <code className="bg-card px-1.5 py-0.5 rounded text-foreground font-mono text-xs">i-sdo.ru</code></li>
            <li>Сохраните домен здесь и дождитесь активации SSL (до 24 часов)</li>
          </ol>
        </div>

        {customDomain && !domainError && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <Icon name="Clock" size={14} />
            Ожидает подключения DNS
          </div>
        )}
      </div>

      {/* Кнопка сохранения */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>Отмена</Button>
        <Button
          className="gradient-primary text-white gap-2"
          onClick={handleSave}
          disabled={!!domainError}
        >
          {saved ? (
            <><Icon name="Check" size={15} />Сохранено</>
          ) : (
            <><Icon name="Save" size={15} />Сохранить</>
          )}
        </Button>
      </div>
    </div>
  );
}