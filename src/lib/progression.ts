import type { ScenarioId } from '../store/userStore'

export const LEVEL_THRESHOLDS = [0, 500, 1200, 2200, 3500, 5000, 7000]
export const LEVEL_NAMES = ['', 'Новичок', 'Стажёр', 'Подмастерье', 'Специалист', 'Эксперт', 'Мастер', 'Ас']

export function computeLevel(xp: number): number {
  let lv = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) lv = i + 1
    else break
  }
  return lv
}

export function xpToNextLevel(xp: number): number {
  const lv = computeLevel(xp)
  if (lv >= LEVEL_THRESHOLDS.length) return 0
  return LEVEL_THRESHOLDS[lv] - xp
}

export function levelProgress(xp: number): number {
  const lv = computeLevel(xp)
  const base = LEVEL_THRESHOLDS[lv - 1] ?? 0
  const next = LEVEL_THRESHOLDS[lv] ?? base + 1
  return Math.round(((xp - base) / (next - base)) * 100)
}

export const SCENARIO_SKILL_MAP: Record<ScenarioId, string> = {
  kyc: 'kyc',
  accounts: 'deposits',
  deposits: 'deposits',
  transfers: 'transfers',
  cards: 'cards',
}

export const MENTOR_FEEDBACK: Record<string, { title: string; note: string }> = {
  'kyc:A:': {
    title: 'Отличная работа — всё по инструкции.',
    note: 'Хороший прогон, Алексей. Ты правильно эскалировал санкционный хит с уверенностью 72%. Именно так должен действовать сотрудник.',
  },
  'kyc:B:': {
    title: 'Хорошо, но есть куда расти.',
    note: 'Неплохо. Проверь скорость на шаге «Источник средств» — там теряешь время.',
  },
  'kyc:C:sanctions_cleared': {
    title: 'Неплохо, почти получилось.',
    note: '«Отметить как очищенное» здесь не подходит — уверенность 72% превышает порог 50%. При таком совпадении нужна эскалация.',
  },
  'kyc:ПЕРЕСДАТЬ:sanctions_override': {
    title: 'Это серьёзный промах.',
    note: 'Ты проигнорировал возможное совпадение с уверенностью 72%. Разберём завтра в 11:00 — санкционные решения дают инцидентов.',
  },
  'accounts:A:': {
    title: 'Счёт открыт безупречно.',
    note: 'Всё правильно: клиент, продукт, тариф, ОТП. Отличный результат.',
  },
  'accounts:B:': {
    title: 'Счёт открыт, есть замечания.',
    note: 'Старайся работать быстрее на этапе выбора тарифа.',
  },
  'deposits:A:': {
    title: 'Вклад оформлен правильно.',
    note: 'Декларацию SOF обработал верно. Хорошая работа.',
  },
  'deposits:ПЕРЕСДАТЬ:missing_sof': {
    title: 'Пропущена декларация.',
    note: 'При сумме ≥ 50 млн UZS обязательна декларация источника средств (2-НДФЛ). Повтори сценарий.',
  },
  'transfers:A:': {
    title: 'Перевод проведён корректно.',
    note: 'Эскалация AML выполнена верно. Именно так и нужно при превышении порогов.',
  },
  'transfers:ПЕРЕСДАТЬ:aml_not_escalated': {
    title: 'Перевод с нарушением.',
    note: 'Ты провёл перевод без эскалации при превышении AML-порога. Это нарушение процедуры. Повтори сценарий.',
  },
  'cards:A:': {
    title: 'Заявка на карту оформлена.',
    note: 'Все параметры правильно. Карта отправлена в персонализацию.',
  },
}

export function getMentorFeedback(
  scenarioId: ScenarioId,
  grade: string,
  mistakeKeys: string[]
): { title: string; note: string } {
  const k1 = `${scenarioId}:${grade}:${mistakeKeys[0] ?? ''}`
  const k2 = `${scenarioId}:${grade}:`
  return (
    MENTOR_FEEDBACK[k1] ??
    MENTOR_FEEDBACK[k2] ?? {
      title: grade === 'A' ? 'Отличная работа!' : grade === 'B' ? 'Хорошо.' : 'Требует улучшения.',
      note: `Сценарий завершён с оценкой ${grade}.`,
    }
  )
}
