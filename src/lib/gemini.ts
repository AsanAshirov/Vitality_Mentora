// gemini.ts — Mentora AI client: Gemini → Groq → canned fallback
import { GoogleGenerativeAI } from '@google/generative-ai'
import { streamGroqAnswer } from './groq'

const API_KEY = import.meta.env.VITE_GEMINI_KEY as string
const genAI = new GoogleGenerativeAI(API_KEY)

// Models tried in order — stops at first success
const MODEL_CHAIN = [
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash',
]

// ─── Banking knowledge base (RAG context) ────────────────────────────────────

const KNOWLEDGE_BASE = `
# BANKING PROCEDURES KNOWLEDGE BASE — Mentora Training Simulator

## KYC — Know Your Customer (KYC-PROC)
- Verification requires 3 documents: passport/ID, proof of address (≤90 days old), source of funds declaration for deposits ≥50M UZS
- New client draft stays in "Черновик KYC" until all steps complete and compliance approved
- Source of funds declaration mandatory for single deposit ≥50,000,000 UZS or cumulative within 7 days
- Cumulative monitoring: same client deposits >$20,000 over 7 days triggers extended monitoring
- Non-residents need notarised passport translation

## SANCTIONS SCREENING (SANCTIONS-PROC)
- Runs against OFAC SDN, EU 833/2014, UN 1267/1718, CBU-AML lists
- Yellow flag (possible match, <80% confidence): STOP operation, escalate to compliance, notify supervisor within 15 min
- Red flag (>80% confidence): FREEZE account, file STR within 3 working days
- Never ignore a flag or mark as "cleared" without compliance approval
- Override (ignoring flag) is PROHIBITED for regular staff — senior officer only
- PEP match >50% confidence always requires escalation, regardless of level

## AML — Anti-Money Laundering (AML-HB)
- CTR (Currency Transaction Report): automatic for single transaction ≥$10,000 equivalent
- STR (Suspicious Transaction Report): file within 3 working days of suspicion; any amount
- Tipping-off: PROHIBITED — never inform client that STR was filed (criminal offence)
- STR grounds: structuring (smurfing), unusual SWIFT routes, profile mismatch, refusal to provide docs
- After STR filed: freeze account until CBU-AML clearance received
- Cumulative rule: transactions >$20,000 in 7 days from one client = extended monitoring

## PEP — Politically Exposed Persons (PEP-HB)
- PEP and immediate family = HIGH RISK automatically
- Requires Enhanced Due Diligence (EDD): source of funds, business purpose, senior manager approval
- All PEP transactions >5,000,000 UZS under compliance monitoring
- Post-PEP status maintained 12 months after leaving office
- Annual risk profile reassessment required

## DEPOSITS (DEPOSIT-OPS)
- KYC status must be "Активен" (not Draft or Frozen) before deposit
- Terms: 3, 6, 9, 12, 24 months available
- Early termination: rate recalculated at "demand" rate (no penalty fee)
- Within 30 days: no interest. 30-90 days: 50% of rate. After 90 days: full rate

## TRANSFERS (TRANSFER-OPS)
- Internal UZS: instant, no limits (with source of funds)
- Interbank: processed within clearing window (by 17:00 local time)
- SWIFT (individuals): up to $10,000/day without extended check; above = AML filter + purpose declaration
- SWIFT (entities): no limit, but first transfer to high-risk country = compliance review
- All SWIFT screened in real-time against OFAC/EU/UN
- Transfers >100,000,000 UZS: compliance officer approval required

## CARD ISSUANCE (CARD-ISSUE)
- KYC status must be "Активен" (not Черновик/Заморожен)
- Card types: UZCARD (default), HUMO, VISA (higher tier)
- Processing: 1-3 working days
- Issuance: in-person at branch, passport required, signature in journal
- Card limits: up to 30,000,000 UZS/day (varies by tariff)

## CURRENCY & FX (FX-RATE)
- CBU official rate updated 09:00 daily
- Client rate = CBU ± spread (per tariff)
- Conversion for transfers: rate at time of confirmation
- Corporate clients: individual rate negotiated with Treasury
- Supported: UZS, USD, EUR, RUB (restricted), GBP
- Multi-currency: up to 3 currencies per individual client

## ESCALATION PROCEDURE (OPS-ESC)
1. Stop transaction — DO NOT confirm
2. Open Jira ticket: Compliance → Escalation (include operation ID + reason)
3. Notify supervisor in Slack #compliance-alert within 15 minutes
4. Await compliance officer decision (SLA: 2 hours during business hours)
5. Record outcome in client card
`

