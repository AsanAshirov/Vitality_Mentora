// Shell.jsx — sidebar + topbar app frame (RU)
const { useState: useState_s } = React;

function BrandMark() {
  return (
    <span className="brand-mark"><i /><i /></span>
  );
}

function Sidebar({ route, setRoute, xp, level, sidebarHidden, setSidebarHidden }) {
  const items = [
    { id: "dashboard", label: "Главная",     Icon: I.Home },
    { id: "tasks",     label: "Задачи",       Icon: I.Spark, badge: "3" },
    { id: "simulator", label: "Симулятор",   Icon: I.Sim },
    { id: "knowledge", label: "База знаний", Icon: I.Book },
    { id: "messages",  label: "Сообщения",   Icon: I.Chat, badge: "10" },
    { id: "badges",    label: "Награды",     Icon: I.Trophy },
  ];
  const personalItems = [
    { id: "profile",  label: "Профиль",   Icon: I.User },
    { id: "settings", label: "Настройки", Icon: I.Settings },
  ];

  return (
    <aside className="sidebar" data-screen-label="Sidebar">
      <div className="brand">
        <BrandMark />
        <span className="brand-name">mentora<em>*</em></span>
      </div>

      <div className="nav-section">
        <div className="nav-title">Обучение</div>
        {items.map(it => (
          <button key={it.id} className={`nav-item ${route === it.id ? "active" : ""}`} onClick={() => setRoute(it.id)}>
            <it.Icon className="nav-icon" />
            <span>{it.label}</span>
            {it.badge && <span className="nav-badge">{it.badge}</span>}
          </button>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-title">Личное</div>
        {personalItems.map(it => (
          <button key={it.id} className={`nav-item ${route === it.id ? "active" : ""}`} onClick={() => setRoute(it.id)}>
            <it.Icon className="nav-icon" />
            <span>{it.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-foot">
        <div className="synth-tag">Синтетическая среда</div>
        <button className="user-chip" onClick={() => setRoute("profile")}>
          <div className="avatar">АП</div>
          <div className="user-meta">
            <b>Алексей П.</b>
            <span>Ур. {level} · {xp.toLocaleString("ru-RU")} XP</span>
          </div>
        </button>
      </div>

      <ResizeHandle side="right" cssVar="--sidebar-w" min={180} max={360} defaultSize={220} />
    </aside>
  );
}

function Topbar({ crumbs, ptt, onCrumb, sidebarHidden, setSidebarHidden }) {
  return (
    <header className="topbar">
      <button className="sidebar-toggle" onClick={() => setSidebarHidden && setSidebarHidden(!sidebarHidden)}
              title={sidebarHidden ? "Показать панель" : "Скрыть панель"}>
        <I.ChevronR size={14} style={{ transform: sidebarHidden ? "" : "rotate(180deg)" }} />
      </button>
      <nav className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            {i === crumbs.length - 1
              ? <b>{c}</b>
              : <button className="crumb-btn" onClick={() => onCrumb && onCrumb(i)}>{c}</button>}
          </React.Fragment>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div className="search">
        <I.Search size={14} />
        <span>Поиск процедур, клиентов, наград…</span>
        <kbd>⌘K</kbd>
      </div>

      <div className={`ptt-hint ${ptt ? "live" : ""}`}>
        <I.Mic size={13} />
        {ptt ? <>Слушаю{" "}<span className="wave"><i/><i/><i/><i/><i/><i/></span></> : <>Зажмите <kbd>`</kbd> чтобы говорить с Кликом</>}
      </div>
    </header>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
window.BrandMark = BrandMark;
