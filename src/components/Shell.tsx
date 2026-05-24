// Shell.tsx — sidebar + topbar app frame
import React, { Fragment, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { I } from './Icons';
import { Resizable } from './Resizable';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';

// ─── Route mapping ──────────────────────────────────────────────────────────
const ROUTE_MAP: Record<string, string> = {
  dashboard:  '/',
  tasks:      '/tasks',
  simulator:  '/simulator',
  knowledge:  '/knowledge',
  messages:   '/messages',
  badges:     '/badges',
  profile:    '/profile',
  settings:   '/settings',
};

// ─── BrandMark ──────────────────────────────────────────────────────────────
export function BrandMark() {
  return (
    <span className="brand-mark"><i /><i /></span>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { xp, level } = useUserStore();

  const route = location.pathname;

  const items = [
    { id: 'dashboard', label: 'Главная',     Icon: I.Home },
    { id: 'tasks',     label: 'Задачи',      Icon: I.Spark,  badge: '3' },
    { id: 'simulator', label: 'Симулятор',   Icon: I.Sim },
    { id: 'knowledge', label: 'База знаний', Icon: I.Book },
    { id: 'messages',  label: 'Сообщения',   Icon: I.Chat,   badge: '10' },
    { id: 'badges',    label: 'Награды',     Icon: I.Trophy },
  ];
  const personalItems = [
    { id: 'profile',  label: 'Профиль',   Icon: I.User },
    { id: 'settings', label: 'Настройки', Icon: I.Settings },
  ];

  const go = (id: string) => navigate(ROUTE_MAP[id] ?? '/');

  const isActive = (id: string) => {
    const target = ROUTE_MAP[id] ?? '/';
    if (target === '/') return route === '/';
    return route.startsWith(target);
  };

  return (
    <aside className="sidebar" data-screen-label="Sidebar">
      <div className="brand">
        <BrandMark />
        <span className="brand-name">mentora<em>*</em></span>
      </div>

      <div className="nav-section">
        <div className="nav-title">Обучение</div>
        {items.map(it => (
          <button
            key={it.id}
            className={`nav-item ${isActive(it.id) ? 'active' : ''}`}
            onClick={() => go(it.id)}
          >
            <it.Icon className="nav-icon" />
            <span>{it.label}</span>
            {it.badge && <span className="nav-badge">{it.badge}</span>}
          </button>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-title">Личное</div>
        {personalItems.map(it => (
          <button
            key={it.id}
            className={`nav-item ${isActive(it.id) ? 'active' : ''}`}
            onClick={() => go(it.id)}
          >
            <it.Icon className="nav-icon" />
            <span>{it.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-foot">
        <div className="synth-tag">Синтетическая среда</div>
        <button className="user-chip" onClick={() => navigate('/profile')}>
          <div className="avatar">АП</div>
          <div className="user-meta">
            <b>Алексей П.</b>
            <span>Ур. {level} · {xp.toLocaleString('ru-RU')} XP</span>
          </div>
        </button>
        <button
          onClick={() => navigate('/portal')}
          style={{
            width: '100%', marginTop: 8,
            padding: '7px 10px', borderRadius: 8, fontSize: 12,
            background: 'transparent', border: '1px solid var(--line)',
            color: 'var(--mute)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'color .15s, border-color .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--cobalt)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--mute)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)' }}
        >
          <span style={{ fontSize: 14 }}>⇄</span> Сменить портал
        </button>
      </div>

      <Resizable side="right" cssVar="--sidebar-w" min={180} max={360} defaultSize={220} />
    </aside>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────────────
export interface TopbarProps {
  crumbs: string[];
  ptt: boolean;
  onCrumb: (i: number) => void;
  sidebarHidden: boolean;
  setSidebarHidden: (v: boolean) => void;
}

export function Topbar({ crumbs, ptt, onCrumb, sidebarHidden, setSidebarHidden }: TopbarProps) {
  return (
    <header className="topbar">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarHidden && setSidebarHidden(!sidebarHidden)}
        title={sidebarHidden ? 'Показать панель' : 'Скрыть панель'}
      >
        <I.ChevronR size={14} style={{ transform: sidebarHidden ? '' : 'rotate(180deg)' }} />
      </button>

      <nav className="crumbs">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            {i === crumbs.length - 1
              ? <b>{c}</b>
              : <button className="crumb-btn" onClick={() => onCrumb && onCrumb(i)}>{c}</button>}
          </Fragment>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div className="search">
        <I.Search size={14} />
        <span>Поиск процедур, клиентов, наград…</span>
        <kbd>⌘K</kbd>
      </div>

      <div className={`ptt-hint ${ptt ? 'live' : ''}`}>
        <I.Mic size={13} />
        {ptt
          ? <>Слушаю{' '}<span className="wave"><i/><i/><i/><i/><i/><i/></span></>
          : <>Зажмите <kbd>`</kbd> чтобы говорить с Кликом</>}
      </div>
    </header>
  );
}

// ─── Shell layout wrapper (React Router) ────────────────────────────────────
const CRUMB_MAP: Record<string, string[]> = {
  '/':          ['Стажёр', 'Главная'],
  '/tasks':     ['Стажёр', 'Задачи'],
  '/messages':  ['Стажёр', 'Сообщения'],
  '/knowledge': ['Стажёр', 'База знаний'],
  '/badges':    ['Стажёр', 'Награды'],
  '/profile':   ['Стажёр', 'Профиль'],
  '/settings':  ['Стажёр', 'Настройки'],
  '/results':   ['Стажёр', 'Сценарий', 'Результаты'],
}

export default function Shell() {
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const crumbs = CRUMB_MAP[location.pathname]
    ?? (location.pathname.startsWith('/simulator') ? ['Стажёр', 'Симулятор'] : ['Стажёр'])

  const onCrumb = (i: number) => {
    if (i === 0) navigate('/')
  }

  return (
    <div className={`app${sidebarHidden ? ' sidebar-hidden' : ''}`}>
      <Sidebar />
      <div className="workspace">
        <Topbar
          crumbs={crumbs}
          ptt={false}
          onCrumb={onCrumb}
          sidebarHidden={sidebarHidden}
          setSidebarHidden={setSidebarHidden}
        />
        <div className="main" key={location.pathname}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
