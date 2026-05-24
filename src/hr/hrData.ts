import type {
  AvClass,
  Employee,
  FeedItem,
  ScheduleItem,
  PerfKpi,
  Group,
  DirectConv,
  SharedFile,
  ThreadMsg,
  RequestItem,
  RewardItem,
  CalendarEvent,
  HrUser,
  HrData,
} from './hrTypes'

const AV_PALETTE: AvClass[] = ['av-1', 'av-2', 'av-3', 'av-4', 'av-5', 'av-6', 'av-7', 'av-8']

function avClassFromId(id: number): AvClass {
  return AV_PALETTE[id % AV_PALETTE.length]
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
}

const HR_USER: HrUser = {
  id: 0,
  name: "Ольга Карпова",
  role: "HR Business Partner · Корпоративный блок",
  initials: "ОК",
  avClass: "av-1",
}

const EMPLOYEES: Employee[] = [
  { id: 1,  name: "Никита Соловьёв",    role: "Стажёр · Розница",     team: "Розница",     status: "online",  score: 92, delta: +6,  scenarios: 14, lastActive: "сейчас",       trend: [60,62,66,70,74,80,86,92], hasUnread: 2 },
  { id: 2,  name: "Алина Зайцева",      role: "Стажёр · Розница",     team: "Розница",     status: "online",  score: 88, delta: +3,  scenarios: 12, lastActive: "5 мин назад",   trend: [55,58,62,68,72,78,84,88], hasUnread: 0 },
  { id: 3,  name: "Дмитрий Орлов",      role: "Стажёр · Корпоратив",  team: "Корпоратив",  status: "busy",    score: 84, delta: +1,  scenarios: 15, lastActive: "12 мин назад",  trend: [68,72,74,78,80,82,83,84], hasUnread: 0 },
  { id: 4,  name: "Елизавета Михайлова", role: "Стажёр · Корпоратив", team: "Корпоратив",  status: "online",  score: 80, delta: +5,  scenarios: 11, lastActive: "1 мин назад",   trend: [50,54,60,65,70,73,77,80], hasUnread: 1 },
  { id: 5,  name: "Артём Жданов",       role: "Стажёр · Розница",     team: "Розница",     status: "away",    score: 76, delta: +2,  scenarios: 10, lastActive: "1 ч назад",     trend: [64,66,68,70,72,73,75,76], hasUnread: 0 },
  { id: 6,  name: "София Лебедева",     role: "Стажёр · Премиум",     team: "Премиум",     status: "online",  score: 74, delta: -2,  scenarios:  9, lastActive: "23 мин назад",  trend: [72,76,78,79,77,76,75,74], hasUnread: 0 },
  { id: 7,  name: "Григорий Зимин",     role: "Стажёр · Корпоратив",  team: "Корпоратив",  status: "online",  score: 68, delta: -4,  scenarios:  8, lastActive: "2 мин назад",   trend: [78,76,74,72,70,69,68,68], hasUnread: 3 },
  { id: 8,  name: "Полина Карасёва",    role: "Стажёр · Розница",     team: "Розница",     status: "offline", score: 61, delta: -7,  scenarios:  6, lastActive: "вчера, 19:14",  trend: [72,70,68,66,64,63,62,61], hasUnread: 0 },
  { id: 9,  name: "Кирилл Беляков",     role: "Стажёр · Премиум",     team: "Премиум",     status: "busy",    score: 58, delta: -9,  scenarios:  5, lastActive: "20 мин назад",  trend: [70,68,65,62,60,59,58,58], hasUnread: 1 },
  { id: 10, name: "Виктория Иванова",   role: "Стажёр · Корпоратив",  team: "Корпоратив",  status: "online",  score: 95, delta: +4,  scenarios: 17, lastActive: "сейчас",        trend: [78,82,85,87,89,91,93,95], hasUnread: 0 },
  { id: 11, name: "Михаил Ткачёв",      role: "Стажёр · Розница",     team: "Розница",     status: "online",  score: 71, delta: +1,  scenarios:  9, lastActive: "8 мин назад",   trend: [64,66,68,69,70,70,70,71], hasUnread: 0 },
  { id: 12, name: "Анастасия Громова",  role: "Стажёр · Премиум",     team: "Премиум",     status: "online",  score: 86, delta: +4,  scenarios: 13, lastActive: "3 мин назад",   trend: [70,73,76,79,81,83,85,86], hasUnread: 0 },
  { id: 13, name: "Степан Розов",       role: "Стажёр · Розница",     team: "Розница",     status: "online",  score: 79, delta: +2,  scenarios: 11, lastActive: "4 мин назад",   trend: [68,70,72,74,75,76,78,79], hasUnread: 0 },
  { id: 14, name: "Юлия Беспалова",     role: "Стажёр · Корпоратив",  team: "Корпоратив",  status: "online",  score: 82, delta: +3,  scenarios: 12, lastActive: "11 мин назад",  trend: [70,72,74,76,78,80,81,82], hasUnread: 0 },
  { id: 15, name: "Денис Калинин",      role: "Стажёр · Премиум",     team: "Премиум",     status: "away",    score: 73, delta: 0,   scenarios:  9, lastActive: "40 мин назад",  trend: [73,74,73,72,73,74,73,73], hasUnread: 0 },
  { id: 16, name: "Ева Никифорова",     role: "Стажёр · Розница",     team: "Розница",     status: "online",  score: 89, delta: +5,  scenarios: 14, lastActive: "сейчас",        trend: [72,75,78,81,83,85,87,89], hasUnread: 1 },
  { id: 17, name: "Тимур Габдуллин",    role: "Стажёр · Корпоратив",  team: "Корпоратив",  status: "busy",    score: 65, delta: -3,  scenarios:  7, lastActive: "30 мин назад",  trend: [70,69,68,67,66,66,65,65], hasUnread: 0 },
  { id: 18, name: "Мария Сухова",       role: "Стажёр · Розница",     team: "Розница",     status: "online",  score: 91, delta: +5,  scenarios: 15, lastActive: "2 мин назад",   trend: [75,78,81,83,85,87,89,91], hasUnread: 0 },
  { id: 19, name: "Олег Прохоров",      role: "Стажёр · Премиум",     team: "Премиум",     status: "offline", score: 55, delta: -5,  scenarios:  4, lastActive: "вчера, 14:22",  trend: [64,62,60,58,57,56,55,55], hasUnread: 2 },
  { id: 20, name: "Дарья Поликарпова",  role: "Стажёр · Корпоратив",  team: "Корпоратив",  status: "online",  score: 87, delta: +6,  scenarios: 13, lastActive: "1 мин назад",   trend: [68,72,76,79,82,84,86,87], hasUnread: 0 },
].map(e => ({ ...e, initials: initials(e.name), avClass: avClassFromId(e.id) })) as Employee[]

