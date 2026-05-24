// gemini.ts — Gemini streaming client → Groq fallback → canned answers
import { GoogleGenerativeAI } from '@google/generative-ai'
import { streamGroqAnswer } from './groq'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY as string | undefined

// ── Banking knowledge system prompt ──────────────────────────────────────────

const SYSTEM_PROMPT_BASE = `Ты — ИИ-ассистент банковского тренингового симулятора Vitality Mentora.
Отвечай ТОЛЬКО на основе следующей базы знаний. Не выдумывай факты за её пределами.
Цитируй коды процедур (KYC-PROC, AML-HB, SANCTIONS-PROC, TRANSFER-OPS, DEPOSIT-OPS, CARD-ISSUE, SWIFT-LIMITS, FX-RATES, PEP-HB, ESCAL-PROC) при наличии.

БАЗА ЗНАНИЙ:
[KYC-PROC] Процедура KYC v3.4: идентификация клиента по паспорту → скрининг санкционных списков (OFAC/EU/UN/CBU) → оценка источника средств (ИС) → присвоение уровня риска (Low/Medium/High). Документы: паспорт + ИНН + подтверждение адреса. Для нерезидентов — нотариальный перевод.
[AML-HB] AML-руководство: операции ≥50 млн UZS (или $5 000) → обязательный CTR. Подозрительные паттерны → STR в ФМС в течение 3 рабочих дней. Структурирование (дробление) сумм — серьёзный флаг.
[SANCTIONS-PROC §1.4] Санкционный хит >50% уверенности → немедленная эскалация в комплаенс. Транзакцию заморозить. Только старший комплаенс-офицер может снять хит с документированием.
[TRANSFER-OPS §6.4] SWIFT >$10 000 → автоматический AML. Комиссия физлиц: 0.25%+$15. Юрлица: 0.18%+$25. Лимит SWIFT физлица: $50 000/мес без дополнительного согласования.
[DEPOSIT-OPS §3] Депозиты ≥50 млн UZS → декларация ИС (2-НДФЛ или эквивалент). Минимальный срок 1 мес, ставки: UZS 18-22%, USD 5-7%, EUR 3-5%.
[CARD-ISSUE §2] Выпуск карт: UZCARD/HUMO — 3-5 рабочих дней. VISA/Mastercard — 7-14 дней. Лимиты: стандарт 5 млн UZS/сутки, премиум 20 млн.
[SWIFT-LIMITS] Лимиты SWIFT: физлица $50k/мес, юрлица $500k/мес без дополнительной документации. Платёж в FATF-страны с красным флагом → enhanced due diligence.
[FX-RATES] Курс ЦБ РУз обновляется ежедневно в 10:00. Обменный курс банка: ЦБ ±0.5%. Операции >$10k фиксируются в валютном отчёте.
[PEP-HB] PEP (политически значимые лица): Enhanced Due Diligence обязателен. Источник средств — отдельная документация. Обновление профиля каждые 6 месяцев.
[ESCAL-PROC] Эскалация: уровень 1 → старший тeller. Уровень 2 → менеджер отделения. Уровень 3 → комплаенс-офицер. AML/Sanctions → только уровень 3.`

const SYSTEM_PROMPT_EN = `You are an AI assistant for Vitality Mentora banking training simulator.
Answer ONLY based on the knowledge base below. Cite procedure codes when available.
KNOWLEDGE BASE: KYC-PROC: Customer identification → sanctions screening (OFAC/EU/UN/CBU) → source of funds → risk rating. AML-HB: Transactions ≥$5,000 require CTR; suspicious patterns → STR within 3 days. SANCTIONS-PROC: Hit >50% confidence → freeze and escalate to compliance. TRANSFER-OPS: SWIFT >$10k → automatic AML check; limit $50k/mo for individuals. DEPOSIT-OPS: Deposits ≥50M UZS require source-of-funds declaration. CARD-ISSUE: UZCARD/HUMO 3-5 days; VISA/MC 7-14 days. ESCAL-PROC: Escalation levels 1→senior teller, 2→branch manager, 3→compliance officer.`

