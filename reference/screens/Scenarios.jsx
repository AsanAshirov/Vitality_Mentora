// Scenarios.jsx — Account opening, Deposit, Transfer, Card issue scenarios.
// All share a common SimShell layout, steps rail, hint card and result screen.

const { useState: useState_sc, useEffect: useEffect_sc, useMemo: useMemo_sc } = React;
const { CUSTOMERS: CUST_S, fmt: fmt_s } = window.SYNTH;

// Shared steps panel (also used by KYC; we duplicate here for new scenarios)
function ScSteps({ steps, idx, completedFlags = [], errorIdx }) {
  return (
    <div className="steps-panel">
      <h4>Сценарий · {steps[0]?.code || "v1.0"}</h4>
      {steps.map((s, i) => {
        const status = i < idx ? "done" : i === idx ? "active" : "pending";
        const isErr = errorIdx === i;
        return (
          <div key={s.id} className={`step ${isErr ? "error" : status}`}>
            <div className="marker">{i < idx && !isErr ? "✓" : isErr ? "!" : i + 1}</div>
            <div>
              <b>{s.title}</b>
              <span>{s.hint}</span>
            </div>
            <span className="pts">{i < idx ? (isErr ? "−10" : "+15") : i === idx ? "···" : "0"}</span>
          </div>
        );
      })}
    </div>
  );
}

function ScHint({ step, autoOk, manualOnly }) {
  return (
    <div className="hint-card">
      <h5><I.Spark size={11} /> {autoOk ? "Готово к авто-переходу" : "Подсказка · из документов"}</h5>
      <p>{step.hint}</p>
      {step.source && <p style={{ fontSize: 11.5, color: "var(--mute)" }}>Источник: <span className="cite-mono">{step.source}</span></p>}
      {manualOnly && <p style={{ fontSize: 11.5, color: "var(--mute)", marginTop: 6, fontStyle: "italic" }}>Шаг завершается вручную — после проверки нажмите «Подтвердить шаг».</p>}
    </div>
  );
}

function ScRailMeta({ session }) {
  return (
    <div className="rail-meta">
      <div><span>Дежурный наставник</span> <b>Татьяна К.</b></div>
      <div><span>Сессия</span> <b className="mono">{session}</b></div>
      <div><span>Среда</span> <b style={{ color: "var(--good)" }}>● синтетика</b></div>
    </div>
  );
}

