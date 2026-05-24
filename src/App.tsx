import React, { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router, ModalContext } from './router'
import { useSettingsStore } from './store/settingsStore'
import { useUserStore } from './store/userStore'
import Clicky from './components/Clicky'
import SidePanel from './components/SidePanel'
import AiAssistant from './components/AiAssistant'

export default function App() {
  const {
    density,
    accent,
    clickyEnabled,
    clickyMode,
    clickyColor,
    tutorialMode,
    silentMode,
  } = useSettingsStore()
  const { checkStreak } = useUserStore()
  const [summoned, setSummoned] = useState(false)
  const [_ptt, setPtt] = useState(false)
  const [briefOpen, setBriefOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Apply CSS vars and density class
  useEffect(() => {
    document.body.className = `density-${density}`
    document.documentElement.style.setProperty('--cobalt', accent)
    document.documentElement.style.setProperty('--cobalt-glow', accent + '2e')
    document.documentElement.style.setProperty('--cobalt-50', accent + '0f')
  }, [density, accent])

  // Check streak on app load
  useEffect(() => { checkStreak() }, [])

  // Keyboard: backtick = PTT, Ctrl+K = search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '`') { e.preventDefault(); setPtt(true); setSummoned(true) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === '`') { setPtt(false); setSummoned(false) }
    }
    document.addEventListener('keydown', down)
    document.addEventListener('keyup', up)
    return () => {
      document.removeEventListener('keydown', down)
      document.removeEventListener('keyup', up)
    }
  }, [])

  const modalCtx = React.useMemo(
    () => ({
      openBrief: () => setBriefOpen(true),
      openSearch: () => setSearchOpen(true),
    }),
    []
  )

  return (
    <ModalContext.Provider value={modalCtx}>
      <RouterProvider router={router} />
      {clickyEnabled && (
        <Clicky
          enabled={clickyEnabled}
          mode={clickyMode}
          summoned={summoned}
          setSummoned={setSummoned}
          autoSummoned={tutorialMode && !silentMode}
          color={clickyColor}
        />
      )}
      <SidePanel summoned={summoned} setSummoned={setSummoned} />
      <AiAssistant />
    </ModalContext.Provider>
  )
}
