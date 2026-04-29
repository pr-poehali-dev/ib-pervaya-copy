import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CheckProtocol, Commission, MOCK_PROTOCOLS, MOCK_COMMISSIONS } from "@/data/ebCheckData";
import CommissionsPanel from "./CommissionsPanel";
import CheckWizard from "./CheckWizard";
import CheckJournal from "./CheckJournal";

type EbTab = "journal" | "wizard" | "commissions";

export default function EbCheckPanel() {
  const [activeTab, setActiveTab] = useState<EbTab>("journal");
  const [protocols, setProtocols] = useState<CheckProtocol[]>(MOCK_PROTOCOLS);
  const [commissions, setCommissions] = useState<Commission[]>(MOCK_COMMISSIONS);
  const [editingProtocol, setEditingProtocol] = useState<CheckProtocol | undefined>(undefined);

  function handleSaveProtocol(p: CheckProtocol) {
    setProtocols((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
    });
    setEditingProtocol(undefined);
    setActiveTab("journal");
  }

  const tabs: { key: EbTab; icon: string; label: string }[] = [
    { key: "journal", icon: "BookOpen", label: "Журнал проверок" },
    { key: "wizard", icon: "FilePlus2", label: "Оформить проверку" },
    { key: "commissions", icon: "Users", label: "Комиссии" },
  ];

  const draftCount = protocols.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab.key}
            onClick={() => {
              if (tab.key !== "wizard") setEditingProtocol(undefined);
              setActiveTab(tab.key);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all relative ${
              activeTab === tab.key
                ? "gradient-primary text-white shadow-md"
                : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}>
            <Icon name={tab.icon} size={15} />
            {tab.label}
            {tab.key === "journal" && draftCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {draftCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "journal" && (
        <CheckJournal
          protocols={protocols}
          onEdit={(p) => { setEditingProtocol(p); setActiveTab("wizard"); }}
          onNew={() => { setEditingProtocol(undefined); setActiveTab("wizard"); }}
        />
      )}

      {activeTab === "wizard" && (
        <CheckWizard
          commissions={commissions}
          onSave={handleSaveProtocol}
          onCancel={() => { setEditingProtocol(undefined); setActiveTab("journal"); }}
          editProtocol={editingProtocol}
        />
      )}

      {activeTab === "commissions" && <CommissionsPanel protocols={protocols} />}
    </div>
  );
}