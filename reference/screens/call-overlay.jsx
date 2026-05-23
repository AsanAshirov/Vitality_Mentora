// call-overlay.jsx — active video/voice call

const { useState: useState_co, useEffect: useEffect_co } = React;

function CallOverlay({ peerSpec, mode, onEnd }) {
  // peerSpec is either number (employee id) or "group:gID"
  const isGroup = typeof peerSpec === "string" && peerSpec.startsWith("group:");
  const group = isGroup ? HR_DATA.GROUPS.find(g => g.id === peerSpec.slice(6)) : null;
  const peers = isGroup
    ? group.members.slice(0, 4).map(id => HR_DATA.EMPLOYEES.find(e => e.id === id))
    : [HR_DATA.EMPLOYEES.find(e => e.id === peerSpec)];

  const [seconds, setSeconds] = useState_co(0);
  const [camOff, setCamOff] = useState_co(false);
  const [micOff, setMicOff] = useState_co(false);
  const [hand, setHand] = useState_co(false);
  const [tab, setTab] = useState_co("chat");
  const [speakerIdx, setSpeakerIdx] = useState_co(0);

  useEffect_co(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect_co(() => {
    if (peers.length < 2) return;
    const t = setInterval(() => setSpeakerIdx(i => (i + 1) % peers.length), 3500);
    return () => clearInterval(t);
  }, [peers.length]);

  function fmtTime(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s%3600)/60), sec = s%60;
    return (h ? `${h}:${String(m).padStart(2,'0')}` : `${m}`) + `:${String(sec).padStart(2,'0')}`;
  }

  const tileCount = peers.length + 1; // include self
  const tileCls = tileCount === 1 ? "n1" : tileCount === 2 ? "n2" : tileCount === 3 ? "n3" : tileCount === 4 ? "n4" : tileCount === 5 ? "n5" : "n6";

  return (
    <div className="call-overlay">
      <div className="call-bar">
        <div className="left">
          <div className="call-pip"/>
          <h3>
            {isGroup ? group.name : peers[0].name}
            {mode === "video" ? " · Видеосвязь" : " · Голосовой звонок"}
          </h3>
          <span className="timer">{fmtTime(seconds)}</span>
        </div>
        <div className="right">
          <button className="call-bar-btn" onClick={()=>window.toast?.("Открыты заметки встречи", { sub: "Заметка попадёт в карточку участника" })}><Ihr.Doc size={14}/> Заметки</button>
          <button className="call-bar-btn" onClick={()=>window.toast?.("Запись началась", { kind:"good", sub: "Все участники уведомлены" })}><Ihr.Activity size={14}/> Запись</button>
          <button className="call-bar-btn" onClick={()=>window.toast?.("Меню звонка", { sub: "Качество · Эффекты · Раскладка · Сообщить о проблеме" })}><Ihr.More size={14}/></button>
        </div>
      </div>

      <div className="call-stage">
        <div className={"tile-grid " + tileCls}>
          {peers.map((p, i) => (
            <div className={"vtile" + (i === speakerIdx ? " speaking" : "")} key={p.id}>
              <div className="bg-grid"/>
              {mode === "video" && !camOff ? (
                <div className={"face " + p.avClass + (i === speakerIdx ? " speaking-pulse" : "")}>{p.initials}</div>
              ) : (
                <div className={"face " + p.avClass}>{p.initials}</div>
              )}
              <span className="label">
                {p.name}
                {i === 0 && micOff ? <Ihr.MicOff size={12} className="mic-off"/> : null}
              </span>
            </div>
          ))}
          <div className="vtile self">
            <div className="bg-grid"/>
            {mode === "video" && !camOff ? (
              <div className={"face " + HR_DATA.HR_USER.avClass}>{HR_DATA.HR_USER.initials}</div>
            ) : (
              <div className="face av-1">{HR_DATA.HR_USER.initials}</div>
            )}
            <span className="label">
              Вы (Ольга)
              {micOff ? <Ihr.MicOff size={12} style={{color:'#FF6A5C'}}/> : null}
              {camOff && mode === "video" ? <Ihr.CamOff size={12} style={{color:'#FF6A5C'}}/> : null}
            </span>
          </div>
        </div>

        <div className="call-side">
          <div className="call-side-tabs">
            <button className={"call-side-tab" + (tab==="chat"?" active":"")} onClick={()=>setTab("chat")}>Чат</button>
            <button className={"call-side-tab" + (tab==="people"?" active":"")} onClick={()=>setTab("people")}>Участники · {peers.length + 1}</button>
            <button className={"call-side-tab" + (tab==="notes"?" active":"")} onClick={()=>setTab("notes")}>Заметки</button>
          </div>
          <div className="call-side-body">
            {tab === "chat" ? (
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
                      <div className="head"><b>{peers[1]?.name.split(' ')[0] || "—"}</b><span className="t">0:42</span></div>
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
            ) : tab === "people" ? (
              <>
                <div className="cs-participant">
                  <div className={"av " + HR_DATA.HR_USER.avClass}>{HR_DATA.HR_USER.initials}</div>
                  <div>
                    <div>Ольга Карпова <span className="role-tag">· ведущий</span></div>
                  </div>
                  <span/>
                  <span className={"mic-state" + (micOff ? " muted" : "")}>
                    {micOff ? <Ihr.MicOff size={14}/> : <Ihr.Mic size={14}/>}
                  </span>
                </div>
                {peers.map((p, i) => (
                  <div className="cs-participant" key={p.id}>
                    <div className={"av " + p.avClass}>{p.initials}</div>
                    <div>
                      <div>{p.name}</div>
                    </div>
                    <span className="role-tag">{p.team}</span>
                    <span className={"mic-state " + (i === speakerIdx ? "speaking" : "")}>
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
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="call-controls">
        <button className={"cc-btn" + (micOff?" off":"")} onClick={()=>setMicOff(v=>!v)} title="Микрофон">
          {micOff ? <Ihr.MicOff size={18}/> : <Ihr.Mic size={18}/>}
        </button>
        {mode === "video" ? (
          <button className={"cc-btn" + (camOff?" off":"")} onClick={()=>setCamOff(v=>!v)} title="Камера">
            {camOff ? <Ihr.CamOff size={18}/> : <Ihr.Video size={18}/>}
          </button>
        ) : null}
        <button className="cc-btn" title="Демонстрация экрана"
                onClick={()=>window.toast?.("Демонстрация экрана включена", { kind:"good", sub: "Выберите окно или вкладку" })}>
          <Ihr.Screen size={18}/>
        </button>
        <button className={"cc-btn" + (hand?" off":"")} onClick={()=>{ setHand(v=>!v); window.toast?.(hand ? "Рука опущена" : "Рука поднята", { kind: hand ? "" : "warn" }); }} title="Поднять руку">
          <Ihr.Hand size={18}/>
        </button>
        <button className="cc-btn" title="Реакция"
                onClick={()=>window.toast?.("👍", { sub: "Реакция отправлена всем" })}>
          <Ihr.Smile size={18}/>
        </button>
        <button className="cc-btn" title="Участники"
                onClick={()=>setTab("people")}>
          <Ihr.Team size={18}/>
        </button>
        <button className="cc-btn end" onClick={onEnd} title="Завершить">
          <Ihr.PhoneOff size={18}/>
        </button>
      </div>
    </div>
  );
}

window.CallOverlay = CallOverlay;