const COHORTS: string[] = ["Розница", "Корпоратив", "Премиум"]

const FEED: FeedItem[] = [
  { id: 1,  who: 10, action: "завершила сценарий", target: "«Эскалация по ипотеке»",         tag: "98%",          tagKind: "good", when: "2 мин" },
  { id: 2,  who:  7, action: "провалила сценарий", target: "«Возражение по комиссии»",       tag: "42%",          tagKind: "bad",  when: "9 мин" },
  { id: 3,  who:  4, action: "получила бейдж",     target: "«Эмпатия 2.0»",                 tag: "+15 XP",       tagKind: "",     when: "14 мин" },
  { id: 4,  who:  1, action: "начал сценарий",     target: "«Холодный звонок · Карта Gold»", tag: "",             tagKind: "",     when: "21 мин" },
  { id: 5,  who:  9, action: "пропустил дедлайн",  target: "модуль «Антифрод. Базовый»",    tag: "−8 XP",        tagKind: "warn", when: "1 ч" },
  { id: 6,  who: 18, action: "завершила сценарий", target: "«Возврат комиссии»",             tag: "94%",          tagKind: "good", when: "1 ч" },
  { id: 7,  who:  2, action: "загрузила запись",   target: "«Возражение по карте Gold»",     tag: "MP4 · 18.6МБ", tagKind: "",     when: "1.5 ч" },
  { id: 8,  who: 20, action: "повысила балл",      target: "Корп. кредитование",             tag: "+6",           tagKind: "good", when: "2 ч" },
  { id: 9,  who: 17, action: "начал пересдачу",    target: "модуля «Антифрод»",              tag: "попытка 2",    tagKind: "warn", when: "2 ч" },
  { id: 10, who: 16, action: "получила бейдж",     target: "«Скорость 30 сек»",              tag: "+10 XP",       tagKind: "",     when: "3 ч" },
]

