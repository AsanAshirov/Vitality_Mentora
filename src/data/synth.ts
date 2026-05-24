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
  kind?: "individual" | "corporate";
  country?: string;
  risk?: string;
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
  flag?: string;
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

export interface Loan {
  id: string;
  customer: string;
  amount: number;
  cur: string;
  rate: number;
  term: string;
  issued: string;
  maturity: string;
  balance: number;
  status: string;
}

// ── Customers ─────────────────────────────────────────────────────────────────

const CUSTOMERS: Customer[] = [
  // ── Individuals ───────────────────────────────────────────────────────────
  {
    id: "SYN-2847102", name: "Соколов Иван Алексеевич",    short: "ИС",
    inn: "3094 8826 5571", phone: "+998 90 348 12 04", city: "Ташкент",
    tier: "Med",  status: "Черновик KYC", lang: "RU", since: "—",
    kind: "individual",
  },
  {
    id: "SYN-1840553", name: "Каримова Дилноза Рустамовна", short: "ДК",
    inn: "5012 7741 8830", phone: "+998 71 200 55 17", city: "Самарканд",
    tier: "Low",  status: "Активен",      lang: "UZ", since: "2022-04",
    kind: "individual",
  },
  {
    id: "SYN-9032847", name: "Петров Дмитрий Сергеевич",   short: "ДП",
    inn: "1881 5023 9941", phone: "+998 90 112 84 02", city: "Ташкент",
    tier: "High", status: "Активен",      lang: "RU", since: "2019-11",
    kind: "individual", risk: "PEP-relative",
  },
  {
    id: "SYN-4471009", name: "Юлдашев Бекзод Шарипович",   short: "БЮ",
    inn: "7741 3308 1129", phone: "+998 95 600 11 38", city: "Бухара",
    tier: "Med",  status: "Активен",      lang: "UZ", since: "2024-08",
    kind: "individual",
  },
  {
    id: "SYN-6618402", name: "Mirzaev Sherzod K.",           short: "ШМ",
    inn: "9930 4471 2088", phone: "+998 99 188 04 56", city: "Андижан",
    tier: "Low",  status: "Заморожен",    lang: "UZ", since: "2021-07",
    kind: "individual", risk: "AML-watch",
  },
  {
    id: "SYN-5510334", name: "Иванова Ольга Викторовна",    short: "ОИ",
    inn: "2204 9981 7733", phone: "+998 90 444 19 27", city: "Ташкент",
    tier: "Med",  status: "Активен",      lang: "RU", since: "2023-02",
    kind: "individual",
  },
  {
    id: "SYN-2200471", name: "Турсунов Аброр Бахтиёрович",  short: "АТ",
    inn: "8830 1102 4471", phone: "+998 71 902 33 18", city: "Фергана",
    tier: "High", status: "Активен",      lang: "UZ", since: "2018-05",
    kind: "individual",
  },
  {
    id: "SYN-7733208", name: "Назарова Жасмина Эркиновна",  short: "ЖН",
    inn: "4471 8830 5012", phone: "+998 90 712 28 04", city: "Нукус",
    tier: "Low",  status: "Активен",      lang: "UZ", since: "2025-01",
    kind: "individual",
  },
  {
    id: "SYN-3381904", name: "Хасанов Фарид Набиевич",      short: "ФХ",
    inn: "6610 2214 8830", phone: "+998 93 881 47 02", city: "Наманган",
    tier: "Med",  status: "Активен",      lang: "UZ", since: "2023-09",
    kind: "individual",
  },
  {
    id: "SYN-8841102", name: "Rakhimova Barno S.",           short: "БР",
    inn: "3308 4471 9912", phone: "+998 90 220 81 14", city: "Фергана",
    tier: "Low",  status: "Черновик KYC", lang: "UZ", since: "—",
    kind: "individual",
  },
  {
    id: "SYN-5021884", name: "Матмусаев Улугбек Эркинович", short: "УМ",
    inn: "1102 5577 3308", phone: "+998 71 441 09 31", city: "Ташкент",
    tier: "Med",  status: "Активен",      lang: "UZ", since: "2021-12",
    kind: "individual",
  },
  {
    id: "SYN-6630148", name: "Носирова Малика Шухратовна",  short: "МН",
    inn: "9912 4471 8830", phone: "+998 90 334 72 19", city: "Самарканд",
    tier: "Med",  status: "Активен",      lang: "UZ", since: "2022-07",
    kind: "individual",
  },
  {
    id: "SYN-1129003", name: "Петров Никита Дмитриевич",    short: "НП",
    inn: "5023 8841 1102", phone: "+998 90 118 33 05", city: "Ташкент",
    tier: "Med",  status: "Активен",      lang: "RU", since: "2024-03",
    kind: "individual", risk: "PEP-family",
  },
  {
    id: "SYN-4412808", name: "Тураева Дилноза Хасановна",   short: "ДТ",
    inn: "7733 1880 4408", phone: "+998 99 551 28 40", city: "Ташкент",
    tier: "High", status: "Активен",      lang: "UZ", since: "2020-06",
    kind: "individual",
  },
  {
    id: "SYN-9910482", name: "Kim Soo Jin",                  short: "КС",
    inn: "—",              phone: "+82 10 3921 7741", city: "Ташкент",
    tier: "Med",  status: "Заморожен",    lang: "EN", since: "2025-03",
    kind: "individual", country: "KR", risk: "High-risk nonresident",
  },
  {
    id: "SYN-3302881", name: "Alijonov Qodir M.",            short: "ҚА",
    inn: "—",              phone: "+998 90 002 44 11", city: "Андижан",
    tier: "High", status: "Активен",      lang: "UZ", since: "2023-05",
    kind: "individual", country: "UZ/DE", risk: "Non-resident",
  },

  // ── Corporate ─────────────────────────────────────────────────────────────
  {
    id: "SYN-C-0041", name: "ООО «Технотрейд»",             short: "ТТ",
    inn: "3030 1188 4471", phone: "+998 71 200 00 44", city: "Ташкент",
    tier: "High", status: "Активен",      lang: "RU", since: "2017-03",
    kind: "corporate",
  },
  {
    id: "SYN-C-0042", name: "ТОО «АлматыИмпорт»",          short: "АИ",
    inn: "—",              phone: "+7 727 291 44 12",  city: "Алматы",
    tier: "High", status: "Активен",      lang: "RU", since: "2019-08",
    kind: "corporate", country: "KZ",
  },
  {
    id: "SYN-C-0043", name: "ЧП «ФастПэй»",                 short: "ФП",
    inn: "8841 2200 3308", phone: "+998 90 884 11 33", city: "Ташкент",
    tier: "Med",  status: "Активен",      lang: "UZ", since: "2022-11",
    kind: "corporate",
  },
  {
    id: "SYN-C-0044", name: "Qodirov Trading LLC",          short: "КТ",
    inn: "4471 9912 5577", phone: "+998 95 400 12 88", city: "Бухара",
    tier: "Med",  status: "Активен",      lang: "UZ", since: "2023-01",
    kind: "corporate",
  },
  {
    id: "SYN-C-0045", name: "ООО «СтройИнвест Ташкент»",   short: "СИ",
    inn: "2200 8841 7733", phone: "+998 71 388 04 02", city: "Ташкент",
    tier: "High", status: "Активен",      lang: "RU", since: "2016-04",
    kind: "corporate",
  },
];

