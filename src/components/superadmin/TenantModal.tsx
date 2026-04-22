import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Tenant, TenantType, SubscriptionType } from "@/components/admin/types";
import { SUBSCRIPTION_LABELS as SUB_LABELS } from "@/components/admin/types";
import { generatePassword, copyToClipboard } from "./TenantsModals";
import TenantModalBasicFields from "./TenantModalBasicFields";
import TenantModalSubscriptions, { SUB_TYPES } from "./TenantModalSubscriptions";
import TenantModalContract from "./TenantModalContract";

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
          <TenantModalBasicFields
            name={name} setName={setName}
            inn={inn} setInn={setInn}
            email={email} setEmail={setEmail}
            type={type} setType={setType}
            status={status} setStatus={setStatus}
            isNew={isNew}
            password={password} setPassword={setPassword}
            showPass={showPass} setShowPass={setShowPass}
            copiedPass={copiedPass}
            regeneratePassword={regeneratePassword}
            handleCopyPass={handleCopyPass}
          />

          <TenantModalSubscriptions
            type={type}
            allowedDirs={allowedDirs}
            toggleDir={toggleDir}
            subLimits={subLimits}
            setLimit={setLimit}
            subPrices={subPrices}
            setSubPrice={setSubPrice}
          />

          <TenantModalContract
            contractNum={contractNum} setContractNum={setContractNum}
            contractDate={contractDate} setContractDate={setContractDate}
            contractExpiry={contractExpiry} setContractExpiry={setContractExpiry}
            contractType={contractType} setContractType={setContractType}
          />
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
