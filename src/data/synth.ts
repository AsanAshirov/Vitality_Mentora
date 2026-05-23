// synth.ts — synthetic data for the BankSandbox. NO real customer data, ever.
// All names, IDs, amounts, addresses are randomly generated.

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  short: string;
  inn: string;
  phone: string;
  city: string;
  tier: "Low" | "Med" | "High";
  status: string;
  lang: string;
  since: string;
}

export interface Account {
  id: string;
  customer: string;
  cur: string;
  type: string;
  bal: number;
  status: string;
  opened: string;
}

export interface Deposit {
  id: string;
  customer: string;
  amount: number;
  cur: string;
  rate: number;
  term: string;
  maturity: string;
  status: string;
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  cur: string;
  channel: string;
  status: string;
  t: string;
  reason?: string;
}

export interface Card {
  num: string;
  customer: string;
  brand: string;
  type: string;
  exp: string;
  status: string;
}

export interface Sanction {
  id: string;
  name: string;
  list: string;
  reason: string;
  country: string;
  type: string;
  added: string;
  risk: string;
  hit?: boolean;
}

export interface Pep {
  id: string;
  name: string;
  country: string;
  position: string;
  since: string;
  status: string;
}

export interface AmlReport {
  id: string;
  type: string;
  customer: string;
  amount: string;
  status: string;
  filed: string;
}

export interface HandbookEntry {
  id: string;
  title: string;
  ver: string;
  upd: string;
  tags: string[];
  sections: number;
}

