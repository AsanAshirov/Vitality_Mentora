// keywordMap.ts — maps spoken keywords (RU/UZ/EN) to data-clicky-target values

interface KeywordEntry {
  keywords: string[]
  target: string
}

const KEYWORD_MAP: KeywordEntry[] = [
  // ── KYC scenario cards ────────────────────────────────────────────────────
  {
    keywords: ['клиент', 'customer', 'поиск', 'lookup', 'найти', 'find', 'mijoz', 'qidirish', 'профил'],
    target: 'customer-card',
  },
  {
    keywords: ['личност', 'паспорт', 'identity', 'passport', 'id', 'shaxsiyat', 'hujjat', 'документ', 'document', 'верификац', 'verification'],
    target: 'identity-card',
  },
  {
    keywords: ['санкц', 'sanctions', 'скрининг', 'screening', 'ofac', 'un ', ' un', 'запрет', 'sanktsiya', 'gdl', 'список запрещ'],
    target: 'sanctions-card',
  },
  {
    keywords: ['источник', 'средств', 'source', 'funds', 'sof', 'mablag', 'происхождение', 'origin', 'declaration', 'декларац'],
    target: 'sof-card',
  },
  {
    keywords: ['риск', 'risk', 'оценк', 'assessment', 'xavf', 'рейтинг', 'rating', 'уровень риска'],
    target: 'risk-card',
  },

  // ── Account opening ────────────────────────────────────────────────────────
  {
    keywords: ['открыт', 'счёт', 'open account', 'hisob och', 'новый счёт', 'create account'],
    target: 'ao-customer',
  },
  {
    keywords: ['продукт', 'product', 'валюта', 'currency', 'тариф', 'tariff', 'тип счёт'],
    target: 'ao-product',
  },
  {
    keywords: ['подпис', 'signature', 'sign', 'имзо', 'contract', 'договор', 'otp', 'отп', 'смс код'],
    target: 'ao-sign',
  },

  // ── Deposit scenario ──────────────────────────────────────────────────────
  {
    keywords: ['депозит', 'deposit', 'вклад', 'depozit', 'сумма', 'amount', 'миллион', 'million'],
    target: 'dep-client',
  },
  {
    keywords: ['срок', 'term', 'ставка', 'rate', 'muddат', 'процент', 'percent', 'месяц', 'month'],
    target: 'dep-terms',
  },
  {
    keywords: ['подтвержд', 'confirm', 'итог', 'summary', 'final', 'dep-confirm', 'финал'],
    target: 'dep-confirm',
  },

  // ── Transfer scenario ─────────────────────────────────────────────────────
  {
    keywords: ['перевод', 'transfer', 'отправ', "o'tkazma", 'swift', 'iban', 'внутренн', 'internal'],
    target: 'tr-from',
  },
  {
    keywords: ['получател', 'recipient', 'qabul', 'to account', 'beneficiar'],
    target: 'tr-to',
  },
  {
    keywords: ['aml', 'амл', 'подозр', 'suspicious', 'сомнительн', 'отмыв', 'laundering', 'финансирован', 'финмон'],
    target: 'tr-aml',
  },

  // ── Card issuance ─────────────────────────────────────────────────────────
  {
    keywords: ['карт', 'card', 'выпуск', 'issue', 'karta', 'виза', 'visa', 'mastercard', 'uzcard', 'humo', 'дебетов', 'debit'],
    target: 'ci-product',
  },
  {
    keywords: ['лимит', 'limit', 'параметр', 'param', 'доставк', 'delivery', 'цифров', 'digital'],
    target: 'ci-params',
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    keywords: ['задани', 'quest', 'сегодня', 'today', "bugungi vazifa"],
    target: 'todays-quest',
  },
]

export function extractTarget(text: string): string | null {
  const lower = text.toLowerCase()
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return entry.target
    }
  }
  return null
}
