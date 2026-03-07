import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { OrgData, OrgType, OpfType, orgTypes, opfTypes } from "./types";

interface OrgPanelProps {
  org: OrgData;
  onSave: (data: OrgData) => void;
  onBack: () => void;
}

export default function OrgPanel({ org, onSave, onBack }: OrgPanelProps) {
  const [editOrg, setEditOrg] = useState(false);
  const [orgDraft, setOrgDraft] = useState<OrgData>(org);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(org.externalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveOrg = () => {
    onSave(orgDraft);
    setEditOrg(false);
  };

  const openEdit = () => {
    setOrgDraft(org);
    setEditOrg(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <Icon name="ChevronLeft" size={16} />
          Настройки
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Данные учебного центра</span>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Icon name="Building2" size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-base">Данные учебного центра</h2>
          </div>
          <Button variant="outline" className="rounded-xl gap-2" onClick={openEdit}>
            <Icon name="Pencil" size={15} />
            Редактировать
          </Button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Тип организации", value: org.type },
            { label: "ОПФ", value: org.opf },
            { label: "Наименование", value: org.name },
            { label: "ИНН", value: org.inn },
            { label: "№ лицензии", value: org.licenseNo },
            { label: "Дата лицензии", value: org.licenseDate },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-medium text-sm">{item.value}</p>
            </div>
          ))}
          <div className="md:col-span-2 space-y-1">
            <p className="text-xs text-muted-foreground">Внешний ID</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-muted-foreground">{org.externalId}</p>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs rounded-lg gap-1 flex-shrink-0" onClick={handleCopy}>
                {copied ? <Icon name="Check" size={12} className="text-emerald-500" /> : <Icon name="Copy" size={12} />}
                {copied ? "Скопировано" : "Скопировать"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editOrg} onOpenChange={setEditOrg}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Building2" size={18} className="text-primary" />
              Данные организации
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Тип организации</Label>
                <Select value={orgDraft.type} onValueChange={(v) => setOrgDraft({ ...orgDraft, type: v as OrgType })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{orgTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>ОПФ</Label>
                <Select value={orgDraft.opf} onValueChange={(v) => setOrgDraft({ ...orgDraft, opf: v as OpfType })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{opfTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Наименование</Label>
              <Input className="rounded-xl" value={orgDraft.name} onChange={(e) => setOrgDraft({ ...orgDraft, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ИНН</Label>
                <Input className="rounded-xl" value={orgDraft.inn} onChange={(e) => setOrgDraft({ ...orgDraft, inn: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>№ лицензии</Label>
                <Input className="rounded-xl" value={orgDraft.licenseNo} onChange={(e) => setOrgDraft({ ...orgDraft, licenseNo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Дата лицензии</Label>
              <Input className="rounded-xl" value={orgDraft.licenseDate} onChange={(e) => setOrgDraft({ ...orgDraft, licenseDate: e.target.value })} placeholder="дд.мм.гггг" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditOrg(false)}>Отмена</Button>
              <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={handleSaveOrg}>Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
