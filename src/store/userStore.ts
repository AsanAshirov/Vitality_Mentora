import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ScenarioId = 'kyc' | 'accounts' | 'deposits' | 'transfers' | 'cards'
export type SkillId = 'kyc' | 'deposits' | 'transfers' | 'sanctions' | 'cards' | 'aml'
export type Lang = 'RU' | 'UZ' | 'EN'

export interface StepResult {
  stepId: string
  label: string
  pct: number
  pts: number
}

export interface RunSummary {
  id: string
  scenarioId: ScenarioId
  completedAt: string  // ISO date string
  score: number        // 0-100
  grade: 'A' | 'B' | 'C' | 'ПЕРЕСДАТЬ'
  xpEarned: number
  timeMs: number
  hintsUsed: number
  steps: StepResult[]
  choices: Record<string, unknown>
  newBadges: string[]  // badge IDs unlocked on this run
  mistakeKeys?: string[]
}

export interface BadgeState {
  id: string
  unlockedAt?: string  // ISO date string if unlocked
  progress?: number    // current value for progress badges
}

interface UserState {
  xp: number
  level: number
  streak: number
  lastActive: string   // YYYY-MM-DD
  unlockedScenarios: ScenarioId[]
  completedRuns: RunSummary[]
  badges: BadgeState[]
  skills: Record<SkillId, { pct: number; hours: number }>
  addXp: (n: number) => void
  addRun: (run: RunSummary) => void
  unlockBadge: (id: string) => void
  updateSkill: (id: SkillId, pctDelta: number, hoursDelta?: number) => void
  unlockScenario: (id: ScenarioId) => void
  checkStreak: () => void
  resetProgress: () => void
}

const INITIAL_BADGES: BadgeState[] = [
  { id: 'first-kyc' },
  { id: 'first-deposit' },
  { id: 'swift-master' },
  { id: 'card-issuer' },
  { id: 'perfectionist' },
  { id: 'no-hints' },
  { id: 'accuracy-95' },
  { id: 'compliance-pro' },
  { id: 'anti-aml' },
  { id: 'streak-7', progress: 0 },
  { id: 'streak-30', progress: 0 },
  { id: 'night-owl', unlockedAt: new Date().toISOString() },
  { id: 'early-bird' },
  { id: 'polyglot', unlockedAt: new Date().toISOString() },
  { id: 'asked-mentor', unlockedAt: new Date().toISOString() },
  { id: 'top-3' },
]

const INITIAL_SKILLS: Record<SkillId, { pct: number; hours: number }> = {
  kyc: { pct: 78, hours: 12.4 },
  deposits: { pct: 42, hours: 3.1 },
  transfers: { pct: 28, hours: 1.8 },
  sanctions: { pct: 64, hours: 5.7 },
  cards: { pct: 18, hours: 0.6 },
  aml: { pct: 12, hours: 0.4 },
}

const LEVEL_THRESHOLDS = [0, 500, 1200, 2200, 3500, 5000, 7000]

function computeLevel(xp: number): number {
  let lv = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) lv = i + 1
    else break
  }
  return lv
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      xp: 1480,
      level: 3,
      streak: 5,
      lastActive: new Date().toISOString().slice(0, 10),
      unlockedScenarios: ['kyc'],
      completedRuns: [],
      badges: INITIAL_BADGES,
      skills: INITIAL_SKILLS,

      addXp: (n) => set((s) => {
        const newXp = s.xp + n
        return { xp: newXp, level: computeLevel(newXp) }
      }),

      addRun: (run) => set((s) => {
        const runs = [...s.completedRuns, run]
        // unlock next scenario based on completion
        const unlocked = new Set(s.unlockedScenarios)
        const CHAIN: [ScenarioId, ScenarioId, number][] = [
          ['kyc', 'accounts', 60],
          ['accounts', 'deposits', 60],
          ['deposits', 'transfers', 60],
          ['transfers', 'cards', 60],
        ]
        for (const [req, next, minScore] of CHAIN) {
          if (!unlocked.has(next) && runs.some(r => r.scenarioId === req && r.score >= minScore)) {
            unlocked.add(next)
          }
        }
        return { completedRuns: runs, unlockedScenarios: Array.from(unlocked) }
      }),

      unlockBadge: (id) => set((s) => ({
        badges: s.badges.map(b => b.id === id && !b.unlockedAt
          ? { ...b, unlockedAt: new Date().toISOString() }
          : b
        )
      })),

      updateSkill: (id, pctDelta, hoursDelta = 0.5) => set((s) => ({
        skills: {
          ...s.skills,
          [id]: {
            pct: Math.min(100, s.skills[id].pct + pctDelta),
            hours: s.skills[id].hours + hoursDelta,
          }
        }
      })),

      unlockScenario: (id) => set((s) => ({
        unlockedScenarios: s.unlockedScenarios.includes(id)
          ? s.unlockedScenarios
          : [...s.unlockedScenarios, id]
      })),

      checkStreak: () => {
        const today = new Date().toISOString().slice(0, 10)
        const last = get().lastActive
        if (last === today) return
        const diff = (new Date(today).getTime() - new Date(last).getTime()) / 86400000
        set((s) => ({
          streak: diff <= 1 ? s.streak + 1 : 1,
          lastActive: today,
          badges: s.badges.map(b => {
            if (b.id === 'streak-7') return { ...b, progress: Math.min(7, (b.progress ?? 0) + (diff <= 1 ? 1 : 1)) }
            if (b.id === 'streak-30') return { ...b, progress: Math.min(30, (b.progress ?? 0) + (diff <= 1 ? 1 : 1)) }
            return b
          })
        }))
      },

      resetProgress: () => set({
        xp: 0,
        level: 1,
        streak: 1,
        unlockedScenarios: ['kyc'],
        completedRuns: [],
        badges: INITIAL_BADGES,
        skills: INITIAL_SKILLS,
      }),
    }),
    { name: 'vm_user' }
  )
)
