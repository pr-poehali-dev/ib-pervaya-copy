import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { courseDirections } from "@/components/admin/types";

interface AddUserDialogProps {
  show: boolean;
  onClose: () => void;
  newLastName: string; setNewLastName: (v: string) => void;
  newFirstName: string; setNewFirstName: (v: string) => void;
  newMiddleName: string; setNewMiddleName: (v: string) => void;
  newOrg: string; setNewOrg: (v: string) => void;
  newInn: string; setNewInn: (v: string) => void;
  newEmail: string; setNewEmail: (v: string) => void;
  nameError: string; setNameError: (v: string) => void;
  emailError: string; setEmailError: (v: string) => void;
  selectedCourses: number[]; setSelectedCourses: (v: number[]) => void;
  showCoursesPicker: boolean; setShowCoursesPicker: (v: boolean) => void;
  openDirections: number[]; toggleDirection: (id: number) => void;
  showGroupDropdown: boolean; setShowGroupDropdown: (v: boolean) => void;
  selectedListenerGroup: string; setSelectedListenerGroup: (v: string) => void;
  newGroupForListener: string; setNewGroupForListener: (v: string) => void;
  availableGroups: string[]; setAvailableGroups: (fn: (p: string[]) => string[]) => void;
  setNewGroup: (v: string) => void;
  onSave: () => void;
}

