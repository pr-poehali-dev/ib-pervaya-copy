import Icon from "@/components/ui/icon";

interface TenantModalContractProps {
  contractNum: string;
  setContractNum: (v: string) => void;
  contractDate: string;
  setContractDate: (v: string) => void;
  contractExpiry: string;
  setContractExpiry: (v: string) => void;
  contractType: "package" | "postpay";
  setContractType: (v: "package" | "postpay") => void;
}

export default function TenantModalContract({
  contractNum, setContractNum,
  contractDate, setContractDate,
  contractExpiry, setContractExpiry,
  contractType, setContractType,
}: TenantModalContractProps) {
  return (
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
    </div>
  );
}