// ── Accounts ─────────────────────────────────────────────────────────────────

const ACCOUNTS: Account[] = [
  // Соколов И.А.
  { id: "20208 840 0 00012 0011928", customer: "Соколов И.А.",  cur: "USD", type: "Текущий",        bal: 4_182.30,      status: "Активен",   opened: "—" },

  // Каримова Д.Р.
  { id: "20208 860 0 00012 0078213", customer: "Каримова Д.Р.", cur: "UZS", type: "Сберегательный", bal: 18_400_000,    status: "Активен",   opened: "2022-04-08" },
  { id: "20208 840 0 00012 0078214", customer: "Каримова Д.Р.", cur: "USD", type: "Текущий",        bal: 1_205.50,      status: "Активен",   opened: "2023-10-01" },

  // Петров Д.С.
  { id: "20208 860 0 00012 0042118", customer: "Петров Д.С.",   cur: "UZS", type: "Текущий",        bal: 92_780_500,    status: "Активен",   opened: "2019-11-23" },
  { id: "20208 840 0 00012 0042119", customer: "Петров Д.С.",   cur: "USD", type: "Текущий",        bal: 12_404.18,     status: "Активен",   opened: "2020-03-04" },
  { id: "20208 978 0 00012 0042120", customer: "Петров Д.С.",   cur: "EUR", type: "Срочный",        bal: 8_000.00,      status: "Активен",   opened: "2021-06-14" },

  // Юлдашев Б.Ш.
  { id: "20208 860 0 00012 0119804", customer: "Юлдашев Б.Ш.", cur: "UZS", type: "Текущий",        bal: 7_220_000,     status: "Активен",   opened: "2024-08-19" },

  // Mirzaev S.K.
  { id: "20208 978 0 00012 0099821", customer: "Mirzaev S.K.",  cur: "EUR", type: "Срочный",        bal: 0,             status: "Заморожен", opened: "2021-07-30" },

  // Иванова О.В.
  { id: "20208 860 0 00012 0058334", customer: "Иванова О.В.",  cur: "UZS", type: "Текущий",        bal: 22_991_500,    status: "Активен",   opened: "2023-02-14" },
  { id: "20208 840 0 00012 0058335", customer: "Иванова О.В.",  cur: "USD", type: "Текущий",        bal: 3_500.00,      status: "Активен",   opened: "2024-01-09" },

  // Турсунов А.Б.
  { id: "20208 860 0 00012 0033147", customer: "Турсунов А.Б.", cur: "UZS", type: "Текущий",        bal: 318_402_000,   status: "Активен",   opened: "2018-05-02" },
  { id: "20208 860 0 00012 0021840", customer: "Турсунов А.Б.", cur: "UZS", type: "Сберегательный", bal: 56_700_000,    status: "Активен",   opened: "2020-09-17" },
  { id: "20208 978 0 00012 0021841", customer: "Турсунов А.Б.", cur: "EUR", type: "Текущий",        bal: 4_100.00,      status: "Активен",   opened: "2022-03-11" },

  // Назарова Ж.Э.
  { id: "20208 860 0 00012 0078441", customer: "Назарова Ж.Э.", cur: "UZS", type: "Текущий",        bal: 4_802_000,     status: "Активен",   opened: "2025-01-22" },

  // Хасанов Ф.Н.
  { id: "20208 860 0 00012 0088120", customer: "Хасанов Ф.Н.",  cur: "UZS", type: "Текущий",        bal: 14_320_000,    status: "Активен",   opened: "2023-09-04" },

  // Матмусаев У.Э.
  { id: "20208 860 0 00012 0052110", customer: "Матмусаев У.Э.", cur: "UZS", type: "Текущий",       bal: 9_802_000,     status: "Активен",   opened: "2021-12-18" },
  { id: "20208 840 0 00012 0052111", customer: "Матмусаев У.Э.", cur: "USD", type: "Текущий",       bal: 2_300.00,      status: "Активен",   opened: "2022-04-02" },

  // Носирова М.Ш.
  { id: "20208 860 0 00012 0066004", customer: "Носирова М.Ш.", cur: "UZS", type: "Текущий",        bal: 11_050_000,    status: "Активен",   opened: "2022-07-15" },

  // Петров Н.Д.
  { id: "20208 860 0 00012 0091002", customer: "Петров Н.Д.",   cur: "UZS", type: "Текущий",        bal: 5_440_000,     status: "Активен",   opened: "2024-03-20" },

  // Тураева Д.Х.
  { id: "20208 860 0 00012 0029811", customer: "Тураева Д.Х.",  cur: "UZS", type: "Текущий",        bal: 84_200_000,    status: "Активен",   opened: "2020-06-01" },
  { id: "20208 840 0 00012 0029812", customer: "Тураева Д.Х.",  cur: "USD", type: "Текущий",        bal: 28_000.00,     status: "Активен",   opened: "2021-01-10" },

  // Kim Soo Jin
  { id: "20208 840 0 00012 0104018", customer: "Kim S.J.",       cur: "USD", type: "Текущий",        bal: 0,             status: "Заморожен", opened: "2025-03-14" },

  // Корпоративные клиенты
  { id: "20206 860 1 00012 0041001", customer: "ООО «Технотрейд»",    cur: "UZS", type: "Расчётный",   bal: 1_240_000_000, status: "Активен",   opened: "2017-03-15" },
  { id: "20206 840 1 00012 0041002", customer: "ООО «Технотрейд»",    cur: "USD", type: "Расчётный",   bal: 148_200.00,    status: "Активен",   opened: "2017-03-15" },
  { id: "20206 860 1 00012 0042001", customer: "ТОО «АлматыИмпорт»", cur: "UZS", type: "Расчётный",   bal: 380_000_000,   status: "Активен",   opened: "2019-08-21" },
  { id: "20206 840 1 00012 0042002", customer: "ТОО «АлматыИмпорт»", cur: "USD", type: "Расчётный",   bal: 42_800.00,     status: "Активен",   opened: "2019-08-21" },
  { id: "20206 860 1 00012 0043001", customer: "ЧП «ФастПэй»",        cur: "UZS", type: "Расчётный",   bal: 28_400_000,    status: "Активен",   opened: "2022-11-05" },
  { id: "20206 860 1 00012 0045001", customer: "ООО «СтройИнвест»",   cur: "UZS", type: "Расчётный",   bal: 874_900_000,   status: "Активен",   opened: "2016-04-12" },
  { id: "20206 840 1 00012 0045002", customer: "ООО «СтройИнвест»",   cur: "USD", type: "Расчётный",   bal: 95_000.00,     status: "Активен",   opened: "2016-04-12" },
];

