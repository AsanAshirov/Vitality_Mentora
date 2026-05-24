// gemini.ts — Gemini 2.0 Flash client with RAG over banking handbook
import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = 'AIzaSyCrBKVm6CIBn7ih0ToM406XYKZniE3-8mg'
const genAI = new GoogleGenerativeAI(API_KEY)

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

// ─── Language-aware prompts ───────────────────────────────────────────────────

function buildSystemPrompt(lang: 'RU' | 'UZ' | 'EN'): string {
  const langInstr = lang === 'RU'
    ? 'Отвечай ТОЛЬКО на русском языке. Будь точным, кратким (2-4 предложения максимум). Цитируй процедуры.'
    : lang === 'UZ'
    ? "Faqat o'zbek tilida javob ber. Aniq va qisqa bo'l (maksimal 2-4 gap). Tartib-qoidalarga murojaat qil."
    : 'Answer ONLY in English. Be precise and brief (2-4 sentences max). Cite procedures.'

  return `You are Mentora, a banking compliance AI assistant for a training simulator at a bank in Uzbekistan.

${langInstr}

Use ONLY information from this knowledge base. Do NOT make up numbers or rules not in the knowledge base. If the answer is not in the knowledge base, say so clearly.

When referencing rules, cite the procedure code (e.g. KYC-PROC §2.1, AML-HB §4.7).

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}

Format responses as plain text. No markdown headers. Use bullet points only when listing steps. Keep it short — the user is a bank intern, not a lawyer.`
}

// ─── Citation extraction ──────────────────────────────────────────────────────

function extractCitations(text: string): string[] {
  const rx = /([A-Z-]+\s*§[\d.]+)/g
  const matches = text.match(rx) ?? []
  return [...new Set(matches)]
}

// ─── Main streaming function ──────────────────────────────────────────────────

export async function streamGeminiAnswer(
  question: string,
  lang: 'RU' | 'UZ' | 'EN',
  onChunk: (text: string) => void,
  onDone: (fullText: string, citations: string[]) => void,
  onError: (err: string) => void,
): Promise<void> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: buildSystemPrompt(lang),
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 400,
        topP: 0.8,
      },
    })

    const result = await model.generateContentStream(question)

    let full = ''
    for await (const chunk of result.stream) {
      const text = chunk.text()
      full += text
      onChunk(text)
    }

    onDone(full, extractCitations(full))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    onError(msg)
  }
}