export interface ActivityEntry {
  t: string;
  actor: string;
  action: string;
  what: string;
  tag: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const CUSTOMERS: Customer[] = [
  { id: "SYN-2847102", name: "Соколов Иван Алексеевич",    short: "ИС", inn: "3094 8826 5571", phone: "+998 90 348 12 04", city: "Ташкент",   tier: "Med",  status: "Черновик KYC", lang: "RU", since: "—" },
  { id: "SYN-1840553", name: "Каримова Дилноза Рустамовна", short: "ДК", inn: "5012 7741 8830", phone: "+998 71 200 55 17", city: "Самарканд", tier: "Low",  status: "Активен",      lang: "UZ", since: "2022-04" },
  { id: "SYN-9032847", name: "Петров Дмитрий Сергеевич",   short: "ДП", inn: "1881 5023 9941", phone: "+998 90 112 84 02", city: "Ташкент",   tier: "High", status: "Активен",      lang: "RU", since: "2019-11" },
  { id: "SYN-4471009", name: "Юлдашев Бекзод Шарипович",   short: "БЮ", inn: "7741 3308 1129", phone: "+998 95 600 11 38", city: "Бухара",    tier: "Med",  status: "Активен",      lang: "UZ", since: "2024-08" },
  { id: "SYN-6618402", name: "Mirzaev Sherzod K.",           short: "ШМ", inn: "9930 4471 2088", phone: "+998 99 188 04 56", city: "Андижан",   tier: "Low",  status: "Заморожен",    lang: "UZ", since: "2021-07" },
  { id: "SYN-5510334", name: "Иванова Ольга Викторовна",    short: "ОИ", inn: "2204 9981 7733", phone: "+998 90 444 19 27", city: "Ташкент",   tier: "Med",  status: "Активен",      lang: "RU", since: "2023-02" },
  { id: "SYN-2200471", name: "Турсунов Аброр Бахтиёрович",  short: "АТ", inn: "8830 1102 4471", phone: "+998 71 902 33 18", city: "Фергана",   tier: "High", status: "Активен",      lang: "UZ", since: "2018-05" },
  { id: "SYN-7733208", name: "Назарова Жасмина Эркиновна",  short: "ЖН", inn: "4471 8830 5012", phone: "+998 90 712 28 04", city: "Нукус",     tier: "Low",  status: "Активен",      lang: "UZ", since: "2025-01" },
];

const ACCOUNTS: Account[] = [
  { id: "20208 840 0 00012 0011928", customer: "Соколов И.А.",  cur: "USD", type: "Текущий",        bal: 4_182.30,    status: "Активен",   opened: "—" },
  { id: "20208 860 0 00012 0078213", customer: "Каримова Д.Р.", cur: "UZS", type: "Сберегательный", bal: 18_400_000,  status: "Активен",   opened: "2022-04-08" },
  { id: "20208 860 0 00012 0042118", customer: "Петров Д.С.",   cur: "UZS", type: "Текущий",        bal: 92_780_500,  status: "Активен",   opened: "2019-11-23" },
  { id: "20208 840 0 00012 0042119", customer: "Петров Д.С.",   cur: "USD", type: "Текущий",        bal: 12_404.18,   status: "Активен",   opened: "2020-03-04" },
  { id: "20208 860 0 00012 0119804", customer: "Юлдашев Б.Ш.", cur: "UZS", type: "Текущий",        bal: 7_220_000,   status: "Активен",   opened: "2024-08-19" },
  { id: "20208 978 0 00012 0099821", customer: "Mirzaev S.K.",  cur: "EUR", type: "Срочный",        bal: 0,           status: "Заморожен", opened: "2021-07-30" },
  { id: "20208 860 0 00012 0058334", customer: "Иванова О.В.",  cur: "UZS", type: "Текущий",        bal: 22_991_500,  status: "Активен",   opened: "2023-02-14" },
  { id: "20208 860 0 00012 0033147", customer: "Турсунов А.Б.", cur: "UZS", type: "Текущий",        bal: 318_402_000, status: "Активен",   opened: "2018-05-02" },
  { id: "20208 860 0 00012 0021840", customer: "Турсунов А.Б.", cur: "UZS", type: "Сберегательный", bal: 56_700_000,  status: "Активен",   opened: "2020-09-17" },
  { id: "20208 860 0 00012 0078441", customer: "Назарова Ж.Э.", cur: "UZS", type: "Текущий",        bal: 4_802_000,   status: "Активен",   opened: "2025-01-22" },
];

const DEPOSITS: Deposit[] = [
  { id: "DEP-204881", customer: "Петров Д.С.",   amount: 240_000_000, cur: "UZS", rate: 22.5, term: "12 мес", maturity: "2026-09-12", status: "Действует" },
  { id: "DEP-118023", customer: "Турсунов А.Б.", amount:  56_700_000, cur: "UZS", rate: 24.0, term:  "9 мес", maturity: "2026-07-04", status: "Действует" },
  { id: "DEP-203491", customer: "Каримова Д.Р.", amount:  12_000_000, cur: "UZS", rate: 21.0, term:  "6 мес", maturity: "2026-08-29", status: "Действует" },
  { id: "DEP-099844", customer: "Иванова О.В.",  amount:   3_500.00,  cur: "USD", rate:  6.5, term: "24 мес", maturity: "2027-02-11", status: "Действует" },
  { id: "DEP-447712", customer: "Юлдашев Б.Ш.",  amount:   7_220_000, cur: "UZS", rate: 23.0, term:  "3 мес", maturity: "2026-06-19", status: "Действует" },
  { id: "DEP-074409", customer: "Турсунов А.Б.", amount: 120_000_000, cur: "UZS", rate: 25.0, term: "24 мес", maturity: "2027-04-22", status: "Просрочен" },
  { id: "DEP-088421", customer: "Назарова Ж.Э.", amount:   1_800_000, cur: "UZS", rate: 20.0, term:  "3 мес", maturity: "2026-08-14", status: "Действует" },
];

const TRANSFERS: Transfer[] = [
  { id: "TRN-77418002", from: "Петров Д.С.",   to: "ООО Технотрейд",    amount: 18_400_000, cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "07:42:11" },
  { id: "TRN-77417998", from: "Иванова О.В.",  to: "Каримова Д.Р.",     amount:  3_200_000, cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "07:38:04" },
  { id: "TRN-77417995", from: "Турсунов А.Б.", to: "Стамбул · Турция",  amount:    1_400.00, cur: "EUR", channel: "SWIFT",       status: "На проверке AML", t: "07:31:55" },
  { id: "TRN-77417990", from: "Соколов И.А.",  to: "Tashkent City Card", amount:    480_000, cur: "UZS", channel: "Карта",       status: "Отклонён",        t: "07:24:18", reason: "Недостаточно средств" },
  { id: "TRN-77417982", from: "Юлдашев Б.Ш.", to: "Узбекистон Алока",  amount:    220_000, cur: "UZS", channel: "Платёж",      status: "Проведён",        t: "07:18:02" },
  { id: "TRN-77417978", from: "Каримова Д.Р.", to: "Дубай · ОАЭ",       amount:    2_180.00, cur: "USD", channel: "SWIFT",       status: "Эскалирован",     t: "06:59:31", reason: "Источник средств" },
  { id: "TRN-77417970", from: "Назарова Ж.Э.", to: "Иванова О.В.",      amount:    150_000, cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "06:54:09" },
  { id: "TRN-77417961", from: "Петров Д.С.",   to: "Petrov D.S. (USA)",  amount:    9_800.00, cur: "USD", channel: "SWIFT",       status: "Проведён",        t: "06:31:48" },
];

const CARDS: Card[] = [
  { num: "5614 88•• •••• 4471", customer: "Петров Д.С.",   brand: "UZCARD", type: "Debit Gold", exp: "12/27", status: "Активна" },
  { num: "4242 ••••  •••• 9912", customer: "Иванова О.В.", brand: "VISA",   type: "Classic",    exp: "08/26", status: "Активна" },
  { num: "5614 88•• •••• 0028", customer: "Соколов И.А.",  brand: "HUMO",   type: "Дебетовая",  exp: "—",     status: "Заявка" },
  { num: "5614 88•• •••• 3187", customer: "Каримова Д.Р.", brand: "UZCARD", type: "Дебетовая",  exp: "04/28", status: "Активна" },
  { num: "5614 88•• •••• 7720", customer: "Турсунов А.Б.", brand: "UZCARD", type: "Platinum",   exp: "11/26", status: "Активна" },
  { num: "5577 12•• •••• 8841", customer: "Юлдашев Б.Ш.", brand: "HUMO",   type: "Дебетовая",  exp: "01/27", status: "Активна" },
  { num: "4242 ••••  •••• 1102", customer: "Mirzaev S.K.",  brand: "VISA",   type: "Classic",    exp: "—",     status: "Заблок." },
  { num: "5614 88•• •••• 4419", customer: "Назарова Ж.Э.", brand: "UZCARD", type: "Молодёжная", exp: "07/29", status: "Активна" },
];

const SANCTIONS: Sanction[] = [
  { id: "SAN-44012", name: "Volkov A. P.",         list: "OFAC SDN",    reason: "Foreign Interference (E.O. 14024)",    country: "RU", type: "Individual",   added: "2024-11-12", risk: "high" },
  { id: "SAN-44013", name: "ТОО «КаспийФинанс»",   list: "EU 833/2014", reason: "Sectoral · Financial",                country: "KZ", type: "Entity",        added: "2025-02-04", risk: "high" },
  { id: "SAN-44017", name: "Sokolov Ivan A.",       list: "CBU-AML",     reason: "PEP · 4-day DOB proximity",           country: "UZ", type: "Possible PEP",  added: "2025-08-20", risk: "med",  hit: true },
  { id: "SAN-44018", name: "Smirnov Pavel V.",      list: "UN 1267",     reason: "Terrorism · designated",              country: "—",  type: "Individual",   added: "2023-06-09", risk: "high" },
  { id: "SAN-44020", name: "ABC Trading FZ-LLC",   list: "OFAC SDN",    reason: "Iran · transshipment",                country: "AE", type: "Entity",        added: "2025-09-30", risk: "high" },
  { id: "SAN-44022", name: "Kim Min Su",            list: "UN 1718",     reason: "DPRK procurement",                    country: "KP", type: "Individual",   added: "2024-04-18", risk: "high" },
  { id: "SAN-44030", name: "Хайдаров Жасур (вар.)", list: "CBU-AML",    reason: "Внутренний watchlist",                 country: "UZ", type: "Watchlist",    added: "2025-12-01", risk: "med" },
  { id: "SAN-44035", name: "Petrov Dmitri S.",      list: "CBU-AML",     reason: "Common-name false-positive cluster",  country: "—",  type: "Cleared FP",   added: "2025-10-11", risk: "low" },
];

const PEP: Pep[] = [
  { id: "PEP-1102", name: "Каримов Шавкат (ОЛ)",      country: "UZ", position: "Депутат, региональный совет",       since: "2021", status: "Активен" },
  { id: "PEP-1108", name: "Сулайманова Зебо (ОЛ)",    country: "UZ", position: "Замминистра, госкомтариф",         since: "2023", status: "Активен" },
  { id: "PEP-1115", name: "Petrov D. (PEP-relative)", country: "RU", position: "Близкий родственник чиновника",    since: "2022", status: "Расширенная проверка" },
  { id: "PEP-1120", name: "Юсупов Алишер (ОЛ)",       country: "UZ", position: "Председатель госагентства",       since: "2019", status: "Активен" },
  { id: "PEP-1131", name: "Mirzaeva G. (former)",     country: "UZ", position: "Бывший советник министра",        since: "2017", status: "Пост-PEP · 12 мес" },
  { id: "PEP-1140", name: "Назаров Б. (ОЛ)",          country: "UZ", position: "Член счетной палаты",             since: "2024", status: "Активен" },
];

const AML_REPORTS: AmlReport[] = [
  { id: "STR-2026-00184", type: "STR", customer: "Турсунов А.Б.", amount: "EUR 1 400 · SWIFT IST→UZ", status: "Подан в CBU-AML", filed: "2026-05-22" },
  { id: "STR-2026-00177", type: "STR", customer: "Каримова Д.Р.", amount: "USD 2 180 · SWIFT DXB→UZ", status: "На проверке",     filed: "2026-05-22" },
  { id: "CTR-2026-04412", type: "CTR", customer: "Петров Д.С.",   amount: "UZS 240 000 000",          status: "Авто-отчёт",      filed: "2026-05-18" },
  { id: "STR-2026-00171", type: "STR", customer: "Mirzaev S.K.",  amount: "EUR — счёт заморожен",      status: "Закрыт",          filed: "2026-05-10" },
  { id: "CTR-2026-04404", type: "CTR", customer: "Иванова О.В.",  amount: "UZS 56 700 000",            status: "Подан",           filed: "2026-05-08" },
  { id: "STR-2026-00164", type: "STR", customer: "Юлдашев Б.Ш.", amount: "UZS 12 000 000 (split)",    status: "Подан",           filed: "2026-04-29" },
];

const HANDBOOK: HandbookEntry[] = [
  { id: "KYC-PROC",       title: "Процедура верификации KYC",     ver: "v3.4", upd: "2026-04-12", tags: ["KYC", "Розница"],        sections: 11 },
  { id: "AML-HB",         title: "Справочник AML",                ver: "v2.9", upd: "2026-03-30", tags: ["AML", "Compliance"],     sections: 24 },
  { id: "SANCTIONS-PROC", title: "Обработка санкционных хитов",   ver: "v1.7", upd: "2026-02-08", tags: ["Sanctions"],             sections:  6 },
  { id: "OPS-ESC",        title: "Эскалация операций",            ver: "v1.2", upd: "2025-11-19", tags: ["Operations"],            sections:  4 },
  { id: "DEPOSIT-OPS",    title: "Депозитные операции",           ver: "v2.1", upd: "2026-01-15", tags: ["Deposits"],              sections:  9 },
  { id: "TRANSFER-OPS",   title: "Переводы · внутренние и SWIFT", ver: "v3.0", upd: "2026-03-04", tags: ["Transfers", "SWIFT"],    sections: 14 },
  { id: "CARD-ISSUE",     title: "Выпуск и активация карт",       ver: "v1.8", upd: "2025-12-22", tags: ["Cards"],                 sections:  7 },
  { id: "FX-RATE",        title: "Курсы валют и конвертация",     ver: "v2.0", upd: "2026-04-01", tags: ["FX", "Treasury"],        sections:  5 },
  { id: "PEP-HB",         title: "Реестр ПДЛ — порядок работы",  ver: "v1.3", upd: "2025-10-08", tags: ["PEP", "AML"],            sections:  5 },
  { id: "INCIDENT-RESP",  title: "Реагирование на инциденты",     ver: "v1.5", upd: "2026-02-27", tags: ["Security"],              sections:  8 },
];

const ACTIVITY: ActivityEntry[] = [
  { t: "07:42:11",       actor: "Алексей П. (вы)", action: "открыл",          what: "KYC SYN-2847102",                     tag: "KYC" },
  { t: "07:38:04",       actor: "Татьяна К.",       action: "оставила фидбэк", what: "тренировка KYC #14",                 tag: "Mentor" },
  { t: "07:31:55",       actor: "Алексей П. (вы)", action: "запустил",        what: "санкционный скрининг (HIT-7741)",     tag: "Sanctions" },
  { t: "07:18:02",       actor: "Авто-AML",         action: "пометил",         what: "TRN-77417995 как «На проверке»",     tag: "AML" },
  { t: "06:54:09",       actor: "Юлдашев Б.Ш.",    action: "получил",         what: "карту HUMO ••8841",                  tag: "Cards" },
  { t: "06:31:48",       actor: "Петров Д.С.",      action: "провёл",          what: "SWIFT USD 9 800",                    tag: "Transfer" },
  { t: "06:00:00",       actor: "Система",          action: "обновила",        what: "санкционные списки (OFAC, EU, UN)",  tag: "System" },
  { t: "05:42:18",       actor: "Ольга Р. (HR)",    action: "назначила",       what: "квест «Открытие счёта», день 12",    tag: "HR" },
  { t: "Вчера · 21:14", actor: "Алексей П. (вы)", action: "прошёл",          what: "ночной квест «Streak» (+30 XP)",     tag: "Streak" },
  { t: "Вчера · 16:42", actor: "Алексей П. (вы)", action: "получил",         what: "награду «Первый KYC»",               tag: "Badge" },
  { t: "Вчера · 14:08", actor: "Алексей П. (вы)", action: "завершил",        what: "сценарий «KYC: разбор» (87/100)",    tag: "Scenario" },
  { t: "Вчера · 09:10", actor: "Поток Q2-26",      action: "открыл",          what: "модуль «Санкции»",                   tag: "Cohort" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number, cur: string = "UZS"): string => {
  if (cur === "USD") return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (cur === "EUR") return "€" + n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("ru-RU") + " UZS";
};

// ── Single aggregate export ───────────────────────────────────────────────────

export const SYNTH = {
  CUSTOMERS,
  ACCOUNTS,
  DEPOSITS,
  TRANSFERS,
  CARDS,
  SANCTIONS,
  PEP,
  AML_REPORTS,
  HANDBOOK,
  ACTIVITY,
  fmt,
};
