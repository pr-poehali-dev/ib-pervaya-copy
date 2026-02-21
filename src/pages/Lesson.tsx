import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const lessonData = {
  title: "Урок 12: Криптографические протоколы",
  course: "Основы информационной безопасности",
  duration: "45 мин",
  progress: 65,
  totalLessons: 18,
  currentLesson: 12,
  content: `
    Криптографические протоколы — это набор правил и процедур, обеспечивающих безопасный обмен информацией между участниками.
    
    Основные типы криптографических протоколов:
    • SSL/TLS — защита передачи данных в интернете
    • SSH — безопасный удалённый доступ к серверам  
    • IPSec — защита на сетевом уровне
    • PGP — шифрование электронной почты
  `,
  lessons: [
    { id: 1, title: "Введение в ИБ", done: true },
    { id: 2, title: "Угрозы и атаки", done: true },
    { id: 3, title: "Политики безопасности", done: true },
    { id: 4, title: "Аутентификация", done: true },
    { id: 12, title: "Криптографические протоколы", done: false, active: true },
    { id: 13, title: "PKI и сертификаты", done: false },
    { id: 14, title: "Защита данных в покое", done: false },
  ],
};

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"content" | "materials" | "quiz">("content");

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад к курсам
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
              <div className="bg-gradient-to-r from-violet-600 to-purple-700 aspect-video flex items-center justify-center relative">
                <div className="text-center">
                  <span className="text-6xl block mb-4">🎬</span>
                  <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center gap-2 mx-auto">
                    <Icon name="Play" size={18} />
                    Смотреть урок
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                  45:20
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">Урок {lessonData.currentLesson} из {lessonData.totalLessons}</Badge>
                    <h1 className="text-2xl font-bold">{lessonData.title}</h1>
                    <p className="text-muted-foreground text-sm mt-1">{lessonData.course}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
                    <Icon name="Clock" size={15} />
                    {lessonData.duration}
                  </div>
                </div>

                <div className="flex gap-1 border-b border-border mb-5">
                  {(["content", "materials", "quiz"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                        tab === t
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "content" ? "Материал" : t === "materials" ? "Файлы" : "Тест"}
                    </button>
                  ))}
                </div>

                {tab === "content" && (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p className="leading-relaxed whitespace-pre-line text-sm text-muted-foreground">{lessonData.content}</p>
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mt-4">
                      <div className="flex gap-2">
                        <Icon name="Lightbulb" size={18} className="text-violet-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-violet-800">
                          <strong>Ключевой момент:</strong> TLS используется в 95% веб-сайтов для защиты данных пользователей при передаче.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "materials" && (
                  <div className="space-y-3">
                    {["Презентация урока.pdf", "Схемы протоколов.zip", "Дополнительная литература.pdf"].map((file) => (
                      <div key={file} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <Icon name="FileText" size={15} className="text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium">{file}</span>
                        </div>
                        <button className="text-primary hover:text-primary/80">
                          <Icon name="Download" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "quiz" && (
                  <div className="text-center py-8">
                    <span className="text-4xl block mb-3">📝</span>
                    <p className="font-medium mb-1">Тест по теме урока</p>
                    <p className="text-muted-foreground text-sm mb-5">10 вопросов · 15 минут</p>
                    <button className="gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
                      Начать тест
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 border border-border bg-white text-foreground px-5 py-3 rounded-xl font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                <Icon name="ChevronLeft" size={18} />
                Предыдущий урок
              </button>
              <button className="flex-1 gradient-primary text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                Следующий урок
                <Icon name="ChevronRight" size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <h3 className="font-bold mb-3">Прогресс курса</h3>
              <Progress value={lessonData.progress} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">{lessonData.progress}% завершено</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <h3 className="font-bold mb-4">Содержание курса</h3>
              <div className="space-y-1">
                {lessonData.lessons.map((l) => (
                  <div
                    key={l.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-sm transition-colors ${
                      l.active ? "bg-violet-50 text-violet-700" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      l.done ? "bg-emerald-500" : l.active ? "bg-violet-600" : "bg-muted border-2 border-border"
                    }`}>
                      {l.done ? (
                        <Icon name="Check" size={12} className="text-white" />
                      ) : l.active ? (
                        <Icon name="Play" size={10} className="text-white" />
                      ) : null}
                    </div>
                    <span className={`${l.active ? "font-semibold" : ""} line-clamp-1`}>{l.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