// ── Deposits ──────────────────────────────────────────────────────────────────

const DEPOSITS: Deposit[] = [
  { id: "DEP-204881", customer: "Петров Д.С.",    amount: 240_000_000, cur: "UZS", rate: 22.5, term: "12 мес", maturity: "2026-09-12", status: "Действует" },
  { id: "DEP-118023", customer: "Турсунов А.Б.",  amount:  56_700_000, cur: "UZS", rate: 24.0, term:  "9 мес", maturity: "2026-07-04", status: "Действует" },
  { id: "DEP-203491", customer: "Каримова Д.Р.",  amount:  12_000_000, cur: "UZS", rate: 21.0, term:  "6 мес", maturity: "2026-08-29", status: "Действует" },
  { id: "DEP-099844", customer: "Иванова О.В.",   amount:   3_500.00,  cur: "USD", rate:  6.5, term: "24 мес", maturity: "2027-02-11", status: "Действует" },
  { id: "DEP-447712", customer: "Юлдашев Б.Ш.",   amount:   7_220_000, cur: "UZS", rate: 23.0, term:  "3 мес", maturity: "2026-06-19", status: "Действует" },
  { id: "DEP-074409", customer: "Турсунов А.Б.",  amount: 120_000_000, cur: "UZS", rate: 25.0, term: "24 мес", maturity: "2027-04-22", status: "Просрочен" },
  { id: "DEP-088421", customer: "Назарова Ж.Э.",  amount:   1_800_000, cur: "UZS", rate: 20.0, term:  "3 мес", maturity: "2026-08-14", status: "Действует" },
  { id: "DEP-112004", customer: "Хасанов Ф.Н.",   amount:  10_000_000, cur: "UZS", rate: 22.0, term:  "6 мес", maturity: "2026-11-04", status: "Действует" },
  { id: "DEP-220811", customer: "Тураева Д.Х.",   amount:  80_000_000, cur: "UZS", rate: 23.5, term: "12 мес", maturity: "2027-01-18", status: "Действует" },
  { id: "DEP-330091", customer: "Тураева Д.Х.",   amount:  15_000.00,  cur: "USD", rate:  7.0, term: "12 мес", maturity: "2027-01-18", status: "Действует" },
  { id: "DEP-440017", customer: "Матмусаев У.Э.",  amount:   5_000_000, cur: "UZS", rate: 20.5, term:  "3 мес", maturity: "2026-06-29", status: "Действует" },
  { id: "DEP-550188", customer: "ООО «Технотрейд»", amount: 500_000_000, cur: "UZS", rate: 21.0, term: "6 мес", maturity: "2026-09-01", status: "Действует" },
  { id: "DEP-660024", customer: "Носирова М.Ш.",  amount:   8_000_000, cur: "UZS", rate: 22.0, term:  "9 мес", maturity: "2027-02-20", status: "Действует" },
  { id: "DEP-770308", customer: "Петров Д.С.",    amount:   5_000.00,  cur: "USD", rate:  6.0, term:  "6 мес", maturity: "2026-10-04", status: "Досрочно закрыт" },
  { id: "DEP-880441", customer: "Alijonov Q.M.",  amount:   2_000.00,  cur: "USD", rate:  6.5, term: "12 мес", maturity: "2027-05-03", status: "Действует" },
];

