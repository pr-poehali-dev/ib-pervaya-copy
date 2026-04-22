import type { ChatThread } from "@/types/chat";

export const CHAT_THREADS: ChatThread[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Тред type="tenant", tenantId=1, статус "new"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 1,
    type: "tenant",
    status: "new",
    subject: "Не могу получить доступ к материалам курса",
    fromUserId: "student@isp.ru",
    fromUserName: "Иванов Алексей",
    fromUserRole: "student",
    tenantId: 1,
    tenantName: "ООО Нефтехим",
    assignedToId: "admin@isp.ru",
    assignedToName: "Петрова Мария",
    createdAt: "2026-04-20T09:15:00.000Z",
    updatedAt: "2026-04-20T09:15:00.000Z",
    unreadCount: 1,
    messages: [
      {
        id: 101,
        threadId: 1,
        authorId: "student@isp.ru",
        authorName: "Иванов Алексей",
        authorRole: "student",
        text: "Добрый день! После последнего обновления платформы перестал открываться раздел «Видеолекции» в курсе «Охрана труда на производстве». При клике на урок страница просто перезагружается и ничего не происходит. Прикладываю скриншот.",
        attachments: [
          {
            id: 1,
            name: "скриншот_ошибки.png",
            size: 245000,
            type: "image",
            url: "/mock/screenshot.png",
          },
        ],
        createdAt: "2026-04-20T09:15:00.000Z",
        isRead: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Тред type="tenant", tenantId=1, статус "in_progress"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 2,
    type: "tenant",
    status: "in_progress",
    subject: "Вопрос по итоговому тесту — неверно засчитан ответ",
    fromUserId: "student@isp.ru",
    fromUserName: "Иванов Алексей",
    fromUserRole: "student",
    tenantId: 1,
    tenantName: "ООО Нефтехим",
    assignedToId: "manager@isp.ru",
    assignedToName: "Козлов Дмитрий",
    createdAt: "2026-04-18T14:30:00.000Z",
    updatedAt: "2026-04-19T10:05:00.000Z",
    unreadCount: 0,
    messages: [
      {
        id: 201,
        threadId: 2,
        authorId: "student@isp.ru",
        authorName: "Иванов Алексей",
        authorRole: "student",
        text: "Здравствуйте! В итоговом тесте по курсу «Пожарная безопасность» вопрос №7 имеет два правильных варианта ответа, но система принимает только один. Из-за этого результат теста засчитан как «не пройден». Прошу пересмотреть.",
        attachments: [],
        createdAt: "2026-04-18T14:30:00.000Z",
        isRead: true,
      },
      {
        id: 202,
        threadId: 2,
        authorId: "manager@isp.ru",
        authorName: "Козлов Дмитрий",
        authorRole: "manager",
        text: "Алексей, спасибо за обращение. Мы передали информацию методисту — проверяем корректность вопроса. Ожидайте ответа в течение 1 рабочего дня.",
        attachments: [],
        createdAt: "2026-04-18T16:00:00.000Z",
        isRead: true,
      },
      {
        id: 203,
        threadId: 2,
        authorId: "student@isp.ru",
        authorName: "Иванов Алексей",
        authorRole: "student",
        text: "Хорошо, спасибо! Буду ждать.",
        attachments: [],
        createdAt: "2026-04-19T10:05:00.000Z",
        isRead: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Тред type="tenant", tenantId=1, статус "resolved"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 3,
    type: "tenant",
    status: "resolved",
    subject: "Запрос справки об окончании курса",
    fromUserId: "student@isp.ru",
    fromUserName: "Иванов Алексей",
    fromUserRole: "student",
    tenantId: 1,
    tenantName: "ООО Нефтехим",
    assignedToId: "admin@isp.ru",
    assignedToName: "Петрова Мария",
    createdAt: "2026-04-10T11:00:00.000Z",
    updatedAt: "2026-04-11T09:30:00.000Z",
    unreadCount: 0,
    messages: [
      {
        id: 301,
        threadId: 3,
        authorId: "student@isp.ru",
        authorName: "Иванов Алексей",
        authorRole: "student",
        text: "Добрый день, Мария! Курс «Охрана труда» завершён, но в личном кабинете нет кнопки для скачивания справки. Подскажите, как её получить?",
        attachments: [],
        createdAt: "2026-04-10T11:00:00.000Z",
        isRead: true,
      },
      {
        id: 302,
        threadId: 3,
        authorId: "admin@isp.ru",
        authorName: "Петрова Мария",
        authorRole: "admin",
        text: "Алексей, добрый день! Справка формируется в течение суток после завершения курса. Сейчас она уже готова — прикладываю документ.",
        attachments: [
          {
            id: 2,
            name: "справка_охрана_труда_Иванов.pdf",
            size: 128000,
            type: "file",
            url: "/mock/certificate.pdf",
          },
        ],
        createdAt: "2026-04-11T09:20:00.000Z",
        isRead: true,
      },
      {
        id: 303,
        threadId: 3,
        authorId: "student@isp.ru",
        authorName: "Иванов Алексей",
        authorRole: "student",
        text: "Спасибо большое, всё получил!",
        attachments: [],
        createdAt: "2026-04-11T09:30:00.000Z",
        isRead: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Тред type="support" от слушателя (tenantId=1), статус "in_progress"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 4,
    type: "support",
    status: "in_progress",
    subject: "Не работает видеоплеер в браузере Safari",
    fromUserId: "student@isp.ru",
    fromUserName: "Иванов Алексей",
    fromUserRole: "student",
    tenantId: 1,
    tenantName: "ООО Нефтехим",
    assignedToId: "support@isp.ru",
    assignedToName: "Сидорова Елена",
    createdAt: "2026-04-21T08:45:00.000Z",
    updatedAt: "2026-04-21T13:20:00.000Z",
    unreadCount: 1,
    messages: [
      {
        id: 401,
        threadId: 4,
        authorId: "student@isp.ru",
        authorName: "Иванов Алексей",
        authorRole: "student",
        text: "Здравствуйте! Видеолекции не воспроизводятся в Safari на macOS 14.4. В Chrome всё работает нормально. Прикладываю скриншот консоли с ошибкой.",
        attachments: [
          {
            id: 3,
            name: "console_error.png",
            size: 187000,
            type: "image",
            url: "/mock/console_error.png",
          },
        ],
        createdAt: "2026-04-21T08:45:00.000Z",
        isRead: true,
      },
      {
        id: 402,
        threadId: 4,
        authorId: "support@isp.ru",
        authorName: "Сидорова Елена",
        authorRole: "support",
        text: "Алексей, добрый день! Спасибо за подробное описание. Видим проблему с кодеком H.264 в Safari. Инженеры уже занимаются исправлением, планируемый срок — завтра. В качестве временного решения рекомендуем Chrome или Firefox.",
        attachments: [],
        createdAt: "2026-04-21T13:20:00.000Z",
        isRead: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Тред type="support" от слушателя (tenantId=1), статус "new"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 5,
    type: "support",
    status: "new",
    subject: "Ошибка при прохождении теста — система зависает",
    fromUserId: "student@isp.ru",
    fromUserName: "Иванов Алексей",
    fromUserRole: "student",
    tenantId: 1,
    tenantName: "ООО Нефтехим",
    createdAt: "2026-04-22T16:10:00.000Z",
    updatedAt: "2026-04-22T16:10:00.000Z",
    unreadCount: 1,
    messages: [
      {
        id: 501,
        threadId: 5,
        authorId: "student@isp.ru",
        authorName: "Иванов Алексей",
        authorRole: "student",
        text: "Добрый день! При прохождении теста по курсу «Электробезопасность» на вопросе №12 система зависла: кнопка «Далее» не реагирует на нажатие уже 10 минут. Попытка перезагрузить страницу сбрасывает прогресс теста. Прошу помочь.",
        attachments: [
          {
            id: 4,
            name: "зависание_теста.png",
            size: 312000,
            type: "image",
            url: "/mock/test_freeze.png",
          },
        ],
        createdAt: "2026-04-22T16:10:00.000Z",
        isRead: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Тред type="support" от тенанта (admin@isp.ru, tenantId=1), "in_progress"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 6,
    type: "support",
    status: "in_progress",
    subject: "Запрос на добавление нового курса в каталог",
    fromUserId: "admin@isp.ru",
    fromUserName: "Петрова Мария",
    fromUserRole: "admin",
    tenantId: 1,
    tenantName: "ООО Нефтехим",
    assignedToId: "support@isp.ru",
    assignedToName: "Сидорова Елена",
    createdAt: "2026-04-17T10:00:00.000Z",
    updatedAt: "2026-04-18T11:45:00.000Z",
    unreadCount: 0,
    messages: [
      {
        id: 601,
        threadId: 6,
        authorId: "admin@isp.ru",
        authorName: "Петрова Мария",
        authorRole: "admin",
        text: "Добрый день! Нам необходимо добавить в каталог курс «Промышленная безопасность ПБ-03» для операторов технологических установок. Прикладываю техническое задание и список слушателей.",
        attachments: [
          {
            id: 5,
            name: "ТЗ_курс_ПБ03.docx",
            size: 94000,
            type: "file",
            url: "/mock/tz_pb03.docx",
          },
          {
            id: 6,
            name: "список_слушателей.xlsx",
            size: 56000,
            type: "file",
            url: "/mock/students_list.xlsx",
          },
        ],
        createdAt: "2026-04-17T10:00:00.000Z",
        isRead: true,
      },
      {
        id: 602,
        threadId: 6,
        authorId: "support@isp.ru",
        authorName: "Сидорова Елена",
        authorRole: "support",
        text: "Мария, добрый день! Документы получили, передаём методологическому отделу. Ориентировочный срок размещения курса — 5 рабочих дней. Если потребуются уточнения, свяжемся с вами.",
        attachments: [],
        createdAt: "2026-04-17T14:30:00.000Z",
        isRead: true,
      },
      {
        id: 603,
        threadId: 6,
        authorId: "admin@isp.ru",
        authorName: "Петрова Мария",
        authorRole: "admin",
        text: "Отлично, спасибо! Ждём.",
        attachments: [],
        createdAt: "2026-04-18T11:45:00.000Z",
        isRead: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Тред type="support" от тенанта (admin@isp.ru, tenantId=1), "resolved"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 7,
    type: "support",
    status: "resolved",
    subject: "Не формируется сводный отчёт по обучению",
    fromUserId: "admin@isp.ru",
    fromUserName: "Петрова Мария",
    fromUserRole: "admin",
    tenantId: 1,
    tenantName: "ООО Нефтехим",
    assignedToId: "support@isp.ru",
    assignedToName: "Сидорова Елена",
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-07T15:00:00.000Z",
    unreadCount: 0,
    messages: [
      {
        id: 701,
        threadId: 7,
        authorId: "admin@isp.ru",
        authorName: "Петрова Мария",
        authorRole: "admin",
        text: "Здравствуйте! При попытке выгрузить сводный отчёт за март 2026 г. (раздел «Аналитика → Отчёты → Сводный») система возвращает ошибку 500. Это критично — отчёт нужен для регулятора.",
        attachments: [],
        createdAt: "2026-04-05T09:00:00.000Z",
        isRead: true,
      },
      {
        id: 702,
        threadId: 7,
        authorId: "support@isp.ru",
        authorName: "Сидорова Елена",
        authorRole: "support",
        text: "Мария, проблему зафиксировали. Ошибка связана с большим объёмом данных — временно увеличили лимит запроса. Попробуйте выгрузить отчёт сейчас.",
        attachments: [],
        createdAt: "2026-04-06T10:15:00.000Z",
        isRead: true,
      },
      {
        id: 703,
        threadId: 7,
        authorId: "admin@isp.ru",
        authorName: "Петрова Мария",
        authorRole: "admin",
        text: "Отчёт успешно выгрузился! Спасибо за оперативность.",
        attachments: [
          {
            id: 7,
            name: "отчёт_март_2026.xlsx",
            size: 213000,
            type: "file",
            url: "/mock/report_march2026.xlsx",
          },
        ],
        createdAt: "2026-04-07T15:00:00.000Z",
        isRead: true,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Тред type="support" от тенанта 2 (АО Энергосеть), статус "new"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 8,
    type: "support",
    status: "new",
    subject: "Проблема с интеграцией SSO — вход через корпоративный аккаунт",
    fromUserId: "admin@energoset.ru",
    fromUserName: "Смирнов Игорь",
    fromUserRole: "admin",
    tenantId: 2,
    tenantName: "АО Энергосеть",
    createdAt: "2026-04-22T07:30:00.000Z",
    updatedAt: "2026-04-22T07:30:00.000Z",
    unreadCount: 1,
    messages: [
      {
        id: 801,
        threadId: 8,
        authorId: "admin@energoset.ru",
        authorName: "Смирнов Игорь",
        authorRole: "admin",
        text: "Добрый день! После настройки SSO через Azure AD сотрудники не могут войти в систему — получают ошибку «Invalid assertion». Конфигурация SAML проверена дважды. Прикладываю лог ошибки и нашу XML-метадату.",
        attachments: [
          {
            id: 8,
            name: "saml_error_log.txt",
            size: 18000,
            type: "file",
            url: "/mock/saml_error.txt",
          },
          {
            id: 9,
            name: "metadata_energoset.xml",
            size: 7400,
            type: "file",
            url: "/mock/metadata.xml",
          },
        ],
        createdAt: "2026-04-22T07:30:00.000Z",
        isRead: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. Тред type="support" от тенанта 3 (ГК Стройпром), статус "in_progress"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 9,
    type: "support",
    status: "in_progress",
    subject: "Увеличение лимита слушателей по договору",
    fromUserId: "admin@stroyprom.ru",
    fromUserName: "Кузнецова Ольга",
    fromUserRole: "admin",
    tenantId: 3,
    tenantName: "ГК Стройпром",
    assignedToId: "sales@isp.ru",
    assignedToName: "Воронов Константин",
    createdAt: "2026-04-19T13:00:00.000Z",
    updatedAt: "2026-04-21T09:00:00.000Z",
    unreadCount: 2,
    messages: [
      {
        id: 901,
        threadId: 9,
        authorId: "admin@stroyprom.ru",
        authorName: "Кузнецова Ольга",
        authorRole: "admin",
        text: "Здравствуйте! По текущему договору у нас 50 слушателей, но в связи с расширением штата нам нужно увеличить лимит до 120 человек. Подскажите порядок оформления и стоимость.",
        attachments: [],
        createdAt: "2026-04-19T13:00:00.000Z",
        isRead: true,
      },
      {
        id: 902,
        threadId: 9,
        authorId: "sales@isp.ru",
        authorName: "Воронов Константин",
        authorRole: "sales_manager",
        text: "Ольга, добрый день! Рад помочь. Расширение до 120 слушателей оформляется дополнительным соглашением к договору. Стоимость — 1 200 руб./мес. за каждого слушателя сверх тарифа. Подготовлю коммерческое предложение и пришлю сегодня.",
        attachments: [],
        createdAt: "2026-04-20T10:30:00.000Z",
        isRead: true,
      },
      {
        id: 903,
        threadId: 9,
        authorId: "sales@isp.ru",
        authorName: "Воронов Константин",
        authorRole: "sales_manager",
        text: "Направляю коммерческое предложение и шаблон доп. соглашения.",
        attachments: [
          {
            id: 10,
            name: "КП_Стройпром_расширение.pdf",
            size: 340000,
            type: "file",
            url: "/mock/kp_stroyprom.pdf",
          },
          {
            id: 11,
            name: "доп_соглашение_шаблон.docx",
            size: 78000,
            type: "file",
            url: "/mock/dop_soglashenie.docx",
          },
        ],
        createdAt: "2026-04-21T09:00:00.000Z",
        isRead: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. Тред type="tenant" от слушателя к тенанту 2 (АО Энергосеть), "new"
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 10,
    type: "tenant",
    status: "new",
    subject: "Когда будет открыт следующий модуль курса?",
    fromUserId: "petrov@energoset.ru",
    fromUserName: "Петров Сергей",
    fromUserRole: "student",
    tenantId: 2,
    tenantName: "АО Энергосеть",
    assignedToId: "admin@energoset.ru",
    assignedToName: "Смирнов Игорь",
    createdAt: "2026-04-23T06:55:00.000Z",
    updatedAt: "2026-04-23T06:55:00.000Z",
    unreadCount: 1,
    messages: [
      {
        id: 1001,
        threadId: 10,
        authorId: "petrov@energoset.ru",
        authorName: "Петров Сергей",
        authorRole: "student",
        text: "Добрый день! Прошёл первый модуль курса «Релейная защита и автоматика» ещё неделю назад, но второй модуль до сих пор недоступен. Статус отображается как «Скоро». Подскажите, когда откроется доступ?",
        attachments: [],
        createdAt: "2026-04-23T06:55:00.000Z",
        isRead: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 11. Бонусный тред type="tenant", tenantId=1, статус "in_progress"
  //     (ещё один тред от слушателя к тенанту 1 для полноты данных)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 11,
    type: "tenant",
    status: "in_progress",
    subject: "Прошу перенести срок сдачи курса по семейным обстоятельствам",
    fromUserId: "student@isp.ru",
    fromUserName: "Иванов Алексей",
    fromUserRole: "student",
    tenantId: 1,
    tenantName: "ООО Нефтехим",
    assignedToId: "admin@isp.ru",
    assignedToName: "Петрова Мария",
    createdAt: "2026-04-15T17:00:00.000Z",
    updatedAt: "2026-04-16T09:10:00.000Z",
    unreadCount: 1,
    messages: [
      {
        id: 1101,
        threadId: 11,
        authorId: "student@isp.ru",
        authorName: "Иванов Алексей",
        authorRole: "student",
        text: "Добрый день, Мария! Срок сдачи курса «Электробезопасность 4 группа» — 30 апреля. К сожалению, в ближайшие две недели нахожусь на больничном. Прошу рассмотреть возможность переноса срока на 15 мая. Прикладываю листок нетрудоспособности.",
        attachments: [
          {
            id: 12,
            name: "листок_нетрудоспособности.jpg",
            size: 420000,
            type: "image",
            url: "/mock/sick_leave.jpg",
          },
        ],
        createdAt: "2026-04-15T17:00:00.000Z",
        isRead: true,
      },
      {
        id: 1102,
        threadId: 11,
        authorId: "admin@isp.ru",
        authorName: "Петрова Мария",
        authorRole: "admin",
        text: "Алексей, добрый день! Документ получили. Вопрос согласован с руководством, срок переносим на 15 мая. Поправьтесь скорее!",
        attachments: [],
        createdAt: "2026-04-16T09:10:00.000Z",
        isRead: false,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Вспомогательные функции
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Треды, доступные слушателю: только те, где он является инициатором.
 */
export function getThreadsForStudent(userEmail: string): ChatThread[] {
  return CHAT_THREADS.filter((t) => t.fromUserId === userEmail);
}

/**
 * Треды, доступные администратору тенанта:
 * - все type="tenant" своего тенанта (входящие обращения слушателей)
 * - все type="support", отправленные от имени своего тенанта
 */
export function getThreadsForTenantAdmin(tenantId: number): ChatThread[] {
  return CHAT_THREADS.filter((t) => t.tenantId === tenantId);
}

/**
 * Треды для специалиста техподдержки: все обращения типа "support".
 */
export function getThreadsForSupport(): ChatThread[] {
  return CHAT_THREADS.filter((t) => t.type === "support");
}

/**
 * Треды для менеджера продаж: все обращения, назначенные на него.
 */
export function getThreadsForSalesManager(managerEmail: string): ChatThread[] {
  return CHAT_THREADS.filter((t) => t.assignedToId === managerEmail);
}

/**
 * Количество непрочитанных сообщений для пользователя по списку тредов.
 * Считаем сообщения, где автор — НЕ сам пользователь и isRead === false.
 */
export function getUnreadCount(
  threads: ChatThread[],
  userEmail: string
): number {
  return threads.reduce((total, thread) => {
    const unread = thread.messages.filter(
      (m) => m.authorId !== userEmail && !m.isRead
    ).length;
    return total + unread;
  }, 0);
}
