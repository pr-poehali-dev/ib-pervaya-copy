import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CertificateTemplate from "./CertificateTemplate";
import type { Certificate } from "@/components/admin/types";

export default function IssueCertModal({
  cert,
  onClose,
  onIssue,
}: {
  cert: Certificate;
  onClose: () => void;
  onIssue: (certNum: string, issuedBy: string) => void;
}) {
  const [certNum,  setCertNum]  = useState(`ДПО-${new Date().getFullYear()}-${String(cert.id).padStart(3, "0")}`);
  const [issuedBy, setIssuedBy] = useState("Иванов И.И.");
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = document.getElementById("certificate-template");
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Удостоверение ДПО</title>
      <style>
        @page { size: A4 landscape; margin: 0; }
        body { margin: 0; }
        #certificate-template { page-break-inside: avoid; }
      </style>
      </head><body>${content.outerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  const previewCert: Certificate = {
    ...cert,
    certificateNumber: certNum,
    issuedBy,
    issuedAt: new Date().toLocaleDateString("ru-RU"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-bold text-base">Выдача удостоверения ДПО</h2>
            <p className="text-xs text-muted-foreground">{cert.userName} · {cert.courseTitle}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
            <Icon name="CheckCircle" size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Тест сдан успешно</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Результат: {cert.testScore}% · Дата: {cert.testPassedAt}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Номер удостоверения</label>
              <input value={certNum} onChange={(e) => setCertNum(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Подписант</label>
              <input value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-xl gap-2"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Icon name={showPreview ? "EyeOff" : "Eye"} size={15} />
            {showPreview ? "Скрыть предпросмотр" : "Предпросмотр"}
          </Button>

          {showPreview && (
            <div className="border border-border rounded-xl overflow-hidden" style={{ transform: "scale(0.35)", transformOrigin: "top left", height: "105mm", marginBottom: "-68%" }}>
              <div ref={printRef}>
                <CertificateTemplate cert={previewCert} />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-6 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button variant="outline" className="rounded-xl gap-2" onClick={handlePrint}>
            <Icon name="Printer" size={15} />
            Печать
          </Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white gap-2" onClick={() => onIssue(certNum, issuedBy)}>
            <Icon name="Award" size={15} />
            Выдать
          </Button>
        </div>
      </div>

      {/* Скрытый шаблон для печати */}
      {showPreview && (
        <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
          <CertificateTemplate cert={previewCert} />
        </div>
      )}
    </div>
  );
}