const SCHEDULE: ScheduleItem[] = [
  { id: "s1", time: "10:00", end: "10:30", title: "1:1 · Артём Жданов",         context: "Разбор недели",      with: [5] },
  { id: "s2", time: "11:30", end: "12:15", title: "Калибровка · Розница",       context: "5 участников",       with: [1,2,5,8,11] },
  { id: "s3", time: "14:00", end: "14:45", title: "Видеоразбор · Г. Зимин",     context: "Запись «Антифрод»",  with: [7] },
  { id: "s4", time: "16:00", end: "16:30", title: "Скрининг · Корпоратив",      context: "Полугодовая оценка", with: [3,4,10,7,14,20] },
  { id: "s5", time: "17:00", end: "17:30", title: "Менторская · Премиум",       context: "Кейс-клуб",          with: [6,9,12,15] },
]

const PERF_KPIS: PerfKpi[] = [
  { lbl: "Средний балл",        val: 79.4, suffix: "%",    delta: "+3.2", dir: "up",   spark: [70,72,73,72,74,76,78,79,79] },
  { lbl: "Активных стажёров",   val: 24,   suffix: "/26",  delta: "+2",   dir: "up",   spark: [20,21,21,22,23,23,24,24,24] },
  { lbl: "Завершено сценариев", val: 312,  suffix: "",     delta: "+47",  dir: "up",   spark: [40,50,55,58,60,62,65,68,72] },
  { lbl: "Зона риска",          val: 4,    suffix: "",     delta: "−1",   dir: "down", spark: [6,6,5,5,5,4,5,4,4] },
]

const MODULES: string[] = ["Onboarding", "Розница: продукты", "Антифрод", "Корп. кредитование", "Эмпатия в звонке", "Эскалация"]

const HEATMAP: Record<string, number[]> = {
  "Розница":    [92, 88, 71, 54, 84, 76],
  "Корпоратив": [95, 72, 86, 91, 78, 82],
  "Премиум":    [89, 84, 68, 70, 91, 88],
  "Бэк-офис":   [88, 65, 90, 72, 60, 55],
  "Скоринг":    [86, 70, 94, 80, 56, 62],
}

const GROUPS: Group[] = [
  {
    id: "g1", type: "Команда", name: "Розница · Стажёры 2026",
    members: [1,2,5,8,11], unread: 4,
    preview: "Никита: Готов к разбору в 11:30 👍",
    lastAt: "10:42",
  },
  {
    id: "g2", type: "Проект", name: "Антифрод · Калибровка",
    members: [3,7,9,10], unread: 0,
    preview: "Виктория: Загрузила обновлённый сценарий",
    lastAt: "10:15",
  },
  {
    id: "g3", type: "Когорта", name: "Корпоратив · 1-й поток",
    members: [3,4,7,10], unread: 1,
    preview: "Елизавета: Можно перенести встречу на 14:30?",
    lastAt: "09:58",
  },
  {
    id: "g4", type: "Менторская", name: "Премиум · Кейс-клуб",
    members: [6,9,12], unread: 0,
    preview: "София: спасибо за разбор!",
    lastAt: "вчера",
  },
]

