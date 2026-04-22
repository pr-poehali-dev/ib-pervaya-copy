import { useState } from "react";
import Icon from "@/components/ui/icon";
import { User } from "@/components/admin/types";
import { useRole } from "@/contexts/RoleContext";
import AdminUsers from "@/components/admin/users/AdminUsers";
import AdminGroups from "@/components/admin/groups/AdminGroups";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminCatalogPanel from "@/components/admin/catalog/AdminCatalogPanel";
import StatsModal from "@/components/admin/reports/StatsModal";
import CertRegistryModal from "@/components/admin/reports/CertRegistryModal";
import SubscriptionReportModal from "@/components/admin/reports/SubscriptionReportModal";
import STPPanel from "@/components/admin/stp/STPPanel";
import CertificatesPanel from "@/components/admin/certificates/CertificatesPanel";
import TenantClosingReportModal from "@/components/admin/reports/TenantClosingReportModal";

import { AdminTabKey } from "@/components/admin/AdminTabBar";

interface AdminTabContentProps {
  activeTab: AdminTabKey;
  users: User[];
  filteredUsers: User[];
  toggleCourse: (userId: number, courseId: number) => void;
}

const reportItems = [
  {
    num: "1",
    title: "Списание подписок за период",
    desc: "Детализация списаний по организациям, группам и пользователям за выбранный период",
    icon: "CreditCard",
    color: "from-violet-500 to-purple-700",
    bg: "bg-violet-50 dark:bg-violet-900/10",
    border: "border-violet-200 dark:border-violet-800",
  },
  {
    num: "2",
    title: "Статистика обучения",
    desc: "Прогресс слушателей, процент завершения курсов, активность по группам",
    icon: "BarChart2",
    color: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/10",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  {
    num: "3",
    title: "Реестр выданных удостоверений",
    desc: "Список всех выданных удостоверений с датами, курсами и данными слушателей",
    icon: "Award",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    num: "4",
    title: "Закрытие периода",
    desc: "Итоги списания подписок по направлениям за выбранный период. Доступна выгрузка в Excel",
    icon: "FileSpreadsheet",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-900/10",
    border: "border-amber-200 dark:border-amber-800",
  },
];

export default function AdminTabContent({
  activeTab, users, filteredUsers, toggleCourse,
}: AdminTabContentProps) {
  const [showStatsModal,   setShowStatsModal]   = useState(false);
  const [showCertModal,    setShowCertModal]    = useState(false);
  const [showSubModal,     setShowSubModal]     = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const { tenantType } = useRole();
  const canIssueCert = tenantType === "training_center";

  if (activeTab === "users") {
    return (
      <AdminUsers
        users={users}
        filteredUsers={filteredUsers}
        toggleCourse={toggleCourse}
      />
    );
  }

  if (activeTab === "catalog") {
    return <AdminCatalogPanel />;
  }

  if (activeTab === "stp") {
    return <STPPanel />;
  }

  if (activeTab === "certificates") {
    return <CertificatesPanel />;
  }

  if (activeTab === "groups") {
    return <AdminGroups users={users} />;
  }

  if (activeTab === "reports") {
    return (
      <>
        <SubscriptionReportModal open={showSubModal} onClose={() => setShowSubModal(false)} users={users} />
        <StatsModal open={showStatsModal} onClose={() => setShowStatsModal(false)} users={users} />
        <CertRegistryModal open={showCertModal} onClose={() => setShowCertModal(false)} users={users} />
        <TenantClosingReportModal open={showClosingModal} onClose={() => setShowClosingModal(false)} />
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm">Выберите отчёт для формирования</p>
          {!canIssueCert && (
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
              <Icon name="Info" size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Часть отчётов недоступна, так как ваш тенант зарегистрирован как <strong>Организация</strong>.
                Реестр удостоверений и выдача удостоверений доступны только для <strong>Учебных центров</strong>.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportItems.filter((r) => r.num !== "3" || canIssueCert).map((report) => {
              const isSub     = report.num === "1";
              const isStats   = report.num === "2";
              const isCert    = report.num === "3";
              const isClosing = report.num === "4";
              const isActive  = isSub || isStats || isCert || isClosing;
              const handleOpen = isSub
                ? () => setShowSubModal(true)
                : isStats
                ? () => setShowStatsModal(true)
                : isCert
                ? () => setShowCertModal(true)
                : isClosing
                ? () => setShowClosingModal(true)
                : undefined;
              return (
                <div
                  key={report.num}
                  className={`bg-card rounded-2xl border ${report.border} p-6 flex flex-col gap-4 hover:shadow-md transition-shadow ${isActive ? "cursor-pointer" : "cursor-default"} group`}
                  onClick={handleOpen}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-xl flex items-center justify-center`}>
                      <Icon name={report.icon} size={22} className="text-white" />
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${report.bg} text-muted-foreground`}>
                      Отчёт {report.num}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base leading-tight">{report.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{report.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {isSub && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg text-xs text-violet-600 dark:text-violet-400 font-medium">
                        <Icon name="CreditCard" size={12} />
                        Доступен
                      </div>
                    )}
                    {isStats && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                        <Icon name="BarChart2" size={12} />
                        Доступен
                      </div>
                    )}
                    {isCert && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <Icon name="Award" size={12} />
                        Доступен
                      </div>
                    )}
                    {isClosing && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-600 dark:text-amber-400 font-medium">
                        <Icon name="FileSpreadsheet" size={12} />
                        Доступен
                      </div>
                    )}
                    {!isActive && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-xs text-muted-foreground">
                        <Icon name="Clock" size={12} className="text-amber-500" />
                        В разработке
                      </div>
                    )}
                    <button
                      className={`ml-auto flex items-center gap-1.5 text-xs font-medium transition-colors ${isSub ? "text-violet-500 group-hover:text-violet-600" : isStats ? "text-cyan-500 group-hover:text-cyan-600" : isCert ? "text-emerald-500 group-hover:text-emerald-600" : isClosing ? "text-amber-500 group-hover:text-amber-600" : "text-muted-foreground"}`}
                      onClick={handleOpen}
                    >
                      Открыть
                      <Icon name="ChevronRight" size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  if (activeTab === "settings") {
    return <AdminSettings />;
  }

  return null;
}