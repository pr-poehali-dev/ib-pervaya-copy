import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

interface AdminHeaderProps {
  showAddGroup: boolean;
  setShowAddGroup: (v: boolean) => void;
  newGroupName: string;
  setNewGroupName: (v: string) => void;
  newGroupOrgName: string;
  setNewGroupOrgName: (v: string) => void;
  newGroupInn: string;
  setNewGroupInn: (v: string) => void;
  newGroupFile: File | null;
  setNewGroupFile: (v: File | null) => void;
  newGroupError: string;
  setNewGroupError: (v: string) => void;
  onAddUserClick: () => void;
}

export default function AdminHeader({
  showAddGroup, setShowAddGroup,
  newGroupName, setNewGroupName,
  newGroupOrgName, setNewGroupOrgName,
  newGroupInn, setNewGroupInn,
  newGroupFile, setNewGroupFile,
  newGroupError, setNewGroupError,
  onAddUserClick,
}: AdminHeaderProps) {
  const resetGroup = () => {
    setNewGroupName("");
    setNewGroupOrgName("");
    setNewGroupInn("");
    setNewGroupFile(null);
    setNewGroupError("");
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
            <Icon name="ShieldCheck" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Панель администратора</h1>
            <p className="text-muted-foreground text-sm">Управление пользователями и курсами</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={() => setShowAddGroup(true)}
          >
            <Icon name="FolderPlus" size={16} />
            Добавить группу
          </Button>
          <Button
            className="gradient-primary text-white rounded-xl shadow-md shadow-purple-200 gap-2"
            onClick={onAddUserClick}
          >
            <Icon name="UserPlus" size={16} />
            Добавить слушателя
          </Button>
        </div>
      </div>

      <Dialog open={showAddGroup} onOpenChange={(open) => { setShowAddGroup(open); if (!open) resetGroup(); }}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Добавление новой группы</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Название группы <span className="text-destructive">*</span></Label>
              <Input
                placeholder=""
                value={newGroupName}
                onChange={(e) => { setNewGroupName(e.target.value); setNewGroupError(""); }}
                className="rounded-xl"
              />
              {newGroupError && <p className="text-destructive text-xs">{newGroupError}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Наименование организации</Label>
              <Input
                placeholder=""
                value={newGroupOrgName}
                onChange={(e) => setNewGroupOrgName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>ИНН</Label>
              <Input
                placeholder=""
                value={newGroupInn}
                onChange={(e) => setNewGroupInn(e.target.value)}
                className="rounded-xl"
                maxLength={12}
              />
            </div>

            <div className="flex items-center gap-3">
              <Label className="flex-shrink-0">Шаблон реестра группы:</Label>
              <Button
                type="button"
                className="gradient-primary text-white rounded-xl gap-2"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = "#";
                  a.download = "registry_template.xlsx";
                  a.click();
                }}
              >
                <Icon name="Download" size={15} />
                Скачать шаблон реестра
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label>Загрузить реестр группы <span className="text-destructive">*</span></Label>
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <label className="cursor-pointer px-4 py-2.5 bg-muted hover:bg-muted/80 border-r border-border text-sm font-medium flex-shrink-0 transition-colors">
                  Выберите файл
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setNewGroupFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <span className="px-4 text-sm text-muted-foreground truncate">
                  {newGroupFile ? newGroupFile.name : "Файл не выбран"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" className="rounded-xl px-6" onClick={() => setShowAddGroup(false)}>
                Отменить
              </Button>
              <Button className="rounded-xl gradient-primary text-white gap-2 px-5" onClick={() => {
                if (!newGroupName.trim()) { setNewGroupError("Введите название группы"); return; }
                setShowAddGroup(false);
                resetGroup();
              }}>
                <Icon name="Save" size={15} />
                Сохранить и продолжить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