const DIRECT: DirectConv[] = [
  { id: "d1", with: 1,  unread: 2, preview: "Можно ли пересдать модуль раньше?",           lastAt: "10:48" },
  { id: "d3", with: 7,  unread: 3, preview: "Голосовое сообщение · 0:42",                   lastAt: "10:28" },
  { id: "d4", with: 4,  unread: 1, preview: "Спасибо за фидбэк — попробую сегодня",         lastAt: "09:52" },
  { id: "d2", with: 10, unread: 0, preview: "Вы: Отличная работа на сценарии 17 👏",        lastAt: "09:30" },
  { id: "d5", with: 9,  unread: 1, preview: "Пропущенный видео-звонок",                     lastAt: "вчера" },
  { id: "d6", with: 3,  unread: 0, preview: "Вы: Жду отчёт по сценарию «Холодный звонок»", lastAt: "вчера" },
  { id: "d7", with: 12, unread: 0, preview: "Анастасия: согласна, прийду в 16:00",          lastAt: "пн" },
]

const THREAD_D1: ThreadMsg[] = [
  { kind: "divider", text: "Сегодня · 10:32" },
  { kind: "msg", from: 1, text: "Ольга, добрый день! Подскажите — можно пересдать модуль «Антифрод» раньше срока? Я уже прошёл два смежных сценария.", time: "10:32" },
  { kind: "msg", from: 0, text: "Привет, Никита! Конечно, можно. Загляни в расписание — есть открытые слоты в среду и пятницу.", time: "10:35" },
  { kind: "scenario", title: "«Холодный звонок · Карта Gold»", progress: 87, status: "В процессе" },
  { kind: "msg", from: 1, text: "Спасибо! И ещё — записал сегодняшний сценарий. Можешь глянуть таймкод 4:18, у меня там сложный отказ от клиента.", time: "10:46" },
  { kind: "file", name: "Холодный_звонок_Карта_Gold.mp4", size: "12.4 МБ", kindLabel: "MP4" },
  { kind: "msg", from: 0, text: "Глянула. На 4:18 ты переключился слишком резко — попробуй фразу-мост из модуля «Эмпатия 2.0», урок 3.", time: "10:54" },
  { kind: "call", direction: "outgoing", kind2: "voice", duration: "8 мин 12 сек", time: "10:58" },
  { kind: "msg", from: 1, text: "Понял, спасибо! Готов к разбору в 11:30 👍", time: "11:02" },
]

const THREAD_D3: ThreadMsg[] = [
  { kind: "divider", text: "Сегодня · 10:15" },
  { kind: "msg", from: 7, text: "Ольга, привет. Мне сказали, пересдача «Возражения» назначена на пятницу?", time: "10:15" },
  { kind: "msg", from: 0, text: "Да, Григорий. Пятница 14:00. Акцент на фразу-мост из урока 3 модуля «Эмпатия 2.0».", time: "10:18" },
  { kind: "msg", from: 7, text: "Понял. Можно ещё раз посмотреть запись провала?", time: "10:20" },
  { kind: "call", direction: "missed", kind2: "voice", duration: "0:42", time: "10:25" },
  { kind: "msg", from: 0, text: "Вижу, что не взял трубку — ок, пришлю ссылку на запись в чат.", time: "10:28" },
]

const THREAD_D4: ThreadMsg[] = [
  { kind: "divider", text: "Сегодня · 09:45" },
  { kind: "msg", from: 4, text: "Ольга, большое спасибо за подробный фидбэк! Попробую сегодня.", time: "09:45" },
  { kind: "msg", from: 0, text: "Молодец, Елизавета! Обрати внимание на скорость закрытия звонка — сейчас у тебя чуть выше нормы.", time: "09:48" },
  { kind: "scenario", title: "«Корп. кредитование · Базовый»", progress: 76, status: "Завершён" },
  { kind: "msg", from: 4, text: "Вот результат — стало лучше чем вчера?", time: "09:52" },
]

