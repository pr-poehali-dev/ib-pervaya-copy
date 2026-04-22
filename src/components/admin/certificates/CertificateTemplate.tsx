import { Badge } from "@/components/ui/badge";
import type { Certificate, CertificateStatus } from "@/components/admin/types";

// ─── Бейдж статуса удостоверения ─────────────────────────────────────────────

export function CertBadge({ status }: { status: CertificateStatus }) {
  const map: Record<CertificateStatus, { label: string; cls: string }> = {
    ready:  { label: "Готов к выдаче", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    issued: { label: "Выдан",          cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
  };
  const { label, cls } = map[status];
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

// ─── Шаблон удостоверения ─────────────────────────────────────────────────────

export default function CertificateTemplate({ cert }: { cert: Certificate }) {
  const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  const certNum = cert.certificateNumber ?? `ДПО-${new Date().getFullYear()}-${String(cert.id).padStart(3, "0")}`;

  return (
    <div
      id="certificate-template"
      className="bg-white text-black"
      style={{
        width: "297mm",
        minHeight: "210mm",
        padding: "20mm 25mm",
        fontFamily: "Times New Roman, serif",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Рамка */}
      <div style={{
        position: "absolute", inset: "8mm",
        border: "3px solid #1a1a6e",
        borderRadius: "4px",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: "10mm",
        border: "1px solid #1a1a6e",
        borderRadius: "3px",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Шапка */}
        <p style={{ fontSize: "11pt", marginBottom: "4mm", color: "#1a1a6e", letterSpacing: "1px" }}>
          МИНИСТЕРСТВО ОБРАЗОВАНИЯ И НАУКИ РОССИЙСКОЙ ФЕДЕРАЦИИ
        </p>
        <p style={{ fontSize: "12pt", fontWeight: "bold", marginBottom: "8mm", color: "#1a1a6e" }}>
          ООО «УЦ ИСП»
        </p>
        <p style={{ fontSize: "10pt", marginBottom: "2mm", color: "#555" }}>
          Лицензия на осуществление образовательной деятельности № 9999 от 09.02.2026
        </p>

        <div style={{ margin: "8mm 0 4mm", borderBottom: "1px solid #1a1a6e" }} />

        {/* Заголовок */}
        <p style={{ fontSize: "20pt", fontWeight: "bold", letterSpacing: "3px", color: "#1a1a6e", margin: "6mm 0 2mm" }}>
          УДОСТОВЕРЕНИЕ
        </p>
        <p style={{ fontSize: "14pt", letterSpacing: "2px", color: "#1a1a6e", marginBottom: "8mm" }}>
          О ПОВЫШЕНИИ КВАЛИФИКАЦИИ
        </p>
        <p style={{ fontSize: "9pt", color: "#777", marginBottom: "6mm" }}>№ {certNum}</p>

        {/* Тело */}
        <p style={{ fontSize: "12pt", marginBottom: "4mm" }}>
          Настоящее удостоверение выдано
        </p>
        <p style={{ fontSize: "16pt", fontWeight: "bold", borderBottom: "1px solid #333", display: "inline-block", paddingBottom: "1mm", marginBottom: "6mm", minWidth: "200mm" }}>
          {cert.userName}
        </p>

        <p style={{ fontSize: "11pt", marginBottom: "4mm", lineHeight: "1.6" }}>
          в том, что он(а) в период с {cert.activatedAt ?? cert.testPassedAt} по {cert.issuedAt ?? today} прошёл(а) обучение
          по дополнительной профессиональной программе повышения квалификации:
        </p>

        <p style={{ fontSize: "13pt", fontWeight: "bold", fontStyle: "italic", margin: "4mm 0 2mm", color: "#1a1a6e" }}>
          «{cert.courseTitle}»
        </p>
        {cert.courseCode && (
          <p style={{ fontSize: "10pt", color: "#555", marginBottom: "2mm" }}>({cert.courseCode})</p>
        )}
        <p style={{ fontSize: "11pt", marginBottom: "6mm" }}>
          Объём программы: <strong>{cert.courseHours ?? "—"} академических часов</strong>
        </p>

        <p style={{ fontSize: "11pt", marginBottom: "8mm" }}>
          Итоговая аттестация пройдена с результатом: <strong>{cert.testScore}%</strong>
        </p>

        <div style={{ margin: "4mm 0", borderBottom: "1px solid #1a1a6e" }} />

        {/* Подписи */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8mm", fontSize: "10pt" }}>
          <div style={{ textAlign: "left" }}>
            <p style={{ marginBottom: "12mm" }}>Дата выдачи: <strong>{cert.issuedAt ?? today}</strong></p>
            <p>Регистрационный номер: <strong>{certNum}</strong></p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "60mm", height: "60mm", border: "1px dashed #aaa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "9pt" }}>
              М.П.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ marginBottom: "12mm" }}>Директор</p>
            <p style={{ borderTop: "1px solid #333", paddingTop: "1mm" }}>
              {cert.issuedBy ?? "________________"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
