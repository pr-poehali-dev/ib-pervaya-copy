import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CertificateTemplate from "./CertificateTemplate";
import type { Certificate } from "@/components/admin/types";

export default function ViewCertModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  function handlePrint() {
    const content = document.getElementById("cert-view-template");
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Удостоверение ДПО</title><style>@page{size:A4 landscape;margin:0}body{margin:0}</style></head><body>${content.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  function handleDownload() {
    const content = document.getElementById("cert-view-template");
    if (!content) return;
    const blob = new Blob([`<html><head><style>@page{size:A4 landscape;margin:0}body{margin:0}</style></head><body>${content.outerHTML}</body></html>`], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${cert.certificateNumber ?? "certificate"}.html`;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md space-y-0 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-semibold text-base">Удостоверение ДПО</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{cert.certificateNumber ?? "—"}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Слушатель</span><span className="font-medium">{cert.userName}</span></div>
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Организация</span><span>{cert.userOrganization ?? "—"}</span></div>
          <div className="flex justify-between py-1 border-b border-border/50 gap-4"><span className="text-muted-foreground shrink-0">Курс</span><span className="text-right">{cert.courseTitle}</span></div>
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Код</span><span className="font-mono">{cert.courseCode ?? "—"}</span></div>
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Часов</span><span>{cert.courseHours ? `${cert.courseHours} ч` : "—"}</span></div>
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Начало обучения</span><span>{cert.activatedAt ?? "—"}</span></div>
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Результат</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">{cert.testScore}%</span></div>
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Дата теста</span><span>{cert.testPassedAt}</span></div>
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Дата выдачи</span><span>{cert.issuedAt ?? "—"}</span></div>
          <div className="flex justify-between py-1"><span className="text-muted-foreground">Выдал</span><span>{cert.issuedBy ?? "—"}</span></div>
        </div>
        <div className="p-6 pt-0 space-y-2">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl gap-2 text-sm" onClick={handlePrint}>
              <Icon name="Eye" size={15} />
              Показать удостоверение
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl gap-2 text-sm" onClick={handleDownload}>
              <Icon name="Download" size={15} />
              Скачать
            </Button>
          </div>
          <Button variant="outline" className="w-full rounded-xl text-sm" onClick={onClose}>Закрыть</Button>
        </div>
        {/* Скрытый шаблон для печати/скачивания */}
        <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
          <div id="cert-view-template">
            <CertificateTemplate cert={cert} />
          </div>
        </div>
      </div>
    </div>
  );
}
