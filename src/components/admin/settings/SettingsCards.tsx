import Icon from "@/components/ui/icon";
import { ActivePanel, OrgData, SystemUser } from "./types";
import { useRole } from "@/contexts/RoleContext";

interface SettingsCardsProps {
  org: OrgData;
  systemUsers: SystemUser[];
  setActivePanel: (panel: ActivePanel) => void;
}

export default function SettingsCards({ org, systemUsers, setActivePanel }: SettingsCardsProps) {
  const { tenantType } = useRole();
  const isUC = tenantType === "training_center";


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Карточка: Данные организации */}
      <div
        className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100 dark:hover:shadow-violet-900/20 transition-all duration-200 group"
        onClick={() => setActivePanel("org")}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
            <Icon name="Building2" size={22} className="text-white" />
          </div>
          <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-violet-500 transition-colors mt-1" />
        </div>
        <h3 className="font-bold text-base mb-1">Данные учебного центра</h3>
        <p className="text-muted-foreground text-sm mb-4">Реквизиты организации, лицензия, внешний ID</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Организация</span>
            <span className="text-sm font-medium truncate">{org.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">ИНН</span>
            <span className="text-sm font-mono">{org.inn}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Лицензия №</span>
            <span className="text-sm">{org.licenseNo} до {org.licenseDate}</span>
          </div>
        </div>
      </div>

      {/* Карточка: Брендирование */}
      <div
        className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-pink-400 hover:shadow-lg hover:shadow-pink-100 dark:hover:shadow-pink-900/20 transition-all duration-200 group"
        onClick={() => setActivePanel("branding")}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
            <Icon name="Palette" size={22} className="text-white" />
          </div>
          <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-pink-500 transition-colors mt-1" />
        </div>
        <h3 className="font-bold text-base mb-1">Брендирование</h3>
        <p className="text-muted-foreground text-sm mb-4">Логотип организации и свой домен платформы</p>
        <div className="flex items-center gap-2">
          <Icon name="Image" size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Логотип и домен</span>
        </div>
      </div>

      {/* Карточка: Пользователи системы */}
      <div
        className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20 transition-all duration-200 group"
        onClick={() => setActivePanel("users")}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Icon name="UserCog" size={22} className="text-white" />
          </div>
          <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-cyan-500 transition-colors mt-1" />
        </div>
        <h3 className="font-bold text-base mb-1">Пользователи системы</h3>
        <p className="text-muted-foreground text-sm mb-4">Администраторы, менеджеры, преподаватели</p>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {systemUsers.slice(0, 3).map((u) => (
              <div key={u.id} className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-full flex items-center justify-center border-2 border-card">
                <span className="text-white font-bold text-xs">{(u.firstName[0] || "") + (u.lastName[0] || "")}</span>
              </div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{systemUsers.length} пользователей</span>
        </div>
      </div>

      {/* Карточка: Настройка почты */}
      <div
        className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 transition-all duration-200 group"
        onClick={() => setActivePanel("email")}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Icon name="Mail" size={22} className="text-white" />
          </div>
          <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-emerald-500 transition-colors mt-1" />
        </div>
        <h3 className="font-bold text-base mb-1">Настройка электронной почты</h3>
        <p className="text-muted-foreground text-sm mb-4">SMTP, уведомления, шаблоны писем</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-sm text-muted-foreground">SMTP настроен</span>
        </div>
      </div>

      {/* Карточка: Организации-клиенты (только для УЦ) */}
      {isUC && (
        <div
          className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100 dark:hover:shadow-amber-900/20 transition-all duration-200 group"
          onClick={() => setActivePanel("client_orgs")}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Icon name="Building" size={22} className="text-white" />
            </div>
            <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-amber-500 transition-colors mt-1" />
          </div>
          <h3 className="font-bold text-base mb-1">Организации-клиенты</h3>
          <p className="text-muted-foreground text-sm mb-4">Компании, для сотрудников которых проводится обучение</p>
          <div className="flex items-center gap-2">
            <Icon name="Building2" size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Управление списком клиентов</span>
          </div>
        </div>
      )}
    </div>
  );
}