// Generic scenario success card
function ScDone({ title, lines, xpEarned, onContinue, onRetry }) {
  return (
    <div className="sc-done">
      <div className="sc-done-icon"><I.Check size={26} /></div>
      <h2>{title}</h2>
      <p className="sub">{lines[0]}</p>
      {lines.slice(1).map((l, i) => <p key={i} className="sub" style={{ marginTop: 6 }}>{l}</p>)}
      <div className="sc-done-xp">
        <I.Bolt size={14} /> <b>+{xpEarned} XP</b> · оценка <b className="mono">94/100</b>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button className="btn btn-primary" onClick={onContinue}><I.Arrow size={13} /> К следующей задаче</button>
        <button className="btn btn-ghost" onClick={onRetry}>Пройти заново</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1. ACCOUNT OPENING
// ════════════════════════════════════════════════════════════════════════════

const AO_STEPS = [
  { id: "customer", title: "Клиент",      code: "OPEN-ACC v2.1",
    hint: "Выберите клиента — система подтянет проверенный профиль и привязанные документы." },
  { id: "product",  title: "Продукт",      code: "OPEN-ACC v2.1",
    hint: "Выберите тип счёта и валюту. Балансовый счёт сформируется автоматически по плану." },
  { id: "terms",    title: "Тариф · условия", code: "OPEN-ACC v2.1",
    hint: "Подтвердите тариф. Для нерезидентов и валютных счетов — расширенные комиссии.", source: "OPEN-ACC §3.1" },
  { id: "sign",     title: "Документы и подпись", code: "OPEN-ACC v2.1",
    hint: "Сформируйте номер счёта, распечатайте договор. Подпись клиента — по СМС-OTP." },
];

function OpenAccountScenario({ setSimPage, onComplete, onJournal, onStepChange, taskTitle }) {
  const [idx, setIdx] = useState_sc(0);
  const [state, setState] = useState_sc({
    customer: null,
    product: null,
    cur: null,
    tariff: null,
    otp: "",
    accountNumber: "",
  });
  const [done, setDone] = useState_sc(false);

  // Auto-advance when step completion criteria met
  const stepDone = {
    customer: !!state.customer,
    product:  !!state.product && !!state.cur,
    terms:    !!state.tariff,
    sign:     state.otp.length >= 4 && !!state.accountNumber,
  };
  const curId = AO_STEPS[idx].id;
  useEffect_sc(() => { onStepChange && onStepChange(done ? null : curId); }, [curId, done]);
  useEffect_sc(() => {
    if (!stepDone[curId]) return;
    if (idx === AO_STEPS.length - 1) { const tm = setTimeout(() => setDone(true), 600); return () => clearTimeout(tm); }
    const tm = setTimeout(() => setIdx(idx + 1), 600);
    return () => clearTimeout(tm);
  }, [stepDone[curId], idx]);

  const progressPct = Math.round(((idx + (stepDone[curId] ? 1 : 0)) / AO_STEPS.length) * 100);

  return (
    <SimShell
      simPage="accounts"
      setSimPage={setSimPage}
      crumb={["Операции", "Открытие счёта", taskTitle || "Новый счёт"]}
      progress={{ label: `Шаг ${idx + 1} / ${AO_STEPS.length} · ${AO_STEPS[idx].title}`, pct: progressPct }}
      rail={done ? null : <><ScSteps steps={AO_STEPS} idx={idx} /><ScHint step={AO_STEPS[idx]} autoOk={stepDone[curId]} /><ScRailMeta session="acc-1f02" /></>}
      foot={done ? null : (
        <>
          <div className="left">Сценарий <b>OPEN-ACC v2.1</b> · автопереход когда шаг готов</div>
          <div className="spacer" />
          {onJournal && <button className="btn btn-ghost" onClick={onJournal}><I.Doc size={13} /> Журнал</button>}
          <button className="btn btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← Назад</button>
          <button className="btn btn-primary"
                  onClick={() => { if (idx === AO_STEPS.length - 1) setDone(true); else setIdx(idx + 1); }}>
            {idx === AO_STEPS.length - 1 ? "Подтвердить" : "Подтвердить шаг"} <I.Arrow size={13} />
          </button>
        </>
      )}
    >
      {done && <ScDone
        title="Счёт открыт"
        lines={[
          `Счёт ${state.accountNumber} успешно открыт для клиента ${state.customer?.name?.split(" ").slice(0, 2).join(" ")}.`,
          "Договор отправлен в личный кабинет клиента и наставнику на проверку."]}
        xpEarned={50}
        onContinue={() => onComplete && onComplete()}
        onRetry={() => { setIdx(0); setState({ customer: null, product: null, cur: null, tariff: null, otp: "", accountNumber: "" }); setDone(false); }}
      />}

      {!done && curId === "customer" && (
        <AoCustomerStep state={state} setState={setState} />
      )}
      {!done && curId === "product" && (
        <AoProductStep state={state} setState={setState} />
      )}
      {!done && curId === "terms" && (
        <AoTermsStep state={state} setState={setState} />
      )}
      {!done && curId === "sign" && (
        <AoSignStep state={state} setState={setState} />
      )}
    </SimShell>
  );
}

function AoCustomerStep({ state, setState }) {
  const [q, setQ] = useState_sc("");
  const rows = CUST_S.filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.id.includes(q));
  return (
    <div className="crm-card" data-clicky-target="ao-customer">
      <div className="crm-head">
        <h3>Шаг 1 · Выбор клиента</h3>
        {state.customer && <span className="tag good"><I.Check size={11} /> Выбран</span>}
      </div>
      <div className="crm-body">
        <div className="filter-input" style={{ marginBottom: 12 }}>
          <I.Search size={14} />
          <input placeholder="Поиск по ФИО, ИНН или ID…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="cust-pick">
          {rows.slice(0, 5).map(c => (
            <button key={c.id}
                    className={`cust-row ${state.customer?.id === c.id ? "active" : ""}`}
                    onClick={() => setState({ ...state, customer: c })}>
              <div className={`avatar ${["cobalt","lilac","teal","rose"][c.short.charCodeAt(0) % 4]}`}>{c.short}</div>
              <div className="cust-meta">
                <b>{c.name}</b>
                <span>{c.city} · ИНН {c.inn} · {c.lang}</span>
              </div>
              <div className="cust-status">
                <span className={`tag ${c.status === "Активен" ? "good" : c.status.includes("KYC") ? "warn" : "mute"}`}>{c.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AoProductStep({ state, setState }) {
  const types = [
    { id: "current",  label: "Текущий счёт",        sub: "Без срока · карта в комплекте", icon: <I.Plus size={14} /> },
    { id: "saving",   label: "Сберегательный",       sub: "Накопления · 12% годовых",      icon: <I.Coins size={14} /> },
    { id: "term",     label: "Срочный депозит",      sub: "От 3 мес · ставки до 24%",      icon: <I.Star size={14} /> },
    { id: "card",     label: "Карточный",            sub: "Привязан к карте",              icon: <I.Doc size={14} /> },
  ];
  const currencies = ["UZS", "USD", "EUR", "RUB"];
  return (
    <div className="crm-card" data-clicky-target="ao-product">
      <div className="crm-head">
        <h3>Шаг 2 · Продукт</h3>
        {state.product && state.cur && <span className="tag good"><I.Check size={11} /> Выбрано</span>}
      </div>
      <div className="crm-body">
        <label className="field-label-block">Тип счёта</label>
        <div className="prod-grid">
          {types.map(t => (
            <button key={t.id}
                    className={`prod-tile ${state.product === t.id ? "active" : ""}`}
                    onClick={() => setState({ ...state, product: t.id })}>
              <div className="prod-icon">{t.icon}</div>
              <b>{t.label}</b>
              <span>{t.sub}</span>
            </button>
          ))}
        </div>
        <label className="field-label-block" style={{ marginTop: 16 }}>Валюта</label>
        <div className="tab-pill" style={{ width: "fit-content" }}>
          {currencies.map(c => (
            <button key={c} className={state.cur === c ? "active" : ""}
                    onClick={() => setState({ ...state, cur: c })}>{c}</button>
          ))}
        </div>
        {state.product && state.cur && (
          <div className="info-banner" style={{ marginTop: 16 }}>
            <I.Check size={12} /> Балансовый счёт по плану: <span className="mono">{state.cur === "UZS" ? "20208 860 0 00012" : state.cur === "USD" ? "20208 840 0 00012" : state.cur === "EUR" ? "20208 978 0 00012" : "20208 643 0 00012"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AoTermsStep({ state, setState }) {
  const tariffs = [
    { id: "basic",   label: "Резидент · базовый",        fee: "0 UZS/мес",   sub: "Стандартный пакет, без подписки" },
    { id: "pro",     label: "Резидент · Pro",            fee: "25 000 UZS/мес", sub: "Бесплатные SWIFT, кешбэк до 3%" },
    { id: "fx",      label: "Валютный · базовый",         fee: "$1/мес",      sub: "Только для USD/EUR счетов" },
  ];
  return (
    <div className="crm-card" data-clicky-target="ao-terms">
      <div className="crm-head">
        <h3>Шаг 3 · Тариф</h3>
        {state.tariff && <span className="tag good"><I.Check size={11} /> Подтверждено</span>}
      </div>
      <div className="crm-body">
        <div className="tariffs">
          {tariffs.map(t => (
            <button key={t.id}
                    className={`tariff-row ${state.tariff === t.id ? "active" : ""}`}
                    onClick={() => setState({ ...state, tariff: t.id })}>
              <span className="opt-radio">{state.tariff === t.id && <span/>}</span>
              <div className="tariff-meta">
                <b>{t.label}</b>
                <span>{t.sub}</span>
              </div>
              <div className="tariff-fee mono">{t.fee}</div>
            </button>
          ))}
        </div>
        <div className="info-banner" style={{ marginTop: 16, background: "var(--cobalt-tint)", borderColor: "var(--cobalt-tint-2)", color: "var(--cobalt-ink)" }}>
          Тариф можно сменить в течение 30 дней без комиссии. После — переход возможен с 1-го числа следующего месяца.
        </div>
      </div>
    </div>
  );
}

function AoSignStep({ state, setState }) {
  const gen = () => {
    const tail = String(Math.floor(Math.random() * 9999999)).padStart(7, "0");
    const prefix = state.cur === "UZS" ? "20208 860 0 00012" : state.cur === "USD" ? "20208 840 0 00012" : "20208 978 0 00012";
    setState({ ...state, accountNumber: `${prefix} ${tail}` });
  };
  return (
    <div className="crm-card" data-clicky-target="ao-sign">
      <div className="crm-head">
        <h3>Шаг 4 · Документы и подпись</h3>
        {state.accountNumber && state.otp.length >= 4 && <span className="tag good"><I.Check size={11} /> Подписано</span>}
      </div>
      <div className="crm-body">
        <div className="sign-grid">
          <div>
            <label className="field-label-block">Номер счёта</label>
            {state.accountNumber ? (
              <div className="account-num-display">
                <span className="mono">{state.accountNumber}</span>
                <span className="tag cobalt">сгенерирован</span>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={gen}><I.Plus size={12} /> Сгенерировать номер</button>
            )}
          </div>
          <div>
            <label className="field-label-block">Договор</label>
            <div className="doc-row uploaded">
              <div className="doc-thumb" />
              <div className="doc-meta">
                <b>account_agreement_{state.cur || "UZS"}.pdf</b>
                <span>2 стр. · Сформирован автоматически</span>
              </div>
              <button className="btn btn-ghost btn-xs">Открыть</button>
            </div>
          </div>
          <div>
            <label className="field-label-block">СМС-код подтверждения</label>
            <div className="otp-row">
              <input className="otp-input mono" maxLength={4} placeholder="••••"
                     value={state.otp} onChange={(e) => setState({ ...state, otp: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
              <span className="otp-hint">Отправлен на <span className="mono">+998 71 ••• 55 17</span></span>
              <button className="btn btn-ghost btn-xs">Переотправить</button>
            </div>
            {state.otp === "1234" && <div className="info-banner ok" style={{ marginTop: 8 }}><I.Check size={12} /> Подтверждено</div>}
            {state.otp.length >= 1 && state.otp.length < 4 && <div className="info-banner warn" style={{ marginTop: 8 }}>Подсказка для тренажёра: введите <b className="mono">1234</b></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. DEPOSIT
// ════════════════════════════════════════════════════════════════════════════

const DEP_STEPS = [
  { id: "client",  title: "Клиент и сумма",   code: "DEPOSIT-OPS v2.1",
    hint: "Выберите вкладчика и введите сумму. От 50 млн UZS — обязательна декларация ИС." },
  { id: "terms",   title: "Срок и ставка",     code: "DEPOSIT-OPS v2.1",
    hint: "Чем длиннее срок, тем выше ставка. Минимум — 3 месяца.", source: "DEPOSIT-OPS §2.4" },
  { id: "sof",     title: "Источник средств",  code: "AML-HB v2.9",
    hint: "При сумме ≥ 50 млн UZS — нужна декларация и подтверждающий документ.", source: "AML-HB §4.7" },
  { id: "confirm", title: "Подтверждение",     code: "DEPOSIT-OPS v2.1",
    hint: "Проверьте параметры, оформите договор и отправьте на одобрение." },
];

function DepositScenario({ setSimPage, onComplete, onJournal, onStepChange, taskTitle }) {
  const [idx, setIdx] = useState_sc(0);
  const [state, setState] = useState_sc({ customer: null, amount: 0, term: null, sofUploaded: false, confirmed: false });
  const [done, setDone] = useState_sc(false);
  const needsSof = state.amount >= 50_000_000;

  const stepDone = {
    client:  !!state.customer && state.amount > 0,
    terms:   !!state.term,
    sof:     !needsSof || state.sofUploaded,
    confirm: state.confirmed,
  };
  const curId = DEP_STEPS[idx].id;
  useEffect_sc(() => { onStepChange && onStepChange(done ? null : curId); }, [curId, done]);
  useEffect_sc(() => {
    if (!stepDone[curId]) return;
    if (idx === DEP_STEPS.length - 1) { const tm = setTimeout(() => setDone(true), 600); return () => clearTimeout(tm); }
    const tm = setTimeout(() => setIdx(idx + 1), 600);
    return () => clearTimeout(tm);
  }, [stepDone[curId], idx]);

  return (
    <SimShell
      simPage="deposits"
      setSimPage={setSimPage}
      crumb={["Операции", "Депозиты", taskTitle || "Новый вклад"]}
      progress={{ label: `Шаг ${idx + 1} / ${DEP_STEPS.length} · ${DEP_STEPS[idx].title}`, pct: Math.round((idx / (DEP_STEPS.length - 1)) * 100) }}
      rail={done ? null : <><ScSteps steps={DEP_STEPS} idx={idx} /><ScHint step={DEP_STEPS[idx]} autoOk={stepDone[curId]} /><ScRailMeta session="dep-7a14" /></>}
      foot={done ? null : (<>
        <div className="left">Сценарий <b>DEPOSIT-OPS v2.1</b> · автопроверка значений на каждом шаге</div>
        <div className="spacer" />
        {onJournal && <button className="btn btn-ghost" onClick={onJournal}><I.Doc size={13} /> Журнал</button>}
        <button className="btn btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← Назад</button>
        <button className="btn btn-primary"
                onClick={() => { if (idx === DEP_STEPS.length - 1) setDone(true); else setIdx(idx + 1); }}>
          {idx === DEP_STEPS.length - 1 ? "Оформить вклад" : "Подтвердить шаг"} <I.Arrow size={13} />
        </button>
      </>)}
    >
      {done && <ScDone
        title="Вклад оформлен"
        lines={[`Срочный депозит на ${(state.amount / 1_000_000).toLocaleString("ru-RU")} млн UZS принят. Договор подписан, средства переведены на накопительный.`,
                `Дата окончания: ${state.term?.maturity || "—"}. Итоговая ставка: ${state.term?.rate || "—"}% годовых.`]}
        xpEarned={70}
        onContinue={() => onComplete && onComplete()}
        onRetry={() => { setIdx(0); setState({ customer: null, amount: 0, term: null, sofUploaded: false, confirmed: false }); setDone(false); }}
      />}

      {!done && curId === "client" && <DepClientStep state={state} setState={setState} />}
      {!done && curId === "terms"  && <DepTermsStep  state={state} setState={setState} />}
      {!done && curId === "sof"    && <DepSofStep    state={state} setState={setState} needs={needsSof} />}
      {!done && curId === "confirm"&& <DepConfirmStep state={state} setState={setState} />}
    </SimShell>
  );
}

function DepClientStep({ state, setState }) {
  return (
    <div className="crm-card" data-clicky-target="dep-client">
      <div className="crm-head"><h3>Шаг 1 · Клиент и сумма</h3></div>
      <div className="crm-body">
        <div className="crm-grid cols-2">
          <div className="field">
            <label>Вкладчик</label>
            <select value={state.customer?.id || ""}
                    onChange={(e) => setState({ ...state, customer: CUST_S.find(c => c.id === e.target.value) })}>
              <option value="">Выберите клиента…</option>
              {CUST_S.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Сумма вклада (UZS)</label>
            <input className="mono" type="number" placeholder="50 000 000"
                   value={state.amount || ""} onChange={(e) => setState({ ...state, amount: Number(e.target.value) })} />
            {state.amount > 0 && <span className="hint">{state.amount.toLocaleString("ru-RU")} UZS</span>}
          </div>
        </div>
        <div className="amount-presets">
          {[10_000_000, 50_000_000, 100_000_000, 250_000_000].map(a => (
            <button key={a} className="preset-chip" onClick={() => setState({ ...state, amount: a })}>{(a / 1_000_000)} млн</button>
          ))}
        </div>
        {state.amount >= 50_000_000 && (
          <div className="info-banner warn" style={{ marginTop: 16 }}>
            <I.Shield size={12} /> Сумма ≥ 50 млн UZS — на шаге «Источник средств» потребуется декларация и 2-НДФЛ.
          </div>
        )}
      </div>
    </div>
  );
}

function DepTermsStep({ state, setState }) {
  const today = new Date();
  const mkDate = (m) => new Date(today.getFullYear(), today.getMonth() + m, today.getDate()).toLocaleDateString("ru-RU");
  const opts = [
    { id: 3,  months: 3,  rate: 21.0, maturity: mkDate(3),  pop: false },
    { id: 6,  months: 6,  rate: 22.5, maturity: mkDate(6),  pop: true  },
    { id: 12, months: 12, rate: 23.5, maturity: mkDate(12), pop: true  },
    { id: 24, months: 24, rate: 24.0, maturity: mkDate(24), pop: false },
  ];
  const projected = state.amount && state.term ? Math.round(state.amount * (state.term.rate / 100) * (state.term.months / 12)) : 0;
  return (
    <div className="crm-card" data-clicky-target="dep-terms">
      <div className="crm-head"><h3>Шаг 2 · Срок и ставка</h3></div>
      <div className="crm-body">
        <label className="field-label-block">Срок вклада</label>
        <div className="term-grid">
          {opts.map(o => (
            <button key={o.id}
                    className={`term-tile ${state.term?.id === o.id ? "active" : ""}`}
                    onClick={() => setState({ ...state, term: o })}>
              {o.pop && <span className="term-pop">популярно</span>}
              <b>{o.months} мес</b>
              <div className="term-rate mono">{o.rate}%</div>
              <span className="term-date">До {o.maturity}</span>
            </button>
          ))}
        </div>
        {projected > 0 && (
          <div className="proj-card">
            <div>
              <div className="proj-label">Прогнозируемая доходность</div>
              <div className="proj-value mono">+ {projected.toLocaleString("ru-RU")} UZS</div>
            </div>
            <div className="proj-meta">
              {state.term.rate}% × {state.term.months} мес · базис 365 дней
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DepSofStep({ state, setState, needs }) {
  if (!needs) return (
    <div className="crm-card">
      <div className="crm-head"><h3>Шаг 3 · Источник средств</h3><span className="tag good">Не требуется</span></div>
      <div className="crm-body">
        <p className="sub">Сумма меньше 50 млн UZS — декларация источника не требуется по AML-HB §4.7. Шаг пропускается автоматически.</p>
      </div>
    </div>
  );
  return (
    <div className="crm-card" data-clicky-target="dep-sof">
      <div className="crm-head">
        <h3>Шаг 3 · Источник средств</h3>
        <span className="tag warn">Требуется</span>
      </div>
      <div className="crm-body">
        <div className="crm-grid cols-2">
          <Field label="Заявленный источник" v="Зарплата и бонусы · «ООО ТехноТрейд»" />
          <Field label="Годовой доход" v="~ 220 000 000 UZS" mono />
        </div>
        <div style={{ marginTop: 14 }}>
          {state.sofUploaded ? (
            <div className="doc-row uploaded">
              <div className="doc-thumb" />
              <div className="doc-meta">
                <b>2NDFL_2025_signed.pdf</b>
                <span>Подписан · OCR совпал на 97.8% · <span style={{ color: "var(--good)" }}>Принят</span></span>
              </div>
              <button className="btn btn-ghost btn-xs">Открыть</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setState({ ...state, sofUploaded: true })}>
              <I.Upload size={13} /> Загрузить 2-НДФЛ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DepConfirmStep({ state, setState }) {
  return (
    <div className="crm-card" data-clicky-target="dep-confirm">
      <div className="crm-head"><h3>Шаг 4 · Подтверждение</h3></div>
      <div className="crm-body">
        <div className="confirm-grid">
          <Field label="Вкладчик" v={state.customer?.name || "—"} />
          <Field label="Сумма" v={`${(state.amount / 1_000_000).toLocaleString("ru-RU")} млн UZS`} mono />
          <Field label="Срок" v={`${state.term?.months || "—"} мес`} mono />
          <Field label="Ставка" v={`${state.term?.rate || "—"}%`} mono />
          <Field label="Дата окончания" v={state.term?.maturity || "—"} mono />
          <Field label="Декларация ИС" v={state.sofUploaded ? "Загружена · 2-НДФЛ" : "Не требуется"} />
        </div>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <button className={`btn ${state.confirmed ? "btn-ghost" : "btn-primary"}`}
                  onClick={() => setState({ ...state, confirmed: true })}
                  disabled={state.confirmed}>
            {state.confirmed ? <><I.Check size={12} /> Подтверждено</> : <>Оформить вклад</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. TRANSFER
// ════════════════════════════════════════════════════════════════════════════

const TR_STEPS = [
  { id: "from", title: "Отправитель",   code: "TRANSFER-OPS v3.0", hint: "Выберите счёт отправителя — со списанием комиссии и проверкой остатка." },
  { id: "to",   title: "Получатель",    code: "TRANSFER-OPS v3.0", hint: "Внутренний клиент, ИБАН или SWIFT. SWIFT требует точный BIC и адрес банка-получателя." },
  { id: "amt",  title: "Сумма",         code: "TRANSFER-OPS v3.0", hint: "Введите сумму. Выше $10 000/сутки — расширенная AML-проверка.", source: "TRANSFER-OPS §6.4" },
  { id: "aml",  title: "AML · проверка", code: "AML-HB v2.9",       hint: "Система запустит проверку. Эскалируйте, если флаг жёлтый.", source: "AML-HB §5.0" },
  { id: "conf", title: "Подтверждение", code: "TRANSFER-OPS v3.0", hint: "Финальный обзор + OTP. Возврат невозможен после подтверждения." },
];

function TransferScenario({ setSimPage, onComplete, onJournal, onStepChange, taskTitle }) {
  const [idx, setIdx] = useState_sc(0);
  const [state, setState] = useState_sc({ from: null, channel: "internal", to: "", amount: 0, cur: "UZS", amlChoice: null, confirmed: false });
  const [done, setDone] = useState_sc(false);
  const highRisk = state.amount > (state.cur === "UZS" ? 100_000_000 : 10_000);

  const stepDone = {
    from: !!state.from,
    to:   !!state.to && state.to.length >= 3,
    amt:  state.amount > 0,
    aml:  state.amlChoice !== null,
    conf: state.confirmed,
  };
  const curId = TR_STEPS[idx].id;
  useEffect_sc(() => { onStepChange && onStepChange(done ? null : curId); }, [curId, done]);
  useEffect_sc(() => {
    if (!stepDone[curId]) return;
    if (idx === TR_STEPS.length - 1) { const tm = setTimeout(() => setDone(true), 600); return () => clearTimeout(tm); }
    const tm = setTimeout(() => setIdx(idx + 1), 600);
    return () => clearTimeout(tm);
  }, [stepDone[curId], idx]);

  const isCorrect = !highRisk || state.amlChoice === "escal";

  return (
    <SimShell
      simPage="transfers"
      setSimPage={setSimPage}
      crumb={["Операции", "Переводы", taskTitle || "Новый перевод"]}
      progress={{ label: `Шаг ${idx + 1} / ${TR_STEPS.length} · ${TR_STEPS[idx].title}`, pct: Math.round((idx / (TR_STEPS.length - 1)) * 100) }}
      rail={done ? null : <><ScSteps steps={TR_STEPS} idx={idx} errorIdx={done && !isCorrect ? 3 : undefined} /><ScHint step={TR_STEPS[idx]} autoOk={stepDone[curId]} /><ScRailMeta session="trn-9c41" /></>}
      foot={done ? null : (<>
        <div className="left">Сценарий <b>TRANSFER-OPS v3.0</b> · {highRisk ? "обнаружен жёлтый флаг" : "обычный поток"}</div>
        <div className="spacer" />
        {onJournal && <button className="btn btn-ghost" onClick={onJournal}><I.Doc size={13} /> Журнал</button>}
        <button className="btn btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← Назад</button>
        <button className="btn btn-primary"
                onClick={() => { if (idx === TR_STEPS.length - 1) setDone(true); else setIdx(idx + 1); }}>
          {idx === TR_STEPS.length - 1 ? "Провести перевод" : "Подтвердить шаг"} <I.Arrow size={13} />
        </button>
      </>)}
    >
      {done && <ScDone
        title={isCorrect ? "Перевод проведён" : "Перевод проведён · с инцидентом"}
        lines={isCorrect
          ? [`${state.cur} ${state.amount.toLocaleString("ru-RU")} отправлено получателю «${state.to}» через ${state.channel === "swift" ? "SWIFT" : "внутреннюю систему"}.`,
             "Подтверждение отправлено клиенту по СМС. Журнал событий обновлён."]
          : [`Сумма провёдена без AML-эскалации, хотя превышение лимита было. В журнал создан инцидент комплаенса.`,
             "Наставник свяжется с вами в течение дня для разбора."]}
        xpEarned={isCorrect ? 65 : 30}
        onContinue={() => onComplete && onComplete()}
        onRetry={() => { setIdx(0); setState({ from: null, channel: "internal", to: "", amount: 0, cur: "UZS", amlChoice: null, confirmed: false }); setDone(false); }}
      />}

      {!done && curId === "from" && <TrFromStep state={state} setState={setState} />}
      {!done && curId === "to"   && <TrToStep state={state} setState={setState} />}
      {!done && curId === "amt"  && <TrAmtStep state={state} setState={setState} />}
      {!done && curId === "aml"  && <TrAmlStep state={state} setState={setState} highRisk={highRisk} />}
      {!done && curId === "conf" && <TrConfStep state={state} setState={setState} />}
    </SimShell>
  );
}

function TrFromStep({ state, setState }) {
  const accounts = window.SYNTH.ACCOUNTS.filter(a => a.status === "Активен").slice(0, 5);
  return (
    <div className="crm-card" data-clicky-target="tr-from">
      <div className="crm-head"><h3>Шаг 1 · Счёт отправителя</h3></div>
      <div className="crm-body">
        <div className="acc-list">
          {accounts.map(a => (
            <button key={a.id}
                    className={`acc-row ${state.from?.id === a.id ? "active" : ""}`}
                    onClick={() => setState({ ...state, from: a })}>
              <div className="opt-radio">{state.from?.id === a.id && <span />}</div>
              <div className="acc-meta">
                <b>{a.customer}</b>
                <span className="mono">{a.id}</span>
              </div>
              <div className="acc-bal mono">{fmt_s(a.bal, a.cur)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrToStep({ state, setState }) {
  return (
    <div className="crm-card" data-clicky-target="tr-to">
      <div className="crm-head"><h3>Шаг 2 · Получатель</h3></div>
      <div className="crm-body">
        <label className="field-label-block">Канал</label>
        <div className="tab-pill" style={{ width: "fit-content" }}>
          <button className={state.channel === "internal" ? "active" : ""} onClick={() => setState({ ...state, channel: "internal" })}>Внутренний</button>
          <button className={state.channel === "iban" ? "active" : ""}     onClick={() => setState({ ...state, channel: "iban" })}>ИБАН</button>
          <button className={state.channel === "swift" ? "active" : ""}    onClick={() => setState({ ...state, channel: "swift" })}>SWIFT</button>
        </div>
        <div style={{ marginTop: 14 }} className="crm-grid cols-2">
          <div className="field">
            <label>Имя получателя</label>
            <input value={state.to} onChange={(e) => setState({ ...state, to: e.target.value })} placeholder="Например, Петров Д.С. или Anonymous Corp." />
          </div>
          {state.channel === "swift" && (
            <div className="field">
              <label>BIC получателя</label>
              <input className="mono" placeholder="DEUTDEFFXXX" defaultValue="GARABAEUXXX" />
            </div>
          )}
          {state.channel === "iban" && (
            <div className="field">
              <label>ИБАН</label>
              <input className="mono" placeholder="UZ00 ____ ____ ____ ____" defaultValue="UZ12 0010 8800 4471 0023" />
            </div>
          )}
        </div>
        {state.channel === "swift" && (
          <div className="info-banner warn" style={{ marginTop: 14 }}>
            <I.Globe size={12} /> SWIFT-переводы свыше эквивалента $10 000/сутки проходят расширенную AML-проверку.
          </div>
        )}
      </div>
    </div>
  );
}

function TrAmtStep({ state, setState }) {
  return (
    <div className="crm-card" data-clicky-target="tr-amt">
      <div className="crm-head"><h3>Шаг 3 · Сумма</h3></div>
      <div className="crm-body">
        <div className="crm-grid cols-2">
          <div className="field">
            <label>Сумма</label>
            <input className="mono" type="number" placeholder="0"
                   value={state.amount || ""} onChange={(e) => setState({ ...state, amount: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Валюта</label>
            <select value={state.cur} onChange={(e) => setState({ ...state, cur: e.target.value })}>
              <option>UZS</option><option>USD</option><option>EUR</option><option>RUB</option>
            </select>
          </div>
        </div>
        <div className="amount-presets">
          {[100_000, 1_000_000, 10_000_000, 100_000_000].map(a => (
            <button key={a} className="preset-chip" onClick={() => setState({ ...state, amount: a })}>
              {(a / 1_000_000) >= 1 ? `${a/1_000_000} млн` : `${a/1000}k`}
            </button>
          ))}
        </div>
        {state.amount > 0 && (
          <div className="info-banner" style={{ marginTop: 14 }}>
            Комиссия: <b className="mono">{state.channel === "swift" ? "0.25%" : state.channel === "iban" ? "0.1%" : "0.05%"}</b> · итого к списанию <b className="mono">{(state.amount * (state.channel === "swift" ? 1.0025 : state.channel === "iban" ? 1.001 : 1.0005)).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {state.cur}</b>
          </div>
        )}
      </div>
    </div>
  );
}

function TrAmlStep({ state, setState, highRisk }) {
  return (
    <div className="crm-card" data-clicky-target="tr-aml">
      <div className="crm-head">
        <h3>Шаг 4 · AML-проверка</h3>
        {highRisk ? <span className="tag warn">⚠ Превышение лимита</span> : <span className="tag good">✓ В пределах</span>}
      </div>
      <div className="crm-body">
        {highRisk ? (
          <>
            <div className="sanctions-hit">
              <div className="hit-mark">!</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Превышение суточного лимита физлица</div>
                <div style={{ fontSize: 12, color: "var(--warn)", marginTop: 3 }}>
                  Эквивалент превышает $10 000. По <span className="cite-mono">AML-HB §5.0</span> — запросить декларацию цели и эскалировать в комплаенс.
                </div>
              </div>
              <div className="hit-id"><div>ID</div><div className="hit-id-num">AML-9c41</div></div>
            </div>
            <label className="field-label-block" style={{ marginTop: 14 }}>Ваше решение</label>
            <div className="action-grid">
              <button className={`action-chip ${state.amlChoice === "proceed" ? "sel-bad" : ""}`}
                      onClick={() => setState({ ...state, amlChoice: "proceed" })}>
                <div className="ac-row"><span className={`ac-dot ${state.amlChoice === "proceed" ? "bad" : ""}`}>{state.amlChoice === "proceed" && <span/>}</span> Провести как есть</div>
                <div className="ac-sub">Не рекомендуется при превышении</div>
              </button>
              <button className={`action-chip ${state.amlChoice === "escal" ? "sel-good" : ""}`}
                      onClick={() => setState({ ...state, amlChoice: "escal" })}>
                <div className="ac-row"><span className={`ac-dot ${state.amlChoice === "escal" ? "good" : ""}`}>{state.amlChoice === "escal" && <span/>}</span> Эскалировать в комплаенс</div>
                <div className="ac-sub">Создать тикет, дождаться решения</div>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <I.Check size={20} style={{ color: "var(--good)" }} />
            <div>
              <b>AML-проверка пройдена</b>
              <p className="sub" style={{ marginTop: 2 }}>Сумма в пределах суточного лимита. Дополнительные действия не требуются.</p>
            </div>
            <div className="spacer" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={() => setState({ ...state, amlChoice: "ok" })}>
              <I.Check size={12} /> Принять
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TrConfStep({ state, setState }) {
  return (
    <div className="crm-card" data-clicky-target="tr-conf">
      <div className="crm-head"><h3>Шаг 5 · Подтверждение</h3></div>
      <div className="crm-body">
        <div className="confirm-grid">
          <Field label="От" v={state.from?.customer || "—"} />
          <Field label="Кому" v={state.to || "—"} />
          <Field label="Канал" v={state.channel === "swift" ? "SWIFT" : state.channel === "iban" ? "ИБАН" : "Внутренний"} />
          <Field label="Сумма" v={`${state.cur} ${state.amount.toLocaleString("ru-RU")}`} mono />
          <Field label="AML" v={state.amlChoice === "escal" ? "Эскалирован" : state.amlChoice === "proceed" ? "Принудительно проведён" : "Пройдено"} />
          <Field label="Статус" v={state.amlChoice === "escal" ? "Ожидает комплаенс" : "Готов к проведению"} />
        </div>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <button className={`btn ${state.confirmed ? "btn-ghost" : "btn-primary"}`}
                  onClick={() => setState({ ...state, confirmed: true })}
                  disabled={state.confirmed}>
            {state.confirmed ? <><I.Check size={12} /> Подтверждено</> : "Провести перевод"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. CARD ISSUE
// ════════════════════════════════════════════════════════════════════════════

const CI_STEPS = [
  { id: "client",  title: "Клиент",        code: "CARD-ISSUE v1.8", hint: "Выберите держателя — карта будет привязана к его профилю." },
  { id: "product", title: "Тип карты",     code: "CARD-ISSUE v1.8", hint: "UZCARD / HUMO — местные. VISA / Mastercard — для зарубежных платежей.", source: "CARD-ISSUE §2.1" },
  { id: "params",  title: "Параметры",     code: "CARD-ISSUE v1.8", hint: "Лимиты, цифровая копия, доставка. Все параметры можно поменять позже." },
  { id: "review",  title: "Заявка",        code: "CARD-ISSUE v1.8", hint: "Финальная проверка. Заявка уйдёт в персонализацию." },
];

function CardIssueScenario({ setSimPage, onComplete, onJournal, onStepChange, taskTitle }) {
  const [idx, setIdx] = useState_sc(0);
  const [state, setState] = useState_sc({ customer: null, brand: null, type: null, digital: true, delivery: "office", confirmed: false });
  const [done, setDone] = useState_sc(false);
  const stepDone = {
    client:  !!state.customer,
    product: !!state.brand && !!state.type,
    params:  true,
    review:  state.confirmed,
  };
  const curId = CI_STEPS[idx].id;
  useEffect_sc(() => { onStepChange && onStepChange(done ? null : curId); }, [curId, done]);
  useEffect_sc(() => {
    if (!stepDone[curId]) return;
    if (idx === CI_STEPS.length - 1) { const tm = setTimeout(() => setDone(true), 600); return () => clearTimeout(tm); }
    const tm = setTimeout(() => setIdx(idx + 1), 600);
    return () => clearTimeout(tm);
  }, [stepDone[curId], idx]);

  return (
    <SimShell
      simPage="cards"
      setSimPage={setSimPage}
      crumb={["Операции", "Выпуск карт", taskTitle || "Новая карта"]}
      progress={{ label: `Шаг ${idx + 1} / ${CI_STEPS.length} · ${CI_STEPS[idx].title}`, pct: Math.round((idx / (CI_STEPS.length - 1)) * 100) }}
      rail={done ? null : <><ScSteps steps={CI_STEPS} idx={idx} /><ScHint step={CI_STEPS[idx]} autoOk={stepDone[curId]} /><ScRailMeta session="card-2e09" /></>}
      foot={done ? null : (<>
        <div className="left">Сценарий <b>CARD-ISSUE v1.8</b> · SLA выпуска до 3 дней</div>
        <div className="spacer" />
        {onJournal && <button className="btn btn-ghost" onClick={onJournal}><I.Doc size={13} /> Журнал</button>}
        <button className="btn btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← Назад</button>
        <button className="btn btn-primary"
                onClick={() => { if (idx === CI_STEPS.length - 1) setDone(true); else setIdx(idx + 1); }}>
          {idx === CI_STEPS.length - 1 ? "Отправить в выпуск" : "Подтвердить шаг"} <I.Arrow size={13} />
        </button>
      </>)}
    >
      {done && <ScDone
        title="Заявка отправлена"
        lines={[`Карта ${state.brand} ${state.type} для ${state.customer?.name?.split(" ").slice(0,2).join(" ")} отправлена в персонализацию.`,
                state.digital ? "Цифровая копия будет доступна в течение 10 минут." : "Пластик будет готов к выдаче через 1–3 рабочих дня."]}
        xpEarned={40}
        onContinue={() => onComplete && onComplete()}
        onRetry={() => { setIdx(0); setState({ customer: null, brand: null, type: null, digital: true, delivery: "office", confirmed: false }); setDone(false); }}
      />}

      {!done && curId === "client"  && <AoCustomerStep state={state} setState={setState} />}
      {!done && curId === "product" && <CiProductStep state={state} setState={setState} />}
      {!done && curId === "params"  && <CiParamsStep state={state} setState={setState} />}
      {!done && curId === "review"  && <CiReviewStep state={state} setState={setState} />}
    </SimShell>
  );
}

function CiProductStep({ state, setState }) {
  const brands = [
    { id: "UZCARD", sub: "Внутри Узбекистана · Pay Me" },
    { id: "HUMO",   sub: "Внутри Узбекистана · мобильные платежи" },
    { id: "VISA",   sub: "Международная · 200+ стран" },
    { id: "MC",     sub: "Mastercard · международная" },
  ];
  const types = [
    { id: "debit", label: "Дебетовая", sub: "Стандарт · мгновенная" },
    { id: "gold",  label: "Gold",      sub: "Премиум · кешбэк до 5%" },
    { id: "youth", label: "Молодёжная", sub: "До 23 лет · сниженный тариф" },
  ];
  return (
    <div className="crm-card" data-clicky-target="ci-product">
      <div className="crm-head"><h3>Шаг 2 · Тип карты</h3></div>
      <div className="crm-body">
        <label className="field-label-block">Бренд</label>
        <div className="prod-grid">
          {brands.map(b => (
            <button key={b.id}
                    className={`prod-tile ${state.brand === b.id ? "active" : ""}`}
                    onClick={() => setState({ ...state, brand: b.id })}>
              <b>{b.id}</b>
              <span>{b.sub}</span>
            </button>
          ))}
        </div>
        <label className="field-label-block" style={{ marginTop: 16 }}>Категория</label>
        <div className="prod-grid">
          {types.map(t => (
            <button key={t.id}
                    className={`prod-tile ${state.type === t.id ? "active" : ""}`}
                    onClick={() => setState({ ...state, type: t.id })}>
              <b>{t.label}</b>
              <span>{t.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CiParamsStep({ state, setState }) {
  return (
    <div className="crm-card" data-clicky-target="ci-params">
      <div className="crm-head"><h3>Шаг 3 · Параметры</h3></div>
      <div className="crm-body">
        <div className="crm-grid cols-2">
          <Field label="Дневной лимит" v="5 000 000 UZS" mono />
          <Field label="Лимит снятия в банкоматах" v="2 000 000 UZS" mono />
          <Field label="Срок действия" v="3 года" />
          <Field label="Тариф" v="Базовый · 0 UZS/мес" />
        </div>
        <div className="param-toggles">
          <ToggleRow label="Цифровая копия" sub="Доступ к карте через мобильное приложение"
                     v={state.digital} on={() => setState({ ...state, digital: !state.digital })} />
          <div className="param-delivery">
            <label className="field-label-block">Доставка пластика</label>
            <div className="tab-pill" style={{ width: "fit-content" }}>
              <button className={state.delivery === "office" ? "active" : ""} onClick={() => setState({ ...state, delivery: "office" })}>В отделение</button>
              <button className={state.delivery === "courier" ? "active" : ""} onClick={() => setState({ ...state, delivery: "courier" })}>Курьером</button>
              <button className={state.delivery === "none" ? "active" : ""} onClick={() => setState({ ...state, delivery: "none" })}>Только цифровая</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CiReviewStep({ state, setState }) {
  return (
    <div className="crm-card" data-clicky-target="ci-review">
      <div className="crm-head"><h3>Шаг 4 · Финальная проверка</h3></div>
      <div className="crm-body">
        <div className="confirm-grid">
          <Field label="Держатель" v={state.customer?.name || "—"} />
          <Field label="Бренд" v={state.brand || "—"} />
          <Field label="Категория" v={state.type || "—"} />
          <Field label="Цифровая копия" v={state.digital ? "Да" : "Нет"} />
          <Field label="Доставка пластика" v={state.delivery === "office" ? "В отделение" : state.delivery === "courier" ? "Курьером" : "Только цифровая"} />
          <Field label="SLA" v="до 3 рабочих дней" />
        </div>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <button className={`btn ${state.confirmed ? "btn-ghost" : "btn-primary"}`}
                  onClick={() => setState({ ...state, confirmed: true })}
                  disabled={state.confirmed}>
            {state.confirmed ? <><I.Check size={12} /> Отправлено</> : "Отправить в персонализацию"}
          </button>
        </div>
      </div>
    </div>
  );
}

window.OpenAccountScenario = OpenAccountScenario;
window.DepositScenario      = DepositScenario;
window.TransferScenario     = TransferScenario;
window.CardIssueScenario    = CardIssueScenario;
