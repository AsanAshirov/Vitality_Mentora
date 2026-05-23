import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { I } from '../Icons'
import { SYNTH } from '../../data/synth'

const TASKS = [
  { id: 'T-2148', title: 'KYC клиента Соколов', route: '/tasks' },
  { id: 'T-2150', title: 'Открытие счёта', route: '/tasks' },
  { id: 'T-2155', title: 'SWIFT-перевод', route: '/tasks' },
]

interface Props { open: boolean; onClose: () => void }

export default function SearchModal({ open, onClose }: Props) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 50) } }, [open])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  const ql = q.toLowerCase().trim()
  const customers = ql ? SYNTH.CUSTOMERS.filter(c => c.name.toLowerCase().includes(ql) || c.id.toLowerCase().includes(ql)) : []
  const handbook = ql ? SYNTH.HANDBOOK.filter(h => h.title.toLowerCase().includes(ql) || h.tags.some((t: string) => t.toLowerCase().includes(ql))) : []
  const tasks = ql ? TASKS.filter(t => t.title.toLowerCase().includes(ql) || t.id.toLowerCase().includes(ql)) : []
  const hasResults = customers.length + handbook.length + tasks.length > 0

  const go = (route: string) => { navigate(route); onClose() }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-input-row">
          <I.Search size={16} />
          <input ref={inputRef} className="search-modal-input" placeholder="Поиск процедур, клиентов, задач…" value={q} onChange={e => setQ(e.target.value)} />
          {q && <button className="btn ghost" style={{padding:'2px 6px'}} onClick={() => setQ('')}><I.X size={14}/></button>}
        </div>
        {ql && (
          <div className="search-results">
            {customers.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">Клиенты</div>
                {customers.map(c => (
                  <button key={c.id} className="search-result-row" onClick={() => go('/simulator/accounts')}>
                    <span className="avatar-chip" style={{background:'var(--cobalt-tint)',color:'var(--cobalt)',width:28,height:28,borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:11,marginRight:8}}>{c.short}</span>
                    <span>{c.name}</span><span className="mute" style={{marginLeft:'auto',fontSize:12}}>{c.id}</span>
                  </button>
                ))}
              </div>
            )}
            {handbook.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">Справочник</div>
                {handbook.map(h => (
                  <button key={h.id} className="search-result-row" onClick={() => go('/simulator/handbook')}>
                    <I.Doc size={14} style={{marginRight:8, flexShrink:0}} />
                    <span>{h.title}</span><span className="mute" style={{marginLeft:'auto',fontSize:12}}>{h.id}</span>
                  </button>
                ))}
              </div>
            )}
            {tasks.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">Задачи</div>
                {tasks.map(t => (
                  <button key={t.id} className="search-result-row" onClick={() => go(t.route)}>
                    <I.Play size={14} style={{marginRight:8, flexShrink:0}} />
                    <span>{t.title}</span><span className="mute" style={{marginLeft:'auto',fontSize:12}}>{t.id}</span>
                  </button>
                ))}
              </div>
            )}
            {!hasResults && <div className="search-no-results">Ничего не найдено по запросу «{q}»</div>}
          </div>
        )}
        {!ql && (
          <div className="search-results">
            <div className="search-no-results" style={{padding:'16px 0'}}>Начни вводить для поиска…</div>
          </div>
        )}
      </div>
    </div>
  )
}
