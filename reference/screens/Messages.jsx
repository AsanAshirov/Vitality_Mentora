// Messages.jsx — mini Telegram with HR, mentor, group chats, voice notes, calls
const { useState: useState_m, useRef: useRef_m, useEffect: useEffect_m, useCallback: useCb_m } = React;

const CHATS = [
  { id: "hr-olga", name: "Ольга Р. · HR", short: "ОР", cls: "lilac", type: "dm",
    last: "Не забудь, в четверг финальный микс-сценарий.", lastT: "10:42", unread: 1, online: true,
    msgs: [
      { from: "them", t: "Вчера · 16:00", text: "Алексей, добрый день! Как прошёл день?" },
      { from: "me",   t: "Вчера · 16:04", text: "Хорошо, прошёл KYC дебютной серии — 87/100." },
      { from: "them", t: "Вчера · 16:08", text: "Отлично! По плану на этой неделе — Открытие счёта и SWIFT." },
      { from: "them", t: "Вчера · 16:09", text: "На пятницу — финальный микс-сценарий ☕" },
      { from: "me",   t: "Сегодня · 10:35", text: "Принял. Подготовлю вопросы по AML-HB §4.7" },
      { from: "them", t: "Сегодня · 10:42", text: "Не забудь, в четверг финальный микс-сценарий." },
    ],
  },
  { id: "tatiana", name: "Татьяна К. · наставник", short: "ТК", cls: "cobalt", type: "dm",
    last: "Послушай голосовую — там пара мыслей про §4.7", lastT: "09:14", unread: 2, online: true,
    msgs: [
      { from: "them", t: "Пн · 11:12", text: "Хорошее ощущение KYC-флоу. Готов пробовать открытие счёта." },
      { from: "me",   t: "Пн · 14:30", text: "Спасибо! Завтра попробую." },
      { from: "them", t: "Сегодня · 09:12", text: "Видела твой прогон KYC #14. Решение по санкциям правильное." },
      { from: "them", t: "Сегодня · 09:13", kind: "voice", dur: 47 },
      { from: "them", t: "Сегодня · 09:14", text: "Послушай голосовую — там пара мыслей про §4.7" },
    ],
  },
  { id: "cohort-q2", name: "Поток Q2-26", short: "Q2", cls: "teal", type: "group", members: 13, online: false,
    last: "Жасур: «Кто пробовал SWIFT в Турцию?»", lastT: "08:22", unread: 7,
    msgs: [
      { from: "them", who: "Ольга Р. (HR)", t: "Вчера · 09:00", text: "Доброе утро! Модуль «Санкции» открыт." },
      { from: "them", who: "Татьяна К.", t: "Вчера · 14:22", text: "Привычка переносится с тренажёра в боевой CRM, не переживайте." },
      { from: "them", who: "Бекзод Ю.", t: "Вчера · 18:40", text: "8 минут на KYC — реально, не парьтесь по таймеру" },
      { from: "me",   t: "Сегодня · 07:45", text: "Доброе утро, поток! Кто на разборе у Татьяны в 11:00?" },
      { from: "them", who: "Дилноза К.", t: "Сегодня · 07:51", text: "Я. Готовлю вопросы." },
      { from: "them", who: "Алишер Т.", t: "Сегодня · 08:10", text: "Завтра деплою свой первый депозит 🎉" },
      { from: "them", who: "Жасур М.", t: "Сегодня · 08:22", text: "Кто пробовал SWIFT в Турцию? Там флаг странный" },
    ],
  },
  { id: "compliance", name: "Комплаенс · дежурная", short: "К", cls: "rose", type: "group", members: 4, online: true,
    last: "До 18:00 дежурит Гульнара Х.", lastT: "07:30", unread: 0,
    msgs: [
      { from: "them", who: "Бот Mentora", t: "Сегодня · 07:00", text: "Доброе утро. Дежурят: Гульнара Х. (до 18:00), Дилшод М. (с 18:00)." },
      { from: "them", who: "Гульнара Х.", t: "Сегодня · 07:25", text: "Санкционные эскалации — сюда. Ответ в течение 2 часов." },
      { from: "them", who: "Гульнара Х.", t: "Сегодня · 07:30", text: "До 18:00 дежурит Гульнара Х." },
    ],
  },
  { id: "ask-mentora", name: "Ask Mentora · бот", short: "M*", cls: "cobalt", type: "bot", online: true,
    last: "0.25% + $15. Источник: TRANSFER-OPS §6.4.", lastT: "Вчера", unread: 0,
    msgs: [
      { from: "them", who: "Mentora Bot", t: "Вчера · 21:14", text: "Привет! Я отвечу на любой вопрос по процедурам." },
      { from: "me",   t: "Вчера · 21:18", text: "Какая комиссия за SWIFT для физлица?" },
      { from: "them", who: "Mentora Bot", t: "Вчера · 21:18", text: "0.25% + $15. Источник: TRANSFER-OPS §6.4." },
    ],
  },
  { id: "tech-help", name: "Tech Help", short: "TH", cls: "", type: "group", members: 6, online: false,
    last: "DevOps: соединение с BankSandbox восстановлено", lastT: "Пн", unread: 0,
    msgs: [
      { from: "them", who: "DevOps", t: "Пн · 06:00", text: "Соединение с BankSandbox восстановлено в 06:00" },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Scrubber — horizontal swipe/pan/click to seek. Works for mouse + touch.

function Scrubber({ value, max, onChange, height = 6, color, ...rest }) {
  const ref = useRef_m();
  const pct = Math.min(1, Math.max(0, value / max));

  const updateFromEvent = useCb_m((clientX) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    onChange(p * max);
  }, [max, onChange]);

  const onDown = (e) => {
    e.preventDefault();
    const isTouch = e.type.startsWith("touch");
    const getX = (ev) => isTouch ? ev.touches[0].clientX : ev.clientX;
    updateFromEvent(getX(e));
    const move = (ev) => updateFromEvent(getX(ev));
    const up = () => {
      window.removeEventListener(isTouch ? "touchmove" : "mousemove", move);
      window.removeEventListener(isTouch ? "touchend" : "mouseup", up);
    };
    window.addEventListener(isTouch ? "touchmove" : "mousemove", move, { passive: false });
    window.addEventListener(isTouch ? "touchend" : "mouseup", up);
  };

  return (
    <div className="scrubber" ref={ref}
         style={{ height, "--col": color || "var(--cobalt)" }}
         onMouseDown={onDown}
         onTouchStart={onDown}
         {...rest}>
      <div className="scrubber-track" />
      <div className="scrubber-fill" style={{ width: `${pct * 100}%` }} />
      <div className="scrubber-thumb" style={{ left: `${pct * 100}%` }} />
    </div>
  );
}

// Same idea but renders a waveform (for voice notes)
function WaveScrubber({ value, max, onChange, bars = 32, seed = 1 }) {
  const ref = useRef_m();
  const pct = Math.min(1, Math.max(0, value / max));
  const heights = React.useMemo(() => {
    const arr = [];
    let x = seed;
    for (let i = 0; i < bars; i++) {
      x = (x * 9301 + 49297) % 233280;
      arr.push(0.25 + (x / 233280) * 0.75);
    }
    return arr;
  }, [bars, seed]);

  const onDown = (e) => {
    e.preventDefault();
    const isTouch = e.type.startsWith("touch");
    const getX = (ev) => isTouch ? ev.touches[0].clientX : ev.clientX;
    const update = (cx) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (cx - r.left) / r.width));
      onChange(p * max);
    };
    update(getX(e));
    const move = (ev) => update(getX(ev));
    const up = () => {
      window.removeEventListener(isTouch ? "touchmove" : "mousemove", move);
      window.removeEventListener(isTouch ? "touchend" : "mouseup", up);
    };
    window.addEventListener(isTouch ? "touchmove" : "mousemove", move, { passive: false });
    window.addEventListener(isTouch ? "touchend" : "mouseup", up);
  };

  return (
    <div className="wave-scrub" ref={ref} onMouseDown={onDown} onTouchStart={onDown}>
      {heights.map((h, i) => (
        <span key={i} className={i / bars <= pct ? "wb-on" : "wb-off"} style={{ height: `${h * 100}%` }} />
      ))}
    </div>
  );
}