// ─── Canned FAQ answers (shown when API unavailable) ─────────────────────────

const CANNED: Array<{
  keys: string[]
  RU: string
  UZ: string
  EN: string
}> = [
  {
    keys: ['kyc', 'документ', 'верификац', 'паспорт', 'document', 'hujjat'],
    RU: 'Для KYC требуются 3 документа: паспорт/удостоверение личности, подтверждение адреса (не старше 90 дней) и декларация об источнике средств для депозитов ≥50 000 000 UZS. Нерезиденты дополнительно предоставляют нотариально заверенный перевод паспорта. (KYC-PROC)',
    UZ: 'KYC uchun 3 ta hujjat kerak: pasport/shaxsni tasdiqlovchi hujjat, yashash manzili tasdiqnomasi (90 kundan eski bo\'lmasin) va ≥50 000 000 UZS depozitlar uchun mablag\' manbai deklaratsiyasi. Norezidentlar qo\'shimcha notarial tasdiqlangan pasport tarjimasini taqdim etadilar. (KYC-PROC)',
    EN: 'KYC requires 3 documents: passport/ID, proof of address (≤90 days old), and source of funds declaration for deposits ≥50M UZS. Non-residents additionally provide a notarised passport translation. (KYC-PROC)',
  },
  {
    keys: ['swift', 'лимит', 'limit', '10000', '$10'],
    RU: 'SWIFT для физлиц: до $10 000/день без расширенной проверки. Свыше $10 000 — фильтр AML + декларация о цели перевода. Для юрлиц лимита нет, но первый перевод в страну высокого риска проходит комплаенс-ревью. (TRANSFER-OPS)',
    UZ: 'Jismoniy shaxslar uchun SWIFT: kengaytirilgan tekshiruvsiz kuniga $10 000 gacha. $10 000 dan oshiq bo\'lsa — AML filtri + o\'tkazma maqsadi deklaratsiyasi. Yuridik shaxslar uchun limit yo\'q, lekin yuqori riskli mamlakatga birinchi o\'tkazma compliance ko\'rib chiqishini talab qiladi. (TRANSFER-OPS)',
    EN: 'SWIFT for individuals: up to $10,000/day without extended check. Above $10,000 — AML filter + purpose declaration required. For entities: no limit, but first transfer to a high-risk country requires compliance review. (TRANSFER-OPS)',
  },
  {
    keys: ['санкц', 'санкционн', 'ofac', 'sdn', 'флаг', 'flag', 'sancti'],
    RU: 'Жёлтый флаг (<80% совпадения): СТОП операция, эскалация в комплаенс, уведомить супервайзера за 15 минут. Красный флаг (>80%): ЗАМОРОЗИТЬ счёт, подать STR в течение 3 рабочих дней. Игнорировать или снимать флаг без одобрения комплаенса ЗАПРЕЩЕНО. (SANCTIONS-PROC)',
    UZ: 'Sariq bayroq (<80% moslik): STOP operatsiya, compliancega eskalatsiya, 15 daqiqa ichida nazoratchi xabardor qilish. Qizil bayroq (>80%): hisobni MUZLATISH, 3 ish kuni ichida STR topshirish. Compliance tasdiqlamisdan bayroqni e\'tiborsiz qoldirish yoki tozalash TAQIQLANGAN. (SANCTIONS-PROC)',
    EN: 'Yellow flag (<80% match): STOP operation, escalate to compliance, notify supervisor within 15 min. Red flag (>80%): FREEZE account, file STR within 3 working days. Ignoring or clearing a flag without compliance approval is PROHIBITED. (SANCTIONS-PROC)',
  },
  {
    keys: ['aml', 'ctr', 'str', 'подозрит', 'suspicious', 'отмыван', 'laundering'],
    RU: 'CTR (отчёт о валютной операции): автоматически для транзакций ≥$10 000. STR (отчёт о подозрительной операции): подаётся в течение 3 рабочих дней при любой сумме. Сообщать клиенту о подаче STR ЗАПРЕЩЕНО — уголовная ответственность. (AML-HB)',
    UZ: 'CTR (valyuta operatsiyasi hisoboti): ≥$10 000 operatsiyalar uchun avtomatik. STR (shubhali operatsiya hisoboti): istalgan summada shubha paydo bo\'lgandan 3 ish kuni ichida topshiriladi. Mijozga STR topshirilganligi haqida xabardor qilish TAQIQLANGAN — jinoiy javobgarlik. (AML-HB)',
    EN: 'CTR (Currency Transaction Report): automatic for transactions ≥$10,000. STR (Suspicious Transaction Report): file within 3 working days for any amount. Tipping off the client that an STR was filed is PROHIBITED — criminal offence. (AML-HB)',
  },
  {
    keys: ['pep', 'политическ', 'должностн', 'politically', 'exposed'],
    RU: 'PEP и их ближайшие родственники автоматически = ВЫСОКИЙ РИСК. Требуется расширенная проверка (EDD): источник средств, цель операции, одобрение руководителя. Все транзакции PEP >5 000 000 UZS под мониторингом комплаенса. Статус PEP сохраняется 12 месяцев после ухода с должности. (PEP-HB)',
    UZ: 'PEP va ularning yaqin qarindoshlari avtomatik = YUQORI RISK. Kengaytirilgan tekshiruv (EDD) talab qilinadi: mablag\' manbai, operatsiya maqsadi, rahbar tasdiqi. PEP >5 000 000 UZS barcha tranzaksiyalari compliance monitoringida. PEP maqomi lavozimdan ketgandan 12 oy davomida saqlanadi. (PEP-HB)',
    EN: 'PEP and immediate family = HIGH RISK automatically. Requires Enhanced Due Diligence (EDD): source of funds, business purpose, senior manager approval. All PEP transactions >5,000,000 UZS under compliance monitoring. PEP status maintained 12 months after leaving office. (PEP-HB)',
  },
  {
    keys: ['депозит', 'вклад', 'deposit', 'срок', 'term', 'досрочн'],
    RU: 'Депозиты доступны на 3, 6, 9, 12, 24 месяца. KYC статус клиента должен быть "Активен". Досрочное закрытие: до 30 дней — без процентов; 30–90 дней — 50% ставки; после 90 дней — полная ставка. Штрафа за досрочное закрытие нет. (DEPOSIT-OPS)',
    UZ: 'Depozitlar 3, 6, 9, 12, 24 oyga mavjud. Mijozning KYC holati "Faol" bo\'lishi kerak. Muddatidan oldin yopish: 30 kungacha — foizsiz; 30–90 kun — stavkaning 50%i; 90 kundan keyin — to\'liq stavka. Muddatidan oldin yopish uchun jarima yo\'q. (DEPOSIT-OPS)',
    EN: 'Deposits available for 3, 6, 9, 12, 24 months. Client KYC status must be "Active". Early termination: under 30 days — no interest; 30–90 days — 50% of rate; after 90 days — full rate. No penalty for early termination. (DEPOSIT-OPS)',
  },
  {
    keys: ['карт', 'card', 'uzcard', 'humo', 'visa', 'лимит карт'],
    RU: 'Типы карт: UZCARD (по умолчанию), HUMO, VISA (повышенный уровень). KYC должен быть "Активен". Выпуск: 1–3 рабочих дня, оформление лично в отделении с паспортом и подписью в журнале. Лимит: до 30 000 000 UZS/день (зависит от тарифа). (CARD-ISSUE)',
    UZ: 'Karta turlari: UZCARD (standart), HUMO, VISA (yuqori daraja). KYC "Faol" bo\'lishi kerak. Chiqarish: 1–3 ish kuni, filialda shaxsan pasport bilan rasmiylashtirish va jurnalda imzo. Limit: kuniga 30 000 000 UZS gacha (tarifga qarab). (CARD-ISSUE)',
    EN: 'Card types: UZCARD (default), HUMO, VISA (higher tier). KYC must be "Active". Issuance: 1–3 working days, in-person at branch with passport and signature in journal. Limit: up to 30,000,000 UZS/day (varies by tariff). (CARD-ISSUE)',
  },
  {
    keys: ['эскалац', 'escalat', 'jira', 'supervisor', 'супервайзер', 'compliance', 'комплаенс'],
    RU: 'Процедура эскалации (OPS-ESC): 1) Остановить транзакцию. 2) Создать тикет в Jira: Compliance → Escalation с ID операции и причиной. 3) Уведомить супервайзера в Slack #compliance-alert в течение 15 минут. 4) Ожидать решения комплаенс-офицера (SLA: 2 часа в рабочее время). 5) Записать результат в карточку клиента.',
    UZ: 'Eskalatsiya tartibi (OPS-ESC): 1) Tranzaksiyani to\'xtating. 2) Jirada chipta oching: Compliance → Escalation, operatsiya ID va sababi bilan. 3) 15 daqiqa ichida Slack #compliance-alertda nazoratchi xabardor qiling. 4) Compliance xodimi qarorini kuting (SLA: ish vaqtida 2 soat). 5) Natijani mijoz kartasiga yozing.',
    EN: 'Escalation procedure (OPS-ESC): 1) Stop the transaction. 2) Open Jira ticket: Compliance → Escalation with operation ID and reason. 3) Notify supervisor in Slack #compliance-alert within 15 minutes. 4) Await compliance officer decision (SLA: 2 hours during business hours). 5) Record outcome in client card.',
  },
  {
    keys: ['fx', 'курс', 'валют', 'currency', 'rate', 'cbu', 'цб'],
    RU: 'Официальный курс ЦБ обновляется в 09:00 ежедневно. Курс для клиента = ЦБ ± спред (по тарифу). При конвертации для переводов используется курс на момент подтверждения. Корпоративным клиентам — индивидуальный курс с Казначейством. Доступные валюты: UZS, USD, EUR, RUB (ограничен), GBP. До 3 валют на одного клиента. (FX-RATE)',
    UZ: 'Rasmiy CBU kursi har kuni 09:00 da yangilanadi. Mijoz kursi = CBU ± spred (tarif bo\'yicha). O\'tkazmalar uchun konvertatsiyada tasdiqlash vaqtidagi kurs ishlatiladi. Korporativ mijozlarga G\'aznachilik bilan individual kurs. Mavjud valyutalar: UZS, USD, EUR, RUB (cheklangan), GBP. Bir mijozga 3 ta valyutaga qadar. (FX-RATE)',
    EN: 'CBU official rate updated daily at 09:00. Client rate = CBU ± spread (per tariff). Conversion for transfers uses rate at time of confirmation. Corporate clients: individual rate negotiated with Treasury. Supported currencies: UZS, USD, EUR, RUB (restricted), GBP. Up to 3 currencies per client. (FX-RATE)',
  },
]