const THREAD_D2: ThreadMsg[] = [
  { kind: "divider", text: "Сегодня · 09:20" },
  { kind: "msg", from: 0, text: "Виктория, отличная работа на сценарии 17 — 95 баллов! 👏", time: "09:20" },
  { kind: "msg", from: 10, text: "Спасибо, Ольга! Старалась. Когда откроется следующий модуль?", time: "09:25" },
  { kind: "msg", from: 0, text: "Следующий модуль откроется в среду. Ты в топ-3 по когорте!", time: "09:30" },
]

const THREAD_D5: ThreadMsg[] = [
  { kind: "divider", text: "Вчера · 16:45" },
  { kind: "call", direction: "missed", kind2: "video", duration: "пропущен", time: "16:45" },
  { kind: "msg", from: 0, text: "Кирилл, перезвони когда сможешь — важный разговор по дедлайну модуля.", time: "17:00" },
]

const THREAD_D6: ThreadMsg[] = [
  { kind: "divider", text: "Вчера · 14:30" },
  { kind: "msg", from: 0, text: "Дмитрий, жду отчёт по сценарию «Холодный звонок». Пришли до конца дня.", time: "14:30" },
  { kind: "msg", from: 3, text: "Принято, сдам к 18:00.", time: "14:42" },
]

const THREAD_D7: ThreadMsg[] = [
  { kind: "divider", text: "Понедельник · 15:45" },
  { kind: "msg", from: 0, text: "Анастасия, встреча в понедельник в 16:00 — подтверди, пожалуйста.", time: "15:45" },
  { kind: "msg", from: 12, text: "Согласна, прийду в 16:00", time: "15:52" },
]

const THREADS: Record<string, ThreadMsg[]> = {
  d1: THREAD_D1,
  d2: THREAD_D2,
  d3: THREAD_D3,
  d4: THREAD_D4,
  d5: THREAD_D5,
  d6: THREAD_D6,
  d7: THREAD_D7,
}

const SHARED_FILES: SharedFile[] = [
  { name: "Холодный_звонок_Gold.mp4", size: "12.4 МБ", kind: "MP4" },
  { name: "Отчёт_недели_07.pdf",      size: "1.2 МБ",  kind: "PDF" },
  { name: "Антифрод_конспект.docx",   size: "320 КБ",  kind: "DOC" },
]

const REQUESTS: RequestItem[] = [
  { id: "r1", who: 1,  kind: "Пересдача модуля",    subject: "«Антифрод · Базовый»",                  submitted: "сегодня, 09:18",  status: "pending",  note: "Хочу пересдать раньше срока — прошёл смежные сценарии." },
  { id: "r2", who: 4,  kind: "Перенос встречи",      subject: "Калибровка · Корпоратив",               submitted: "сегодня, 09:58",  status: "pending",  note: "Можно ли перенести на 14:30? Налагается с сессией ментора." },
  { id: "r3", who: 7,  kind: "Доступ к материалам",  subject: "Корп. кредитование · продвинутый",      submitted: "вчера, 17:42",    status: "review",   note: "Запрос доступа к продвинутому модулю." },
  { id: "r4", who: 9,  kind: "Продление срока",      subject: "Дедлайн модуля «Антифрод»",             submitted: "вчера, 14:11",    status: "review",   note: "Прошу дополнительные 3 дня — был на больничном." },
  { id: "r5", who: 10, kind: "Награда",               subject: "Промо до позиции Mid",                  submitted: "пятница, 11:30",  status: "approved", note: "Превысила цель квартала на 18%." },
  { id: "r6", who: 2,  kind: "Доступ к материалам",  subject: "Архив прошлых сценариев",               submitted: "пятница, 09:14",  status: "approved", note: "Для подготовки к калибровке." },
]