window.Scrubber = Scrubber;
window.WaveScrubber = WaveScrubber;

// ────────────────────────────────────────────────────────────────────────────
// Voice note bubble

function VoiceNote({ dur, dark }) {
  const [playing, setPlaying] = useState_m(false);
  const [pos, setPos] = useState_m(0);
  useEffect_m(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos(p => {
        if (p >= dur) { setPlaying(false); return 0; }
        return p + 0.25;
      });
    }, 250);
    return () => clearInterval(id);
  }, [playing, dur]);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <div className={`voice-note ${dark ? "dark" : ""}`}>
      <button className="vn-play" onClick={() => setPlaying(p => !p)} aria-label={playing ? "Pause" : "Play"}>
        {playing ? <I.Pause size={13} /> : <I.Play size={13} />}
      </button>
      <WaveScrubber value={pos} max={dur} onChange={setPos} seed={Math.floor(dur)} />
      <span className="vn-time mono">{fmt(playing ? pos : dur - pos)}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Messages page

function MessagesPage() {
  const [active, setActive] = useState_m(CHATS[0]);
  const [input, setInput] = useState_m("");
  const [filter, setFilter] = useState_m("all");
  const [query, setQuery] = useState_m("");
  const [extraMsgs, setExtraMsgs] = useState_m({});
  const [calling, setCalling] = useState_m(null);
  const [attachMenu, setAttachMenu] = useState_m(false);
  const [emojiMenu, setEmojiMenu] = useState_m(false);
  const [recording, setRecording] = useState_m(false);
  const [recordSec, setRecordSec] = useState_m(0);
  const bodyRef = useRef_m();

  // Filter chats
  const filteredChats = CHATS.filter(c => {
    if (filter !== "all" && c.type !== filter) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const allMsgs = [...active.msgs, ...(extraMsgs[active.id] || [])];

  useEffect_m(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [active, extraMsgs]);

  // Recording timer
  useEffect_m(() => {
    if (!recording) { setRecordSec(0); return; }
    const id = setInterval(() => setRecordSec(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const append = (msg) => {
    setExtraMsgs(m => ({ ...m, [active.id]: [...(m[active.id] || []), msg] }));
  };

  const send = () => {
    if (!input.trim()) return;
    append({ from: "me", t: "Сейчас", text: input.trim() });
    setInput("");
    setEmojiMenu(false);
    autoReply();
  };

  const autoReply = () => {
    if (active.id === "tatiana" || active.id === "hr-olga" || active.id === "ask-mentora") {
      setTimeout(() => {
        const r = {
          tatiana: "Принято. Загляну в твои заметки и отвечу подробнее ближе к обеду.",
          "hr-olga": "Спасибо! Отметила в твоём плане недели.",
          "ask-mentora": "Поняла. Ищу ответ в индексированной базе… найдено: см. карточку в чате базы знаний.",
        }[active.id];
        append({ from: "them", who: active.type === "group" ? active.name : undefined, t: "Сейчас", text: r });
      }, 900 + Math.random() * 600);
    }
  };

  const handleAttach = (kind) => {
    setAttachMenu(false);
    const map = {
      file:  { from: "me", t: "Сейчас", kind: "file", name: "kyc_summary_2026-05.pdf", size: "184 КБ" },
      photo: { from: "me", t: "Сейчас", kind: "photo", w: 240, h: 160 },
      poll:  { from: "me", t: "Сейчас", kind: "poll", question: "Когда удобно созвон?", opts: ["Сегодня 16:00", "Завтра 11:00", "Пятница 14:00"] },
      loc:   { from: "me", t: "Сейчас", kind: "loc", place: "Tashkent City · 23 этаж" },
    };
    append(map[kind]);
    autoReply();
  };

  const handleEmoji = (e) => {
    setInput(input + e);
    setEmojiMenu(false);
  };

  const startRecord = () => setRecording(true);
  const stopRecord = (cancel) => {
    if (!cancel && recordSec > 0) {
      append({ from: "me", t: "Сейчас", kind: "voice", dur: recordSec });
      autoReply();
    }
    setRecording(false);
  };

  return (
    <div className="msg-shell screen-in" data-screen-label="Messages">
      <aside className="msg-list">
        <div className="msg-list-head">
          <h2>Сообщения</h2>
          <button className="btn btn-ghost btn-xs" onClick={() => alert("Новый чат — в разработке")}><I.Plus size={12} /> Новый</button>
        </div>
        <div className="msg-search">
          <I.Search size={13} />
          <input placeholder="Поиск чатов и сообщений…" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && <button className="msg-search-clear" onClick={() => setQuery("")}><I.X size={12} /></button>}
        </div>
        <div className="msg-tabs">
          {[["all", "Все"], ["dm", "Личные"], ["group", "Группы"], ["bot", "Боты"]].map(([id, lbl]) => (
            <button key={id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{lbl}</button>
          ))}
        </div>
        <div className="msg-chats">
          {filteredChats.map(c => (
            <button key={c.id}
                    className={`msg-chat ${active.id === c.id ? "active" : ""}`}
                    onClick={() => setActive(c)}>
              <div className={`avatar ${c.cls}`} style={{ position: "relative" }}>
                {c.short}
                {c.online && <span className="online-dot" />}
              </div>
              <div className="msg-chat-main">
                <div className="msg-chat-top">
                  <b>{c.name}</b>
                  <span className="msg-t mono">{c.lastT}</span>
                </div>
                <div className="msg-chat-bot">
                  <span className="msg-preview">{c.last}</span>
                  {c.unread > 0 && <span className="unread">{c.unread}</span>}
                </div>
              </div>
            </button>
          ))}
          {filteredChats.length === 0 && (
            <div className="dt-empty" style={{ padding: 22 }}>
              {query ? `Нет чатов по запросу «${query}»` : "В этой категории пусто"}
            </div>
          )}
        </div>
        <ResizeHandle side="right" cssVar="--msg-list-w" min={260} max={480} defaultSize={320} />
      </aside>

      <main className="msg-thread">
        <div className="msg-thread-head">
          <div className={`avatar ${active.cls}`} style={{ position: "relative" }}>
            {active.short}
            {active.online && <span className="online-dot" />}
          </div>
          <div className="msg-thread-meta">
            <b>{active.name}</b>
            <span>{active.type === "group" ? `${active.members} участников · ${active.online ? "активны" : "тихо"}` : active.online ? "в сети" : "был(а) недавно"}</span>
          </div>
          <div className="msg-thread-actions">
            <button className="msg-act-btn" title="Аудиозвонок" onClick={() => setCalling({ ...active, kind: "audio" })}><I.Mic size={15} /></button>
            <button className="msg-act-btn" title="Видеозвонок" onClick={() => setCalling({ ...active, kind: "video" })}><I.Globe size={15} /></button>
            <button className="msg-act-btn" title="Поиск в чате"><I.Search size={15} /></button>
            <button className="msg-act-btn" title="Подробности"><I.Help size={15} /></button>
          </div>
        </div>

        <div className="msg-body" ref={bodyRef}>
          <div className="msg-day">сегодня · {new Date().toLocaleDateString("ru-RU")}</div>
          {allMsgs.map((m, i) => <Bubble key={i} m={m} group={active.type === "group"} />)}
        </div>

        {recording ? (
          <div className="msg-input recording">
            <span className="rec-dot" />
            <span className="rec-time mono">{String(Math.floor(recordSec / 60)).padStart(2, "0")}:{String(recordSec % 60).padStart(2, "0")}</span>
            <div className="rec-wave">
              {[...Array(20)].map((_, i) => <span key={i} style={{ height: `${20 + Math.abs(Math.sin(recordSec * 1.4 + i * 0.6)) * 60}%` }} />)}
            </div>
            <button className="rec-cancel" onClick={() => stopRecord(true)}>Отмена</button>
            <button className="msg-send" onClick={() => stopRecord(false)}><I.Send size={15} /></button>
          </div>
        ) : (
          <div className="msg-input">
            <div className="msg-input-side">
              <button className="msg-att" onClick={() => { setAttachMenu(!attachMenu); setEmojiMenu(false); }}><I.Plus size={15} /></button>
              {attachMenu && (
                <div className="attach-menu" onMouseLeave={() => setAttachMenu(false)}>
                  <button onClick={() => handleAttach("file")}><I.Doc size={13} /> Файл</button>
                  <button onClick={() => handleAttach("photo")}><I.Upload size={13} /> Фото</button>
                  <button onClick={() => handleAttach("poll")}><I.Spark size={13} /> Опрос</button>
                  <button onClick={() => handleAttach("loc")}><I.Globe size={13} /> Локация</button>
                </div>
              )}
            </div>
            <input placeholder="Написать в чат…" value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onFocus={() => { setEmojiMenu(false); setAttachMenu(false); }}
                   onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
            <div className="msg-input-side">
              <button className="msg-att" onClick={() => { setEmojiMenu(!emojiMenu); setAttachMenu(false); }}>😊</button>
              {emojiMenu && (
                <div className="emoji-menu" onMouseLeave={() => setEmojiMenu(false)}>
                  {"👍🙏✨🎯🔥💎✅❌⚠️📎💬🎉☕💡🛡️🌐".split("").map(e => (
                    <button key={e} onClick={() => handleEmoji(e)}>{e}</button>
                  ))}
                </div>
              )}
            </div>
            {input.trim() ? (
              <button className="msg-send" onClick={send}><I.Send size={15} /></button>
            ) : (
              <button className="msg-send mic" title="Голосовое (зажать)"
                      onMouseDown={startRecord} onMouseUp={() => stopRecord(false)}
                      onTouchStart={startRecord} onTouchEnd={() => stopRecord(false)}>
                <I.Mic size={15} />
              </button>
            )}
          </div>
        )}
      </main>

      {calling && <CallOverlay chat={calling} onClose={() => setCalling(null)} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Bubble — different kinds of messages

function Bubble({ m, group }) {
  const isMe = m.from === "me";
  return (
    <div className={`msg-bubble ${isMe ? "me" : "them"} ${m.kind ? `k-${m.kind}` : ""}`}>
      {!isMe && m.who && group && <div className="msg-from">{m.who}</div>}
      {m.kind === "voice"
        ? <VoiceNote dur={m.dur} dark={isMe} />
      : m.kind === "file"
        ? <div className="bub-file"><div className="bub-file-icon"><I.Doc size={16} /></div><div><b>{m.name}</b><small>{m.size}</small></div></div>
      : m.kind === "photo"
        ? <div className="bub-photo pl-img" style={{ width: m.w, height: m.h }}>скрин-шот сценария</div>
      : m.kind === "poll"
        ? <div className="bub-poll"><b>{m.question}</b>{m.opts.map(o => <div key={o} className="poll-opt"><span/>{o}</div>)}<small>Анонимно · 0 голосов</small></div>
      : m.kind === "loc"
        ? <div className="bub-loc"><I.Globe size={14} /> {m.place}</div>
      : <div className="msg-text">{m.text}</div>}
      <div className="msg-time mono">{m.t}{isMe && <I.Check size={10} style={{ marginLeft: 4 }} />}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Call overlay — bigger, with participant tiles + scrubbable timeline

function CallOverlay({ chat, onClose }) {
  const [sec, setSec] = useState_m(0);
  const [muted, setMuted] = useState_m(false);
  const [cam, setCam] = useState_m(chat.kind === "video");
  const [scrub, setScrub] = useState_m(0); // mocked seek pos
  const isVideo = chat.kind === "video";
  const isGroup = chat.type === "group";

  useEffect_m(() => {
    const t = setInterval(() => setSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect_m(() => { setScrub(sec); }, [sec]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Synthetic participants for group calls
  const participants = isGroup ? [
    { name: "Алексей П. (вы)",  short: "АП", cls: "" },
    { name: chat.name,             short: chat.short, cls: chat.cls },
    { name: "Татьяна К.",         short: "ТК", cls: "cobalt" },
    { name: "Дилноза К.",         short: "ДК", cls: "lilac" },
    { name: "Бекзод Ю.",          short: "БЮ", cls: "teal" },
    { name: "Жасур М.",            short: "ЖМ", cls: "rose" },
  ] : [
    { name: "Алексей П. (вы)",  short: "АП", cls: "" },
    { name: chat.name,             short: chat.short, cls: chat.cls },
  ];

  return (
    <div className="call-overlay">
      <div className="call-bg" />
      <div className={`call-frame ${isVideo ? "video" : "audio"} ${isGroup ? "group" : ""}`}>
        <div className="call-top">
          <div className="call-title">
            <div className={`avatar ${chat.cls}`} style={{ width: 30, height: 30, fontSize: 11 }}>{chat.short}</div>
            <div>
              <b>{chat.name}</b>
              <small>{isVideo ? "Видеозвонок" : "Аудиозвонок"} · {isGroup ? `${participants.length} участников` : "1-на-1"}</small>
            </div>
          </div>
          <div className="call-quality"><span className="bar-q on"/><span className="bar-q on"/><span className="bar-q on"/><span className="bar-q dim"/></div>
        </div>

        <div className="call-stage">
          {isVideo ? (
            <div className={`tile-grid c-${Math.min(participants.length, 6)}`}>
              {participants.slice(0, 6).map((p, i) => (
                <div key={i} className={`call-tile ${p.cls}`}>
                  <div className={`avatar ${p.cls}`}>{p.short}</div>
                  <div className="call-tile-name">{p.name}{i === 0 && " · вы"}</div>
                  {i === 0 && muted && <span className="tile-mute">muted</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="audio-stage">
              <div className={`avatar ${chat.cls}`} style={{ width: 120, height: 120, fontSize: 36 }}>{chat.short}</div>
              <div className="call-wave">
                {[...Array(28)].map((_, i) => (
                  <span key={i} style={{ height: `${20 + Math.abs(Math.sin(sec * 1.5 + i * 0.4)) * 60}%` }} />
                ))}
              </div>
              <h3>{chat.name}</h3>
              <p className="call-status">соединение установлено</p>
            </div>
          )}
        </div>

        <div className="call-timeline">
          <span className="mono">{fmt(scrub)}</span>
          <Scrubber value={scrub} max={Math.max(sec, 1)} onChange={setScrub} />
          <span className="mono mute-x">{fmt(sec)}</span>
        </div>

        <div className="call-controls">
          <button className={`call-btn ${muted ? "off" : ""}`} onClick={() => setMuted(!muted)} title={muted ? "Включить микрофон" : "Выключить микрофон"}><I.Mic size={18} /></button>
          {isVideo && (
            <button className={`call-btn ${!cam ? "off" : ""}`} onClick={() => setCam(!cam)} title="Камера"><I.Globe size={18} /></button>
          )}
          <button className="call-btn" title="Показать экран"><I.Upload size={18} /></button>
          <button className="call-btn" title="Чат во время звонка"><I.Chat size={18} /></button>
          <button className="call-btn" title="Участники"><I.User size={18} /></button>
          <button className="call-btn end" onClick={onClose} title="Завершить"><I.X size={20} /></button>
        </div>
      </div>
    </div>
  );
}

window.MessagesPage = MessagesPage;
