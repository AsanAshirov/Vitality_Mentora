import type { ScenarioId, StepResult } from '../store/userStore'

export interface ScoreBreakdown {
  steps: StepResult[]
  total: number
  xpEarned: number
  grade: 'A' | 'B' | 'C' | 'ПЕРЕСДАТЬ'
  mistakeKeys: string[]
}

interface RunMeta {
  timeMs: number
  hintsUsed: number
}

export function scoreKyc(choices: Record<string, unknown>, meta: RunMeta): ScoreBreakdown {
  const sanctionsAction = choices['sanctions'] as string | undefined
  const escal = sanctionsAction === 'escal'
  const override = sanctionsAction === 'override'
  const timePts = meta.timeMs < 600_000 ? 15 : meta.timeMs < 900_000 ? 13 : 9
  const timePct = meta.timeMs < 600_000 ? 100 : meta.timeMs < 900_000 ? 84 : 60

  const steps: StepResult[] = [
    { stepId: 'lookup',    label: 'Поиск клиента',             pct: 100, pts: 15 },
    { stepId: 'id',        label: 'Проверка личности',          pct: 100, pts: 15 },
    { stepId: 'sanctions', label: 'Обработка санкций',
      pct: escal ? 100 : override ? 0 : 60,
      pts: escal ? 25  : override ? -20 : 15 },
    { stepId: 'sof',       label: 'Источник средств',           pct: 100, pts: 15 },
    { stepId: 'risk',      label: 'Оценка риска',               pct: 92,  pts: 14 },
    { stepId: 'time',      label: 'Эффективность по времени',   pct: timePct, pts: timePts },
  ]
  const hintPenalty = Math.min(meta.hintsUsed * 2, 10)
  const raw = steps.reduce((s, x) => s + x.pts, 0)
  const total = Math.max(0, Math.min(100, raw - hintPenalty))
  const xpEarned = escal ? 80 : override ? 25 : 50
  const mistakeKeys: string[] = []
  if (override) mistakeKeys.push('sanctions_override')
  else if (!escal) mistakeKeys.push('sanctions_cleared')
  if (meta.hintsUsed > 3) mistakeKeys.push('many_hints')
  return { steps, total, xpEarned, grade: total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : 'ПЕРЕСДАТЬ', mistakeKeys }
}

export function scoreAccount(choices: Record<string, unknown>, meta: RunMeta): ScoreBreakdown {
  const timePts = meta.timeMs < 480_000 ? 10 : 7
  const timePct = meta.timeMs < 480_000 ? 100 : 70
  const steps: StepResult[] = [
    { stepId: 'customer', label: 'Выбор клиента',    pct: 100, pts: 20 },
    { stepId: 'product',  label: 'Продукт и валюта', pct: 100, pts: 25 },
    { stepId: 'terms',    label: 'Тариф',             pct: 100, pts: 25 },
    { stepId: 'sign',     label: 'Документы и ОТП',   pct: 100, pts: 20 },
    { stepId: 'time',     label: 'Эффективность',     pct: timePct, pts: timePts },
  ]
  const hintPenalty = Math.min(meta.hintsUsed * 2, 10)
  const total = Math.max(0, steps.reduce((s, x) => s + x.pts, 0) - hintPenalty)
  return { steps, total, xpEarned: 50, grade: total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : 'ПЕРЕСДАТЬ', mistakeKeys: [] }
}

