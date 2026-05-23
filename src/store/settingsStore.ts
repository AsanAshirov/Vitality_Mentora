import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  lang: 'RU' | 'UZ' | 'EN'
  density: 'compact' | 'regular' | 'comfy'
  accent: string
  clickyEnabled: boolean
  clickyMode: 'smart' | 'ghost'
  clickyColor: string
  clickyName: string
  clickyVoice: string
  clickyLang: string
  tutorialMode: boolean
  autoHint: boolean
  silentMode: boolean
  soundEnabled: boolean
  panelOpen: boolean
  panelTab: 'clicky' | 'chat'
  railHidden: boolean
  role: 'intern' | 'hr'
  setRole: (r: 'intern' | 'hr') => void
  setLang: (l: 'RU' | 'UZ' | 'EN') => void
  setDensity: (d: 'compact' | 'regular' | 'comfy') => void
  setAccent: (a: string) => void
  setClicky: (patch: Partial<Pick<SettingsState, 'clickyEnabled'|'clickyMode'|'clickyColor'|'clickyName'|'clickyVoice'|'clickyLang'|'tutorialMode'|'autoHint'|'silentMode'|'soundEnabled'>>) => void
  togglePanel: () => void
  setPanelTab: (t: 'clicky' | 'chat') => void
  setRailHidden: (h: boolean) => void
  setPanelOpen: (o: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'RU',
      density: 'regular',
      accent: '#2046FF',
      clickyEnabled: true,
      clickyMode: 'smart',
      clickyColor: '#2046FF',
      clickyName: 'Клик',
      clickyVoice: 'Проводник',
      clickyLang: 'RU',
      tutorialMode: true,
      autoHint: true,
      silentMode: false,
      soundEnabled: true,
      panelOpen: true,
      panelTab: 'clicky',
      railHidden: false,
      role: 'intern',
      setRole: (r) => set({ role: r }),
      setLang: (l) => set({ lang: l }),
      setDensity: (d) => set({ density: d }),
      setAccent: (a) => set({ accent: a }),
      setClicky: (patch) => set(patch),
      togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
      setPanelTab: (t) => set({ panelTab: t }),
      setRailHidden: (h) => set({ railHidden: h }),
      setPanelOpen: (o) => set({ panelOpen: o }),
    }),
    { name: 'vm_settings' }
  )
)