// ── Transfers ─────────────────────────────────────────────────────────────────

const TRANSFERS: Transfer[] = [
  // Сегодня
  { id: "TRN-77418002", from: "Петров Д.С.",    to: "ООО «Технотрейд»",    amount: 18_400_000,  cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "07:42:11" },
  { id: "TRN-77417998", from: "Иванова О.В.",   to: "Каримова Д.Р.",       amount:  3_200_000,  cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "07:38:04" },
  { id: "TRN-77417995", from: "Турсунов А.Б.",  to: "Стамбул · Турция",    amount:  1_400.00,   cur: "EUR", channel: "SWIFT",       status: "На проверке AML", t: "07:31:55", flag: "AML" },
  { id: "TRN-77417990", from: "Соколов И.А.",   to: "Tashkent City Card",  amount:    480_000,  cur: "UZS", channel: "Карта",       status: "Отклонён",        t: "07:24:18", reason: "Недостаточно средств" },
  { id: "TRN-77417982", from: "Юлдашев Б.Ш.",  to: "Узбекистон Алока",    amount:    220_000,  cur: "UZS", channel: "Платёж",      status: "Проведён",        t: "07:18:02" },
  { id: "TRN-77417978", from: "Каримова Д.Р.",  to: "Дубай · ОАЭ",         amount:  2_180.00,   cur: "USD", channel: "SWIFT",       status: "Эскалирован",     t: "06:59:31", reason: "Источник средств", flag: "SANCTIONS" },
  { id: "TRN-77417970", from: "Назарова Ж.Э.",  to: "Иванова О.В.",        amount:    150_000,  cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "06:54:09" },
  { id: "TRN-77417961", from: "Петров Д.С.",    to: "Petrov D.S. (USA)",   amount:  9_800.00,   cur: "USD", channel: "SWIFT",       status: "Проведён",        t: "06:31:48" },

  // Структурирование — «смурфинг» (Хасанов, 4 транзакции < $10k за 2 дня)
  { id: "TRN-77417940", from: "Хасанов Ф.Н.",   to: "Назарова Ж.Э.",       amount:  9_500_000,  cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "Вчера 16:11", flag: "AML" },
  { id: "TRN-77417935", from: "Хасанов Ф.Н.",   to: "Юлдашев Б.Ш.",       amount:  9_200_000,  cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "Вчера 15:48", flag: "AML" },
  { id: "TRN-77417928", from: "Хасанов Ф.Н.",   to: "Матмусаев У.Э.",      amount:  8_900_000,  cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "Вчера 14:22", flag: "AML" },
  { id: "TRN-77417921", from: "Хасанов Ф.Н.",   to: "Иванова О.В.",        amount:  8_700_000,  cur: "UZS", channel: "Внутренний", status: "Проведён",        t: "Вчера 13:05" },

  // Крупный внутренний > 100 млн UZS — нужно одобрение комплаенса
  { id: "TRN-77417910", from: "ООО «Технотрейд»", to: "ООО «СтройИнвест»", amount: 420_000_000, cur: "UZS", channel: "Внутренний", status: "Ожидает одобрения", t: "Вчера 11:30", flag: "COMPLIANCE" },

  // SWIFT в страну высокого риска (первый — комплаенс-ревью)
  { id: "TRN-77417902", from: "Тураева Д.Х.",   to: "Лагос · Нигерия",     amount:  5_000.00,   cur: "USD", channel: "SWIFT",       status: "Эскалирован",     t: "Вчера 10:48", reason: "Высокорисковая юрисдикция", flag: "COMPLIANCE" },

  // Заморожен (санкция)
  { id: "TRN-77417890", from: "Kim S.J.",        to: "Seoul · Корея",        amount:  8_200.00,   cur: "USD", channel: "SWIFT",       status: "Заморожен",       t: "Вчера 09:14", flag: "SANCTIONS" },

  // Возврат
  { id: "TRN-77417880", from: "ЧП «ФастПэй»",   to: "Петров Д.С.",         amount:  1_200_000,  cur: "UZS", channel: "Возврат",     status: "Возврат",         t: "Вчера 08:02" },

  // Карточные
  { id: "TRN-77417870", from: "Иванова О.В.",   to: "OʻzDonMaxsulot",      amount:    480_000,  cur: "UZS", channel: "Карта",       status: "Проведён",        t: "2 дня назад 19:41" },
  { id: "TRN-77417860", from: "Тураева Д.Х.",   to: "IQOS Tashkent",       amount:  1_900_000,  cur: "UZS", channel: "Карта",       status: "Проведён",        t: "2 дня назад 14:28" },

  // Интербанк
  { id: "TRN-77417841", from: "Матмусаев У.Э.", to: "ИпотекаБанк",         amount: 12_000_000,  cur: "UZS", channel: "Интербанк",   status: "Проведён",        t: "3 дня назад 11:00" },
  { id: "TRN-77417830", from: "Носирова М.Ш.",  to: "AsiaCredit Bank",      amount:  3_500_000,  cur: "UZS", channel: "Интербанк",   status: "Проведён",        t: "3 дня назад 10:12" },
];