function findCanned(question: string, lang: 'RU' | 'UZ' | 'EN'): string | null {
  const q = question.toLowerCase()
  for (const entry of CANNED) {
    if (entry.keys.some(k => q.includes(k))) return entry[lang]
  }
  return null
}

// ─── Language-aware prompts ───────────────────────────────────────────────────

function buildSystemPrompt(lang: 'RU' | 'UZ' | 'EN'): string {
  const langInstr = lang === 'RU'
    ? 'Отвечай ТОЛЬКО на русском языке. Будь точным и кратким (2-5 предложений).'
    : lang === 'UZ'
    ? "Faqat o'zbek tilida javob ber. Aniq va qisqa bo'l (2-5 gap)."
    : 'Answer ONLY in English. Be precise and brief (2-5 sentences).'

  const antiHallucination = lang === 'RU'
    ? `СТРОГИЕ ПРАВИЛА — нарушать НЕЛЬЗЯ:
1. Используй ТОЛЬКО информацию из базы знаний ниже. НИЧЕГО не придумывай.
2. Если вопрос выходит за рамки базы знаний — скажи: "Этой информации нет в моей базе знаний. Уточни у наставника."
3. Никогда не угадывай цифры, даты, имена или процедуры — только то, что точно есть в документах.
4. При ссылке на правило — цитируй код процедуры (например: KYC-PROC, AML-HB).
5. Если не уверен — честно признай это.`
    : lang === 'UZ'
    ? `QATTIQ QOIDALAR — buzish MUMKIN EMAS:
1. Faqat quyidagi bilimlar bazasidan foydalaning. Hech narsa o'ylab topmang.
2. Savol bilimlar bazasidan tashqarida bo'lsa: "Bu ma'lumot bilimlar bazamda yo'q. Murabbiydan so'rang."
3. Raqamlar, sanalar yoki tartiblarni taxmin qilmang — faqat hujjatlardagini ayting.
4. Qoidaga murojaat qilganda — protsedura kodini keltiring (masalan: KYC-PROC).`
    : `STRICT RULES — MUST NOT break:
1. Use ONLY information from the knowledge base below. NEVER make anything up.
2. If the question is outside the knowledge base: "This information is not in my knowledge base. Please ask your supervisor."
3. Never guess numbers, dates, names or procedures — only what's explicitly documented.
4. When citing a rule — include the procedure code (e.g. KYC-PROC, AML-HB).
5. If uncertain — say so honestly.`

  return `You are Mentora AI, a banking compliance assistant for a training simulator at a bank in Uzbekistan.

${langInstr}

${antiHallucination}

KNOWLEDGE BASE (the ONLY source of truth):
${KNOWLEDGE_BASE}

Format: plain text, no markdown headers, bullet points only for step lists. Keep responses short — the user is a bank intern learning procedures.`
}

