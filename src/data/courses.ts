import type { Course, CourseDirection } from "@/types/admin";

// ─── Направления курсов ───────────────────────────────────────────────────────
// API: GET /api/course-directions → CourseDirection[]

export const COURSE_DIRECTIONS: CourseDirection[] = [
  {
    id: 1,
    title: "Промышленная безопасность",
    subscriptionType: "industrial_safety",
    courses: [
      { id: 101, code: "А.1.",   title: "Основы промышленной безопасности",                                                                             hours: 72,  hasTest: true, dpoAvailable: true  },
      { id: 102, code: "Б.1.1.", title: "Эксплуатация химически опасных производственных объектов",                                                     hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 103, code: "Б.1.2.", title: "Эксплуатация опасных производственных объектов нефтегазоперерабатывающих и нефтехимических производств",        hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 104, code: "Б.1.3.", title: "Эксплуатация опасных производственных объектов сжиженного природного газа",                                    hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 105, code: "Б.1.4.", title: "Эксплуатация хлорных объектов",                                                                                hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 106, code: "Б.1.5.", title: "Эксплуатация производств минеральных удобрений",                                                               hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 107, code: "Б.1.6.", title: "Эксплуатация аммиачных холодильных установок",                                                                 hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 108, code: "Б.1.7.", title: "Эксплуатация опасных производственных объектов складов нефти и нефтепродуктов",                                hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 109, code: "Б.2.1.", title: "Эксплуатация подъёмных сооружений",                                                                            hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 110, code: "Б.3.1.", title: "Эксплуатация объектов горнорудной и нерудной промышленности",                                                  hours: 40,  hasTest: true, dpoAvailable: true  },
    ],
  },
  {
    id: 2,
    title: "Энергобезопасность",
    subscriptionType: "energy_safety",
    courses: [
      { id: 201, code: "Э.1.",  title: "Правила технической эксплуатации электроустановок потребителей",                                                hours: 72,  hasTest: true, dpoAvailable: true  },
      { id: 202, code: "Э.2.",  title: "Охрана труда при эксплуатации электроустановок",                                                                hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 203, code: "Э.3.",  title: "Безопасность работ в электроустановках",                                                                        hours: 40,  hasTest: true, dpoAvailable: false },
      { id: 204, code: "Э.4.",  title: "Правила устройства электроустановок",                                                                           hours: 40,  hasTest: true, dpoAvailable: false },
    ],
  },
  {
    id: 3,
    title: "Охрана труда",
    subscriptionType: "labor_protection",
    courses: [
      { id: 301, code: "ОТ.1.", title: "Общие вопросы охраны труда и функционирования СУОТ",                                                            hours: 40,  hasTest: true, dpoAvailable: false },
      { id: 302, code: "ОТ.2.", title: "Обучение и проверка знаний требований охраны труда",                                                            hours: 16,  hasTest: true, dpoAvailable: false },
      { id: 303, code: "ОТ.3.", title: "Специальная оценка условий труда",                                                                              hours: 40,  hasTest: true, dpoAvailable: false },
      { id: 304, code: "ОТ.4.", title: "Расследование и учёт несчастных случаев на производстве",                                                       hours: 16,  hasTest: true, dpoAvailable: false },
      { id: 305, code: "ОТ.5.", title: "Оказание первой помощи пострадавшим на производстве",                                                           hours: 16,  hasTest: false, dpoAvailable: false },
    ],
  },
  {
    id: 4,
    title: "Подготовка экспертов ПБ",
    subscriptionType: "expert_pb",
    courses: [
      { id: 401, code: "ЭПБ.1.", title: "Подготовка экспертов в области промышленной безопасности",                                                     hours: 120, hasTest: true, dpoAvailable: true  },
      { id: 402, code: "ЭПБ.2.", title: "Повышение квалификации экспертов в области промышленной безопасности",                                         hours: 72,  hasTest: true, dpoAvailable: true  },
    ],
  },
  {
    id: 5,
    title: "Подготовка экспертов ГТС",
    subscriptionType: "expert_gts",
    courses: [
      { id: 501, code: "ЭГС.1.", title: "Подготовка экспертов в области безопасности гидротехнических сооружений",                                      hours: 120, hasTest: true, dpoAvailable: true  },
      { id: 502, code: "ЭГС.2.", title: "Повышение квалификации экспертов в области безопасности ГТС",                                                  hours: 72,  hasTest: true, dpoAvailable: true  },
    ],
  },
  {
    id: 6,
    title: "Свои курсы",
    subscriptionType: "own_courses",
    courses: [],
  },
];

// ─── Курсы (базовый каталог, legacy) ─────────────────────────────────────────
// API: GET /api/courses → Course[]

export const ALL_COURSES: Course[] = [
  { id: 101, title: "Основы промышленной безопасности",                         category: "Промышленная безопасность", emoji: "🏭", lessons: 18, duration: "72 ч" },
  { id: 201, title: "Правила технической эксплуатации электроустановок",        category: "Энергобезопасность",        emoji: "⚡", lessons: 14, duration: "72 ч" },
  { id: 301, title: "Общие вопросы охраны труда и функционирования СУОТ",       category: "Охрана труда",              emoji: "🦺", lessons: 12, duration: "40 ч" },
  { id: 401, title: "Подготовка экспертов в области промышленной безопасности", category: "Эксперты ПБ",               emoji: "📋", lessons: 22, duration: "120 ч" },
  { id: 501, title: "Подготовка экспертов в области безопасности ГТС",          category: "Эксперты ГТС",              emoji: "🌊", lessons: 20, duration: "120 ч" },
  { id: 102, title: "Эксплуатация химически опасных производственных объектов", category: "Промышленная безопасность", emoji: "☣️", lessons: 10, duration: "40 ч" },
];