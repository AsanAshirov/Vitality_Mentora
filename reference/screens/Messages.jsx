// messages.jsx — direct conversations + chat thread + details rail

const { useState: useState_msg, useEffect: useEffect_msg, useRef: useRef_msg } = React;

function Messages({ openCall, initialConvId, openProfile }) {
  const [activeId, setActiveId] = useState_msg(initialConvId || "d1");
  const [tab, setTab] = useState_msg("all");
  const [q, setQ] = useState_msg("");
  const [draft, setDraft] = useState_msg("");
  const [thread, setThread] = useState_msg(HR_DATA.THREAD_D1);
  const scrollRef = useRef_msg(null);

  useEffect_msg(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, activeId]);

  let convs = HR_DATA.DIRECT;
  if (tab === "unread") convs = convs.filter(c => c.unread > 0);
  else if (tab === "active") convs = convs.filter(c => {
    const e = HR_DATA.EMPLOYEES.find(x=>x.id===c.with);
    return e?.status === "online";
  });
  if (q) convs = convs.filter(c => {
    const e = HR_DATA.EMPLOYEES.find(x=>x.id===c.with);
    return e?.name.toLowerCase().includes(q.toLowerCase());
  });

  const active = HR_DATA.DIRECT.find(c => c.id === activeId);
  const peer = active ? HR_DATA.EMPLOYEES.find(e => e.id === active.with) : null;
  const unread = HR_DATA.DIRECT.filter(c=>c.unread>0).length;

  function send() {
    if (!draft.trim()) return;
    setThread(t => [...t, { kind: "msg", from: 0, text: draft, time: "сейчас" }]);
    setDraft("");
    // simulate reply
    setTimeout(() => {
      setThread(t => [...t, { kind: "msg", from: active?.with || 1, text: "Принято, спасибо!", time: "сейчас" }]);
    }, 1400);
  }

  return (
    <div className="msg-shell">
      <ConvList tab={tab} setTab={setTab} q={q} setQ={setQ} convs={convs} activeId={activeId} setActiveId={setActiveId} unread={unread}/>

      {peer ? (
        <div className="chat-pane">
          <ChatBar peer={peer} openCall={openCall} openProfile={openProfile}/>
          <div className="chat-scroll" ref={scrollRef}>
            {thread.map((m, i) => <ThreadItem key={i} m={m} peer={peer}/>)}
          </div>
          <Composer draft={draft} setDraft={setDraft} onSend={send}/>
        </div>
      ) : (
        <div className="chat-pane">
          <div className="empty-state">
            <div>
              <div className="glyph"><Ihr.Message size={20}/></div>
              Выберите диалог
            </div>
          </div>
        </div>
      )}

      {peer ? <ChatRail peer={peer} openCall={openCall} openProfile={openProfile}/> : null}
    </div>
  );
}

