// toast.jsx — global toast notifications + popover host

const { useState: useState_t, useEffect: useEffect_t, useRef: useRef_t } = React;

function ToastHost() {
  const [list, setList] = useState_t([]);

  useEffect_t(() => {
    window.toast = (msg, opts = {}) => {
      const id = Math.random().toString(36).slice(2);
      const kind = opts.kind || 'info';
      const sub = opts.sub || null;
      setList(l => [...l, { id, msg, sub, kind, leaving: false }]);
      const dwell = opts.dwell || 2600;
      setTimeout(() => {
        setList(l => l.map(t => t.id === id ? { ...t, leaving: true } : t));
        setTimeout(() => setList(l => l.filter(t => t.id !== id)), 200);
      }, dwell);
    };
  }, []);

  const iconFor = (kind) => {
    if (kind === 'good') return <Ihr.Check size={12}/>;
    if (kind === 'bad')  return <Ihr.X size={12}/>;
    if (kind === 'warn') return <Ihr.Bell size={12}/>;
    return <Ihr.Check size={12}/>;
  };

  return (
    <div className="toast-wrap">
      {list.map(t => (
        <div className={"toast " + t.kind + (t.leaving ? " leaving" : "")} key={t.id}>
          <div className="ti">{iconFor(t.kind)}</div>
          <div>
            <b>{t.msg}</b>
            {t.sub ? <small>{t.sub}</small> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Popover host — uses a button as anchor, positions relative to anchor */
function Popover({ open, anchorRef, onClose, children, align = "right", offset = 8, className = "" }) {
  const ref = useRef_t(null);
  useEffect_t(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current?.contains(e.target)) return;
      if (anchorRef?.current?.contains(e.target)) return;
      onClose?.();
    }
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;
  const rect = anchorRef?.current?.getBoundingClientRect();
  if (!rect) return null;

  const style = { top: rect.bottom + offset };
  if (align === "right") style.right = window.innerWidth - rect.right;
  else style.left = rect.left;

  return (
    <div ref={ref} className={"popover " + className} style={style}>
      {children}
    </div>
  );
}

/* Notifications popover content */
const NOTIFICATIONS = [
  { id:1, who:7,  unread:true,  msg: <><b>Григорий Зимин</b> <span className="muted">провалил сценарий</span> <b>«Возражение по комиссии»</b></>, when:"2 мин" },
  { id:2, who:10, unread:true,  msg: <><b>Виктория Иванова</b> <span className="muted">завершила сценарий с баллом</span> <b>98%</b></>, when:"9 мин" },
  { id:3, who:1,  unread:true,  msg: <><b>Никита Соловьёв</b> <span className="muted">прислал запись на проверку</span></>, when:"14 мин" },
  { id:4, who:9,  unread:false, msg: <><b>Кирилл Беляков</b> <span className="muted">пропустил дедлайн модуля</span> <b>«Антифрод»</b></>, when:"1 ч" },
  { id:5, who:4,  unread:false, msg: <><b>Елизавета Михайлова</b> <span className="muted">получила бейдж</span> <b>«Эмпатия 2.0»</b></>, when:"3 ч" },
  { id:6, who:8,  unread:false, msg: <><b>Полина Карасёва</b> <span className="muted">не выходила в систему 2 дня</span></>, when:"вчера" },
];

function NotificationsPopover({ open, anchorRef, onClose, onOpenProfile }) {
  const [seen, setSeen] = useState_t(false);
  return (
    <Popover open={open} anchorRef={anchorRef} onClose={onClose} align="right" className="notif-pop">
      <div className="notif-head">
        <h3>Уведомления</h3>
        <a onClick={()=>{ setSeen(true); window.toast?.("Все уведомления отмечены прочитанными", { kind:"good" }); }}>Прочитать все</a>
      </div>
      <div className="notif-list">
        {NOTIFICATIONS.map(n => {
          const e = HR_DATA.EMPLOYEES.find(x=>x.id===n.who);
          const unread = !seen && n.unread;
          return (
            <div className={"notif-item" + (unread?" unread":"")} key={n.id}
                 onClick={()=>{ onOpenProfile?.(n.who); onClose?.(); }}>
              <div className={"av-mini " + e.avClass}>{e.initials}</div>
              <div className="body">
                {n.msg}
                <span className="when">{n.when} назад</span>
              </div>
              {unread ? <span className="dot-mark"/> : <span/>}
            </div>
          );
        })}
      </div>
    </Popover>
  );
}

/* User menu */
function UserMenuPopover({ open, anchorRef, onClose, onAction }) {
  return (
    <Popover open={open} anchorRef={anchorRef} onClose={onClose} align="right" className="user-pop">
      <div className="user-pop-head">
        <div className={"av " + HR_DATA.HR_USER.avClass}>{HR_DATA.HR_USER.initials}</div>
        <div>
          <b>{HR_DATA.HR_USER.name}</b>
          <small>hr.karpova@bank.synth</small>
        </div>
      </div>
      <button className="popover-item" onClick={()=>{ onAction?.("profile"); window.toast?.("Открыт ваш профиль", { sub: "HRBP · Корпоратив" }); onClose?.(); }}>
        <Ihr.User size={15} className="ico"/> Мой профиль
      </button>
      <button className="popover-item" onClick={()=>{ onAction?.("settings"); onClose?.(); }}>
        <Ihr.Settings size={15} className="ico"/> Настройки
      </button>
      <button className="popover-item" onClick={()=>{ window.toast?.("Переключаюсь на песочницу 2026/Q3"); onClose?.(); }}>
        <Ihr.Swap size={15} className="ico"/> Сменить песочницу
        <span className="right">2026/Q2</span>
      </button>
      <div className="popover-sep"/>
      <div className="popover-title">Статус</div>
      <button className="popover-item" onClick={()=>{ window.toast?.("Статус: в сети", { kind:"good" }); onClose?.(); }}>
        <span className="ico"><span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--good)'}}/></span>
        В сети
      </button>
      <button className="popover-item" onClick={()=>{ window.toast?.("Статус: не беспокоить", { kind:"warn" }); onClose?.(); }}>
        <span className="ico"><span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--bad)'}}/></span>
        Не беспокоить
      </button>
      <div className="popover-sep"/>
      <button className="popover-item" onClick={()=>{ window.toast?.("Выход выполнен · возврат к экрану входа"); onClose?.(); }}>
        <Ihr.ArrowL size={15} className="ico"/> Выйти
      </button>
    </Popover>
  );
}

/* Generic menu */
function MenuPopover({ open, anchorRef, onClose, items, align="right" }) {
  return (
    <Popover open={open} anchorRef={anchorRef} onClose={onClose} align={align}>
      {items.map((it, i) => {
        if (it.sep) return <div className="popover-sep" key={i}/>;
        if (it.title) return <div className="popover-title" key={i}>{it.title}</div>;
        return (
          <button className={"popover-item" + (it.active ? " active" : "")} key={i}
                  onClick={()=>{ it.onClick?.(); onClose?.(); }}>
            {it.icon ? <span className="ico">{it.icon}</span> : null}
            {it.label}
            {it.right ? <span className="right">{it.right}</span> : null}
          </button>
        );
      })}
    </Popover>
  );
}

window.ToastHost = ToastHost;
window.Popover = Popover;
window.NotificationsPopover = NotificationsPopover;
window.UserMenuPopover = UserMenuPopover;
window.MenuPopover = MenuPopover;
