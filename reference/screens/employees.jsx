// employees.jsx — list + profile detail

const { useState: useState_em } = React;

function Employees({ openProfile, openChat, openCall }) {
  const [tab, setTab] = useState_em("all");
  const [q, setQ] = useState_em("");

  let rows = HR_DATA.EMPLOYEES;
  if (tab !== "all") {
    if (tab === "risk")  rows = rows.filter(e => e.score < 70);
    else if (tab === "top") rows = rows.filter(e => e.score >= 85);
    else if (tab === "new") rows = rows.filter(e => e.scenarios < 10);
    else rows = rows.filter(e => e.team === tab);
  }
  if (q) rows = rows.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));

  const counts = {
    all: HR_DATA.EMPLOYEES.length,
    risk: HR_DATA.EMPLOYEES.filter(e=>e.score<70).length,
    top:  HR_DATA.EMPLOYEES.filter(e=>e.score>=85).length,
    Розница:    HR_DATA.EMPLOYEES.filter(e=>e.team==="Розница").length,
    Корпоратив: HR_DATA.EMPLOYEES.filter(e=>e.team==="Корпоратив").length,
    Премиум:    HR_DATA.EMPLOYEES.filter(e=>e.team==="Премиум").length,
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>Сотрудники</h1>
          <p>26 стажёров · 3 когорты · все данные на 23 мая, 10:48 MSK</p>
        </div>
        <div className="right">
          <button className="btn" onClick={()=>window.toast?.("Открыта панель фильтров", { sub: "Команда, статус, диапазон балла, ментор" })}><Ihr.Filter size={14}/> Фильтр</button>
          <button className="btn" onClick={()=>window.toast?.("CSV экспорт · " + HR_DATA.EMPLOYEES.length + " строк", { kind: "good", sub: "Файл сохранён в Загрузки" })}><Ihr.Download size={14}/> Экспорт CSV</button>
          <button className="btn primary" onClick={()=>window.toast?.("Открыто окно добавления стажёра", { sub: "Заполните анкету: имя, когорта, ментор" })}><Ihr.Plus size={14}/> Добавить стажёра</button>
        </div>
      </div>

      <div className="emp-filter-bar">
        <label className="emp-search">
          <Ihr.Search size={14}/>
          <input placeholder="Поиск по имени, команде…" value={q} onChange={e=>setQ(e.target.value)}/>
        </label>
        <div className="emp-filter-pills">
          <button className={"emp-pill" + (tab==="all"?" active":"")} onClick={()=>setTab("all")}>Все<span className="count">{counts.all}</span></button>
          <button className={"emp-pill" + (tab==="risk"?" active":"")} onClick={()=>setTab("risk")}>Зона риска<span className="count">{counts.risk}</span></button>
          <button className={"emp-pill" + (tab==="top"?" active":"")} onClick={()=>setTab("top")}>Топ-перформеры<span className="count">{counts.top}</span></button>
          <button className={"emp-pill" + (tab==="Розница"?" active":"")} onClick={()=>setTab("Розница")}>Розница<span className="count">{counts["Розница"]}</span></button>
          <button className={"emp-pill" + (tab==="Корпоратив"?" active":"")} onClick={()=>setTab("Корпоратив")}>Корпоратив<span className="count">{counts["Корпоратив"]}</span></button>
          <button className={"emp-pill" + (tab==="Премиум"?" active":"")} onClick={()=>setTab("Премиум")}>Премиум<span className="count">{counts["Премиум"]}</span></button>
        </div>
      </div>

      <div className="emp-table">
        <div className="emp-table-head">
          <span>Стажёр</span>
          <span>Статус</span>
          <span>Балл</span>
          <span>Тренд · 8 недель</span>
          <span>Был онлайн</span>
          <span style={{textAlign:'right'}}>Действия</span>
        </div>
        {rows.map(e => {
          const tone = e.score >= 85 ? "good" : e.score >= 70 ? "" : e.score >= 60 ? "warn" : "bad";
          const sparkTone = e.delta > 0 ? "good" : e.delta < 0 ? "bad" : "";
          return (
            <div className="emp-row" key={e.id} onClick={()=>openProfile(e.id)}>
              <div className="nm">
                <div className={"av " + e.avClass}>{e.initials}</div>
                <div>
                  <b>{e.name}</b>
                  <small>{e.role}</small>
                </div>
              </div>
              <span className={"st " + e.status}>
                {e.status === "online" ? "В сети" :
                 e.status === "busy"   ? "Занят" :
                 e.status === "away"   ? "Отошёл" : "Не в сети"}
              </span>
              <span className={"score-cell " + tone}>{e.score}</span>
              <span>
                <Sparkline data={e.trend} tone={sparkTone}/>
                <span style={{
                  font: '500 11.5px/1 var(--font-mono)',
                  color: e.delta > 0 ? 'var(--good)' : e.delta < 0 ? 'var(--bad)' : 'var(--mute)'
                }}>{e.delta > 0 ? '+' : ''}{e.delta}</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>{e.lastActive}</span>
              <div className="actions" onClick={(ev)=>ev.stopPropagation()}>
                <button className="icon-btn" title="Сообщение" onClick={()=>openChat(e.id)}><Ihr.Message size={14}/></button>
                <button className="icon-btn" title="Звонок"     onClick={()=>openCall(e.id, "voice")}><Ihr.Phone size={14}/></button>
                <button className="icon-btn" title="Видеосвязь" onClick={()=>openCall(e.id, "video")}><Ihr.Video size={14}/></button>
                <button className="icon-btn" title="Ещё"        onClick={()=>window.toast?.("Меню стажёра", { sub: "Назначить · Заметка · Архив · Экспорт" })}><Ihr.More size={14}/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Profile ============ */

function Profile({ id, onBack, openChat, openCall }) {
  const e = HR_DATA.EMPLOYEES.find(x => x.id === id);
  if (!e) return null;

  const tone = e.score >= 85 ? "good" : e.score >= 70 ? "" : e.score >= 60 ? "warn" : "bad";

  const kpis = [
    { lbl: "Текущий балл",   val: e.score,    suffix: "/100", delta: (e.delta>=0?"+":"") + e.delta, dir: e.delta>0?"up":"down" },
    { lbl: "Сценариев",      val: e.scenarios,suffix: "",     delta: "+3 за нед", dir: "up" },
    { lbl: "Точность ответов", val: 84,       suffix: "%",   delta: "+5%",       dir: "up" },
    { lbl: "Активность",     val: "92%",      suffix: "",    delta: "стабильно", dir: "flat" },
  ];

  const skills = [
    { lbl: "Продукты · карты",  pct: 92, tone: "good" },
    { lbl: "Антифрод",          pct: 71, tone: "" },
    { lbl: "Эмпатия в звонке",  pct: 86, tone: "good" },
    { lbl: "Эскалация",         pct: 64, tone: "warn" },
    { lbl: "Корп. кредит",      pct: 48, tone: "bad" },
    { lbl: "Регламенты",        pct: 79, tone: "" },
  ];

  const history = [
    { title: "Холодный звонок · Карта Gold",  ts: "сегодня, 10:46", score: 87, ic: "good" },
    { title: "Возражение по комиссии",         ts: "пятница, 16:22", score: 76, ic: "" },
    { title: "Антифрод · Подозрительный счёт", ts: "пятница, 11:08", score: 68, ic: "warn" },
    { title: "Эмпатия · Жалоба клиента",       ts: "четверг, 15:30", score: 91, ic: "good" },
    { title: "Эскалация по ипотеке",           ts: "среда, 17:00",   score: 64, ic: "warn" },
    { title: "Onboarding · Базовый",           ts: "1-я неделя",     score: 95, ic: "good" },
  ];

  return (
    <div className="page">
      <button className="back-link" onClick={onBack}>
        <Ihr.ArrowL size={12}/> К списку сотрудников
      </button>

      <div className="profile-head">
        <div className={"av-big " + e.avClass}>{e.initials}</div>
        <div>
          <h1>{e.name}</h1>
          <div className="role">{e.role} · Стаж: 7 недель</div>
          <div className="tag-row">
            <span className={"st " + e.status}>
              {e.status === "online" ? "В сети" : e.status === "busy" ? "Занят" : e.status === "away" ? "Отошёл" : "Не в сети"}
            </span>
            <span className="tag cobalt">Когорта 2026/04</span>
            <span className="tag">Ментор: Е. Соколова</span>
            <span className="tag good">↑ Топ-25%</span>
          </div>
        </div>
        <div className="pa">
          <button className="pa-btn" onClick={()=>openChat(e.id)}><Ihr.Message size={14}/> Написать</button>
          <button className="pa-btn" onClick={()=>openCall(e.id, "voice")}><Ihr.Phone size={14}/> Звонок</button>
          <button className="pa-btn primary" onClick={()=>openCall(e.id, "video")}><Ihr.Video size={14}/> Видеосвязь</button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k,i)=>(
          <div className="kpi" key={i}>
            <span className="lbl">{k.lbl}</span>
            <span className="val">{k.val}<small>{k.suffix}</small></span>
            <span className={"delta " + (k.dir==="down"?"down":k.dir==="flat"?"flat":"")}>
              {k.dir==="up" ? <Ihr.ArrowUp size={10}/> : k.dir==="down" ? <Ihr.ArrowDn size={10}/> : null}
              {k.delta}
            </span>
          </div>
        ))}
      </div>

      <div className="profile-grid">
        <div>
          <div className="scenario-history">
            <div className="ch">
              <h3>История сценариев</h3>
              <span>последние 6</span>
            </div>
            {history.map((h, i) => (
              <div className="sh-row" key={i} style={{cursor:'pointer'}}
                   onClick={()=>window.toast?.("Открыта запись сценария", { sub: h.title + " · таймкод 04:18" })}>
                <div className={"sh-icn " + (h.ic||"")}>
                  <Ihr.Activity size={14}/>
                </div>
                <div className="sh-name">
                  <b>{h.title}</b>
                  <small>{h.ts}</small>
                </div>
                <span className={"score-x " + (h.score>=85?"good":h.score>=70?"mute":h.score>=60?"warn":"bad")} style={{textAlign:'center'}}>{h.score}</span>
                <button className="btn ghost" style={{height:28, fontSize:11.5}}
                        onClick={(ev)=>{ ev.stopPropagation(); window.toast?.("Воспроизведение записи · " + h.title); }}>
                  Запись →
                </button>
              </div>
            ))}
          </div>

          <div className="notes-card">
            <h3>Заметки HR <span>3 записи</span></h3>
            <div className="note-it">
              <b>Сильный прогресс в эмпатии</b>
              За две недели вырос с 62 до 86 в сценариях с возражениями. Готов брать сценарии следующего уровня сложности.
              <div className="meta"><span>Ольга Карпова</span><span>пт, 14:20</span></div>
            </div>
            <div className="note-it">
              <b>Сложности с антифродом</b>
              На сценарии «Подозрительный счёт» теряется при двух одновременных триггерах. Назначен дополнительный модуль.
              <div className="meta"><span>Ольга Карпова</span><span>ср, 09:14</span></div>
            </div>
            <div className="note-it">
              <b>Mid-term review</b>
              Промежуточная оценка пройдена. Рекомендация — продлить наставничество на 2 недели.
              <div className="meta"><span>Е. Соколова · ментор</span><span>2 нед назад</span></div>
            </div>
            <button className="btn" style={{marginTop:10, width:'100%'}}
                    onClick={()=>window.toast?.("Новая заметка добавлена в карточку", { kind:"good" })}>
              <Ihr.Plus size={12}/> Добавить заметку
            </button>
          </div>
        </div>

        <div>
          <div className="skills-card">
            <h3>Навыки <span>Радар компетенций</span></h3>
            {skills.map((s, i) => (
              <div className="skill-row" key={i}>
                <span className="lbl">{s.lbl}</span>
                <span className="bar"><i className={s.tone} style={{ width: s.pct + "%" }}/></span>
                <span className="pct">{s.pct}</span>
              </div>
            ))}
          </div>

          <div className="notes-card">
            <h3>Ближайшие события <span>3</span></h3>
            <div className="note-it" style={{cursor:'pointer'}}
                 onClick={()=>window.toast?.("Открыта карточка встречи", { sub: "1:1 · среда, 11:30 · 30 минут" })}>
              <b>1:1 встреча · среда, 11:30</b>
              Разбор записи «Холодный звонок · Карта Gold»
              <div className="meta"><span>с Ольгой Карповой</span><span>30 мин</span></div>
            </div>
            <div className="note-it" style={{cursor:'pointer'}}
                 onClick={()=>window.toast?.("Открыт модуль «Антифрод»", { sub: "Попытка 2 из 3 · дедлайн пт 17:00" })}>
              <b>Пересдача модуля «Антифрод»</b>
              Дедлайн — пятница, 17:00
              <div className="meta"><span>3 попытки</span><span>~45 мин</span></div>
            </div>
            <div className="note-it" style={{cursor:'pointer'}}
                 onClick={()=>window.toast?.("Калибровка когорты", { sub: "четверг, 16:00 · 4 ментра + 12 стажёров" })}>
              <b>Калибровка когорты</b>
              Видеовстреча с 4 ментрами
              <div className="meta"><span>четверг, 16:00</span><span>1 час</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Employees = Employees;
window.Profile = Profile;
