import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  MODES,
  COURSE_MATERIALS,
  type LearningMode,
  type TestAttempt,
  type CourseMaterial,
  type NtdDoc,
} from "./CoursePageTypes";

type CourseMenuCourse = {
  hasTest?: boolean;
};

type CourseMenuDir = {
  id?: number;
};

export function CourseMenu({
  course,
  dir,
  finalTestHistory,
  onSetMode,
  onShowHistory,
  onSetHistoryProtocol,
}: {
  course: CourseMenuCourse | undefined;
  dir: CourseMenuDir | undefined;
  finalTestHistory: TestAttempt[];
  onSetMode: (mode: LearningMode) => void;
  onShowHistory: () => void;
  onSetHistoryProtocol: (attempt: TestAttempt) => void;
}) {
  const [openMaterial, setOpenMaterial] = useState<CourseMaterial | null>(null);
  const [openNtd,      setOpenNtd]      = useState<NtdDoc | null>(null);

  const ntdDocs: NtdDoc[] = dir?.id === 2
    ? [
        { label: "ПТЭЭП «Правила технической эксплуатации электроустановок потребителей»", url: "https://docs.cntd.ru/document/1200031625" },
        { label: "ПОТЭУ «Правила по охране труда при эксплуатации электроустановок»",      url: "https://www.consultant.ru/document/cons_doc_LAW_171985/" },
        { label: "ПУЭ «Правила устройства электроустановок»",                              url: "https://docs.cntd.ru/document/1200030216" },
        { label: "Приказ Минэнерго № 261 «Инструкция по применению средств защиты»",      url: "https://docs.cntd.ru/document/1200069862" },
      ]
    : dir?.id === 3
    ? [
        { label: "ТК РФ — Трудовой кодекс Российской Федерации",                                    url: "https://www.consultant.ru/document/cons_doc_LAW_34683/" },
        { label: "ФЗ-426 «О специальной оценке условий труда»",                                     url: "https://www.consultant.ru/document/cons_doc_LAW_156555/" },
        { label: "ФЗ-125 «Об обязательном социальном страховании от несчастных случаев»",           url: "https://www.consultant.ru/document/cons_doc_LAW_17696/" },
        { label: "ПП РФ № 2464 «О порядке обучения по охране труда»",                              url: "https://www.consultant.ru/document/cons_doc_LAW_428609/" },
      ]
    : dir?.id === 4
    ? [
        { label: "ФЗ-116 «О промышленной безопасности опасных производственных объектов»",  url: "https://www.consultant.ru/document/cons_doc_LAW_15234/" },
        { label: "ПП РФ № 467 «Об аттестации экспертов в области промышленной безопасности»", url: "https://www.consultant.ru/document/cons_doc_LAW_194838/" },
        { label: "Приказ Ростехнадзора № 538 «Порядок осуществления экспертизы ПБ»",         url: "https://docs.cntd.ru/document/499031789" },
      ]
    : dir?.id === 5
    ? [
        { label: "ФЗ-117 «О безопасности гидротехнических сооружений»",   url: "https://www.consultant.ru/document/cons_doc_LAW_16446/" },
        { label: "ПП РФ № 986 «Критерии классификации ГТС»",               url: "https://www.consultant.ru/document/cons_doc_LAW_49455/" },
        { label: "СП 39.13330.2012 «Плотины из грунтовых материалов»",    url: "https://docs.cntd.ru/document/1200092717" },
      ]
    : [
        { label: "ФЗ-116 «О промышленной безопасности опасных производственных объектов»", url: "https://www.consultant.ru/document/cons_doc_LAW_15234/" },
        { label: "ПП РФ № 263 «Об организации и осуществлении производственного контроля»", url: "https://www.consultant.ru/document/cons_doc_LAW_36585/" },
        { label: "Приказ Ростехнадзора № 471 «Об утверждении руководства по безопасности»", url: "https://docs.cntd.ru/document/499032558" },
      ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-medium px-1">Выберите режим обучения</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODES.filter((m) => !(!course?.hasTest && (m.key === "section_test" || m.key === "final_test"))).map((m) => {
          if (m.key === "final_test" && course?.hasTest) {
            const best = finalTestHistory.length > 0
              ? finalTestHistory.reduce((a, b) => a.score > b.score ? a : b)
              : null;
            return (
              <div key={m.key} className={`p-5 rounded-2xl border-2 ${m.bg} space-y-3`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${m.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon name={m.icon} size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-0.5">{m.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                </div>
                {best && (
                  <div className="bg-background/60 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name={best.passed ? "Trophy" : "TrendingUp"} size={14} className={best.passed ? "text-amber-500 flex-shrink-0" : "text-muted-foreground flex-shrink-0"} />
                      <span className="text-xs font-medium truncate">
                        Лучший: {best.correct} из {best.total} · {best.date}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSetHistoryProtocol(best); onShowHistory(); }}
                      className="text-xs text-primary hover:underline flex-shrink-0"
                    >
                      Протокол
                    </button>
                  </div>
                )}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => onSetMode(m.key)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${m.color} hover:opacity-90 transition-opacity`}
                  >
                    {finalTestHistory.length > 0 ? "Пройти ещё раз" : "Начать тест"}
                  </button>
                  <button
                    onClick={() => onShowHistory()}
                    className="px-3 py-2 rounded-xl text-xs font-medium border border-border bg-background/60 hover:bg-muted/40 transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="History" size={13} />
                    История
                  </button>
                </div>
              </div>
            );
          }
          return (
            <button
              key={m.key}
              onClick={() => onSetMode(m.key)}
              className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md group ${m.bg}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${m.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon name={m.icon} size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{m.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Модалка просмотра материала */}
      {openMaterial && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg flex items-center justify-center">
              <Icon name={openMaterial.icon} size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{openMaterial.label}</p>
              <p className="text-xs text-muted-foreground">{openMaterial.type} · {openMaterial.ext}</p>
            </div>
            <button
              onClick={() => setOpenMaterial(null)}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {openMaterial.ext === "MP4" && (
              <div className="w-full h-full flex items-center justify-center bg-black p-4">
                <video
                  key={openMaterial.url}
                  src={openMaterial.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-xl shadow-2xl"
                  style={{ maxHeight: "calc(100vh - 64px)" }}
                >
                  Ваш браузер не поддерживает видео.
                </video>
              </div>
            )}
            {openMaterial.ext === "MP3" && (
              <div className="w-full h-full flex items-center justify-center p-6">
                <div className="w-full max-w-lg space-y-6 text-center">
                  <div className="w-28 h-28 bg-gradient-to-br from-violet-500 to-purple-700 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <Icon name="Mic" size={44} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-xl">{openMaterial.label}</p>
                    <p className="text-muted-foreground text-sm mt-1">Аудиоматериал курса</p>
                  </div>
                  <div className="bg-card rounded-2xl border border-border p-5">
                    <audio key={openMaterial.url} src={openMaterial.url} controls autoPlay className="w-full">
                      Ваш браузер не поддерживает аудио.
                    </audio>
                  </div>
                </div>
              </div>
            )}
            {openMaterial.ext === "PDF" && (
              <iframe key={openMaterial.url} src={openMaterial.url} className="w-full h-full border-0" title={openMaterial.label} />
            )}
            {openMaterial.ext === "PPTX" && (
              <iframe
                key={openMaterial.url}
                src={`https://docs.google.com/gview?url=${encodeURIComponent(openMaterial.url)}&embedded=true`}
                className="w-full h-full border-0"
                title={openMaterial.label}
              />
            )}
          </div>
        </div>
      )}

      {/* Материалы курса */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
            <Icon name="FolderOpen" size={16} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Материалы курса</p>
            <p className="text-xs text-muted-foreground">Лекции, презентации, видео и аудио</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {COURSE_MATERIALS.map((m) => (
            <button
              key={m.label}
              onClick={() => setOpenMaterial(m)}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/40 hover:bg-muted/70 rounded-xl transition-colors group text-left"
            >
              <Icon name={m.icon} size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm flex-1 min-w-0 truncate group-hover:text-foreground transition-colors">{m.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">{m.ext}</span>
              <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Модалка просмотра НТД */}
      {openNtd && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{openNtd.label}</p>
              <p className="text-xs text-muted-foreground">Нормативно-технический документ · PDF</p>
            </div>
            <button
              onClick={() => setOpenNtd(null)}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe key={openNtd.url} src={openNtd.url} className="w-full h-full border-0" title={openNtd.label} />
          </div>
        </div>
      )}

      {/* Библиотека НТД */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Icon name="Library" size={16} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Библиотека НТД</p>
            <p className="text-xs text-muted-foreground">Нормативно-технические документы по курсу</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {ntdDocs.map((doc) => (
            <button
              key={doc.label}
              onClick={() => setOpenNtd(doc)}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/40 hover:bg-muted/70 rounded-xl transition-colors group text-left"
            >
              <Icon name="FileText" size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm flex-1 min-w-0 truncate group-hover:text-foreground transition-colors">{doc.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">PDF</span>
              <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