const REWARDS: RewardItem[] = [
  { id: "b1", name: "Эмпатия 2.0",     desc: "Завершить 10 сценариев с возражениями (балл ≥85)",      kind: "cobalt", recipients: [4,2,10,18],   pct: 78,  foot: "4/26 получили" },
  { id: "b2", name: "Скорость 30 сек", desc: "Закрыть звонок до 30 секунд после согласия клиента",   kind: "good",   recipients: [16,1,18],      pct: 62,  foot: "3/26 получили" },
  { id: "b3", name: "Антифрод-эксперт", desc: "Распознать 5 типов мошенничества подряд",             kind: "warn",   recipients: [10,20],        pct: 34,  foot: "2/26 получили" },
  { id: "b4", name: "Топ недели",       desc: "Выйти в топ-3 по среднему баллу за неделю",            kind: "synth",  recipients: [10,1,18],      pct: 100, foot: "Распределено: понедельник" },
  { id: "b5", name: "Без срывов",       desc: "Не пропустить ни одного дедлайна за месяц",            kind: "good",   recipients: [2,3,12,14,16,20], pct: 48, foot: "6/26 получили" },
  { id: "b6", name: "Регламент-знаток", desc: "Точность в модуле «Регламенты» ≥ 95%",                kind: "cobalt", recipients: [10,3,12],      pct: 42,  foot: "3/26 получили" },
]

const CALENDAR_EVENTS: CalendarEvent[] = [
  { day: 0, start: 10,   end: 10.5,  kind: "cobalt", title: "1:1 · А. Жданов",       sub: "Разбор недели" },
  { day: 0, start: 11.5, end: 12.25, kind: "cobalt", title: "Калибровка · Розница",  sub: "5 участников" },
  { day: 0, start: 14,   end: 14.75, kind: "warn",   title: "Видеоразбор · Зимин",   sub: "Антифрод" },
  { day: 0, start: 16,   end: 16.5,  kind: "cobalt", title: "Скрининг · Корпоратив", sub: "Полугодовой" },
  { day: 1, start: 9.5,  end: 10.5,  kind: "good",   title: "Onboarding · поток 5",  sub: "Новые стажёры" },
  { day: 1, start: 13,   end: 14,    kind: "cobalt", title: "1:1 · С. Лебедева",     sub: "Кейс-клуб" },
  { day: 1, start: 15.5, end: 16.5,  kind: "cobalt", title: "Менторская · Премиум",  sub: "3 ментора" },
  { day: 2, start: 10,   end: 11,    kind: "warn",   title: "Пересдача · Антифрод",  sub: "К. Беляков" },
  { day: 2, start: 11.5, end: 12,    kind: "cobalt", title: "1:1 · Никита С.",        sub: "Разбор записи" },
  { day: 2, start: 14,   end: 15,    kind: "good",   title: "Награды · подведение",   sub: "6 номинантов" },
  { day: 3, start: 9,    end: 10,    kind: "cobalt", title: "Stand-up · HR",          sub: "Все HRBP" },
  { day: 3, start: 14,   end: 15,    kind: "cobalt", title: "Sync · IT-команда",      sub: "Платформа" },
  { day: 3, start: 16,   end: 17,    kind: "cobalt", title: "Калибровка ментров",      sub: "4 человека" },
  { day: 4, start: 10,   end: 11,    kind: "good",   title: "Демо-день",              sub: "5 стажёров" },
  { day: 4, start: 13,   end: 14,    kind: "cobalt", title: "Ретро недели",           sub: "Команда HR" },
  { day: 4, start: 16,   end: 17,    kind: "warn",   title: "Дедлайн · Антифрод",     sub: "Финальный" },
]

const hrData: HrData = {
  HR_USER, EMPLOYEES, COHORTS, FEED, SCHEDULE,
  PERF_KPIS, MODULES, HEATMAP, GROUPS, DIRECT,
  THREAD_D1, SHARED_FILES, REQUESTS, REWARDS, CALENDAR_EVENTS,
  THREADS,
  avClassFromId, initials,
}

export default hrData
