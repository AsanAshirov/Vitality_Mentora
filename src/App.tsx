import React, { useEffect, useRef, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router, ModalContext } from './router'
import { useSettingsStore } from './store/settingsStore'
import { useUserStore } from './store/userStore'
import { useClickyStore } from './store/clickyStore'
import Clicky from './components/Clicky'
import SidePanel from './components/SidePanel'
import AiAssistant from './components/AiAssistant'
import HrApp from './hr/HrApp'
import RoleSwitcher from './hr/RoleSwitcher'
import { startListening, isSTTSupported } from './lib/stt'
import { processVoiceInput, cancelVoiceAgent } from './lib/voiceAgent'

export default function App() {
  const {
    density,
    accent,
    clickyEnabled,
    clickyMode,
    clickyColor,
    tutorialMode,
    silentMode,
    role,
    lang,
  } = useSettingsStore()
  const { checkStreak } = useUserStore()
  const clickyStore = useClickyStore()
  const [summoned, setSummoned] = useState(false)
  const [_ptt, setPtt] = useState(false)
  const [briefOpen, setBriefOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const stopSTTRef = useRef<(() => void) | null>(null)

  // Apply CSS vars and density class
  useEffect(() => {
    document.body.className = `density-${density}`
    document.documentElement.style.setProperty('--cobalt', accent)
    document.documentElement.style.setProperty('--cobalt-glow', accent + '2e')
    document.documentElement.style.setProperty('--cobalt-50', accent + '0f')
  }, [density, accent])

  // Check streak on app load
  useEffect(() => { checkStreak() }, [])

  // Keyboard: backtick = PTT voice agent, Ctrl+K = search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '`' && !e.repeat) {
        e.preventDefault()
        setPtt(true)
        setSummoned(true)
        clickyStore.setListening(true)
        if (isSTTSupported() && clickyEnabled) {
          stopSTTRef.current = startListening(
            lang as 'RU' | 'UZ' | 'EN',
            (text) => {
              clickyStore.setListening(false)
              processVoiceInput(text, lang as 'RU' | 'UZ' | 'EN')
            },
            () => {
              clickyStore.setListening(false)
            },
          )
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === '`') {
        setPtt(false)
        setSummoned(false)
        clickyStore.setListening(false)
        stopSTTRef.current?.()
        stopSTTRef.current = null
      }
    }
    document.addEventListener('keydown', down)
    document.addEventListener('keyup', up)
    return () => {
      document.removeEventListener('keydown', down)
      document.removeEventListener('keyup', up)
    }
  }, [clickyEnabled, lang])

  // Cancel voice agent on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setBriefOpen(false)
        cancelVoiceAgent()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
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
      {role === 'hr' ? (
        <HrApp />
      ) : (
        <>
          <RouterProvider router={router} />
          {clickyEnabled && (
            <Clicky
              enabled={clickyEnabled}
              mode={clickyMode}
              summoned={summoned || clickyStore.active}
              setSummoned={setSummoned}
              autoSummoned={tutorialMode && !silentMode}
              color={clickyColor}
            />
          )}
          <SidePanel summoned={summoned} setSummoned={setSummoned} />
          <AiAssistant />
        </>
      )}
      <RoleSwitcher />
    </ModalContext.Provider>
  )
}