const SYSTEM_PROMPT_UZ = `Siz Vitality Mentora bank trening simulyatorining AI yordamchisisiz.
Faqat quyidagi bilimlar bazasi asosida javob bering. Protsedura kodlarini keltiring.
BILIMLAR BAZASI: KYC-PROC: Mijozni identifikatsiya → sanktsiya tekshiruvi → mablag' manbasi → xavf darajasi. AML-HB: ≥50M UZS operatsiyalar → CTR; shubhali → 3 kun ichida STR. SANCTIONS-PROC: Hit >50% → to'xtatish va compliance ga eskalatsiya. TRANSFER-OPS: SWIFT >$10k → AML tekshiruv. DEPOSIT-OPS: ≥50M UZS depozit → mablag' manbasi deklaratsiyasi.`

// ── Canned fallback answers ───────────────────────────────────────────────────

const CANNED: Array<{ keys: string[]; ru: string; en: string; uz: string }> = [
  {
    keys: ['kyc', 'кyc', 'верификац', 'клиент', 'идентифик'],
    ru: 'Процедура KYC включает: 1) идентификацию по паспорту, 2) санкционный скрининг, 3) оценку источника средств, 4) присвоение уровня риска. Источник: KYC-PROC §2–§4.',
    en: 'KYC procedure: 1) passport identification, 2) sanctions screening, 3) source of funds assessment, 4) risk rating. Ref: KYC-PROC §2–§4.',
    uz: 'KYC tartibi: 1) pasport orqali identifikatsiya, 2) sanktsiya tekshiruvi, 3) mablag\' manbasi baholash, 4) xavf darajasi. Manba: KYC-PROC §2–§4.',
  },
  {
    keys: ['санкц', 'sanctions', 'скрининг', 'ofac'],
    ru: 'При санкционном хите >50% — немедленная эскалация в комплаенс, транзакция замораживается. Источник: SANCTIONS-PROC §1.4.',
    en: 'Sanctions hit >50% confidence → freeze transaction and escalate to compliance immediately. Ref: SANCTIONS-PROC §1.4.',
    uz: 'Sanktsiya hiti >50% → tranzaktsiyani to\'xtatish va compliance ga eskalatsiya. Manba: SANCTIONS-PROC §1.4.',
  },
  {
    keys: ['aml', 'амл', 'подозр', 'ctr', 'str'],
    ru: 'Операции ≥50 млн UZS требуют CTR. Подозрительные → STR в ФМС в течение 3 дней. Источник: AML-HB.',
    en: 'Transactions ≥50M UZS require CTR. Suspicious activity → STR to FIU within 3 days. Ref: AML-HB.',
    uz: '≥50M UZS operatsiyalar CTR talab qiladi. Shubhali → 3 kun ichida STR. Manba: AML-HB.',
  },
  {
    keys: ['swift', 'перевод', 'transfer', 'лимит'],
    ru: 'Лимит SWIFT для физлиц: $50 000/мес. Переводы >$10 000 — автоматический AML. Комиссия: 0.25%+$15. Источник: TRANSFER-OPS §6.4.',
    en: 'SWIFT limit for individuals: $50,000/month. Transfers >$10,000 trigger automatic AML check. Fee: 0.25%+$15. Ref: TRANSFER-OPS §6.4.',
    uz: 'Jismoniy shaxslar uchun SWIFT limiti: $50,000/oy. >$10,000 → AML tekshiruv. Komissiya: 0.25%+$15. Manba: TRANSFER-OPS §6.4.',
  },
  {
    keys: ['депозит', 'вклад', 'deposit'],
    ru: 'Для депозита ≥50 млн UZS нужна декларация источника средств. Ставки: UZS 18-22%, USD 5-7%. Источник: DEPOSIT-OPS §3.',
    en: 'Deposits ≥50M UZS require source-of-funds declaration. Rates: UZS 18-22%, USD 5-7%. Ref: DEPOSIT-OPS §3.',
    uz: '≥50M UZS depozit uchun mablag\' manbasi deklaratsiyasi kerak. Stavkalar: UZS 18-22%, USD 5-7%. Manba: DEPOSIT-OPS §3.',
  },
  {
    keys: ['карт', 'card', 'выпуск', 'karta'],
    ru: 'UZCARD/HUMO выпускается 3-5 рабочих дней. VISA/Mastercard — 7-14 дней. Лимит: стандарт 5 млн UZS/сутки. Источник: CARD-ISSUE §2.',
    en: 'UZCARD/HUMO issued in 3-5 business days. VISA/MC — 7-14 days. Limit: standard 5M UZS/day. Ref: CARD-ISSUE §2.',
    uz: 'UZCARD/HUMO 3-5 ish kuni ichida chiqariladi. VISA/MC — 7-14 kun. Limit: standart 5M UZS/kun. Manba: CARD-ISSUE §2.',
  },
  {
    keys: ['pep', 'пэп', 'политическ', 'politically'],
    ru: 'PEP требует Enhanced Due Diligence, документацию источника средств и обновление профиля каждые 6 месяцев. Источник: PEP-HB.',
    en: 'PEP requires Enhanced Due Diligence, source-of-funds documentation, and profile update every 6 months. Ref: PEP-HB.',
    uz: 'PEP Enhanced Due Diligence, mablag\' manbasi hujjatlari va har 6 oyda profil yangilashini talab qiladi. Manba: PEP-HB.',
  },
]

