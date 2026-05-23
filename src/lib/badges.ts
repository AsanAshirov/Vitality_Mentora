import type { RunSummary, BadgeState } from '../store/userStore'

export interface BadgeDef {
  id: string
  name: string
  glyph: string
  desc: string
  category: 'ops' | 'quality' | 'compliance' | 'streak' | 'community'
  unlockPath: string
  maxProgress?: number
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'first-kyc',      name: 'Первый KYC',         glyph: '🆔', desc: 'Завершил первый KYC-сценарий.',           category: 'ops',        unlockPath: 'Пройди сценарий KYC.' },
  { id: 'first-deposit',  name: 'Первый депозит',     glyph: '💰', desc: 'Оформил первый депозит.',                  category: 'ops',        unlockPath: 'Пройди сценарий «Депозиты».' },
  { id: 'swift-master',   name: 'SWIFT-мастер',       glyph: '🌐', desc: 'Провёл SWIFT-перевод без ошибок.',        category: 'ops',        unlockPath: 'Пройди «Переводы» с оценкой ≥ B.' },
  { id: 'card-issuer',    name: 'Эмитент карт',       glyph: '💳', desc: 'Выпустил карту правильно.',                category: 'ops',        unlockPath: 'Пройди сценарий «Карты».' },
  { id: 'perfectionist',  name: 'Перфекционист',      glyph: '🏆', desc: 'Набрал 100/100 в любом сценарии.',        category: 'quality',    unlockPath: 'Пройди сценарий без ошибок и без подсказок.' },
  { id: 'no-hints',       name: 'Без подсказок',      glyph: '🧠', desc: 'Завершил сценарий без подсказок.',        category: 'quality',    unlockPath: 'Пройди любой сценарий с 0 подсказок.' },
  { id: 'accuracy-95',    name: 'Точность 95+',       glyph: '🎯', desc: 'Набрал ≥ 95 баллов.',                      category: 'quality',    unlockPath: 'Набери 95+ в любом сценарии.' },
  { id: 'compliance-pro', name: 'Комплаенс-про',      glyph: '🛡️', desc: '3 правильные эскалации санкций подряд.',  category: 'compliance', unlockPath: 'Эскалируй санкционный хит без ошибок 3 раза.' },
  { id: 'anti-aml',       name: 'Анти-AML',           glyph: '🔍', desc: 'Корректно обработал AML-флаг.',           category: 'compliance', unlockPath: 'Пройди «Переводы» с эскалацией AML.' },
  { id: 'streak-7',       name: 'Серия 7 дней',       glyph: '🔥', desc: 'Занимался 7 дней подряд.',                category: 'streak',     unlockPath: '7 дней активности подряд.', maxProgress: 7 },
  { id: 'streak-30',      name: 'Серия 30 дней',      glyph: '💥', desc: 'Занимался 30 дней подряд.',               category: 'streak',     unlockPath: '30 дней активности подряд.', maxProgress: 30 },
  { id: 'night-owl',      name: 'Полуночник',          glyph: '🦉', desc: 'Работал после 23:00.',                    category: 'streak',     unlockPath: 'Заходи в систему после полуночи.' },
  { id: 'early-bird',     name: 'Ранняя пташка',      glyph: '🌅', desc: 'Работал до 07:00.',                       category: 'streak',     unlockPath: 'Заходи до 7 утра.' },
  { id: 'polyglot',       name: 'Полиглот',            glyph: '🌍', desc: 'Переключил язык интерфейса.',             category: 'community',  unlockPath: 'Измени язык в настройках.' },
  { id: 'asked-mentor',   name: 'Спросил наставника', glyph: '💬', desc: 'Открыл чат с наставником.',               category: 'community',  unlockPath: 'Напиши Татьяне К.' },
  { id: 'top-3',          name: 'Топ-3 потока',       glyph: '🥉', desc: 'Войди в топ-3 потока по XP.',             category: 'community',  unlockPath: 'Набери достаточно XP.' },
]

export function checkBadgeUnlocks(
  runs: RunSummary[],
  badges: BadgeState[],
  streak: number
): string[] {
  const unlocked = new Set(badges.filter(b => b.unlockedAt).map(b => b.id))
  const newUnlocks: string[] = []

  const kycRuns       = runs.filter(r => r.scenarioId === 'kyc')
  const depositRuns   = runs.filter(r => r.scenarioId === 'deposits')
  const transferRuns  = runs.filter(r => r.scenarioId === 'transfers')

  if (!unlocked.has('first-kyc')     && kycRuns.length > 0)                                           newUnlocks.push('first-kyc')
  if (!unlocked.has('first-deposit') && depositRuns.length > 0)                                        newUnlocks.push('first-deposit')
  if (!unlocked.has('card-issuer')   && runs.some(r => r.scenarioId === 'cards'))                      newUnlocks.push('card-issuer')
  if (!unlocked.has('swift-master')  && transferRuns.some(r => r.score >= 75))                         newUnlocks.push('swift-master')
  if (!unlocked.has('perfectionist') && runs.some(r => r.score >= 100))                                newUnlocks.push('perfectionist')
  if (!unlocked.has('no-hints')      && runs.some(r => r.hintsUsed === 0))                             newUnlocks.push('no-hints')
  if (!unlocked.has('accuracy-95')   && runs.some(r => r.score >= 95))                                 newUnlocks.push('accuracy-95')
  if (!unlocked.has('anti-aml')      && transferRuns.some(r => !r.mistakeKeys?.includes('aml_not_escalated'))) newUnlocks.push('anti-aml')

  const cleanKyc = kycRuns.filter(r =>
    !r.mistakeKeys?.includes('sanctions_override') &&
    !r.mistakeKeys?.includes('sanctions_cleared') &&
    r.hintsUsed === 0
  )
  if (!unlocked.has('compliance-pro') && cleanKyc.length >= 3) newUnlocks.push('compliance-pro')
  if (!unlocked.has('streak-7')       && streak >= 7)           newUnlocks.push('streak-7')
  if (!unlocked.has('streak-30')      && streak >= 30)          newUnlocks.push('streak-30')

  return newUnlocks
}
