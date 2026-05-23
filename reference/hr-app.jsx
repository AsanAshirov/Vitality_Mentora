// hr-app.jsx — top-level wiring

const { useState: useState_app, useEffect: useEffect_app } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "route": "dashboard",
  "accent": "#2046FF",
  "density": "comfortable"
}/*EDITMODE-END*/;

function HrApp() {
  const [route, setRoute] = useState_app(DEFAULTS.route);
  const [profileId, setProfileId] = useState_app(null);
  const [callPeer, setCallPeer] = useState_app(null); // {id, mode}
  const [chatOpenId, setChatOpenId] = useState_app(null);

  const tweaks = window.useTweaks ? window.useTweaks(DEFAULTS) : [DEFAULTS, ()=>{}];
  const [t, setTweak] = tweaks;

  // Apply accent tweak
  useEffect_app(() => {
    const map = {
      "#2046FF":  ["#2046FF", "#0F2BD9", "#0a1857", "#ECF0FF", "#DCE3FF", "rgba(32, 70, 255, 0.18)"],
      "#5147E5":  ["#5147E5", "#3A30C8", "#1C1755", "#EEEDFB", "#DCD9F7", "rgba(81, 71, 229, 0.18)"],
      "#0E8A8A":  ["#0E8A8A", "#066F6F", "#063535", "#E0F5F5", "#C2EAEA", "rgba(14, 138, 138, 0.18)"],
      "#C42B7A":  ["#C42B7A", "#9B1F60", "#4B0F2D", "#FCE5F0", "#F8C7DE", "rgba(196, 43, 122, 0.18)"],
    };
    const v = map[t.accent] || map["#2046FF"];
    const r = document.documentElement.style;
    r.setProperty('--cobalt', v[0]);
    r.setProperty('--cobalt-deep', v[1]);
    r.setProperty('--cobalt-ink', v[2]);
    r.setProperty('--cobalt-tint', v[3]);
    r.setProperty('--cobalt-tint-2', v[4]);
    r.setProperty('--cobalt-glow', v[5]);
  }, [t.accent]);

  const unreadDM = HR_DATA.DIRECT.reduce((s,c)=>s + c.unread, 0);
  const unreadGroups = HR_DATA.GROUPS.reduce((s,g)=>s + g.unread, 0);

  function openProfile(id) { setProfileId(id); setRoute("profile"); }
  function backFromProfile() { setProfileId(null); setRoute("employees"); }
  function openChat(employeeId) {
    const conv = HR_DATA.DIRECT.find(c => c.with === employeeId);
    setChatOpenId(conv ? conv.id : null);
    setRoute("messages");
  }
  function openCall(peerId, mode) { setCallPeer({ id: peerId, mode: mode || "video" }); }
  function endCall() {
    window.toast?.("Звонок завершён", { kind:"good", sub: "Запись сохранена в карточку участника" });
    setCallPeer(null);
  }

  const crumbsMap = {
    dashboard:   ["HR Mentora", "Дашборд"],
    employees:   ["HR Mentora", "Сотрудники"],
    profile:     ["HR Mentora", "Сотрудники", profileId ? HR_DATA.EMPLOYEES.find(e=>e.id===profileId)?.name : ""],
    performance: ["HR Mentora", "Performance"],
    messages:    ["HR Mentora", "Сообщения"],
    groups:      ["HR Mentora", "Групповые чаты"],
    calendar:    ["HR Mentora", "Календарь"],
    requests:    ["HR Mentora", "Заявки"],
    rewards:     ["HR Mentora", "Награды"],
    settings:    ["HR Mentora", "Настройки"],
  };

  const fullbleed = route === "messages" || route === "groups";

  let screen;
  if (route === "dashboard")    screen = <Dashboard setRoute={setRoute} openProfile={openProfile} openChat={openChat}/>;
  else if (route === "employees") screen = <Employees openProfile={openProfile} openChat={openChat} openCall={openCall}/>;
  else if (route === "profile")   screen = <Profile id={profileId} onBack={backFromProfile} openChat={openChat} openCall={openCall}/>;
  else if (route === "performance") screen = <Performance openProfile={openProfile}/>;
  else if (route === "messages")  screen = <Messages openCall={openCall} initialConvId={chatOpenId} openProfile={openProfile}/>;
  else if (route === "groups")    screen = <Groups openCall={openCall} openProfile={openProfile}/>;
  else if (route === "calendar")  screen = <Calendar openCall={openCall} openProfile={openProfile}/>;
  else if (route === "requests")  screen = <Requests/>;
  else if (route === "rewards")   screen = <Rewards openProfile={openProfile}/>;
  else if (route === "settings")  screen = <Settings/>;
  else screen = <PlaceholderScreen label={crumbsMap[route]?.[1] || route}/>;

  return (
    <div className="app app-hr">
      <HrSidebar route={route} setRoute={(r)=>{ setRoute(r); if (r !== "profile") setProfileId(null); }} unreadDM={unreadDM} unreadGroups={unreadGroups}/>
      <div className={"app-main" + (fullbleed ? " fullbleed" : "")}>
        <HrTopbar crumbs={crumbsMap[route] || ["HR Mentora"]}
                  onOpenProfile={(id)=>{ if (id) openProfile(id); }}
                  onOpenSettings={()=>setRoute("settings")}/>
        {screen}
      </div>

      {callPeer ? (
        <CallOverlay peerSpec={callPeer.id} mode={callPeer.mode} onEnd={endCall}/>
      ) : null}

      <ToastHost/>

      {window.TweaksPanel ? (
        <TweaksPanel title="Tweaks · HR Mentora">
          <TweakSection label="Внешний вид"/>
          <TweakColor
            label="Акцент"
            value={t.accent}
            onChange={v => setTweak('accent', v)}
            options={['#2046FF', '#5147E5', '#0E8A8A', '#C42B7A']}
          />
          <TweakSection label="Навигация"/>
          <TweakSelect
            label="Экран"
            value={route}
            onChange={v => { setTweak('route', v); setRoute(v); }}
            options={['dashboard', 'employees', 'performance', 'messages', 'groups']}
          />
          <TweakSection label="Демо-действия"/>
          <TweakButton label="Видеозвонок · Никита" onClick={()=>openCall(1, "video")}/>
          <TweakButton label="Голосовой звонок · Никита" onClick={()=>openCall(1, "voice")} secondary/>
          <TweakButton label="Групповой видеозвонок" onClick={()=>openCall("group:g1", "video")} secondary/>
          <TweakButton label="Профиль топ-перформера" onClick={()=>openProfile(10)} secondary/>
        </TweaksPanel>
      ) : null}
    </div>
  );
}

function PlaceholderScreen({ label }) {
  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>{label}</h1>
          <p>Раздел в разработке — продолжим в следующей итерации</p>
        </div>
      </div>
      <div style={{
        marginTop: 40, padding: '60px 24px', textAlign: 'center',
        background: 'var(--surface)', border: '1px dashed var(--line-2)',
        borderRadius: 'var(--r-lg)', color: 'var(--mute)', fontSize: 13
      }}>
        <div className="glyph" style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
          margin: '0 auto 14px', color: 'var(--mute-2)'
        }}>
          <Ihr.Calendar size={22}/>
        </div>
        Скоро — пока заглушка для следующих итераций
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<HrApp/>);
