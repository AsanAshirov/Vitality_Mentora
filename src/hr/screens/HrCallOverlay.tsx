// HrCallOverlay.tsx — active video/voice call

import { useState, useEffect, useRef } from 'react'
import hrData from '../hrData'
import { hrToast, MenuPopover } from '../hrToast'
import { Ihr } from '../iconsHr'
import type { Employee } from '../hrTypes'

interface HrCallOverlayProps {
  peerSpec: number | string
  mode: string
  onEnd: () => void
}

function fmtTime(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(sec).padStart(2, '0')}`
}

export default function HrCallOverlay({ peerSpec, mode, onEnd }: HrCallOverlayProps) {
  // peerSpec is either number (employee id) or "group:gID"
  const isGroup = typeof peerSpec === 'string' && peerSpec.startsWith('group:')
  const group = isGroup ? hrData.GROUPS.find(g => g.id === (peerSpec as string).slice(6)) : null
  const peers: Employee[] = isGroup
    ? group!.members.slice(0, 4).map(id => hrData.EMPLOYEES.find(e => e.id === id)!)
    : [hrData.EMPLOYEES.find(e => e.id === peerSpec)!]

  const [seconds, setSeconds] = useState(0)
  const [camOff, setCamOff] = useState(false)
  const [micOff, setMicOff] = useState(false)
  const [hand, setHand] = useState(false)
  const [tab, setTab] = useState('chat')
  const [speakerIdx, setSpeakerIdx] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [reactionEmoji, setReactionEmoji] = useState<string | null>(null)
  const moreRef = useRef<HTMLButtonElement>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [callNotes, setCallNotes] = useState<string[]>(['Никита — топ, предложить менторство'])
  const [noteInput, setNoteInput] = useState('')

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (peers.length < 2) return
    const t = setInterval(() => setSpeakerIdx(i => (i + 1) % peers.length), 3500)
    return () => clearInterval(t)
  }, [peers.length])

  const tileCount = peers.length + 1 // include self
  const tileCls = tileCount === 1 ? 'n1' : tileCount === 2 ? 'n2' : tileCount === 3 ? 'n3' : tileCount === 4 ? 'n4' : tileCount === 5 ? 'n5' : 'n6'

  return (
    <div className="call-overlay">
      <div className="call-bar">
        <div className="left">
          <div className="call-pip"/>
          <h3>
            {isGroup ? group!.name : peers[0].name}
            {mode === 'video' ? ' · Видеосвязь' : ' · Голосовой звонок'}
          </h3>
          <span className="timer">{fmtTime(seconds)}</span>
        </div>
        <div className="right">
          <button className="call-bar-btn" onClick={() => hrToast('Открыты заметки встречи', { sub: 'Заметка попадёт в карточку участника' })}><Ihr.Doc size={14}/> Заметки</button>
          <button
            className="call-bar-btn"
            style={isRecording ? {boxShadow:'0 0 0 3px var(--bad)'} : undefined}
            onClick={() => { setIsRecording(v => !v); if (!isRecording) hrToast('Запись началась', {kind:'warn'}); else hrToast('Запись остановлена', {kind:'good',sub:'Файл сохранён'}); }}
          ><Ihr.Activity size={14}/> Запись</button>
          <button ref={moreRef} className="call-bar-btn" onClick={() => setMoreOpen(v => !v)}><Ihr.More size={14}/></button>
        </div>
      </div>

      <div className="call-stage">
        <div className={'tile-grid ' + tileCls}>
          {peers.map((p, i) => (
            <div className={'vtile' + (i === speakerIdx ? ' speaking' : '')} key={p.id} style={{position:'relative'}}>
              <div className="bg-grid"/>
              {mode === 'video' && !camOff ? (
                <div className={'face ' + p.avClass + (i === speakerIdx ? ' speaking-pulse' : '')}>{p.initials}</div>
              ) : (
                <div className={'face ' + p.avClass}>{p.initials}</div>
              )}
              <span className="label">
                {p.name}
                {i === 0 && micOff ? <Ihr.MicOff size={12} className="mic-off"/> : null}
              </span>
              {reactionEmoji && i === speakerIdx && <span style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',fontSize:28}}>{reactionEmoji}</span>}
            </div>
          ))}
          <div className="vtile self">
            <div className="bg-grid"/>
            {mode === 'video' && !camOff ? (
              <div className={'face ' + hrData.HR_USER.avClass}>{hrData.HR_USER.initials}</div>
            ) : (
              <div className="face av-1">{hrData.HR_USER.initials}</div>
            )}
            <span className="label">
              Вы (Ольга)
              {micOff ? <Ihr.MicOff size={12} style={{color:'#FF6A5C'}}/> : null}
              {camOff && mode === 'video' ? <Ihr.CamOff size={12} style={{color:'#FF6A5C'}}/> : null}
            </span>
          </div>
        </div>

        <div className="call-side">
          <div className="call-side-tabs">
            <button className={'call-side-tab' + (tab === 'chat' ? ' active' : '')} onClick={() => setTab('chat')}>Чат</button>
            <button className={'call-side-tab' + (tab === 'people' ? ' active' : '')} onClick={() => setTab('people')}>Участники · {peers.length + 1}</button>
            <button className={'call-side-tab' + (tab === 'notes' ? ' active' : '')} onClick={() => setTab('notes')}>Заметки</button>
          </div>
          <div className="call-side-body">
            {tab === 'chat' ? (
              <>
                <div className="cs-msg">
                  <div className="head"><b>Система</b><span className="t">{fmtTime(0)}</span></div>
                  <p>Звонок начат. Запись включена.</p>
                </div>
                {isGroup ? (
                  <>
                    <div className="cs-msg">
                      <div className="head"><b>{peers[0].name.split(' ')[0]}</b><span className="t">0:18</span></div>
                      <p>Привет всем! Готов разобрать вчерашний сценарий.</p>
                    </div>
                    <div className="cs-msg">
                      <div className="head"><b>{peers[1]?.name.split(' ')[0] || '—'}</b><span className="t">0:42</span></div>
                      <p>+1, у меня тоже есть вопрос по эскалации</p>
                    </div>
                    <div className="cs-msg">
                      <div className="head"><b>Ольга</b><span className="t">1:05</span></div>
                      <p>Отлично. Начнём с записи Никиты, потом разберём вопрос Алины.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="cs-msg">
                      <div className="head"><b>{peers[0].name.split(' ')[0]}</b><span className="t">0:24</span></div>
                      <p>Здравствуйте! Готов к разбору записи.</p>
                    </div>
                    <div className="cs-msg">
                      <div className="head"><b>Ольга</b><span className="t">0:38</span></div>
                      <p>Привет! Запускаю запись на таймкоде 4:18 — посмотрим вместе.</p>
                    </div>
                  </>
                )}
              </>
            ) : tab === 'people' ? (
              <>
                <div className="cs-participant">
                  <div className={'av ' + hrData.HR_USER.avClass}>{hrData.HR_USER.initials}</div>
                  <div>
                    <div>Ольга Карпова <span className="role-tag">· ведущий</span></div>
                  </div>
                  <span/>
                  <span className={'mic-state' + (micOff ? ' muted' : '')}>
                    {micOff ? <Ihr.MicOff size={14}/> : <Ihr.Mic size={14}/>}
                  </span>
                </div>
                {peers.map((p, i) => (
                  <div className="cs-participant" key={p.id}>
                    <div className={'av ' + p.avClass}>{p.initials}</div>
                    <div>
                      <div>{p.name}</div>
                    </div>
                    <span className="role-tag">{p.team}</span>
                    <span className={'mic-state ' + (i === speakerIdx ? 'speaking' : '')}>
                      <Ihr.Mic size={14}/>
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{color:'rgba(255,255,255,0.7)', fontSize:12.5, lineHeight:1.5}}>
                <b style={{color:'white', display:'block', marginBottom:8, fontWeight:500}}>Заметки встречи</b>
                <div style={{padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:8, marginBottom:8}}>
                  • Таймкод 4:18 — обсудить мост-фразу из «Эмпатии 2.0»
                </div>
                <div style={{padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:8, marginBottom:8}}>
                  • Назначить пересдачу «Антифрод» на пятницу
                </div>
                <div style={{padding:'10px 12px', background:'rgba(32,70,255,0.18)', borderRadius:8, color:'white'}}>
                  <span style={{color:'#92AEFF', fontSize:11, fontFamily:'var(--font-mono)', letterSpacing:0.4, textTransform:'uppercase'}}>To-do · добавлено сейчас</span>
                  <div style={{marginTop:4}}>Прислать материалы по работе с возражениями</div>
                </div>
                {callNotes.map((note, idx) => (
                  <div key={idx} style={{padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:8, marginTop:8}}>
                    • {note}
                  </div>
                ))}
                <div style={{marginTop:12}}>
                  <input
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    onKeyDown={e => { if (e.key==='Enter' && noteInput.trim()) { setCallNotes(n=>[noteInput,...n]); setNoteInput(''); hrToast('Заметка добавлена',{kind:'good'}); } }}
                    placeholder="Добавить заметку… Enter"
                    style={{width:'100%',height:32,padding:'0 10px',border:'1px solid var(--line-2)',borderRadius:'var(--r-sm)',background:'var(--paper)',fontSize:12}}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="call-controls" style={{position:'relative'}}>
        {showReactions && (
          <div style={{position:'absolute', bottom:72, left:'50%', transform:'translateX(-50%)', background:'var(--surface)', border:'1px solid var(--line-2)', borderRadius:'var(--r-lg)', padding:'10px 14px', display:'flex', gap:10, fontSize:22, boxShadow:'var(--shadow-lg)', zIndex:10}}>
            {['🎉','👍','✋','✅','💡','🔥','😊','💪'].map(em => (
              <span key={em} style={{cursor:'pointer'}} onClick={() => {
                setReactionEmoji(em)
                setShowReactions(false)
                setTimeout(() => setReactionEmoji(null), 2000)
              }}>{em}</span>
            ))}
          </div>
        )}
        <button className={'cc-btn' + (micOff ? ' off' : '')} onClick={() => setMicOff(v => !v)} title="Микрофон">
          {micOff ? <Ihr.MicOff size={18}/> : <Ihr.Mic size={18}/>}
        </button>
        {mode === 'video' ? (
          <button className={'cc-btn' + (camOff ? ' off' : '')} onClick={() => setCamOff(v => !v)} title="Камера">
            {camOff ? <Ihr.CamOff size={18}/> : <Ihr.Video size={18}/>}
          </button>
        ) : null}
        <button
          className="cc-btn"
          title="Демонстрация экрана"
          style={isSharing ? {background:'var(--cobalt)',color:'white'} : undefined}
          onClick={() => { setIsSharing(v => !v); hrToast(isSharing ? 'Демонстрация остановлена' : 'Демонстрация экрана включена', {kind: isSharing ? 'good' : 'warn'}); }}
        >
          <Ihr.Screen size={18}/>
        </button>
        <button className={'cc-btn' + (hand ? ' off' : '')} onClick={() => { setHand(v => !v); hrToast(hand ? 'Рука опущена' : 'Рука поднята', { kind: hand ? undefined : 'warn' }); }} title="Поднять руку">
          <Ihr.Hand size={18}/>
        </button>
        <button className="cc-btn" title="Реакция" onClick={() => setShowReactions(v => !v)}>
          <Ihr.Smile size={18}/>
        </button>
        <button className="cc-btn" title="Участники"
                onClick={() => setTab('people')}>
          <Ihr.Team size={18}/>
        </button>
        <button className="cc-btn end" onClick={onEnd} title="Завершить">
          <Ihr.PhoneOff size={18}/>
        </button>
      </div>

      <MenuPopover open={moreOpen} anchorRef={moreRef} onClose={() => setMoreOpen(false)} items={[
        {label:'Настройки звонка', onClick: () => hrToast('Настройки звонка')},
        {label:'Список участников', onClick: () => setTab('people')},
        {label:'Записи встречи', onClick: () => hrToast('Записи встречи', {sub:'2 записи доступны'})},
      ]}/>
    </div>
  )
}