// ── Cards ─────────────────────────────────────────────────────────────────────

const CARDS: Card[] = [
  { num: "5614 88•• •••• 4471", customer: "Петров Д.С.",    brand: "UZCARD", type: "Debit Gold",  exp: "12/27", status: "Активна" },
  { num: "4242 ••••  •••• 9912", customer: "Иванова О.В.", brand: "VISA",   type: "Classic",     exp: "08/26", status: "Активна" },
  { num: "5614 88•• •••• 0028", customer: "Соколов И.А.",  brand: "HUMO",   type: "Дебетовая",   exp: "—",     status: "Заявка" },
  { num: "5614 88•• •••• 3187", customer: "Каримова Д.Р.", brand: "UZCARD", type: "Дебетовая",   exp: "04/28", status: "Активна" },
  { num: "5614 88•• •••• 7720", customer: "Турсунов А.Б.", brand: "UZCARD", type: "Platinum",    exp: "11/26", status: "Активна" },
  { num: "5577 12•• •••• 8841", customer: "Юлдашев Б.Ш.", brand: "HUMO",   type: "Дебетовая",   exp: "01/27", status: "Активна" },
  { num: "4242 ••••  •••• 1102", customer: "Mirzaev S.K.", brand: "VISA",   type: "Classic",     exp: "—",     status: "Заблок." },
  { num: "5614 88•• •••• 4419", customer: "Назарова Ж.Э.", brand: "UZCARD", type: "Молодёжная",  exp: "07/29", status: "Активна" },
  { num: "5614 88•• •••• 8802", customer: "Хасанов Ф.Н.",  brand: "UZCARD", type: "Дебетовая",   exp: "03/28", status: "Активна" },
  { num: "4242 ••••  •••• 4401", customer: "Тураева Д.Х.", brand: "VISA",   type: "Gold",        exp: "09/27", status: "Активна" },
  { num: "5614 88•• •••• 5503", customer: "Матмусаев У.Э.", brand: "UZCARD", type: "Дебетовая",  exp: "05/28", status: "Активна" },
  { num: "5577 12•• •••• 0041", customer: "Носирова М.Ш.", brand: "HUMO",   type: "Дебетовая",   exp: "11/27", status: "Активна" },
  { num: "4242 ••••  •••• 0814", customer: "Kim S.J.",      brand: "VISA",   type: "Classic",     exp: "—",     status: "Заблок." },
  { num: "5614 88•• •••• 9230", customer: "Петров Н.Д.",   brand: "UZCARD", type: "Дебетовая",   exp: "02/29", status: "Активна" },
  { num: "5614 88•• •••• 7714", customer: "Alijonov Q.M.", brand: "UZCARD", type: "Platinum",    exp: "06/28", status: "Активна" },
  { num: "4012 88•• •••• 3301", customer: "ООО «Технотрейд»", brand: "VISA", type: "Corporate",  exp: "10/27", status: "Активна" },
  { num: "4012 88•• •••• 7742", customer: "ООО «СтройИнвест»", brand: "VISA", type: "Corporate", exp: "12/26", status: "Активна" },
];

// ── Sanctions ─────────────────────────────────────────────────────────────────

