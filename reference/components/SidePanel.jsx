// SidePanel.jsx — right-edge panel housing Clicky settings + Chat.
// Two states: collapsed (56px rail with icons) and expanded (340px full panel).

const { useState: useState_sx, useEffect: useEffect_sx, useRef: useRef_sx } = React;

function SidePanel({ open, setOpen, tab, setTab, clicky, setClicky, chatProps, summoned, setSummoned }) {
  return (
    <aside className={`side-panel ${open ? "expanded" : "collapsed"}`}>
      <div className="sp-rail">
        <button
          className={`sp-rail-btn ${tab === "clicky" ? "active" : ""}`}
          onClick={() => { if (open && tab === "clicky") setOpen(false); else { setTab("clicky"); setOpen(true); } }}
          title="Клик"
        >
          <I.Spark size={16} />
        </button>
        <button
          className={`sp-rail-btn ${tab === "chat" ? "active" : ""}`}
          onClick={() => { if (open && tab === "chat") setOpen(false); else { setTab("chat"); setOpen(true); } }}
          title="Чат · база знаний"
        >
          <I.Chat size={16} />
        </button>

        <div className="sp-rail-spacer" />

        {/* Clicky's resting slot — always visible in rail */}
        <div className="sp-rail-clicky-home">
          <div className="clicky-rest-label">Клик</div>
          <div id="clicky-rest" className="clicky-rest-slot">
            {/* The actual Clicky cursor positions itself over this slot when at rest */}
          </div>
          <button className={`summon-btn ${summoned ? "active" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); setSummoned(true); }}
                  onMouseUp={() => setSummoned(false)}
                  onMouseLeave={() => setSummoned(false)}>
            {summoned ? "следую…" : "призвать"}
          </button>
          <div className="summon-hint">или зажми <kbd>`</kbd></div>
        </div>
      </div>

      {open && (
        <div className="sp-body">
          <ResizeHandle side="left" cssVar="--sidepanel-w" min={260} max={520} defaultSize={320} />
          {tab === "clicky" && <ClickyTab clicky={clicky} setClicky={setClicky} />}
          {tab === "chat"   && <ChatTab {...chatProps} />}
        </div>
      )}
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Clicky settings tab

const CLICKY_COLORS = [
  { v: "#2046FF", name: "Кобальт" },
  { v: "#0F2BD9", name: "Глубокий" },
  { v: "#FF7A1A", name: "Янтарь" },
  { v: "#0B8F5C", name: "Хвоя" },
  { v: "#6F47E0", name: "Лаванда" },
  { v: "#D7406A", name: "Малина" },
];

const CLICKY_LANGS = [
  { v: "RU", label: "Русский" },
  { v: "UZ", label: "Oʻzbekcha" },
  { v: "EN", label: "English" },
];

const CLICKY_VOICES = [
  { v: "guide", label: "Проводник",  desc: "Спокойный, объясняющий" },
  { v: "coach", label: "Тренер",     desc: "Прямой, мотивирующий" },
  { v: "neutral", label: "Нейтральный", desc: "Краткий, без эмоций" },
];

function ClickyTab({ clicky, setClicky }) {
  return (
    <div className="sp-tab">
      <div className="sp-tab-head">
        <h3>Клик</h3>
        <span className="tag cobalt">AI-проводник</span>
      </div>
      <p className="sub" style={{ marginTop: 4 }}>
        Маленький курсор-помощник. Живёт в этой панели, отвечает на голос, подсвечивает следующий шаг.
      </p>

      <div className="clicky-preview-card">
        <div className="cpc-glyph" style={{ "--clicky-color": clicky.color }}>
          <div className="clicky-burst-mini"><i/><i/><i/><i/></div>
        </div>
        <div className="cpc-meta">
          <input className="cpc-name" value={clicky.name} onChange={(e) => setClicky({ ...clicky, name: e.target.value })} />
          <small>«{CLICKY_VOICES.find(v => v.v === clicky.voice)?.label}» · {clicky.lang}</small>
        </div>
      </div>

      <SettingBlock label="Цвет">
        <div className="color-swatches">
          {CLICKY_COLORS.map(c => (
            <button key={c.v}
                    className={`swatch ${clicky.color === c.v ? "active" : ""}`}
                    style={{ background: c.v }}
                    title={c.name}
                    onClick={() => setClicky({ ...clicky, color: c.v })} />
          ))}
        </div>
      </SettingBlock>

      <SettingBlock label="Голос">
        {CLICKY_VOICES.map(v => (
          <button key={v.v}
                  className={`option-row ${clicky.voice === v.v ? "active" : ""}`}
                  onClick={() => setClicky({ ...clicky, voice: v.v })}>
            <span className="opt-radio">{clicky.voice === v.v && <span />}</span>
            <div>
              <b>{v.label}</b>
              <span>{v.desc}</span>
            </div>
          </button>
        ))}
      </SettingBlock>

      <SettingBlock label="Язык речи">
        <div className="lang-tabs">
          {CLICKY_LANGS.map(l => (
            <button key={l.v}
                    className={clicky.lang === l.v ? "active" : ""}
                    onClick={() => setClicky({ ...clicky, lang: l.v })}>
              {l.v}<small>{l.label}</small>
            </button>
          ))}
        </div>
      </SettingBlock>

      <SettingBlock label="Обучение">
        <ToggleRow label="Режим туториала" sub="На экране симулятора Клик сам появляется и ведёт по шагам"
                   v={clicky.tutorial} on={() => setClicky({ ...clicky, tutorial: !clicky.tutorial })} />
        <ToggleRow label="Автоподсветка шага" sub="Подсвечивать следующий шаг в журнале/справочнике"
                   v={clicky.autoHint} on={() => setClicky({ ...clicky, autoHint: !clicky.autoHint })} />
        <ToggleRow label="Тихий режим" sub="Не открывать пузыри без запроса"
                   v={clicky.silent} on={() => setClicky({ ...clicky, silent: !clicky.silent })} />
        <ToggleRow label="Звук уведомлений" sub="Лёгкий клик при появлении подсказок"
                   v={clicky.sound} on={() => setClicky({ ...clicky, sound: !clicky.sound })} />
      </SettingBlock>

      <SettingBlock label="Активация">
        <div className="kbd-row">
          <kbd>`</kbd>
          <span>зажать · следовать за курсором</span>
        </div>
        <div className="kbd-row">
          <kbd>⌘</kbd><kbd>K</kbd>
          <span>открыть голосовое окно</span>
        </div>
      </SettingBlock>

      <div className="sp-tab-foot">
        <small>Все диалоги обучают модель только для этой сессии. Запись не сохраняется.</small>
      </div>
    </div>
  );
}

function SettingBlock({ label, children }) {
  return (
    <div className="setting-block">
      <div className="setting-block-label">{label}</div>
      <div className="setting-block-body">{children}</div>
    </div>
  );
}

function ToggleRow({ label, sub, v, on }) {
  return (
    <button className="tg-row" onClick={on}>
      <div>
        <b>{label}</b>
        {sub && <span>{sub}</span>}
      </div>
      <div className={`switch ${v ? "on" : ""}`}><i/></div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat tab — same chat, now docked in the panel

const CHAT_SEED = [
  { role: "bot",
    text: "Привет! Я — <b>помощник по базе знаний Mentora</b>. Спросите про процедуры KYC, лимиты счетов, санкционные проверки или что угодно из банковского справочника. Все ответы — только из проиндексированных документов.",
    sources: [] },
];

const CANNED = {
  "Какие документы нужны для KYC?":
    { answer: ["Для верификации KYC физлица-резидента нужны <b>три документа</b>:",
               "1. <b>Документ, удостоверяющий личность</b> — паспорт или ID-карта.",
               "2. <b>Подтверждение адреса</b> — квитанция не старше 90 дней.",
               "3. <b>Декларация источника средств</b> — при депозите ≥ 50 млн UZS."],
      citations: ["KYC-PROC §2.1", "AML-HB §4.3"] },
  "Максимальный депозит без подтверждения ИС?":
    { answer: ["<b>49 999 999 UZS</b> для физлица в одной операции. Совокупные депозиты за 7 дней суммируются."],
      citations: ["AML-HB §4.7", "DEPOSIT-OPS §3.2"] },
  "Эскалация санкционного хита?":
    { answer: ["1. Не продолжайте операцию.",
               "2. Откройте тикет комплаенса.",
               "3. Уведомьте наставника в течение 15 минут.",
               "4. Дождитесь решения комплаенса."],
      citations: ["SANCTIONS-PROC §1.4", "OPS-ESC §2.1"] },
  "Лимит SWIFT для физлиц?":
    { answer: ["<b>$10 000 в сутки</b> — без расширенной проверки. Свыше — AML-фильтр и декларация цели перевода."],
      citations: ["TRANSFER-OPS §6.4"] },
};

function ChatTab({ lang = "RU" }) {
  const [messages, setMessages] = useState_sx(CHAT_SEED);
  const [input, setInput] = useState_sx("");
  const [typing, setTyping] = useState_sx(false);
  const bodyRef = useRef_sx();

  useEffect_sx(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  const ask = (q) => {
    if (!q.trim()) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    const canned = CANNED[q] || {
      answer: [`Не нашёл уверенного совпадения по запросу «${q}» в базе знаний.`,
               "Попробуйте предложенные вопросы или переформулируйте."],
      citations: ["KB-FALLBACK §0"],
    };
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: canned.answer.join("\n\n"), sources: canned.citations }]);
    }, 700 + Math.random() * 500);
  };

  return (
    <div className="sp-tab sp-tab-chat">
      <div className="sp-tab-head">
        <h3>База знаний</h3>
        <span className="tag good">● grounded</span>
      </div>
      <p className="sub" style={{ marginTop: 4, marginBottom: 12 }}>
        Отвечаю только из проиндексированных документов · {lang === "RU" ? "Русский" : lang === "UZ" ? "Oʻzbekcha" : "English"}
      </p>

      <div className="chat-stream" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.role === "bot"
              ? m.text.split("\n\n").map((p, j) => <p key={j} dangerouslySetInnerHTML={{ __html: p }} />)
              : <p>{m.text}</p>}
            {m.sources && m.sources.length > 0 && (
              <div className="sources">
                <div className="sources-label">Источники</div>
                {m.sources.map(s => <span key={s} className="cite">{s}</span>)}
              </div>
            )}
          </div>
        ))}
        {typing && <div className="chat-msg typing"><i/><i/><i/></div>}
      </div>

      <div className="chat-suggest">
        {Object.keys(CANNED).map(q => (
          <button key={q} onClick={() => ask(q)}>{q}</button>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          placeholder={lang === "RU" ? "Спросите из справочника…" : lang === "UZ" ? "Qoʻllanmadan soʻrang…" : "Ask the handbook…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") ask(input); }}
        />
        <button onClick={() => ask(input)} disabled={!input.trim()}>
          <I.Send size={14} />
        </button>
      </div>
    </div>
  );
}

window.SidePanel = SidePanel;
