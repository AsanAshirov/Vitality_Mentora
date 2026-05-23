// Shell.jsx — sidebar + topbar app frame (HR portal)
const { useState: useState_sh, useRef: useRef_sh } = React;

function HrBrand() {
  return (
    <div className="brand">
      <div className="brand-mark"><i/><i/></div>
      <div className="brand-name">mentora<em>·</em>hr</div>
    </div>
  );
}

function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <button className={"nav-item" + (active ? " active" : "")} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
      {badge != null ? <span className="nav-badge">{badge}</span> : null}
    </button>
  );
}

function HrSidebar({ route, setRoute, unreadDM, unreadGroups }) {
  return (
    <aside className="sidebar">
      <HrBrand/>

      <div className="nav-section">
        <div className="nav-title">Главное</div>
        <NavItem icon={<Ihr.Dashboard/>} label="Дашборд"     active={route==="dashboard"}   onClick={()=>setRoute("dashboard")} />
        <NavItem icon={<Ihr.Team/>}      label="Сотрудники"   active={route==="employees" || route==="profile"} onClick={()=>setRoute("employees")} />
        <NavItem icon={<Ihr.Chart/>}     label="Performance"  active={route==="performance"} onClick={()=>setRoute("performance")} />
      </div>

      <div className="nav-section">
        <div className="nav-title">Общение</div>
        <NavItem icon={<Ihr.Message/>}   label="Сообщения"    active={route==="messages"}  onClick={()=>setRoute("messages")} badge={unreadDM || null} />
        <NavItem icon={<Ihr.Group/>}     label="Групповые чаты" active={route==="groups"}  onClick={()=>setRoute("groups")} badge={unreadGroups || null} />
        <NavItem icon={<Ihr.Calendar/>}  label="Календарь"    active={route==="calendar"}  onClick={()=>setRoute("calendar")} />
      </div>

      <div className="nav-section">
        <div className="nav-title">Операции</div>
        <NavItem icon={<Ihr.Doc/>}       label="Заявки"        active={route==="requests"} onClick={()=>setRoute("requests")} badge={3} />
        <NavItem icon={<Ihr.Award/>}     label="Награды"       active={route==="rewards"}  onClick={()=>setRoute("rewards")} />
        <NavItem icon={<Ihr.Settings/>}  label="Настройки"     active={route==="settings"} onClick={()=>setRoute("settings")} />
      </div>

      <div className="sidebar-foot">
        <div className="synth-tag">Синтетический банк · песочница</div>
        <div className="user-chip">
          <div className={"av " + HR_DATA.HR_USER.avClass}>{HR_DATA.HR_USER.initials}</div>
          <div className="user-meta">
            <b>{HR_DATA.HR_USER.name}</b>
            <span>HRBP · Корпоратив</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HrTopbar({ crumbs, onOpenProfile, onOpenSettings, onSearch }) {
  const bellRef = useRef_sh(null);
  const userRef = useRef_sh(null);
  const [bellOpen, setBellOpen] = useState_sh(false);
  const [userOpen, setUserOpen] = useState_sh(false);
  const [q, setQ] = useState_sh("");

  function onSearchKey(e) {
    if (e.key === "Enter" && q.trim()) {
      window.toast?.("Поиск: «" + q + "»", { sub: "Найдено 3 совпадения в стажёрах и сценариях" });
      setQ("");
    }
  }

  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <Ihr.ChevronR size={12}/> : null}
            <span>
              {i === crumbs.length - 1 ? <em>{c}</em> : c}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="topsearch">
        <Ihr.Search size={14}/>
        <input placeholder="Поиск по сотрудникам, сценариям, модулям…"
               value={q} onChange={e=>setQ(e.target.value)} onKeyDown={onSearchKey}/>
        <kbd>⌘K</kbd>
      </div>

      <div className="top-right">
        <button className="top-icon" title="Уведомления" ref={bellRef} onClick={()=>setBellOpen(o=>!o)}>
          <Ihr.Bell size={16}/>
          <span className="dot"/>
        </button>
        <button className="top-icon" title="Меню"
                onClick={()=>window.toast?.("Быстрые действия", { sub: "Создать стажёра · Импорт CSV · Назначить ментора" })}>
          <Ihr.More size={16}/>
        </button>
        <button ref={userRef} className={"av " + HR_DATA.HR_USER.avClass}
                onClick={()=>setUserOpen(o=>!o)}
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  display: "grid", placeItems: "center",
                  fontSize: 11, fontWeight: 500, color: "white",
                  border: 0, cursor: "pointer"
                }}>{HR_DATA.HR_USER.initials}</button>

        <NotificationsPopover open={bellOpen} anchorRef={bellRef} onClose={()=>setBellOpen(false)}
                              onOpenProfile={onOpenProfile}/>
        <UserMenuPopover open={userOpen} anchorRef={userRef} onClose={()=>setUserOpen(false)}
                         onAction={(a)=>{ if (a==="settings") onOpenSettings?.(); }}/>
      </div>
    </div>
  );
}

/* ============ shared small components ============ */

function Avatar({ id, size = 32, status, className = "" }) {
  const e = HR_DATA.EMPLOYEES.find(x => x.id === id) || HR_DATA.HR_USER;
  const fs = Math.round(size * 0.36);
  return (
    <div className="av-wrap" style={{ width: size, height: size, position: 'relative', flex: `0 0 ${size}px`}}>
      <div className={"av " + (e.avClass || HR_DATA.avClassFromId(id||0)) + " " + className}
           style={{ width: size, height: size, borderRadius: "50%",
                    display: "grid", placeItems: "center",
                    fontSize: fs, fontWeight: 500, color: "white" }}>
        {e.initials || HR_DATA.initials(e.name)}
      </div>
      {status ? <span className={"dot " + status}/> : null}
    </div>
  );
}

function Sparkline({ data, tone = "" }) {
  const w = 60, h = 18, pad = 1;
  const min = Math.min(...data), max = Math.max(...data);
  const range = (max - min) || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg className={"spark " + tone} viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <path d={"M" + pts.replaceAll(' ', ' L')}/>
    </svg>
  );
}

window.HrSidebar = HrSidebar;
window.HrTopbar = HrTopbar;
window.Avatar = Avatar;
window.Sparkline = Sparkline;
