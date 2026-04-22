import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { COURSE_DIRECTIONS } from "@/data/mockData";
import type { Tenant, TenantType, SubscriptionType } from "@/components/admin/types";
import { SUBSCRIPTION_LABELS as SUB_LABELS } from "@/components/admin/types";
import { generatePassword, copyToClipboard } from "./TenantsModals";

const DIRECTION_OPTIONS = COURSE_DIRECTIONS.filter((d) => d.id !== 6);

const SUB_TYPES: SubscriptionType[] = [
  "industrial_safety",
  "energy_safety",
  "labor_protection",
  "expert_pb",
  "expert_gts",
  "own_courses",
];

const DIR_FOR_SUB: Record<SubscriptionType, number | null> = {
  industrial_safety: 1,
  energy_safety:     2,
  labor_protection:  3,
  expert_pb:         4,
  expert_gts:        5,
  own_courses:       6,
};

export function TenantModal({
  tenant,
  onClose,
  onCreated,
}: {
  tenant: Tenant | null;
  onClose: () => void;
  onCreated?: (t: Tenant) => void;
}) {
  const isNew = tenant === null;

  const [name,       setName]       = useState(tenant?.name         ?? "");
  const [inn,        setInn]        = useState(tenant?.inn          ?? "");
  const [email,      setEmail]      = useState(tenant?.contactEmail ?? "");
  const [type,       setType]       = useState<TenantType>(tenant?.type   ?? "organization");
  const [status,     setStatus]     = useState<Tenant["status"]>(tenant?.status ?? "active");
  const [password,   setPassword]   = useState(isNew ? generatePassword() : "");
  const [showPass,   setShowPass]   = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Договор
  const [contractNum,     setContractNum]     = useState("");
  const [contractDate,    setContractDate]    = useState("");
  const [contractExpiry,  setContractExpiry]  = useState("");
  const [contractType,    setContractType]    = useState<"package" | "postpay">("package");
  const [subPrices,       setSubPrices]       = useState<Record<SubscriptionType, string>>({
    industrial_safety: "", energy_safety: "", labor_protection: "",
    expert_pb: "", expert_gts: "", own_courses: "",
  });

  function setSubPrice(subType: SubscriptionType, val: string) {
    setSubPrices((prev) => ({ ...prev, [subType]: val }));
  }

  const [allowedDirs, setAllowedDirs] = useState<number[]>(tenant?.allowedDirections ?? []);

  const defaultSubs = (): Record<SubscriptionType, number> => {
    const map: Record<string, number> = {};
    if (tenant) tenant.subscriptions.forEach((s) => { map[s.type] = s.total; });
    return map as Record<SubscriptionType, number>;
  };
  const [subLimits, setSubLimits] = useState<Record<SubscriptionType, number>>(defaultSubs());

  function toggleDir(id: number) {
    setAllowedDirs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  }
  function setLimit(subType: SubscriptionType, val: string) {
    setSubLimits((prev) => ({ ...prev, [subType]: Number(val) || 0 }));
  }
  function regeneratePassword() {
    const p = generatePassword();
    setPassword(p);
    setShowPass(true);
  }
  function handleCopyPass() {
    copyToClipboard(password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 1500);
  }

  function handleSave() {
    if (isNew && onCreated) {
      const newTenant: Tenant = {
        id:                Date.now(),
        type,
        name,
        inn,
        contactEmail:      email,
        status,
        allowedDirections: allowedDirs,
        subscriptions:     SUB_TYPES.filter((st) => subLimits[st] > 0).map((st) => ({
          type: st,
          label: SUB_LABELS[st],
          total: subLimits[st],
          used: 0,
        })),
        createdAt: new Date().toLocaleDateString("ru-RU"),
      };
      onCreated(newTenant);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="font-bold text-lg">{isNew ? "Добавить тенанта" : "Редактировать тенанта"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
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

          {/* Доступ к направлениям + лимиты подписок */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Доступ к направлениям и лимиты подписок</p>
              <span className="text-xs text-muted-foreground">(выберите направления и укажите лимит)</span>
            </div>
            <div className="space-y-2">
              {SUB_TYPES.map((subType) => {
                const dirId     = DIR_FOR_SUB[subType];
                const dir       = COURSE_DIRECTIONS.find((d) => d.id === dirId);
                const isOwn     = subType === "own_courses";
                const isAllowed = isOwn
                  ? type !== "organization" || allowedDirs.includes(6)
                  : allowedDirs.includes(dirId ?? 0);
                return (
                  <div key={subType} className={`rounded-xl border transition-colors ${isAllowed ? "border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-900/10" : "border-border bg-muted/20"}`}>
                    <label className="flex items-center gap-3 p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        onChange={() => toggleDir(dirId ?? 6)}
                        className="rounded accent-violet-600 w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{SUB_LABELS[subType]}</p>
                        {dir  && <p className="text-xs text-muted-foreground">{dir.courses.length} курсов в направлении</p>}
                        {isOwn && <p className="text-xs text-muted-foreground">Курсы загруженные самим тенантом</p>}
                      </div>
                      {isAllowed && (
                        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <label className="text-xs text-muted-foreground whitespace-nowrap">Лимит:</label>
                          <input
                            type="number" min="0"
                            value={subLimits[subType] ?? 0}
                            onChange={(e) => setLimit(subType, e.target.value)}
                            className="w-20 h-7 px-2 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                          />
                        </div>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Договор ─────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="FileText" size={13} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium">Договор</p>
            </div>

            {/* Реквизиты */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Номер договора</label>
                <input
                  value={contractNum}
                  onChange={(e) => setContractNum(e.target.value)}
                  placeholder="№ 123/2026"
                  className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Тип</label>
                <div className="flex gap-2">
                  {([["package", "Пакет"], ["postpay", "Постоплата"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setContractType(val)}
                      className={`flex-1 h-9 rounded-xl text-xs font-medium border transition-colors ${contractType === val ? "bg-emerald-600 text-white border-emerald-600" : "border-border text-muted-foreground hover:bg-muted/60"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Дата заключения</label>
                <input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Срок действия до</label>
                <input
                  type="date"
                  value={contractExpiry}
                  onChange={(e) => setContractExpiry(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
            </div>

            {/* Стоимость подписок по направлениям */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Стоимость единицы подписки (₽) по направлениям</p>
              <div className="space-y-2">
                {SUB_TYPES.map((subType) => {
                  const dirId = DIR_FOR_SUB[subType];
                  const dir   = COURSE_DIRECTIONS.find((d) => d.id === dirId);
                  const isOwn = subType === "own_courses";
                  return (
                    <div key={subType} className="flex items-center gap-3 px-3 py-2 bg-muted/20 rounded-xl">
                      <p className="text-xs text-muted-foreground flex-1 truncate">
                        {SUB_LABELS[subType]}
                        {dir && <span className="ml-1 opacity-60">· {dir.courses.length} курсов</span>}
                        {isOwn && <span className="ml-1 opacity-60">· собственные</span>}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <input
                          type="number"
                          min="0"
                          value={subPrices[subType]}
                          onChange={(e) => setSubPrice(subType, e.target.value)}
                          placeholder="0"
                          className="w-24 h-7 px-2 rounded-lg border border-border bg-background text-sm text-right focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                        />
                        <span className="text-xs text-muted-foreground">₽</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-6 border-t border-border flex-shrink-0">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={handleSave}>
            {isNew ? "Создать тенанта" : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}