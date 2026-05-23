// groups.jsx — group chats (similar shell, group threads)

const { useState: useState_gr, useRef: useRef_gr, useEffect: useEffect_gr } = React;

function Groups({ openCall, openProfile, initialGroupId }) {
  const [activeId, setActiveId] = useState_gr(initialGroupId || "g1");
  const [draft, setDraft] = useState_gr("");
  const [thread, setThread] = useState_gr(buildGroupThread("g1"));
  const scrollRef = useRef_gr(null);

  useEffect_gr(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, activeId]);

  useEffect_gr(() => {
    setThread(buildGroupThread(activeId));
  }, [activeId]);

  const active = HR_DATA.GROUPS.find(g => g.id === activeId);

  function send() {
    if (!draft.trim()) return;
    setThread(t => [...t, { kind: "msg", from: 0, text: draft, time: "сейчас" }]);
    setDraft("");
    setTimeout(() => {
      const memberId = active.members[Math.floor(Math.random() * active.members.length)];
      setThread(t => [...t, { kind: "msg", from: memberId, text: "Принято! 👍", time: "сейчас" }]);
    }, 1300);
  }

  return (
    <div className="msg-shell">
      <GroupList activeId={activeId} setActiveId={setActiveId}/>

      {active ? (
        <div className="chat-pane">
          <GroupChatBar group={active} openCall={openCall}/>
          <div className="chat-scroll" ref={scrollRef}>
            {thread.map((m, i) => <GroupThreadItem key={i} m={m} group={active}/>)}
          </div>
          <Composer draft={draft} setDraft={setDraft} onSend={send}/>
        </div>
      ) : null}

      {active ? <GroupRail group={active} openCall={openCall} openProfile={openProfile}/> : null}
    </div>
  );
}

