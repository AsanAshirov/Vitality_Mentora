// app.jsx — top-level wiring: routes, state, tweaks, Clicky

const { useState: useState_a, useEffect: useEffect_a, useMemo: useMemo_a } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "clickyEnabled": true,
  "clickyMode": "smart",
  "density": "regular",
  "accent": "#2046FF",
  "lang": "RU",
  "panelOpen": true,
  "panelTab": "clicky",
  "railHidden": false
}/*EDITMODE-END*/;

// Clicky's anchored guidance — KYC by stepIndex; other scenarios by step id
function clickyScript(route, simPage, stepIndex, scStepId) {
  if (route === "dashboard") {
    return {
      target: "todays-quest",
      message: { who: "проводник", lead: "Начни отсюда →",
        text: "Сегодняшний квест — <b>верификация KYC</b>. Нажми «Начать». Я пойду с тобой и буду рассказывать." }
    };
  }
  if (route === "simulator" && simPage === "kyc") {
    if (stepIndex === 0) return { target: "customer-card",
      message: { who: "шаг 1 из 6", lead: "Начни с карточки клиента.",
        text: "Это <b>синтетический профиль</b>. Сверь основные поля и переходи к проверке личности." } };
    if (stepIndex === 1) return { target: "identity-card",
      message: { who: "шаг 2 из 6", lead: "Личность подтверждена.",
        text: "OCR <b>98.4%</b>. Продолжай." } };
    if (stepIndex === 2) return { target: "sanctions-card",
      message: { who: "шаг 3 из 6 · ⚠", lead: "Прочитай хит.",
        text: "Уверенность <b>72%</b>. <span class='cite-mono'>SANCTIONS-PROC §1.4</span>: эскалация." } };
    if (stepIndex === 3) return { target: "sof-card",
      message: { who: "шаг 4 из 6", lead: "ИС обязателен.",
        text: "75 млн UZS — выше порога 50 млн." } };
    if (stepIndex === 4) return { target: "risk-card",
      message: { who: "шаг 5 из 6", lead: "Риск — высокий.",
        text: "Клиентский риск автоподставился из-за эскалации." } };
    if (stepIndex === 5) return { target: "risk-card",
      message: { who: "шаг 6 из 6", lead: "Отправь на проверку.", text: "Досье уйдёт наставнику и в комплаенс." } };
  }
  // Account opening — by step id
  if (route === "simulator" && simPage === "accounts" && scStepId) {
    const map = {
      customer: { target: "ao-customer", message: { who: "шаг 1 из 4", lead: "Найди клиента.", text: "Набери фамилию или выбери из списка ниже." } },
      product:  { target: "ao-product",  message: { who: "шаг 2 из 4", lead: "Выбери продукт.", text: "Тип счёта и валюта." } },
      terms:    { target: "ao-terms",    message: { who: "шаг 3 из 4", lead: "Тариф.",        text: "<b>Резидент · базовый</b> — без комиссии." } },
      sign:     { target: "ao-sign",     message: { who: "шаг 4 из 4", lead: "Подпись.",     text: "Сгенерируй номер и введи OTP <b class='mono'>1234</b>." } },
    };
    return map[scStepId];
  }
  // Deposit
  if (route === "simulator" && simPage === "deposits" && scStepId) {
    const map = {
      client:  { target: "dep-client",  message: { who: "шаг 1 из 4", lead: "Клиент и сумма.",  text: "От 50 млн UZS — появится шаг ИС." } },
      terms:   { target: "dep-terms",   message: { who: "шаг 2 из 4", lead: "Срок и ставка.", text: "Стандарт — <b>12 мес · 23.5%</b>." } },
      sof:     { target: "dep-sof",     message: { who: "шаг 3 из 4", lead: "Декларация ИС.", text: "<span class='cite-mono'>AML-HB §4.7</span> — нужна 2-НДФЛ." } },
      confirm: { target: "dep-confirm", message: { who: "шаг 4 из 4", lead: "Проверь.",       text: "Сверь параметры и оформи." } },
    };
    return map[scStepId];
  }
  // Transfer
  if (route === "simulator" && simPage === "transfers" && scStepId) {
    const map = {
      from: { target: "tr-from", message: { who: "шаг 1 из 5", lead: "Отправитель.", text: "Счёт с достаточным остатком." } },
      to:   { target: "tr-to",   message: { who: "шаг 2 из 5", lead: "Получатель.", text: "Для SWIFT — BIC банка." } },
      amt:  { target: "tr-amt",  message: { who: "шаг 3 из 5", lead: "Сумма.",       text: "На больших суммах включится AML." } },
      aml:  { target: "tr-aml",  message: { who: "шаг 4 из 5 · ⚠", lead: "AML.", text: "При флаге — эскалируй в комплаенс." } },
      conf: { target: "tr-conf", message: { who: "шаг 5 из 5", lead: "Подтверждение.", text: "Сверь и проведи." } },
    };
    return map[scStepId];
  }
  // Card issue
  if (route === "simulator" && simPage === "cards" && scStepId) {
    const map = {
      client:  { target: "ao-customer", message: { who: "шаг 1 из 4", lead: "Держатель.", text: "Карта привяжется к выбранному клиенту." } },
      product: { target: "ci-product",  message: { who: "шаг 2 из 4", lead: "Бренд и категория.", text: "UZCARD/HUMO — RUзб. VISA/Mastercard — зарубеж." } },
      params:  { target: "ci-params",   message: { who: "шаг 3 из 4", lead: "Лимиты.",    text: "Дефолты уже проставлены." } },
      review:  { target: "ci-review",   message: { who: "шаг 4 из 4", lead: "Финал.",      text: "Отправь в персонализацию." } },
    };
    return map[scStepId];
  }
  return null;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Main routes
  const [route, setRoute] = useState_a("dashboard"); // dashboard | simulator | knowledge | badges | profile | settings | results
  // Simulator sub-page
  const [simPage, setSimPage] = useState_a("kyc");
  // Mode within accounts/deposits/transfers/cards
  const [simMode, setSimMode] = useState_a("scenario");
  const [taskTitle, setTaskTitle] = useState_a(null);
  // KYC scenario state
  const [stepIndex, setStepIndex] = useState_a(0);
  const [sanctionsAction, setSanctionsAction] = useState_a(null);

  // Gamification
  const [xp, setXp] = useState_a(1480);
  const [level] = useState_a(3);
  const [streak] = useState_a(5);

  // Chat
  const [panelOpen, setPanelOpen] = useState_a(t.panelOpen);
  const [panelTab, setPanelTab]   = useState_a(t.panelTab);
  useEffect_a(() => { setPanelOpen(t.panelOpen); }, [t.panelOpen]);
  useEffect_a(() => { setPanelTab(t.panelTab); },   [t.panelTab]);

  // Clicky settings (lives independently from tweaks)
  const [clicky, setClicky] = useState_a({
    name: "Клик", color: "#2046FF", lang: "RU", voice: "guide",
    tutorial: true, autoHint: true, silent: false, sound: false,
  });
  const [summoned, setSummoned] = useState_a(false);

  // Left sidebar visibility
  const [sidebarHidden, setSidebarHidden] = useState_a(false);

  // Clicky bubble dismissal
  const [clickyDismissed, setClickyDismissed] = useState_a(false);
  useEffect_a(() => { setClickyDismissed(false); }, [route, simPage, stepIndex]);

  // PTT live indicator
  const [ptt, setPtt] = useState_a(false);
  useEffect_a(() => {
    const d = (e) => { if (e.key === "`" && !e.repeat) setPtt(true); };
    const u = (e) => { if (e.key === "`") setPtt(false); };
    window.addEventListener("keydown", d);
    window.addEventListener("keyup", u);
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, []);

  // ⌘K / Ctrl+K → open chat tab
  useEffect_a(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPanelTab("chat");
        setPanelOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Accent override
  useEffect_a(() => {
    document.documentElement.style.setProperty("--cobalt", t.accent);
    const c = t.accent;
    document.documentElement.style.setProperty("--cobalt-glow", c + "2e");
    document.documentElement.style.setProperty("--cobalt-50",   c + "0f");
  }, [t.accent]);

  // Reset simMode + taskTitle when switching sim pages
  const enterSimPage = (page) => {
    setSimPage(page);
    setSimMode("scenario");
    setTaskTitle(null);
  };

  // Dashboard scenario → simulator routing
  const handleStart = (scenarioId) => {
    if (scenarioId === "kyc") {
      setStepIndex(0);
      setSanctionsAction(null);
      enterSimPage("kyc");
      setRoute("simulator");
    } else {
      const map = { open: "accounts", deposit: "deposits", transfer: "transfers" };
      if (map[scenarioId]) {
        enterSimPage(map[scenarioId]);
        setRoute("simulator");
      }
    }
  };

  // Launch from Tasks page
  const handleTaskLaunch = (task) => {
    const map = { kyc: "kyc", open_account: "accounts", open_deposit: "deposits", new_transfer: "transfers", issue_card: "cards" };
    const page = map[task.scenario];
    if (!page) return;
    if (page === "kyc") { setStepIndex(0); setSanctionsAction(null); }
    setSimPage(page);
    setSimMode("scenario");
    setTaskTitle(task.title);
    setRoute("simulator");
  };

  const handleComplete = () => {
    const xpEarned = sanctionsAction === "escal" ? 80 : sanctionsAction === "override" ? 25 : 50;
    setXp(xp + xpEarned);
    setRoute("results");
  };

  // Breadcrumbs by route
  const crumbs =
    route === "dashboard" ? ["Стажёр", "Главная"]
  : route === "tasks"     ? ["Стажёр", "Задачи"]
  : route === "messages"  ? ["Стажёр", "Сообщения"]
  : route === "simulator" ? ["Стажёр", "Симулятор"]
  : route === "knowledge" ? ["Стажёр", "База знаний"]
  : route === "badges"    ? ["Стажёр", "Награды"]
  : route === "profile"   ? ["Стажёр", "Профиль"]
  : route === "settings"  ? ["Стажёр", "Настройки"]
  : route === "results"   ? ["Стажёр", "Сценарий", "Результаты"]
  : ["Стажёр"];

  // Clicky
  // Current step inside non-KYC scenarios (reported via onStepChange)
  const [scenarioStepId, setScenarioStepId] = useState_a(null);

  const script = useMemo_a(() => clickyScript(route, simPage, stepIndex, scenarioStepId), [route, simPage, stepIndex, scenarioStepId]);
  const showClicky = t.clickyEnabled;
  const showAnchored = script && !clickyDismissed && t.clickyMode !== "ghost";
  // Auto-summon Clicky in tutorial mode whenever there's a script (simulator scenarios)
  const autoSummoned = clicky.tutorial && showAnchored;
  const score = sanctionsAction === "escal" ? 93 : sanctionsAction === "override" ? 52 : 74;
  const xpEarned = sanctionsAction === "escal" ? 80 : sanctionsAction === "override" ? 25 : 50;

  // Lang setter for Settings page
  const setLang = (l) => setTweak("lang", l);

  return (
    <div className={`app density-${t.density} ${sidebarHidden ? "sidebar-hidden" : ""}`}>
      <Sidebar route={route} setRoute={setRoute} xp={xp} level={level} sidebarHidden={sidebarHidden} setSidebarHidden={setSidebarHidden} />

      <div className="workspace">
        <Topbar crumbs={crumbs} ptt={ptt} onCrumb={(i) => i === 0 && setRoute("dashboard")}
                sidebarHidden={sidebarHidden} setSidebarHidden={setSidebarHidden} />

        <div className="main" key={route + ":" + simPage + ":" + simMode}>
          {route === "dashboard" && <Dashboard onStartScenario={handleStart} xp={xp} level={level} streak={streak} />}
          {route === "tasks"     && <TasksPage onLaunch={handleTaskLaunch} />}
          {route === "messages"  && <MessagesPage />}

          {route === "simulator" && simPage === "kyc"       && <KycScenario stepIndex={stepIndex} setStepIndex={setStepIndex} onComplete={handleComplete} sanctionsAction={sanctionsAction} setSanctionsAction={setSanctionsAction} setSimPage={enterSimPage} />}
          {route === "simulator" && simPage === "accounts"  && simMode === "scenario" && <OpenAccountScenario setSimPage={enterSimPage} taskTitle={taskTitle} onStepChange={setScenarioStepId} onComplete={() => setRoute("tasks")} onJournal={() => setSimMode("journal")} />}
          {route === "simulator" && simPage === "accounts"  && simMode === "journal"  && <AccountsPage setSimPage={enterSimPage} onSwitchScenario={() => setSimMode("scenario")} />}
          {route === "simulator" && simPage === "deposits"  && simMode === "scenario" && <DepositScenario setSimPage={enterSimPage} taskTitle={taskTitle} onStepChange={setScenarioStepId} onComplete={() => setRoute("tasks")} onJournal={() => setSimMode("journal")} />}
          {route === "simulator" && simPage === "deposits"  && simMode === "journal"  && <DepositsPage setSimPage={enterSimPage} onSwitchScenario={() => setSimMode("scenario")} />}
          {route === "simulator" && simPage === "transfers" && simMode === "scenario" && <TransferScenario setSimPage={enterSimPage} taskTitle={taskTitle} onStepChange={setScenarioStepId} onComplete={() => setRoute("tasks")} onJournal={() => setSimMode("journal")} />}
          {route === "simulator" && simPage === "transfers" && simMode === "journal"  && <TransfersPage setSimPage={enterSimPage} onSwitchScenario={() => setSimMode("scenario")} />}
          {route === "simulator" && simPage === "cards"     && simMode === "scenario" && <CardIssueScenario setSimPage={enterSimPage} taskTitle={taskTitle} onStepChange={setScenarioStepId} onComplete={() => setRoute("tasks")} onJournal={() => setSimMode("journal")} />}
          {route === "simulator" && simPage === "cards"     && simMode === "journal"  && <CardsPage setSimPage={enterSimPage} onSwitchScenario={() => setSimMode("scenario")} />}
          {route === "simulator" && simPage === "sanctions" && <SanctionsListPage setSimPage={enterSimPage} />}
          {route === "simulator" && simPage === "pep"       && <PepPage setSimPage={enterSimPage} />}
          {route === "simulator" && simPage === "aml"       && <AmlPage setSimPage={enterSimPage} />}
          {route === "simulator" && simPage === "handbook"  && <HandbookPage setSimPage={enterSimPage} />}
          {route === "simulator" && simPage === "activity"  && <ActivityPage setSimPage={enterSimPage} />}

          {route === "knowledge" && <KnowledgePage openChat={() => { setPanelTab("chat"); setPanelOpen(true); }} lang={clicky.lang} />}
          {route === "badges"    && <BadgesPage />}
          {route === "profile"   && <ProfilePage xp={xp} level={level} streak={streak} />}
          {route === "settings"  && <SettingsPage t={t} setTweak={setTweak} lang={t.lang} setLang={setLang} />}

          {route === "results"   && (
            <Results
              score={score}
              xpEarned={xpEarned}
              sanctionsAction={sanctionsAction}
              onRetry={() => { setStepIndex(0); setSanctionsAction(null); setRoute("simulator"); }}
              onContinue={() => setRoute("dashboard")}
            />
          )}
        </div>
      </div>

      {showClicky && (
        <Clicky
          enabled
          mode={showAnchored ? "anchored" : "cursor"}
          target={showAnchored ? script.target : null}
          message={showAnchored ? script.message : null}
          onDismiss={() => setClickyDismissed(true)}
          summoned={summoned}
          setSummoned={setSummoned}
          autoSummoned={autoSummoned}
          color={clicky.color}
        />
      )}

      <SidePanel
        open={panelOpen}
        setOpen={(v) => { setPanelOpen(v); setTweak("panelOpen", v); }}
        tab={panelTab}
        setTab={(v) => { setPanelTab(v); setTweak("panelTab", v); }}
        clicky={clicky}
        setClicky={setClicky}
        summoned={summoned}
        setSummoned={setSummoned}
        chatProps={{ lang: clicky.lang }}
      />

      <TweaksPanel title="Настройки">
        <TweakSection label="Клик (Clicky)" />
        <TweakToggle label="Показывать Клика" value={t.clickyEnabled} onChange={(v) => setTweak("clickyEnabled", v)} />
        <TweakRadio  label="Режим" value={t.clickyMode}
          options={[{value: "smart", label: "умный"}, {value: "ghost", label: "тихий"}]}
          onChange={(v) => setTweak("clickyMode", v)} />

        <TweakSection label="Интерфейс" />
        <TweakRadio label="Плотность" value={t.density}
          options={[{value: "compact", label: "плотно"}, {value: "regular", label: "обычно"}, {value: "comfy", label: "свободно"}]}
          onChange={(v) => setTweak("density", v)} />
        <TweakColor label="Акцент" value={t.accent}
          options={["#2046FF", "#0F2BD9", "#1B5BFF", "#FF7A1A", "#0B8F5C", "#6F47E0"]}
          onChange={(v) => setTweak("accent", v)} />

        <TweakSection label="Язык" />
        <TweakRadio label="Локаль" value={t.lang}
          options={["RU", "UZ", "EN"]}
          onChange={(v) => setTweak("lang", v)} />

        <TweakSection label="Демо" />
        <TweakButton label="Открыть чат"      onClick={() => { setPanelTab("chat"); setPanelOpen(true); }} />
        <TweakButton label="Сбросить прогон" onClick={() => { setStepIndex(0); setSanctionsAction(null); setRoute("dashboard"); }} />
        <TweakButton label="К результатам" onClick={() => { setSanctionsAction(sanctionsAction || "escal"); setRoute("results"); }} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
