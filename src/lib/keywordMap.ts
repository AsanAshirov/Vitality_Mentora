// keywordMap.ts — spoken keyword → data-clicky-target DOM attribute

const KEYWORD_MAP: Array<{ keywords: string[]; target: string }> = [
  { keywords: ['клиент', 'customer', 'поиск', 'lookup', 'mijoz', 'поиск клиента'], target: 'customer-card' },
  { keywords: ['личност', 'паспорт', 'identity', 'документ', 'shaxsiyat', 'удостовер'], target: 'identity-card' },
  { keywords: ['санкц', 'sanctions', 'скрининг', 'screening', 'sanktsiya', 'ofac'], target: 'sanctions-card' },
  { keywords: ['источник', 'средств', 'source', 'funds', 'sof', 'происхождение'], target: 'sof-card' },
  { keywords: ['риск', 'risk', 'оценк', 'assessment', 'xavf', 'рейтинг'], target: 'risk-card' },
  { keywords: ['открыт счёт', 'open account', 'hisob och', 'новый счёт', 'счёт открыть'], target: 'ao-customer' },
  { keywords: ['депозит', 'deposit', 'вклад', 'depozit', 'сумма вклада'], target: 'dep-client' },
  { keywords: ['перевод', 'transfer', 'отправ', 'otkazma', 'отправитель'], target: 'tr-from' },
  { keywords: ['aml', 'амл', 'подозр', 'suspicious', 'проверка aml'], target: 'tr-aml' },
  { keywords: ['карт', 'card', 'выпуск', 'issue', 'karta', 'uzcard', 'humo', 'visa'], target: 'ci-product' },
  { keywords: ['справочник', 'handbook', 'процедур', 'qo\'llanma', 'инструкц'], target: 'handbook-list' },
  { keywords: ['задач', 'task', 'задание', 'topshiriq'], target: 'tasks-list' },
  { keywords: ['значк', 'badge', 'достижен', 'nishon'], target: 'badges-grid' },
  { keywords: ['сообщен', 'message', 'чат', 'xabar'], target: 'msg-shell' },
  { keywords: ['настройк', 'setting', 'профил', 'sozlama'], target: 'settings-form' },
]

export function extractTarget(text: string): string | null {
  const lower = text.toLowerCase()
  for (const { keywords, target } of KEYWORD_MAP) {
    if (keywords.some(k => lower.includes(k))) return target
  }
  return null
}