function GroupList({ activeId, setActiveId }) {
  return (
    <div className="conv-list">
      <div className="conv-head">
        <h2>
          Группы
          <button title="Новая группа" onClick={()=>window.toast?.("Открыто окно создания группы", { sub: "Шаги: название → участники → тип" })}><Ihr.Plus size={14}/></button>
        </h2>
        <div className="conv-search">
          <Ihr.Search size={14}/>
          <input placeholder="Поиск групп"/>
        </div>
      </div>
      <div className="new-conv-callout">
        <Ihr.Group size={14}/>
        <div><b>4 группы</b> · 26 участников всего</div>
      </div>
      <div className="conv-scroll" style={{marginTop: 4}}>
        {HR_DATA.GROUPS.map(g => {
          const members = g.members.slice(0,2).map(id => HR_DATA.EMPLOYEES.find(e=>e.id===id));
          return (
            <div className={"conv-item" + (activeId===g.id?" active":"")} key={g.id} onClick={()=>setActiveId(g.id)}>
              <div className="group-av">
                <div className={"gv " + members[0].avClass}>{members[0].initials}</div>
                <div className={"gv " + members[1].avClass}>{members[1].initials}</div>
              </div>
              <div style={{minWidth:0}}>
                <div className="ci-name">
                  <span className="name-text">{g.name}</span>
                  <span className="typ">{g.type}</span>
                </div>
                <div className="ci-preview">{g.preview}</div>
              </div>
              <div className="ci-meta">
                <span className="ci-when">{g.lastAt}</span>
                {g.unread ? <span className="ci-unread">{g.unread}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GroupChatBar({ group, openCall }) {
  const memb = group.members.map(id => HR_DATA.EMPLOYEES.find(e=>e.id===id));
  return (
    <div className="chat-bar">
      <div className="group-av" style={{width:40, height:40}}>
        <div className={"gv " + memb[0].avClass}>{memb[0].initials}</div>
        <div className={"gv " + memb[1].avClass}>{memb[1].initials}</div>
      </div>
      <div className="head-meta">
        <b>{group.name}</b>
        <span className="online">{memb.length} участников · {memb.filter(m=>m.status==='online').length} в сети</span>
      </div>
      <div className="head-actions">
        <button className="call-btn" title="Голосовая встреча" onClick={()=>openCall("group:"+group.id, "voice")}><Ihr.Phone size={16}/></button>
        <button className="call-btn primary" title="Видеовстреча" onClick={()=>openCall("group:"+group.id, "video")}><Ihr.Video size={16}/></button>
        <button className="call-btn" title="Закрепить" onClick={()=>window.toast?.("Сообщение закреплено в группе", { kind:"good" })}><Ihr.Pin size={16}/></button>
        <button className="call-btn" title="Меню" onClick={()=>window.toast?.("Меню группы", { sub: "Участники · Файлы · Уведомления · Архив" })}><Ihr.More size={16}/></button>
      </div>
    </div>
  );
}

function GroupThreadItem({ m, group }) {
  if (m.kind === "divider") return <div className="chat-divider">{m.text}</div>;
  if (m.kind === "system") {
    return <div style={{display:'flex', justifyContent:'center', margin:'10px 0'}}>
      <div className="bubble system">{m.text}</div>
    </div>;
  }
  if (m.kind === "call") {
    const initiator = HR_DATA.EMPLOYEES.find(e=>e.id===m.by) || HR_DATA.HR_USER;
    return (
      <div className="bubble-row">
        <div className={"av-s " + (initiator.avClass||"av-1")}>{initiator.initials||"ОК"}</div>
        <div className="call-card">
          <div className="icn"><Ihr.Video size={14}/></div>
          <div>
            <b>Групповой видеозвонок · {m.duration}</b>
            <small>Участвовали: {m.count} человек</small>
          </div>
          <span className="when">{m.time}</span>
        </div>
      </div>
    );
  }
  if (m.kind === "file") {
    const sender = HR_DATA.EMPLOYEES.find(e=>e.id===m.from) || HR_DATA.HR_USER;
    return (
      <div className={"bubble-row" + (m.from === 0 ? " me" : "")}>
        {m.from !== 0 ? <div className={"av-s " + sender.avClass}>{sender.initials}</div> : null}
        <div className="file-bubble">
          <div className="ft">{m.kindLabel}</div>
          <div>
            <b>{m.name}</b>
            <small>{m.size} · от {sender.name?.split(' ')[0] || "Ольги"}</small>
          </div>
          <button className="icon-btn"><Ihr.Download size={13}/></button>
        </div>
      </div>
    );
  }
  const me = m.from === 0;
  const sender = HR_DATA.EMPLOYEES.find(e=>e.id===m.from) || HR_DATA.HR_USER;
  return (
    <div className={"bubble-row" + (me ? " me" : "")}>
      {!me ? <div className={"av-s " + sender.avClass}>{sender.initials}</div> : null}
      <div className="bubble">
        {!me ? <span className="sender">{sender.name?.split(' ')[0] || "Ольга"}</span> : null}
        {m.text}
        <span className="time">{m.time}</span>
      </div>
    </div>
  );
}

function GroupRail({ group, openCall, openProfile }) {
  const memb = group.members.map(id => HR_DATA.EMPLOYEES.find(e=>e.id===id));
  return (
    <aside className="chat-rail">
      <div className="rail-profile">
        <div className="group-av" style={{width:64, height:64, margin:'0 auto 10px', position:'relative'}}>
          <div className={"gv " + memb[0].avClass} style={{width:38, height:38, fontSize:14, top:0, left:0, position:'absolute', borderRadius:'50%', display:'grid', placeItems:'center', color:'white', fontWeight:500, border:'3px solid var(--surface)'}}>{memb[0].initials}</div>
          <div className={"gv " + memb[1].avClass} style={{width:38, height:38, fontSize:14, bottom:0, right:0, position:'absolute', borderRadius:'50%', display:'grid', placeItems:'center', color:'white', fontWeight:500, border:'3px solid var(--surface)'}}>{memb[1].initials}</div>
        </div>
        <h3>{group.name}</h3>
        <p>{group.type} · {memb.length} участников</p>
        <div className="quick-acts">
          <button className="call-btn" onClick={()=>openCall("group:"+group.id, "voice")}><Ihr.Phone size={15}/></button>
          <button className="call-btn primary" onClick={()=>openCall("group:"+group.id, "video")}><Ihr.Video size={15}/></button>
          <button className="call-btn" onClick={()=>window.toast?.("Добавить участника", { sub: "Выберите стажёра или ментора" })}><Ihr.Plus size={15}/></button>
          <button className="call-btn" onClick={()=>window.toast?.("Открыты настройки группы", { sub: "Уведомления, доступ, ник" })}><Ihr.Settings size={15}/></button>
        </div>
      </div>

      <div className="rail-section">
        <h4>Участники · {memb.length}</h4>
        {memb.map(e => (
          <div key={e.id} style={{display:'grid', gridTemplateColumns:'28px 1fr auto', gap:10, alignItems:'center', padding:'6px 0', borderTop:'1px dashed var(--line)', fontSize:12.5, cursor:'pointer'}}
               onClick={()=>openProfile?.(e.id)}>
            <div className="av-wrap" style={{position:'relative'}}>
              <div className={"av " + e.avClass} style={{width:28, height:28, borderRadius:'50%', display:'grid', placeItems:'center', color:'white', fontSize:10, fontWeight:500}}>{e.initials}</div>
              <span className={"dot " + e.status} style={{position:'absolute', right:-1, bottom:-1, width:9, height:9, borderRadius:'50%', border:'2px solid var(--surface)'}}/>
            </div>
            <div>
              <b style={{fontWeight:500}}>{e.name}</b>
              <div style={{fontSize:10.5, color:'var(--mute)', textTransform:'uppercase', letterSpacing:0.4, fontFamily:'var(--font-mono)'}}>{e.team}</div>
            </div>
            <span className={"score-x " + (e.score>=85?"good":e.score>=70?"mute":e.score>=60?"warn":"bad")} style={{fontSize:11}}>{e.score}</span>
          </div>
        ))}
      </div>

      <div className="rail-section">
        <h4>Закреплено</h4>
        <div className="scenario-pin" style={{maxWidth:'100%', marginBottom:8, cursor:'pointer'}}
             onClick={()=>window.toast?.("Калибровка · понедельник 11:30", { sub: "Видеовстреча · 45 минут" })}>
          <div className="icn"><Ihr.Pin size={14}/></div>
          <div>
            <b>Калибровка · понедельник 11:30</b>
            <small>Разбор сценариев недели</small>
          </div>
        </div>
        <div className="rail-file" style={{borderTop:'1px dashed var(--line)', cursor:'pointer'}}
             onClick={()=>window.toast?.("Скачивание · Регламент_калибровки.pdf", { kind:"good", sub: "240 КБ" })}>
          <div className="ft">PDF</div>
          <div>
            <b>Регламент_калибровки.pdf</b>
            <small>240 КБ · закреплено</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

function buildGroupThread(groupId) {
  if (groupId === "g1") {
    return [
      { kind:"divider", text:"Сегодня · 09:14" },
      { kind:"msg", from:0,  text:"Доброе утро, команда! Напоминаю: сегодня в 11:30 калибровка по сценариям недели. Подготовьте лучшую и самую трудную запись.", time:"09:14" },
      { kind:"msg", from:2,  text:"Готова — у меня есть запись с трудным отказом по карте Gold", time:"09:21" },
      { kind:"msg", from:1,  text:"Я тоже подготовил две — успели разобрать с ментором вчера", time:"09:28" },
      { kind:"file", from:2, name:"Алина_Возражение_по_карте.mp4", size:"18.6 МБ", kindLabel:"MP4" },
      { kind:"msg", from:5,  text:"А можно прислать запись позже? Я приду на 5 минут позже — стою в пробке", time:"09:42" },
      { kind:"msg", from:0,  text:"Конечно, Артём. Подключайся, когда сможешь.", time:"09:45" },
      { kind:"call", by:0, duration:"32 мин", count:5, time:"вчера, 11:30" },
      { kind:"divider", text:"10:32" },
      { kind:"msg", from:11, text:"Коллеги, кто прошёл «Антифрод базовый»? Поделитесь опытом 🙏", time:"10:32" },
      { kind:"msg", from:1,  text:"Прошёл вчера — там главное не торопиться на двойных триггерах. Расскажу в личке.", time:"10:38" },
      { kind:"msg", from:8,  text:"@Алина можешь скинуть тот PDF с регламентом?", time:"10:41" },
      { kind:"msg", from:2,  text:"Да, конечно — прикрепляю", time:"10:42" },
      { kind:"file", from:2, name:"Антифрод_регламент.pdf", size:"1.2 МБ", kindLabel:"PDF" },
    ];
  }
  if (groupId === "g2") {
    return [
      { kind:"divider", text:"Сегодня · 09:48" },
      { kind:"msg", from:10, text:"Загрузила обновлённый сценарий с новыми триггерами антифрода. Готов к тестированию.", time:"09:48" },
      { kind:"file", from:10, name:"Антифрод_v2.scenario", size:"460 КБ", kindLabel:"FILE" },
      { kind:"msg", from:3,  text:"Тестирую сейчас. Заметил что на шаге 4 нужно ещё одно подтверждение", time:"10:02" },
      { kind:"msg", from:7,  text:"Соглашусь — у меня тоже сработало некорректно", time:"10:08" },
      { kind:"msg", from:0,  text:"Окей, добавим в бэклог. Виктория, поправишь к четвергу?", time:"10:11" },
      { kind:"msg", from:10, text:"Да, успею.", time:"10:15" },
    ];
  }
  if (groupId === "g3") {
    return [
      { kind:"divider", text:"Сегодня · 09:30" },
      { kind:"system", text:"Ольга добавила Григория Зимина в группу" },
      { kind:"msg", from:0,  text:"Коллеги, добавила Григория — будет участвовать в калибровке корпоратив-кейсов.", time:"09:32" },
      { kind:"msg", from:7,  text:"Спасибо! Готов подключиться", time:"09:48" },
      { kind:"msg", from:4,  text:"Можно перенести встречу на 14:30? У меня налагается с сессией ментора", time:"09:58" },
      { kind:"msg", from:0,  text:"Давайте обсудим — кто за 14:30?", time:"10:00" },
    ];
  }
  // g4
  return [
    { kind:"divider", text:"Вчера · 17:10" },
    { kind:"msg", from:6, text:"Спасибо за разбор кейса по премиум-обслуживанию! Очень полезно про двойную верификацию.", time:"17:10" },
    { kind:"msg", from:0, text:"Рада, что зашло. На следующей неделе разберём кейс с международным переводом.", time:"17:14" },
    { kind:"msg", from:9, text:"👏👏👏", time:"17:15" },
    { kind:"msg", from:12, text:"Жду! Заранее посмотрю материалы.", time:"18:02" },
  ];
}

window.Groups = Groups;