const SANCTIONS: Sanction[] = [
  { id: "SAN-44012", name: "Volkov A. P.",           list: "OFAC SDN",    reason: "Foreign Interference (E.O. 14024)",          country: "RU", type: "Individual",  added: "2024-11-12", risk: "high" },
  { id: "SAN-44013", name: "ТОО «КаспийФинанс»",     list: "EU 833/2014", reason: "Sectoral · Financial",                       country: "KZ", type: "Entity",       added: "2025-02-04", risk: "high" },
  { id: "SAN-44017", name: "Sokolov Ivan A.",         list: "CBU-AML",     reason: "PEP · 4-day DOB proximity",                  country: "UZ", type: "Possible PEP", added: "2025-08-20", risk: "med",  hit: true },
  { id: "SAN-44018", name: "Smirnov Pavel V.",        list: "UN 1267",     reason: "Terrorism · designated",                     country: "—",  type: "Individual",  added: "2023-06-09", risk: "high" },
  { id: "SAN-44020", name: "ABC Trading FZ-LLC",     list: "OFAC SDN",    reason: "Iran · transshipment",                       country: "AE", type: "Entity",       added: "2025-09-30", risk: "high" },
  { id: "SAN-44022", name: "Kim Min Su",              list: "UN 1718",     reason: "DPRK procurement",                           country: "KP", type: "Individual",  added: "2024-04-18", risk: "high" },
  { id: "SAN-44030", name: "Хайдаров Жасур (вар.)",  list: "CBU-AML",     reason: "Внутренний watchlist",                        country: "UZ", type: "Watchlist",   added: "2025-12-01", risk: "med" },
  { id: "SAN-44035", name: "Petrov Dmitri S.",        list: "CBU-AML",     reason: "Common-name false-positive cluster",          country: "—",  type: "Cleared FP",  added: "2025-10-11", risk: "low" },
  { id: "SAN-44041", name: "Rashidov Bakhodir",       list: "OFAC SDN",    reason: "Narcotics Trafficking (E.O. 12978)",          country: "UZ", type: "Individual",  added: "2024-08-03", risk: "high" },
  { id: "SAN-44044", name: "NovaTrade GmbH",          list: "EU 833/2014", reason: "Dual-use goods · Russia bypass",             country: "DE", type: "Entity",       added: "2025-04-22", risk: "high" },
  { id: "SAN-44047", name: "Kim Soo Jin",             list: "CBU-AML",     reason: "Suspicious cross-border flows · KR/UZ",      country: "KR", type: "Watchlist",   added: "2026-03-14", risk: "med",  hit: true },
  { id: "SAN-44052", name: "Askarov B. (var.)",       list: "UN 1267",     reason: "Terror finance · affiliated entity",          country: "AF", type: "Individual",  added: "2024-12-19", risk: "high" },
  { id: "SAN-44055", name: "Meridian Capital Ltd",    list: "OFAC SDN",    reason: "Venezuelan corruption (E.O. 13808)",          country: "VG", type: "Entity",       added: "2025-07-11", risk: "high" },
  { id: "SAN-44060", name: "Tursunov A. B.",          list: "CBU-AML",     reason: "Cumulative transfers >$20k in 7 days · flag", country: "UZ", type: "Watchlist",   added: "2026-05-20", risk: "med" },
  { id: "SAN-44063", name: "Hasanov Farid N.",        list: "CBU-AML",     reason: "Structuring pattern detected · 4 txn 2 days", country: "UZ", type: "Watchlist",   added: "2026-05-23", risk: "med",  hit: true },
];

// ── PEP ───────────────────────────────────────────────────────────────────────

const PEP: Pep[] = [
  { id: "PEP-1102", name: "Каримов Шавкат (ОЛ)",        country: "UZ", position: "Депутат, региональный совет",            since: "2021", status: "Активен" },
  { id: "PEP-1108", name: "Сулайманова Зебо (ОЛ)",      country: "UZ", position: "Замминистра, госкомтариф",               since: "2023", status: "Активен" },
  { id: "PEP-1115", name: "Petrov D. (PEP-relative)",   country: "RU", position: "Близкий родственник чиновника",          since: "2022", status: "Расширенная проверка" },
  { id: "PEP-1120", name: "Юсупов Алишер (ОЛ)",         country: "UZ", position: "Председатель госагентства",              since: "2019", status: "Активен" },
  { id: "PEP-1131", name: "Mirzaeva G. (former)",       country: "UZ", position: "Бывший советник министра",               since: "2017", status: "Пост-PEP · 12 мес" },
  { id: "PEP-1140", name: "Назаров Б. (ОЛ)",            country: "UZ", position: "Член счетной палаты",                    since: "2024", status: "Активен" },
  { id: "PEP-1148", name: "Тураев К. (ОЛ)",             country: "UZ", position: "Первый замминистра финансов",            since: "2022", status: "EDD проведена" },
  { id: "PEP-1155", name: "Hasanova N. (ОЛ)",           country: "UZ", position: "Директор государственного банка",        since: "2020", status: "Активен" },
  { id: "PEP-1161", name: "Petrov Nikita D. (family)",  country: "RU", position: "Сын: Петров Д.С. (PEP-relative)",        since: "2024", status: "Расширенная проверка" },
  { id: "PEP-1168", name: "Abdullayev R. (ОЛ)",         country: "UZ", position: "Хоким (глава администрации), Ташкент",   since: "2021", status: "Активен" },
  { id: "PEP-1172", name: "Kim Jae Won (foreign)",      country: "KR", position: "Советник Минторга Республики Корея",     since: "2019", status: "Иностранный PEP" },
  { id: "PEP-1180", name: "Alijonova F. (post-PEP)",    country: "UZ", position: "Бывший депутат парламента",              since: "2015", status: "Очищен после 12 мес" },
];

