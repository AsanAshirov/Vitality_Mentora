import React, { useState } from 'react'
import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom'
import Shell from './components/Shell'
import SimShell from './components/SimShell'

// Screens
import Dashboard from './screens/Dashboard'
import { TasksPage } from './screens/Tasks'
import { MessagesPage } from './screens/Messages'
import { ResultsPage } from './screens/Results'
import { KycScenario } from './screens/simulator/Simulator'
import { OpenAccountScenario, DepositScenario, TransferScenario, CardIssueScenario } from './screens/simulator/Scenarios'
import { AccountsPage, DepositsPage, TransfersPage, CardsPage, SanctionsListPage, PepPage, AmlPage, HandbookPage, ActivityPage } from './screens/simulator/SimPages'
import { KnowledgePage, BadgesPage, ProfilePage, SettingsPage } from './screens/personal/PersonalScreens'
import HRDashboard from './screens/HRDashboard'
import WeekBriefModal from './components/modals/WeekBriefModal'
import SearchModal from './components/modals/SearchModal'
import { useUserStore } from './store/userStore'
import { useScenarioStore } from './store/scenarioStore'
import type { ScenarioId } from './store/userStore'

// ─── Modal context ────────────────────────────────────────────────────────────

export const ModalContext = React.createContext({
  openBrief: () => {},
  openSearch: () => {},
})

// ─── ProtectedScenario ────────────────────────────────────────────────────────

function ProtectedScenario({ id, children }: { id: ScenarioId; children: React.ReactNode }) {
  const unlocked = useUserStore(s => s.unlockedScenarios)
  const navigate = useNavigate()
  if (!unlocked.includes(id)) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <h3 style={{ marginBottom: 12 }}>Сценарий заблокирован</h3>
        <p style={{ color: 'var(--mute)', marginBottom: 20 }}>
          Сначала пройди предыдущий сценарий с оценкой ≥ 60.
        </p>
        <button className="btn" onClick={() => navigate('/simulator/kyc')}>Вернуться к KYC</button>
      </div>
    )
  }
  return <>{children}</>
}

// ─── DashboardWrapper ─────────────────────────────────────────────────────────

function DashboardWrapper() {
  const { openBrief } = React.useContext(ModalContext)
  return <Dashboard onOpenBrief={openBrief} />
}

// ─── ResultsWrapper ───────────────────────────────────────────────────────────

function ResultsWrapper() {
  const navigate = useNavigate()
  const scenarioId = useScenarioStore(s => s.id)

  const onRetry = () => {
    if (scenarioId) {
      useScenarioStore.getState().startScenario(scenarioId)
      navigate('/simulator/' + scenarioId)
    } else {
      navigate('/simulator/kyc')
    }
  }
  const onContinue = () => navigate('/')

  return <ResultsPage onRetry={onRetry} onContinue={onContinue} />
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

function AppLayout() {
  const [briefOpen, setBriefOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Cmd+K / Ctrl+K → search, Escape → close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setBriefOpen(false)
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
      <Outlet />
      <WeekBriefModal open={briefOpen} onClose={() => setBriefOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </ModalContext.Provider>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: <Shell />,
        children: [
          { path: '/', element: <DashboardWrapper /> },
          { path: '/tasks', element: <TasksPage /> },
          { path: '/messages', element: <MessagesPage /> },
          { path: '/knowledge', element: <KnowledgePage /> },
          { path: '/badges', element: <BadgesPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/results', element: <ResultsWrapper /> },
          { path: '/hr', element: <HRDashboard /> },
          {
            path: '/simulator',
            element: <SimShell />,
            children: [
              { index: true, element: <Navigate to="kyc" replace /> },
              { path: 'kyc', element: <KycScenario /> },
              { path: 'accounts', element: <ProtectedScenario id="accounts"><OpenAccountScenario /></ProtectedScenario> },
              { path: 'deposits', element: <ProtectedScenario id="deposits"><DepositScenario /></ProtectedScenario> },
              { path: 'transfers', element: <ProtectedScenario id="transfers"><TransferScenario /></ProtectedScenario> },
              { path: 'cards', element: <ProtectedScenario id="cards"><CardIssueScenario /></ProtectedScenario> },
              { path: 'sanctions', element: <SanctionsListPage /> },
              { path: 'pep', element: <PepPage /> },
              { path: 'aml', element: <AmlPage /> },
              { path: 'handbook', element: <HandbookPage /> },
              { path: 'activity', element: <ActivityPage /> },
            ],
          },
        ],
      },
    ],
  },
])
