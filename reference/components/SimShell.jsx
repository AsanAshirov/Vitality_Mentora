// SimShell.jsx — chrome shared by all simulator sub-pages.
const { useState: useState_ss } = React;

const SIM_NAV = [
  { group: "Операции", items: [
    { id: "kyc",       label: "Верификация KYC",   Icon: I.ID },
    { id: "accounts",  label: "Открытие счёта",    Icon: I.Plus },
    { id: "deposits",  label: "Депозиты",           Icon: I.Coins },
    { id: "transfers", label: "Переводы",           Icon: I.Swap },
    { id: "cards",     label: "Выпуск карт",        Icon: I.Doc },
  ]},
  { group: "Комплаенс", items: [
    { id: "sanctions", label: "Санкционный список", Icon: I.Shield },
    { id: "pep",       label: "Реестр ПДЛ",         Icon: I.Globe },
    { id: "aml",       label: "Отчёты AML",         Icon: I.Doc },
  ]},
  { group: "Справка", items: [
    { id: "handbook",  label: "Справочник",         Icon: I.Book },
    { id: "activity",  label: "Журнал событий",     Icon: I.Clock },
  ]},
];

function SimShell({ simPage, setSimPage, crumb, status, progress, children, rail, foot }) {
  const [railHidden, setRailHidden] = useState_ss(false);
  return (
    <div className="sim-shell" data-screen-label={`Simulator · ${simPage}`}>
      <div className="sim-band">
        <span className="pip" />
        <span style={{ color: "white", fontWeight: 500 }}>BankSandbox</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>/</span>
        <span className="crumbs-x">{crumb.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span>/</span>}
            {i === crumb.length - 1 ? <b>{c}</b> : <span>{c}</span>}
          </React.Fragment>
        ))}</span>
        {status && <span className="sim-status">{status}</span>}
        {progress != null && (
          <div className="scenario-progress">
            <span style={{ color: "rgba(255,255,255,0.55)" }}>{progress.label}</span>
            <div className="bar"><i style={{ width: `${Math.max(8, progress.pct)}%` }} /></div>
          </div>
        )}
      </div>

      <div className={`sim-body ${rail && !railHidden ? "" : "no-rail"}`}>
        <div className="sim-side">
          {SIM_NAV.map(group => (
            <React.Fragment key={group.group}>
              <h4>{group.group}</h4>
              {group.items.map(it => (
                <button key={it.id}
                        className={`navx ${simPage === it.id ? "active" : ""}`}
                        onClick={() => setSimPage(it.id)}>
                  <it.Icon /> <span>{it.label}</span>
                </button>
              ))}
            </React.Fragment>
          ))}
          <div className="sim-side-foot">
            <div className="synth-tag" style={{ width: "100%", justifyContent: "center" }}>Синтетика · {new Date().toLocaleDateString("ru-RU")}</div>
          </div>
          <ResizeHandle side="right" cssVar="--sim-side-w" min={180} max={320} defaultSize={220} />
        </div>
        <main className="sim-main">
          {rail && (
            <button className="rail-toggle" onClick={() => setRailHidden(v => !v)}
                    title={railHidden ? "Показать боковую панель" : "Скрыть боковую панель"}
                    style={{ position: "absolute", top: 14, right: 14, zIndex: 4 }}>
              {railHidden ? <I.ChevronR size={14} style={{ transform: "rotate(180deg)" }} /> : <I.ChevronR size={14} />}
            </button>
          )}
          {children}
        </main>
        {rail && !railHidden && <aside className="sim-rail"><ResizeHandle side="left" cssVar="--sim-rail-w" min={260} max={480} defaultSize={320} />{rail}</aside>}
      </div>

      {foot && <div className="sim-foot">{foot}</div>}
    </div>
  );
}

window.SimShell = SimShell;
window.SIM_NAV = SIM_NAV;