// ── AML Reports ───────────────────────────────────────────────────────────────

const AML_REPORTS: AmlReport[] = [
  { id: "STR-2026-00184", type: "STR", customer: "Турсунов А.Б.",  amount: "EUR 1 400 · SWIFT IST→UZ",          status: "Подан в CBU-AML",   filed: "2026-05-22" },
  { id: "STR-2026-00177", type: "STR", customer: "Каримова Д.Р.",  amount: "USD 2 180 · SWIFT DXB→UZ",          status: "На проверке",        filed: "2026-05-22" },
  { id: "CTR-2026-04412", type: "CTR", customer: "Петров Д.С.",    amount: "UZS 240 000 000",                    status: "Авто-отчёт",         filed: "2026-05-18" },
  { id: "STR-2026-00171", type: "STR", customer: "Mirzaev S.K.",   amount: "EUR — счёт заморожен",               status: "Закрыт",             filed: "2026-05-10" },
  { id: "CTR-2026-04404", type: "CTR", customer: "Иванова О.В.",   amount: "USD 3 500 · депозит",               status: "Подан",              filed: "2026-05-08" },
  { id: "STR-2026-00164", type: "STR", customer: "Юлдашев Б.Ш.",  amount: "UZS 12 000 000 (split)",             status: "Подан",              filed: "2026-04-29" },
  { id: "STR-2026-00191", type: "STR", customer: "Хасанов Ф.Н.",  amount: "UZS 36 300 000 · структурирование",  status: "Черновик",           filed: "2026-05-23" },
  { id: "STR-2026-00193", type: "STR", customer: "Тураева Д.Х.",  amount: "USD 5 000 · SWIFT LOS→UZ",          status: "На проверке",        filed: "2026-05-23" },
  { id: "CTR-2026-04418", type: "CTR", customer: "ООО «Технотрейд»", amount: "UZS 420 000 000 · внутренний",  status: "Авто-отчёт",         filed: "2026-05-23" },
  { id: "STR-2026-00188", type: "STR", customer: "Kim S.J.",       amount: "USD 8 200 · SWIFT SEL→UZ",         status: "Заморожен · CBU",    filed: "2026-05-21" },
  { id: "CTR-2026-04399", type: "CTR", customer: "Тураева Д.Х.",  amount: "USD 28 000 · депозит",              status: "Подан",              filed: "2026-05-05" },
  { id: "STR-2026-00158", type: "STR", customer: "Alijonov Q.M.", amount: "USD 2 000 · депозит нерезидент",    status: "На расширенной проверке", filed: "2026-04-15" },
  { id: "STR-2025-04881", type: "STR", customer: "Mirzaev S.K.",   amount: "EUR 12 000 · SWIFT · high risk",   status: "Закрыт · подтверждён", filed: "2025-11-30" },
  { id: "CTR-2025-03904", type: "CTR", customer: "Турсунов А.Б.",  amount: "UZS 120 000 000 · депозит",        status: "Архив",              filed: "2025-09-22" },
];

// ── Handbook ──────────────────────────────────────────────────────────────────

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

// ── Loans ─────────────────────────────────────────────────────────────────────

const LOANS: Loan[] = [
  { id: "LN-2026-00141", customer: "Петров Д.С.",    amount: 50_000_000,  cur: "UZS", rate: 28.0, term: "36 мес", issued: "2024-05-14", maturity: "2027-05-14", balance: 38_800_000,  status: "Действует" },
  { id: "LN-2026-00118", customer: "Иванова О.В.",   amount: 20_000_000,  cur: "UZS", rate: 27.5, term: "24 мес", issued: "2024-02-01", maturity: "2026-02-01", balance:  5_200_000,  status: "Действует" },
  { id: "LN-2026-00155", customer: "Хасанов Ф.Н.",   amount: 15_000_000,  cur: "UZS", rate: 29.0, term: "12 мес", issued: "2025-09-10", maturity: "2026-09-10", balance: 10_100_000,  status: "Действует" },
  { id: "LN-2026-00088", customer: "Юлдашев Б.Ш.",  amount: 10_000_000,  cur: "UZS", rate: 30.0, term: "12 мес", issued: "2025-08-01", maturity: "2026-08-01", balance:  4_500_000,  status: "Просрочен" },
  { id: "LN-2026-00201", customer: "Матмусаев У.Э.", amount: 8_000_000,   cur: "UZS", rate: 27.0, term: "18 мес", issued: "2025-11-20", maturity: "2027-05-20", balance:  6_800_000,  status: "Действует" },
  { id: "LN-2026-00077", customer: "ООО «ФастПэй»",  amount: 200_000_000, cur: "UZS", rate: 22.0, term: "60 мес", issued: "2023-04-15", maturity: "2028-04-15", balance: 148_000_000, status: "Действует" },
  { id: "LN-2025-04812", customer: "Носирова М.Ш.",  amount: 12_000_000,  cur: "UZS", rate: 28.5, term: "24 мес", issued: "2024-06-08", maturity: "2026-06-08", balance: 3_100_000,   status: "Действует" },
  { id: "LN-2026-00039", customer: "Тураева Д.Х.",   amount: 10_000.00,   cur: "USD", rate:  9.5, term: "24 мес", issued: "2024-09-30", maturity: "2026-09-30", balance:  7_200.00,   status: "Действует" },
];

