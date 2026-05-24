// clickyStore.ts — transient state for the Clicky voice agent (not persisted)
import { create } from 'zustand'

interface ClickyVoiceState {
  listening: boolean
  active: boolean
  target: string | null
  bubble: string
  streaming: boolean

  setListening(v: boolean): void
  setActive(v: boolean): void
  setTarget(t: string | null): void
  setBubble(text: string, streaming: boolean): void
  dismiss(): void
}

export const useClickyStore = create<ClickyVoiceState>((set) => ({
  listening: false,
  active: false,
  target: null,
  bubble: '',
  streaming: false,

  setListening: (v) => set({ listening: v }),
  setActive: (v) => set({ active: v }),
  setTarget: (t) => set({ target: t }),
  setBubble: (text, streaming) => set({ bubble: text, streaming }),
  dismiss: () => set({ active: false, target: null, bubble: '', streaming: false }),
}))
