import { useSettingsStore } from '../store/settingsStore'

export default function RoleSwitcher() {
  const { role, setRole } = useSettingsStore()
  return (
    <button
      onClick={() => setRole(role === 'intern' ? 'hr' : 'intern')}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        height: 28,
        padding: '0 10px',
        borderRadius: 6,
        background: 'var(--ink)',
        color: 'white',
        border: '0',
        font: '500 10px/1 var(--font-mono)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        opacity: 0.6,
        transition: 'opacity 0.15s',
      }}
    >
      {role === 'intern' ? '→ HR' : '→ Стажёр'}
    </button>
  )
}