export function scoreDeposit(choices: Record<string, unknown>, meta: RunMeta): ScoreBreakdown {
  const amount = (choices['amount'] as number) ?? 0
  const needsSof = amount >= 50_000_000
  const sofUploaded = choices['sofUploaded'] as boolean
  const sofOk = !needsSof || sofUploaded
  const timePts = meta.timeMs < 480_000 ? 10 : 7
  const timePct = meta.timeMs < 480_000 ? 100 : 70
  const steps: StepResult[] = [
    { stepId: 'client',  label: 'Клиент и сумма',  pct: 100, pts: 20 },
    { stepId: 'terms',   label: 'Срок и ставка',   pct: 100, pts: 25 },
    { stepId: 'sof',     label: 'Источник средств', pct: sofOk ? 100 : 0, pts: sofOk ? 25 : 0 },
    { stepId: 'confirm', label: 'Подтверждение',    pct: 100, pts: 20 },
    { stepId: 'time',    label: 'Эффективность',    pct: timePct, pts: timePts },
  ]
  const hintPenalty = Math.min(meta.hintsUsed * 2, 10)
  const total = Math.max(0, steps.reduce((s, x) => s + x.pts, 0) - hintPenalty)
  const mistakeKeys: string[] = []
  if (!sofOk) mistakeKeys.push('missing_sof')
  return { steps, total, xpEarned: 70, grade: total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : 'ПЕРЕСДАТЬ', mistakeKeys }
}

export function scoreTransfer(choices: Record<string, unknown>, meta: RunMeta): ScoreBreakdown {
  const amount = (choices['amount'] as number) ?? 0
  const cur = (choices['cur'] as string) ?? 'UZS'
  const amlChoice = choices['amlChoice'] as string | undefined
  const highRisk = amount > (cur === 'UZS' ? 100_000_000 : 10_000)
  const amlOk = !highRisk || amlChoice === 'escal'
  const timePts = meta.timeMs < 600_000 ? 10 : 7
  const timePct = meta.timeMs < 600_000 ? 100 : 70
  const steps: StepResult[] = [
    { stepId: 'from', label: 'Отправитель',    pct: 100, pts: 15 },
    { stepId: 'to',   label: 'Получатель',     pct: 100, pts: 15 },
    { stepId: 'amt',  label: 'Сумма и валюта', pct: 100, pts: 20 },
    { stepId: 'aml',  label: 'AML проверка',   pct: amlOk ? 100 : 0, pts: amlOk ? 30 : -10 },
    { stepId: 'conf', label: 'Подтверждение',  pct: 100, pts: 10 },
    { stepId: 'time', label: 'Эффективность',  pct: timePct, pts: timePts },
  ]
  const hintPenalty = Math.min(meta.hintsUsed * 2, 10)
  const total = Math.max(0, steps.reduce((s, x) => s + x.pts, 0) - hintPenalty)
  const xpEarned = amlOk ? 65 : 30
  const mistakeKeys: string[] = []
  if (!amlOk) mistakeKeys.push('aml_not_escalated')
  return { steps, total, xpEarned, grade: total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : 'ПЕРЕСДАТЬ', mistakeKeys }
}

export function scoreCard(choices: Record<string, unknown>, meta: RunMeta): ScoreBreakdown {
  const timePts = meta.timeMs < 360_000 ? 10 : 7
  const timePct = meta.timeMs < 360_000 ? 100 : 70
  const steps: StepResult[] = [
    { stepId: 'client',  label: 'Клиент',       pct: 100, pts: 20 },
    { stepId: 'product', label: 'Тип карты',    pct: 100, pts: 30 },
    { stepId: 'params',  label: 'Параметры',    pct: 100, pts: 25 },
    { stepId: 'review',  label: 'Заявка',       pct: 100, pts: 15 },
    { stepId: 'time',    label: 'Эффективность', pct: timePct, pts: timePts },
  ]
  const hintPenalty = Math.min(meta.hintsUsed * 2, 10)
  const total = Math.max(0, steps.reduce((s, x) => s + x.pts, 0) - hintPenalty)
  return { steps, total, xpEarned: 40, grade: total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : 'ПЕРЕСДАТЬ', mistakeKeys: [] }
}

export function scoreScenario(
  scenarioId: ScenarioId,
  choices: Record<string, unknown>,
  meta: RunMeta
): ScoreBreakdown {
  switch (scenarioId) {
    case 'kyc':       return scoreKyc(choices, meta)
    case 'accounts':  return scoreAccount(choices, meta)
    case 'deposits':  return scoreDeposit(choices, meta)
    case 'transfers': return scoreTransfer(choices, meta)
    case 'cards':     return scoreCard(choices, meta)
  }
}