// ─── Citation extraction ──────────────────────────────────────────────────────

function extractCitations(text: string): string[] {
  const rx = /([A-Z-]+(?:-PROC|-HB|-OPS|-ESC|-RATE|-ISSUE))/g
  const matches = text.match(rx) ?? []
  return [...new Set(matches)]
}

// ─── Streaming via Gemini API ─────────────────────────────────────────────────

async function tryModelStream(
  modelName: string,
  question: string,
  lang: 'RU' | 'UZ' | 'EN',
  onChunk: (text: string) => void,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: buildSystemPrompt(lang),
    generationConfig: { temperature: 0.0, maxOutputTokens: 500, topP: 0.95 },
  })
  const result = await model.generateContentStream(question)
  let full = ''
  for await (const chunk of result.stream) {
    const text = chunk.text()
    full += text
    onChunk(text)
  }
  return full
}

// ─── Main streaming function ──────────────────────────────────────────────────

export async function streamGeminiAnswer(
  question: string,
  lang: 'RU' | 'UZ' | 'EN',
  onChunk: (text: string) => void,
  onDone: (fullText: string, citations: string[]) => void,
  onError: (err: string) => void,
  docContext?: string,
): Promise<void> {
  const effectiveQuestion = docContext
    ? `[Документ загружен]\n${docContext}\n\nВопрос: ${question}`
    : question

  const sysPrompt = buildSystemPrompt(lang)

  // 1. Try Gemini models in chain
  for (const modelName of MODEL_CHAIN) {
    try {
      const full = await tryModelStream(modelName, effectiveQuestion, lang, onChunk)
      onDone(full, extractCitations(full))
      return
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const isQuota = msg.includes('429') || msg.includes('404') || msg.includes('quota')
      if (!isQuota) break
    }
  }

  // 2. Try Groq (Llama 3) — fast, free tier, streaming
  try {
    const full = await streamGroqAnswer(sysPrompt, effectiveQuestion, onChunk)
    onDone(full, extractCitations(full))
    return
  } catch {
    // Groq also unavailable — fall through to canned answers
  }

  // 3. Canned answer fallback — simulated streaming
  const canned = findCanned(question, lang)
  const answer = canned ?? (
    lang === 'RU'
      ? 'Этой информации нет в моей базе знаний. Уточни у наставника или проверь раздел "Справочник" в симуляторе.'
      : lang === 'UZ'
      ? "Bu ma'lumot bilimlar bazamda yo'q. Murabbiydan so'rang yoki simulyatordagi \"Ma'lumotnoma\" bo'limini tekshiring."
      : 'This information is not in my knowledge base. Please ask your supervisor or check the Handbook section in the simulator.'
  )

  let full = ''
  for (const word of answer.split(' ')) {
    const chunk = (full ? ' ' : '') + word
    full += chunk
    onChunk(chunk)
    await new Promise(r => setTimeout(r, 16))
  }
  onDone(full, extractCitations(full))
}
