// SimShell.tsx — chrome shared by all simulator sub-pages.
import React, { Fragment } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { I } from './Icons';
import { Resizable } from './Resizable';
import { useSettingsStore } from '../store/settingsStore';

// ─── Simulator nav tree ─────────────────────────────────────────────────────
const SIM_NAV = [
  { group: 'Операции', items: [
    { id: 'kyc',       label: 'Верификация KYC',   Icon: I.ID },
    { id: 'accounts',  label: 'Открытие счёта',    Icon: I.Plus },
    { id: 'deposits',  label: 'Депозиты',           Icon: I.Coins },
    { id: 'transfers', label: 'Переводы',           Icon: I.Swap },
    { id: 'cards',     label: 'Выпуск карт',        Icon: I.Doc },
  ]},
  { group: 'Комплаенс', items: [
    { id: 'sanctions', label: 'Санкционный список', Icon: I.Shield },
    { id: 'pep',       label: 'Реестр ПДЛ',         Icon: I.Globe },
    { id: 'aml',       label: 'Отчёты AML',         Icon: I.Doc },
  ]},
  { group: 'Справка', items: [
    { id: 'handbook',  label: 'Справочник',         Icon: I.Book },
    { id: 'activity',  label: 'Журнал событий',     Icon: I.Clock },
  ]},
];

export { SIM_NAV };

// ─── Props ───────────────────────────────────────────────────────────────────
interface Progress {
  label: string;
  pct: number;
}

interface SimShellProps {
  crumb?: string[];
  status?: string;
  progress?: Progress;
  rail?: React.ReactNode;
  foot?: React.ReactNode;
}

// ─── SimShell ────────────────────────────────────────────────────────────────
export default function SimShell({ crumb = [], status, progress, rail, foot }: SimShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { railHidden, setRailHidden } = useSettingsStore();

  // Derive the current sim page from the URL
  const simPage = location.pathname.split('/').pop() ?? '';

  const setSimPage = (page: string) => navigate('/simulator/' + page);

  return (
    <div className="sim-shell" data-screen-label={`Simulator · ${simPage}`}>
      {/* Top band */}
      <div className="sim-band">
        <span className="pip" />
        <span style={{ color: 'white', fontWeight: 500 }}>BankSandbox</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
        <span className="crumbs-x">
          {crumb.map((c, i) => (
            <Fragment key={i}>
              {i > 0 && <span>/</span>}
              {i === crumb.length - 1 ? <b>{c}</b> : <span>{c}</span>}
            </Fragment>
          ))}
        </span>
        {status && <span className="sim-status">{status}</span>}
        {progress != null && (
          <div className="scenario-progress">
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{progress.label}</span>
            <div className="bar"><i style={{ width: `${Math.max(8, progress.pct)}%` }} /></div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`sim-body ${rail && !railHidden ? '' : 'no-rail'}`}>
        {/* Left nav */}
        <div className="sim-side">
          {SIM_NAV.map(group => (
            <Fragment key={group.group}>
              <h4>{group.group}</h4>
              {group.items.map(it => (
                <button
                  key={it.id}
                  className={`navx ${simPage === it.id ? 'active' : ''}`}
                  onClick={() => setSimPage(it.id)}
                >
                  <it.Icon /> <span>{it.label}</span>
                </button>
              ))}
            </Fragment>
          ))}
          <div className="sim-side-foot">
            <div className="synth-tag" style={{ width: '100%', justifyContent: 'center' }}>
              Синтетика · {new Date().toLocaleDateString('ru-RU')}
            </div>
          </div>
          <Resizable side="right" cssVar="--sim-side-w" min={180} max={320} defaultSize={220} />
        </div>

        {/* Main content area — child routes render here */}
        <main className="sim-main" style={{ position: 'relative' }}>
          {rail && (
            <button
              className="rail-toggle"
              onClick={() => setRailHidden(!railHidden)}
              title={railHidden ? 'Показать боковую панель' : 'Скрыть боковую панель'}
              style={{ position: 'absolute', top: 14, right: 14, zIndex: 4 }}
            >
              {railHidden
                ? <I.ChevronR size={14} style={{ transform: 'rotate(180deg)' }} />
                : <I.ChevronR size={14} />}
            </button>
          )}
          <Outlet />
        </main>

        {/* Optional rail panel */}
        {rail && !railHidden && (
          <aside className="sim-rail">
            <Resizable side="left" cssVar="--sim-rail-w" min={260} max={480} defaultSize={320} />
            {rail}
          </aside>
        )}
      </div>

      {/* Optional footer */}
      {foot && <div className="sim-foot">{foot}</div>}
    </div>
  );
}