// ── Activity ──────────────────────────────────────────────────────────────────

const ACTIVITY: ActivityEntry[] = [
  { t: "07:42:11",        actor: "Алексей П. (вы)",  action: "открыл",           what: "KYC SYN-2847102",                          tag: "KYC" },
  { t: "07:38:04",        actor: "Татьяна К.",         action: "оставила фидбэк",  what: "тренировка KYC #14",                      tag: "Mentor" },
  { t: "07:31:55",        actor: "Алексей П. (вы)",  action: "запустил",          what: "санкционный скрининг (HIT-7741)",          tag: "Sanctions" },
  { t: "07:18:02",        actor: "Авто-AML",           action: "пометил",           what: "TRN-77417995 как «На проверке»",          tag: "AML" },
  { t: "07:04:30",        actor: "Система",            action: "подала",            what: "CTR-2026-04418 (UZS 420M автоматически)", tag: "AML" },
  { t: "06:54:09",        actor: "Юлдашев Б.Ш.",      action: "получил",           what: "карту HUMO ••8841",                       tag: "Cards" },
  { t: "06:31:48",        actor: "Петров Д.С.",        action: "провёл",            what: "SWIFT USD 9 800",                         tag: "Transfer" },
  { t: "06:10:00",        actor: "Система",            action: "обновила",          what: "санкционные списки (OFAC, EU, UN)",        tag: "System" },
  { t: "05:42:18",        actor: "Ольга Р. (HR)",      action: "назначила",         what: "квест «Открытие счёта», день 12",          tag: "HR" },
  { t: "Вчера · 16:11",  actor: "Авто-AML",           action: "пометил",           what: "Хасанов Ф.Н. — структурирование (4 txn)", tag: "AML" },
  { t: "Вчера · 14:28",  actor: "Алексей П. (вы)",  action: "эскалировал",       what: "TRN-77417902 · SWIFT Lagos → комплаенс",  tag: "Sanctions" },
  { t: "Вчера · 11:30",  actor: "Комплаенс",          action: "поставил на паузу", what: "TRN-77417910 · UZS 420M",                 tag: "Compliance" },
  { t: "Вчера · 09:14",  actor: "Система",            action: "заморозила",        what: "счёт Kim S.J. · SWIFT блок",              tag: "Sanctions" },
  { t: "Вчера · 08:02",  actor: "Алексей П. (вы)",  action: "обработал",         what: "возврат TRN-77417880 · ЧП ФастПэй",       tag: "Transfer" },
  { t: "Вчера · 21:14",  actor: "Алексей П. (вы)",  action: "прошёл",            what: "ночной квест «Streak» (+30 XP)",           tag: "Streak" },
  { t: "Вчера · 16:42",  actor: "Алексей П. (вы)",  action: "получил",           what: "награду «Первый KYC»",                     tag: "Badge" },
  { t: "Вчера · 14:08",  actor: "Алексей П. (вы)",  action: "завершил",          what: "сценарий «KYC: разбор» (87/100)",          tag: "Scenario" },
  { t: "Вчера · 09:10",  actor: "Поток Q2-26",       action: "открыл",            what: "модуль «Санкции»",                         tag: "Cohort" },
  { t: "2 дня назад",    actor: "Авто-AML",           action: "подала",            what: "STR-2026-00191 · Хасанов (structuring)",   tag: "AML" },
  { t: "2 дня назад",    actor: "Алексей П. (вы)",  action: "открыл депозит",    what: "DEP-660024 · Носирова М.Ш. 8M UZS",       tag: "Deposits" },
  { t: "2 дня назад",    actor: "Алексей П. (вы)",  action: "выдал кредит",      what: "LN-2026-00201 · Матмусаев У.Э.",          tag: "Loans" },
  { t: "3 дня назад",    actor: "Комплаенс",          action: "провёл EDD",        what: "PEP-1148 · Тураев К. — завершена",        tag: "PEP" },
  { t: "3 дня назад",    actor: "Алексей П. (вы)",  action: "добавил клиента",   what: "SYN-C-0044 · Qodirov Trading LLC",        tag: "KYC" },
  { t: "Неделю назад",   actor: "Поток Q2-26",       action: "завершил",          what: "модуль «Депозиты» · 18 стажёров",         tag: "Cohort" },
  { t: "Неделю назад",   actor: "Система",            action: "выпустила",         what: "версию KYC-PROC v3.4",                    tag: "System" },
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
  LOANS,
  ACTIVITY,
  fmt,
};