function getCannedAnswer(question: string, lang: string): string | null {
  const lower = question.toLowerCase()
  for (const item of CANNED) {
    if (item.keys.some(k => lower.includes(k))) {
      return lang === 'EN' ? item.en : lang === 'UZ' ? item.uz : item.ru
    }
  }
  return null
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function streamGeminiAnswer(
  question: string,
  lang: string,
  onChunk: (chunk: string) => void,
  onDone: (fullText: string, citations: string[]) => void,
  onError: (err: unknown) => void,
  docContext?: string,
): Promise<void> {
  const systemBase = lang === 'EN' ? SYSTEM_PROMPT_EN : lang === 'UZ' ? SYSTEM_PROMPT_UZ : SYSTEM_PROMPT_BASE
  const systemPrompt = docContext
    ? `${systemBase}\n\nДОПОЛНИТЕЛЬНЫЙ КОНТЕКСТ ИЗ ДОКУМЕНТА:\n${docContext}`
    : systemBase

  // Try Gemini first
  if (GEMINI_KEY) {
    try {
      await streamGemini(question, systemPrompt, onChunk, onDone, onError)
      return
    } catch (err) {
      console.warn('Gemini failed, trying Groq:', err)
    }
  }

  // Try Groq fallback
  try {
    await streamGroqAnswer(question, lang, systemPrompt, onChunk, onDone, onError)
    return
  } catch (err) {
    console.warn('Groq failed, using canned answer:', err)
  }

  // Final fallback: canned answer
  const canned = getCannedAnswer(question, lang)
  const fallback = canned ?? (
    lang === 'EN' ? 'I can only answer questions about banking procedures in this training system. Please check the Knowledge Base for more details.'
    : lang === 'UZ' ? 'Men faqat bank tartiblari haqida javob bera olaman. Qo\'shimcha ma\'lumot uchun Bilimlar Bazasini tekshiring.'
    : 'Я отвечаю только на вопросы о банковских процедурах. Обратитесь к базе знаний для подробностей.'
  )
  onChunk(fallback)
  onDone(fallback, extractCitations(fallback))
}

async function streamGemini(
  question: string,
  systemPrompt: string,
  onChunk: (chunk: string) => void,
  onDone: (fullText: string, citations: string[]) => void,
  onError: (err: unknown) => void,
): Promise<void> {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY!)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  })

  const result = await model.generateContentStream(question)
  let full = ''
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) { full += text; onChunk(text) }
  }
  onDone(full, extractCitations(full))
}

function extractCitations(text: string): string[] {
  const matches = text.match(/\b(KYC-PROC|AML-HB|SANCTIONS-PROC|TRANSFER-OPS|DEPOSIT-OPS|CARD-ISSUE|SWIFT-LIMITS|FX-RATES|PEP-HB|ESCAL-PROC)\b/g)
  return matches ? [...new Set(matches)] : []
}
