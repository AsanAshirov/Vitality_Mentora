import { create } from 'zustand'
import type { ScenarioId, RunSummary } from './userStore'

interface ScenarioState {
  id: ScenarioId | null
  stepIndex: number
  startTime: number
  hintsUsed: number
  choices: Record<string, unknown>
  pendingRun: RunSummary | null
  startScenario: (id: ScenarioId) => void
  setStep: (idx: number) => void
  recordChoice: (stepId: string, value: unknown) => void
  useHint: () => void
  setPendingRun: (run: RunSummary) => void
  clearScenario: () => void
}

export const useScenarioStore = create<ScenarioState>()((set, _get) => ({
  id: null,
  stepIndex: 0,
  startTime: Date.now(),
  hintsUsed: 0,
  choices: {},
  pendingRun: null,

  startScenario: (id) => set({
    id,
    stepIndex: 0,
    startTime: Date.now(),
    hintsUsed: 0,
    choices: {},
    pendingRun: null,
  }),

  setStep: (idx) => set({ stepIndex: idx }),

  recordChoice: (stepId, value) => set((s) => ({
    choices: { ...s.choices, [stepId]: value }
  })),

  useHint: () => set((s) => ({ hintsUsed: s.hintsUsed + 1 })),

  setPendingRun: (run) => set({ pendingRun: run }),

  clearScenario: () => set({
    id: null,
    stepIndex: 0,
    hintsUsed: 0,
    choices: {},
    pendingRun: null,
  }),
}))