function ConvList({ tab, setTab, q, setQ, convs, activeId, setActiveId, unread }) {
  return (
    <div className="conv-list">
      <div className="conv-head">
        <h2>
          Сообщения
          <button title="Новое сообщение" onClick={()=>window.toast?.("Выберите получателя из списка сотрудников", { sub: "Или используйте поиск" })}><Ihr.Plus size={14}/></button>
        </h2>
        <div className="conv-search">
          <Ihr.Search size={14}/>
          <input placeholder="Поиск" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>
      <div className="conv-tabs">
        <button className={"conv-tab" + (tab==="all"?" active":"")} onClick={()=>setTab("all")}>Все</button>
        <button className={"conv-tab" + (tab==="unread"?" active":"")} onClick={()=>setTab("unread")}>Непрочитано{unread>0?<span className="ct-badge">{unread}</span>:null}</button>
        <button className={"conv-tab" + (tab==="active"?" active":"")} onClick={()=>setTab("active")}>В сети</button>
      </div>
      <div className="conv-scroll">
        {convs.map(c => {
          const e = HR_DATA.EMPLOYEES.find(x => x.id === c.with);
          return (
            <div className={"conv-item" + (activeId===c.id?" active":"")} key={c.id} onClick={()=>setActiveId(c.id)}>
              <div className="av-wrap">
                <div className={"av " + e.avClass}>{e.initials}</div>
                <span className={"dot " + e.status}/>
              </div>
              <div>
                <div className="ci-name">
                  <span className="name-text">{e.name}</span>
                </div>
                <div className="ci-preview">{c.preview}</div>
              </div>
              <div className="ci-meta">
                <span className="ci-when">{c.lastAt}</span>
                {c.unread ? <span className="ci-unread">{c.unread}</span> : null}
              </div>
            </div>
          );
        })}
        {convs.length === 0 ? (
          <div style={{padding:'28px 20px', color:'var(--mute)', fontSize:13, textAlign:'center'}}>
            Нет диалогов по фильтру
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ChatBar({ peer, openCall, openProfile }) {
  return (
    <div className="chat-bar">
      <div className="av-wrap" style={{position:'relative', width:40, height:40, cursor:'pointer'}}
           onClick={()=>openProfile?.(peer.id)}>
        <div className={"av " + peer.avClass}>{peer.initials}</div>
        <span className={"dot " + peer.status} style={{position:'absolute', right:-1, bottom:-1, width:10, height:10, borderRadius:'50%', border:'2px solid var(--surface)'}}/>
      </div>
      <div className="head-meta" style={{cursor:'pointer'}} onClick={()=>openProfile?.(peer.id)}>
        <b>{peer.name}</b>
        <span className={peer.status}>
          {peer.status==="online" ? "В сети, печатает…" : peer.status==="busy" ? "Занят" : peer.status==="away" ? "Отошёл" : "Не в сети"}
        </span>
      </div>
      <div className="head-actions">
        <button className="call-btn" title="Голосовой звонок" onClick={()=>openCall(peer.id, "voice")}><Ihr.Phone size={16}/></button>
        <button className="call-btn primary" title="Видеозвонок" onClick={()=>openCall(peer.id, "video")}><Ihr.Video size={16}/></button>
        <button className="call-btn" title="Профиль" onClick={()=>openProfile?.(peer.id)}><Ihr.User size={16}/></button>
        <button className="call-btn" title="Меню" onClick={()=>window.toast?.("Меню чата", { sub: "Поиск · Закрепить · Архив · Очистить" })}><Ihr.More size={16}/></button>
      </div>
    </div>
  );
}

function ThreadItem({ m, peer }) {
  if (m.kind === "divider") return <div className="chat-divider">{m.text}</div>;
  if (m.kind === "scenario") {
    return (
      <div className="bubble-row">
        <div className={"av-s " + peer.avClass}>{peer.initials}</div>
        <div className="scenario-pin">
          <div className="icn"><Ihr.Activity size={14}/></div>
          <div>
            <b>{m.title}</b>
            <small>Сценарий тренажёра · {m.status}</small>
          </div>
          <span className="scn-pct">{m.progress}%</span>
        </div>
      </div>
    );
  }
  if (m.kind === "call") {
    return (
      <div className={"bubble-row" + (m.direction==="outgoing"?" me":"")}>
        {m.direction!=="outgoing" ? <div className={"av-s " + peer.avClass}>{peer.initials}</div> : null}
        <div className={"call-card" + (m.direction==="missed" ? " missed" : "")}>
          <div className="icn"><Ihr.Phone size={14}/></div>
          <div>
            <b>{m.kind2 === "video" ? "Видеозвонок" : "Голосовой звонок"} · {m.direction==="outgoing" ? "исходящий" : m.direction==="incoming" ? "входящий" : "пропущенный"}</b>
            <small>{m.duration}</small>
          </div>
          <span className="when">{m.time}</span>
        </div>
      </div>
    );
  }
  if (m.kind === "file") {
    return (
      <div className="bubble-row">
        <div className={"av-s " + peer.avClass}>{peer.initials}</div>
        <div className="file-bubble">
          <div className="ft">{m.kindLabel}</div>
          <div>
            <b>{m.name}</b>
            <small>{m.size} · загрузил {peer.name.split(' ')[0]}</small>
          </div>
          <button className="icon-btn"><Ihr.Download size={13}/></button>
        </div>
      </div>
    );
  }
  // text
  const me = m.from === 0;
  return (
    <div className={"bubble-row" + (me ? " me" : "")}>
      {!me ? <div className={"av-s " + peer.avClass}>{peer.initials}</div> : null}
      <div className="bubble">
        {m.text}
        <span className="time">{m.time}</span>
      </div>
    </div>
  );
}

function Composer({ draft, setDraft, onSend }) {
  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  }
  return (
    <div className="composer">
      <div className="composer-inner">
        <button className="composer-icn" title="Файл" onClick={()=>window.toast?.("Открыт выбор файла", { sub: "Поддерживаются: PDF, MP4, DOCX до 50 МБ" })}><Ihr.Paperclip size={16}/></button>
        <textarea
          rows={1}
          placeholder="Напишите сообщение…"
          value={draft}
          onChange={e=>setDraft(e.target.value)}
          onKeyDown={onKey}
        />
        <button className="composer-icn" title="Эмодзи" onClick={()=>window.toast?.("👋 😊 👍 🙏 — выберите реакцию")}><Ihr.Smile size={16}/></button>
        <button className={"composer-send" + (draft.trim() ? "" : " disabled")} onClick={onSend} disabled={!draft.trim()}>
          <Ihr.Send size={14}/>
        </button>
      </div>
    </div>
  );
}

function ChatRail({ peer, openCall, openProfile }) {
  return (
    <aside className="chat-rail">
      <div className="rail-profile">
        <div className={"av-big " + peer.avClass}>{peer.initials}</div>
        <h3>{peer.name}</h3>
        <p>{peer.role}</p>
        <div className="quick-acts">
          <button className="call-btn" title="Звонок" onClick={()=>openCall(peer.id, "voice")}><Ihr.Phone size={15}/></button>
          <button className="call-btn primary" title="Видеосвязь" onClick={()=>openCall(peer.id, "video")}><Ihr.Video size={15}/></button>
          <button className="call-btn" title="Профиль" onClick={()=>openProfile?.(peer.id)}><Ihr.User size={15}/></button>
          <button className="call-btn" title="Заметка" onClick={()=>window.toast?.("Открыт редактор заметок", { sub: "Заметка попадёт в карточку стажёра" })}><Ihr.Doc size={15}/></button>
        </div>
      </div>

      <div className="rail-section">
        <h4>Сводка</h4>
        <div className="rail-stat"><span>Балл</span><b>{peer.score}/100</b></div>
        <div className="rail-stat"><span>Сценариев</span><b>{peer.scenarios}</b></div>
        <div className="rail-stat"><span>Команда</span><b>{peer.team}</b></div>
        <div className="rail-stat"><span>Последняя активность</span><b>{peer.lastActive}</b></div>
        <div className="rail-stat"><span>Был онлайн</span><b style={{color: peer.status==='online' ? 'var(--good)' : 'var(--mute)'}}>{peer.status==="online"?"сейчас":"недавно"}</b></div>
      </div>

      <div className="rail-section">
        <h4>Текущий сценарий</h4>
        <div className="scenario-pin" style={{maxWidth: '100%', marginBottom: 0}}>
          <div className="icn"><Ihr.Activity size={14}/></div>
          <div>
            <b>Холодный звонок · Карта Gold</b>
            <small>Сценарий 14 · в процессе</small>
          </div>
          <span className="scn-pct">87%</span>
        </div>
      </div>

      <div className="rail-section">
        <h4>Файлы · {HR_DATA.SHARED_FILES.length}</h4>
        {HR_DATA.SHARED_FILES.map((f,i)=>(
          <div className="rail-file" key={i} style={{cursor:'pointer'}}
               onClick={()=>window.toast?.("Скачивание · " + f.name, { kind:"good", sub: f.size })}>
            <div className="ft">{f.kind}</div>
            <div>
              <b>{f.name}</b>
              <small>{f.size}</small>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

window.Messages = Messages;
