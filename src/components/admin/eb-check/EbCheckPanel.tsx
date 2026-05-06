import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CheckProtocol, Commission, EbOrganization, MOCK_PROTOCOLS, MOCK_COMMISSIONS, MOCK_EB_ORGS } from "@/data/ebCheckData";
import CommissionsPanel from "./CommissionsPanel";
import CheckWizard from "./CheckWizard";
import CheckJournal from "./CheckJournal";
import EbWaitingList from "./EbWaitingList";

type EbTab = "journal" | "waiting" | "wizard" | "commissions";

function OrgPicker({
  orgs,
  onSelect,
  onCancel,
}: {
  orgs: EbOrganization[];
  onSelect: (orgId: number) => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <div>
          <h2 className="text-base font-bold">Выберите организацию</h2>
          <p className="text-xs text-muted-foreground">Для какой организации оформляется проверка знаний ЭБ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {orgs.map((org) => (
          <button
            key={org.id}
            onClick={() => onSelect(org.id)}
            className="flex items-center gap-4 px-5 py-4 bg-card border border-border rounded-2xl hover:border-primary hover:shadow-sm hover:bg-primary/5 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {org.name.replace(/[^А-ЯA-Z]/g, "").slice(0, 2) || org.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{org.name}</div>
              {org.inn && <div className="text-xs text-muted-foreground">ИНН {org.inn}</div>}
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EbCheckPanel() {
  const [activeTab, setActiveTab] = useState<EbTab>("journal");
  const [protocols, setProtocols] = useState<CheckProtocol[]>(MOCK_PROTOCOLS);
  const [commissions, setCommissions] = useState<Commission[]>(MOCK_COMMISSIONS);
  const [editingProtocol, setEditingProtocol] = useState<CheckProtocol | undefined>(undefined);
  const [newForOrgId, setNewForOrgId] = useState<number | undefined>(undefined);
  const [showOrgPicker, setShowOrgPicker] = useState(false);

  function handleSaveProtocol(p: CheckProtocol) {
    setProtocols((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
    });
    setEditingProtocol(undefined);
    setNewForOrgId(undefined);
    setShowOrgPicker(false);
    setActiveTab("journal");
  }

  function handleClickWizardTab() {
    setEditingProtocol(undefined);
    setNewForOrgId(undefined);
    setShowOrgPicker(true);
    setActiveTab("wizard");
  }

  function handleOrgSelected(orgId: number) {
    setNewForOrgId(orgId);
    setShowOrgPicker(false);
  }

  function handleCancelWizard() {
    setEditingProtocol(undefined);
    setNewForOrgId(undefined);
    setShowOrgPicker(false);
    setActiveTab("journal");
  }

  const tabs: { key: EbTab; icon: string; label: string }[] = [
    { key: "journal", icon: "BookOpen", label: "Журнал проверок" },
    { key: "waiting", icon: "ListChecks", label: "Лист ожидания" },
    { key: "wizard", icon: "FilePlus2", label: "Оформить проверку" },
    { key: "commissions", icon: "Users", label: "Управление комиссиями" },
  ];

  const draftCount = protocols.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab.key}
            onClick={() => {
              if (tab.key === "wizard") {
                handleClickWizardTab();
              } else {
                setEditingProtocol(undefined);
                setNewForOrgId(undefined);
                setShowOrgPicker(false);
                setActiveTab(tab.key as EbTab);
              }
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
          onEdit={(p) => { setEditingProtocol(p); setNewForOrgId(undefined); setShowOrgPicker(false); setActiveTab("wizard"); }}
          onNew={(orgId) => {
            setEditingProtocol(undefined);
            if (orgId) {
              setNewForOrgId(orgId);
              setShowOrgPicker(false);
            } else {
              setNewForOrgId(undefined);
              setShowOrgPicker(true);
            }
            setActiveTab("wizard");
          }}
        />
      )}

      {activeTab === "wizard" && showOrgPicker && !editingProtocol && (
        <OrgPicker
          orgs={MOCK_EB_ORGS}
          onSelect={handleOrgSelected}
          onCancel={handleCancelWizard}
        />
      )}

      {activeTab === "wizard" && !showOrgPicker && (
        <CheckWizard
          commissions={commissions}
          onSave={handleSaveProtocol}
          onCancel={handleCancelWizard}
          editProtocol={editingProtocol}
          defaultOrgId={newForOrgId}
        />
      )}

      {activeTab === "waiting" && (
        <EbWaitingList
          protocols={protocols}
          onCreateCheck={(orgId) => {
            setNewForOrgId(orgId);
            setShowOrgPicker(false);
            setEditingProtocol(undefined);
            setActiveTab("wizard");
          }}
        />
      )}

      {activeTab === "commissions" && <CommissionsPanel protocols={protocols} />}
    </div>
  );
}