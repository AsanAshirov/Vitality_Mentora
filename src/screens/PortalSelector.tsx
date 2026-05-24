// PortalSelector.tsx — role-based entry point
// Choose "Стажёр" (intern app) or "HR менеджер" (HR dashboard)
import React from 'react'
import { useNavigate } from 'react-router-dom'

const ROLE_KEY = 'vitality_portal_role'

export function setPortalRole(role: 'intern' | 'hr') {
  localStorage.setItem(ROLE_KEY, role)
}

export function getPortalRole(): 'intern' | 'hr' | null {
  return (localStorage.getItem(ROLE_KEY) as 'intern' | 'hr') ?? null
}

export default function PortalSelector() {
  const navigate = useNavigate()

  const enter = (role: 'intern' | 'hr') => {
    setPortalRole(role)
    navigate(role === 'hr' ? '/hr' : '/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      fontFamily: 'var(--font-sans, system-ui)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--cobalt)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 18, fontWeight: 700,
        }}>M</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>Vitality Mentora</span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--mute)', marginBottom: 48 }}>
        Выберите роль для входа
      </p>

      {/* Cards */}
      <div style={{ display: 'flex', gap: 20 }}>

        {/* Intern card */}
        <button
          onClick={() => enter('intern')}
          style={{
            width: 240,
            padding: '32px 28px',
            borderRadius: 20,
            background: 'var(--surface)',
            border: '1.5px solid var(--line)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color .15s, box-shadow .15s',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--cobalt)'
            el.style.boxShadow = '0 4px 24px rgba(32,70,255,0.18)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--line)'
            el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--cobalt-50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 18,
          }}>🎓</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
            Стажёр
          </div>
          <div style={{ fontSize: 13, color: 'var(--mute)', lineHeight: 1.5 }}>
            Симулятор, задания, знания, награды и прогресс обучения.
          </div>
          <div style={{
            marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 13, fontWeight: 600, color: 'var(--cobalt)',
          }}>
            Войти →
          </div>
        </button>

        {/* HR card */}
        <button
          onClick={() => enter('hr')}
          style={{
            width: 240,
            padding: '32px 28px',
            borderRadius: 20,
            background: 'var(--surface)',
            border: '1.5px solid var(--line)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color .15s, box-shadow .15s',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--cobalt)'
            el.style.boxShadow = '0 4px 24px rgba(32,70,255,0.18)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--line)'
            el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--cobalt-50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 18,
          }}>🏢</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
            HR менеджер
          </div>
          <div style={{ fontSize: 13, color: 'var(--mute)', lineHeight: 1.5 }}>
            Прогресс стажёров, когорты, задания и аналитика обучения.
          </div>
          <div style={{
            marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 13, fontWeight: 600, color: 'var(--cobalt)',
          }}>
            Войти →
          </div>
        </button>

      </div>

      <p style={{ marginTop: 40, fontSize: 12, color: 'var(--mute)' }}>
        Vitality Mentora · Банковский симулятор
      </p>
    </div>
  )
}
