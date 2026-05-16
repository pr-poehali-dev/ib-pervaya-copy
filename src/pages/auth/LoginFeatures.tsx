import Icon from "@/components/ui/icon";

const FEATURES = [
  {
    icon: "BrainCircuit",
    title: "AI ассистент тренинга",
    desc: "Для формирования траектории подготовки",
  },
  {
    icon: "GraduationCap",
    title: "Обучение и тренинг персонала",
    desc: "Подготовка к аттестации и проверке знаний",
  },
  {
    icon: "BarChart2",
    title: "Аналитика и отчёты",
    desc: "Статистика, отчеты и аналитика в одном ЛК",
  },
  {
    icon: "Plug",
    title: "Интеграция",
    desc: "Индекс безопасности — система управления промышленной безопасностью",
  },
];

export default function LoginFeatures() {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Логотип */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
          <Icon name="BookOpen" size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Интеллектуальная система подготовки</h1>
          <p className="text-sm text-gray-500">Система дистанционного обучения персонала</p>
        </div>
      </div>

      {/* Фичи */}
      <div className="space-y-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <Icon name={f.icon} size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}