export default function AddUserDialog({
  show, onClose,
  newLastName, setNewLastName,
  newFirstName, setNewFirstName,
  newMiddleName, setNewMiddleName,
  newOrg, setNewOrg,
  newInn, setNewInn,
  newEmail, setNewEmail,
  nameError, setNameError,
  emailError, setEmailError,
  selectedCourses, setSelectedCourses,
  showCoursesPicker, setShowCoursesPicker,
  openDirections, toggleDirection,
  showGroupDropdown, setShowGroupDropdown,
  selectedListenerGroup, setSelectedListenerGroup,
  newGroupForListener, setNewGroupForListener,
  availableGroups, setAvailableGroups,
  setNewGroup,
  onSave,
}: AddUserDialogProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Затемнение */}
      <div className="absolute inset-0 bg-black/50" onClick={() => { onClose(); setShowCoursesPicker(false); }} />

      {/* Основное окно — сдвигается влево при открытии панели курсов */}
      <div
        className={`relative bg-background rounded-2xl shadow-2xl z-10 w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-y-auto transition-all duration-300 ${showCoursesPicker ? "-translate-x-[220px]" : ""}`}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-base">Создание/редактирование слушателя</h2>
          <button onClick={() => { onClose(); setShowCoursesPicker(false); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ФИО */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Фамилия <span className="text-destructive">*</span></Label>
              <Input className="rounded-xl" placeholder="Иванов" value={newLastName} onChange={(e) => { setNewLastName(e.target.value); setNameError(""); }} />
              {nameError && <p className="text-destructive text-xs">{nameError}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Имя <span className="text-destructive">*</span></Label>
              <Input className="rounded-xl" placeholder="Иван" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Отчество</Label>
              <Input className="rounded-xl" placeholder="Иванович" value={newMiddleName} onChange={(e) => setNewMiddleName(e.target.value)} />
            </div>
          </div>

          {/* Наименование организации */}
          <div className="space-y-1.5">
            <Label>Наименование организации <span className="text-destructive">*</span></Label>
            <Input className="rounded-xl" value={newOrg} onChange={(e) => setNewOrg(e.target.value)} />
          </div>

          {/* ИНН организации */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              ИНН организации
              <span className="text-xs text-amber-600 dark:text-amber-400 font-normal">(рекомендуется заполнить)</span>
            </Label>
            <Input className="rounded-xl" placeholder="" value={newInn} onChange={(e) => setNewInn(e.target.value)} maxLength={12} />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label>Электронная почта пользователя <span className="text-destructive">*</span></Label>
            <Input className="rounded-xl" value={newEmail} onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }} />
            {emailError && <p className="text-destructive text-xs">{emailError}</p>}
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              className={`rounded-xl gap-2 text-white ${showCoursesPicker ? "bg-violet-700" : "gradient-primary"}`}
              onClick={() => setShowCoursesPicker(!showCoursesPicker)}
            >
              <Icon name="BookOpen" size={15} />
              Добавить/редактировать курсы
            </Button>
            <div className="relative">
              <Button
                type="button"
                className={`rounded-xl gap-2 text-white ${showGroupDropdown ? "bg-violet-700" : "gradient-primary"}`}
                onClick={() => { setShowGroupDropdown(!showGroupDropdown); setShowCoursesPicker(false); }}
              >
                <Icon name="Users" size={15} />
                {selectedListenerGroup ? selectedListenerGroup : "Добавить к группе обучения"}
                <Icon name={showGroupDropdown ? "ChevronUp" : "ChevronDown"} size={14} />
              </Button>

              {showGroupDropdown && (
                <div className="absolute left-0 top-full mt-1 z-30 bg-background border border-border rounded-xl shadow-xl w-72 overflow-hidden">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Существующие группы</p>
                  </div>
                  <div className="max-h-44 overflow-y-auto">
                    {availableGroups.map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between ${selectedListenerGroup === g ? "text-violet-600 font-medium" : ""}`}
                        onClick={() => { setSelectedListenerGroup(g); setNewGroup(g); setShowGroupDropdown(false); }}
                      >
                        {g}
                        {selectedListenerGroup === g && <Icon name="Check" size={14} className="text-violet-600" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border px-3 py-2.5 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Создать новую группу</p>
                    <div className="flex gap-2">
                      <Input
                        className="rounded-lg h-8 text-sm"
                        placeholder="Название группы"
                        value={newGroupForListener}
                        onChange={(e) => setNewGroupForListener(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newGroupForListener.trim()) {
                            const g = newGroupForListener.trim();
                            setAvailableGroups((p) => [...p, g]);
                            setSelectedListenerGroup(g);
                            setNewGroup(g);
                            setNewGroupForListener("");
                            setShowGroupDropdown(false);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="gradient-primary text-white rounded-lg h-8 px-3"
                        disabled={!newGroupForListener.trim()}
                        onClick={() => {
                          const g = newGroupForListener.trim();
                          if (!g) return;
                          setAvailableGroups((p) => [...p, g]);
                          setSelectedListenerGroup(g);
                          setNewGroup(g);
                          setNewGroupForListener("");
                          setShowGroupDropdown(false);
                        }}
                      >
                        <Icon name="Plus" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Выбранные курсы */}
          <div className="space-y-1.5">
            <p className="font-semibold text-sm">Выбранные курсы:</p>
            <div className="border border-border rounded-xl px-4 py-3 min-h-[52px]">
              {selectedCourses.length === 0
                ? <p className="text-muted-foreground text-sm">Пока не выбрано ни одного курса.</p>
                : <div className="flex flex-wrap gap-1.5">
                    {selectedCourses.map((id) => {
                      const found = courseDirections.flatMap((d) => d.courses).find((c) => c.id === id);
                      return found ? (
                        <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium">
                          {found.code} {found.title}
                          <button onClick={() => setSelectedCourses(selectedCourses.filter((i) => i !== id))} className="hover:text-destructive ml-0.5">×</button>
                        </span>
                      ) : null;
                    })}
                  </div>
              }
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" className="rounded-xl px-6" onClick={() => { onClose(); setShowCoursesPicker(false); }}>Отмена</Button>
            <Button className="rounded-xl gradient-primary text-white gap-2 px-6" onClick={onSave}>
              <Icon name="Save" size={15} />
              Сохранить
            </Button>
          </div>
        </div>
      </div>

      {/* Боковая панель выбора курсов */}
      <div
        className={`absolute right-0 top-0 h-full w-[640px] bg-background shadow-2xl z-20 flex flex-col transition-transform duration-300 ${showCoursesPicker ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h3 className="font-semibold text-base">Выбор курсов</h3>
          <button onClick={() => setShowCoursesPicker(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {courseDirections.map((dir) => {
            const isOpen = openDirections.includes(dir.id);
            return (
              <div key={dir.id} className="border-b border-border last:border-0">
                <button
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${isOpen ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-muted/40"}`}
                  onClick={() => toggleDirection(dir.id)}
                >
                  <span className={`font-semibold text-sm ${isOpen ? "text-violet-700 dark:text-violet-300" : ""}`}>{dir.title}</span>
                  <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className={isOpen ? "text-violet-600" : "text-muted-foreground"} />
                </button>
                {isOpen && (
                  <div>
                    {dir.courses.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-5 py-3 border-t border-border/60 hover:bg-muted/30 transition-colors">
                        <span className="text-sm text-foreground leading-snug pr-3">
                          <span className="font-medium">{c.code}</span> {c.title}
                        </span>
                        {selectedCourses.includes(c.id)
                          ? <button
                              className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-red-100 hover:text-red-600 hover:border-red-300 transition-colors"
                              onClick={() => setSelectedCourses(selectedCourses.filter((id) => id !== c.id))}
                            >Выбрано</button>
                          : <button
                              className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity"
                              onClick={() => setSelectedCourses([...selectedCourses, c.id])}
                            >Выбрать</button>
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border flex-shrink-0">
          <Button className="w-full gradient-primary text-white rounded-xl gap-2" onClick={() => setShowCoursesPicker(false)}>
            <Icon name="CheckCircle" size={16} />
            Завершить выбор курсов
          </Button>
        </div>
      </div>
    </div>
  );
}