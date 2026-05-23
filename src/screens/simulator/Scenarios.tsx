// Scenarios.tsx — Account, Deposit, Transfer, Card scenarios
// Ported from reference/screens/Scenarios.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { I } from '../../components/Icons';
import { useScenarioStore } from '../../store/scenarioStore';
import { useUserStore } from '../../store/userStore';
import { scoreScenario } from '../../lib/scoring';
import { checkBadgeUnlocks } from '../../lib/badges';
import { getMentorFeedback } from '../../lib/progression';
import { SYNTH } from '../../data/synth';
import type { ScenarioId, RunSummary } from '../../store/userStore';

const { CUSTOMERS: CUST_S, ACCOUNTS, fmt: fmt_s } = SYNTH;

// ─── Shared helpers ──────────────────────────────────────────────────────────

function Field({ label, v, mono, span }: { label: string; v: React.ReactNode; mono?: boolean; span?: number }) {
  return (
    <div className="field" style={span ? { gridColumn: `1 / span ${span}` } : undefined}>
      <label>{label}</label>
      <div className={`val ${mono ? 'mono' : ''}`}>{v}</div>
    </div>
  );
}

function ToggleRow({ label, sub, v, on }: { label: string; sub: string; v: boolean; on: () => void }) {
  return (
    <div className="toggle-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>{sub}</div>
      </div>
      <button
        onClick={on}
        style={{
          width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer',
          background: v ? 'var(--cobalt)' : 'var(--line-2)',
          position: 'relative', transition: 'background .15s',
        }}
        aria-pressed={v}
      >
        <span style={{
          position: 'absolute', top: 3, left: v ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: 'white', transition: 'left .15s',
        }} />
      </button>
    </div>
  );
}

// Shared steps panel
function ScSteps({
  steps,
  idx,
  errorIdx,
}: {
  steps: Array<{ id: string; title: string; hint: string; code?: string }>;
  idx: number;
  errorIdx?: number;
}) {
  return (
    <div className="steps-panel">
      <h4>Сценарий · {steps[0]?.code ?? 'v1.0'}</h4>
      {steps.map((s, i) => {
        const status = i < idx ? 'done' : i === idx ? 'active' : 'pending';
        const isErr = errorIdx === i;
        return (
          <div key={s.id} className={`step ${isErr ? 'error' : status}`}>
            <div className="marker">{i < idx && !isErr ? '✓' : isErr ? '!' : i + 1}</div>
            <div>
              <b>{s.title}</b>
              <span>{s.hint}</span>
            </div>
            <span className="pts">{i < idx ? (isErr ? '−10' : '+15') : i === idx ? '···' : '0'}</span>
          </div>
        );
      })}
    </div>
  );
}

function ScHint({
  step,
  autoOk,
  manualOnly,
}: {
  step: { hint: string; source?: string };
  autoOk?: boolean;
  manualOnly?: boolean;
}) {
  return (
    <div className="hint-card">
      <h5><I.Spark size={11} /> {autoOk ? 'Готово к авто-переходу' : 'Подсказка · из документов'}</h5>
      <p>{step.hint}</p>
      {step.source && (
        <p style={{ fontSize: 11.5, color: 'var(--mute)' }}>
          Источник: <span className="cite-mono">{step.source}</span>
        </p>
      )}
      {manualOnly && (
        <p style={{ fontSize: 11.5, color: 'var(--mute)', marginTop: 6, fontStyle: 'italic' }}>
          Шаг завершается вручную — после проверки нажмите «Подтвердить шаг».
        </p>
      )}
    </div>
  );
}

function ScRailMeta({ session }: { session: string }) {
  return (
    <div className="rail-meta">
      <div><span>Дежурный наставник</span> <b>Татьяна К.</b></div>
      <div><span>Сессия</span> <b className="mono">{session}</b></div>
      <div><span>Среда</span> <b style={{ color: 'var(--good)' }}>● синтетика</b></div>
    </div>
  );
}

// Generic scenario completion card
function ScDone({
  title,
  lines,
  xpEarned,
  onContinue,
  onRetry,
}: {
  title: string;
  lines: string[];
  xpEarned: number;
  onContinue: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="sc-done">
      <div className="sc-done-icon"><I.Check size={26} /></div>
      <h2>{title}</h2>
      <p className="sub">{lines[0]}</p>
      {lines.slice(1).map((l, i) => (
        <p key={i} className="sub" style={{ marginTop: 6 }}>{l}</p>
      ))}
      <div className="sc-done-xp">
        <I.Bolt size={14} /> <b>+{xpEarned} XP</b> · оценка <b className="mono">94/100</b>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn-primary" onClick={onContinue}><I.Arrow size={13} /> К следующей задаче</button>
        <button className="btn btn-ghost" onClick={onRetry}>Пройти заново</button>
      </div>
    </div>
  );
}

// ─── Helper: build and save run ──────────────────────────────────────────────

function buildAndSaveRun(scenarioId: ScenarioId): RunSummary {
  const { startTime, hintsUsed, choices } = useScenarioStore.getState();
  const timeMs = Date.now() - startTime;
  const breakdown = scoreScenario(scenarioId, choices, { timeMs, hintsUsed });
  const userState = useUserStore.getState();
  const tempRun: RunSummary = {
    id: `${scenarioId}-${Date.now()}`,
    scenarioId,
    completedAt: new Date().toISOString(),
    score: breakdown.total,
    grade: breakdown.grade,
    xpEarned: breakdown.xpEarned,
    timeMs,
    hintsUsed,
    steps: breakdown.steps,
    choices,
    newBadges: [],
  };
  const newBadges = checkBadgeUnlocks(
    [...userState.completedRuns, tempRun],
    userState.badges,
    userState.streak
  );
  const run: RunSummary = { ...tempRun, newBadges };
  useUserStore.getState().addRun(run);
  useUserStore.getState().addXp(run.xpEarned);
  for (const badgeId of newBadges) {
    useUserStore.getState().unlockBadge(badgeId);
  }
  return run;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. ACCOUNT OPENING
// ════════════════════════════════════════════════════════════════════════════

const AO_STEPS = [
  { id: 'customer', title: 'Клиент',           code: 'OPEN-ACC v2.1',
    hint: 'Выберите клиента — система подтянет проверенный профиль и привязанные документы.' },
  { id: 'product',  title: 'Продукт',           code: 'OPEN-ACC v2.1',
    hint: 'Выберите тип счёта и валюту. Балансовый счёт сформируется автоматически по плану.' },
  { id: 'terms',    title: 'Тариф · условия',   code: 'OPEN-ACC v2.1',
    hint: 'Подтвердите тариф. Для нерезидентов и валютных счетов — расширенные комиссии.', source: 'OPEN-ACC §3.1' },
  { id: 'sign',     title: 'Документы и подпись', code: 'OPEN-ACC v2.1',
    hint: 'Сформируйте номер счёта, распечатайте договор. Подпись клиента — по СМС-OTP.' },
];

interface AoState {
  customer: typeof CUST_S[0] | null;
  product: string | null;
  cur: string | null;
  tariff: string | null;
  otp: string;
  accountNumber: string;
}

function AoCustomerStep({ state, setState }: { state: AoState; setState: React.Dispatch<React.SetStateAction<AoState>> }) {
  const [q, setQ] = useState('');
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
            <button
              key={c.id}
              className={`cust-row ${state.customer?.id === c.id ? 'active' : ''}`}
              onClick={() => setState(s => ({ ...s, customer: c }))}
            >
              <div className={`avatar ${(['cobalt', 'lilac', 'teal', 'rose'] as string[])[c.short.charCodeAt(0) % 4]}`}>{c.short}</div>
              <div className="cust-meta">
                <b>{c.name}</b>
                <span>{c.city} · ИНН {c.inn} · {c.lang}</span>
              </div>
              <div className="cust-status">
                <span className={`tag ${c.status === 'Активен' ? 'good' : c.status.includes('KYC') ? 'warn' : 'mute'}`}>{c.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AoProductStep({ state, setState }: { state: AoState; setState: React.Dispatch<React.SetStateAction<AoState>> }) {
  const types = [
    { id: 'current', label: 'Текущий счёт',   sub: 'Без срока · карта в комплекте', icon: <I.Plus size={14} /> },
    { id: 'saving',  label: 'Сберегательный', sub: 'Накопления · 12% годовых',      icon: <I.Coins size={14} /> },
    { id: 'term',    label: 'Срочный депозит', sub: 'От 3 мес · ставки до 24%',      icon: <I.Star size={14} /> },
    { id: 'card',    label: 'Карточный',       sub: 'Привязан к карте',              icon: <I.Doc size={14} /> },
  ];
  const currencies = ['UZS', 'USD', 'EUR', 'RUB'];
  const planCode: Record<string, string> = { UZS: '20208 860 0 00012', USD: '20208 840 0 00012', EUR: '20208 978 0 00012', RUB: '20208 643 0 00012' };
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
            <button
              key={t.id}
              className={`prod-tile ${state.product === t.id ? 'active' : ''}`}
              onClick={() => setState(s => ({ ...s, product: t.id }))}
            >
              <div className="prod-icon">{t.icon}</div>
              <b>{t.label}</b>
              <span>{t.sub}</span>
            </button>
          ))}
        </div>
        <label className="field-label-block" style={{ marginTop: 16 }}>Валюта</label>
        <div className="tab-pill" style={{ width: 'fit-content' }}>
          {currencies.map(c => (
            <button key={c} className={state.cur === c ? 'active' : ''} onClick={() => setState(s => ({ ...s, cur: c }))}>{c}</button>
          ))}
        </div>
        {state.product && state.cur && (
          <div className="info-banner" style={{ marginTop: 16 }}>
            <I.Check size={12} /> Балансовый счёт по плану: <span className="mono">{planCode[state.cur] ?? '20208 860 0 00012'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AoTermsStep({ state, setState }: { state: AoState; setState: React.Dispatch<React.SetStateAction<AoState>> }) {
  const tariffs = [
    { id: 'basic', label: 'Резидент · базовый',  fee: '0 UZS/мес',      sub: 'Стандартный пакет, без подписки' },
    { id: 'pro',   label: 'Резидент · Pro',       fee: '25 000 UZS/мес', sub: 'Бесплатные SWIFT, кешбэк до 3%' },
    { id: 'fx',    label: 'Валютный · базовый',   fee: '$1/мес',         sub: 'Только для USD/EUR счетов' },
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
            <button
              key={t.id}
              className={`tariff-row ${state.tariff === t.id ? 'active' : ''}`}
              onClick={() => setState(s => ({ ...s, tariff: t.id }))}
            >
              <span className="opt-radio">{state.tariff === t.id && <span />}</span>
              <div className="tariff-meta"><b>{t.label}</b><span>{t.sub}</span></div>
              <div className="tariff-fee mono">{t.fee}</div>
            </button>
          ))}
        </div>
        <div className="info-banner" style={{ marginTop: 16, background: 'var(--cobalt-tint)', borderColor: 'var(--cobalt-tint-2)', color: 'var(--cobalt-ink)' }}>
          Тариф можно сменить в течение 30 дней без комиссии. После — переход возможен с 1-го числа следующего месяца.
        </div>
      </div>
    </div>
  );
}

function AoSignStep({ state, setState }: { state: AoState; setState: React.Dispatch<React.SetStateAction<AoState>> }) {
  const gen = () => {
    const tail = String(Math.floor(Math.random() * 9999999)).padStart(7, '0');
    const prefix = state.cur === 'UZS' ? '20208 860 0 00012'
      : state.cur === 'USD' ? '20208 840 0 00012'
      : '20208 978 0 00012';
    setState(s => ({ ...s, accountNumber: `${prefix} ${tail}` }));
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
                <b>account_agreement_{state.cur ?? 'UZS'}.pdf</b>
                <span>2 стр. · Сформирован автоматически</span>
              </div>
              <button className="btn btn-ghost btn-xs">Открыть</button>
            </div>
          </div>
          <div>
            <label className="field-label-block">СМС-код подтверждения</label>
            <div className="otp-row">
              <input
                className="otp-input mono"
                maxLength={4}
                placeholder="••••"
                value={state.otp}
                onChange={(e) => setState(s => ({ ...s, otp: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              />
              <span className="otp-hint">Отправлен на <span className="mono">+998 71 ••• 55 17</span></span>
              <button className="btn btn-ghost btn-xs">Переотправить</button>
            </div>
            {state.otp === '1234' && (
              <div className="info-banner ok" style={{ marginTop: 8 }}><I.Check size={12} /> Подтверждено</div>
            )}
            {state.otp.length >= 1 && state.otp.length < 4 && (
              <div className="hint-card" style={{ marginTop: 8 }}>
                Тренировочный режим — введите <b className="mono">1234</b>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OpenAccountScenario() {
  const navigate = useNavigate();
  const scenarioStore = useScenarioStore();

  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<AoState>({
    customer: null, product: null, cur: null, tariff: null, otp: '', accountNumber: '',
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    scenarioStore.startScenario('accounts');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepDone: Record<string, boolean> = {
    customer: !!state.customer,
    product:  !!state.product && !!state.cur,
    terms:    !!state.tariff,
    sign:     state.otp.length >= 4 && !!state.accountNumber,
  };
  const curId = AO_STEPS[idx].id;

  // Record choices on state changes
  useEffect(() => { scenarioStore.recordChoice('customer', state.customer?.id ?? null); }, [state.customer]);
  useEffect(() => { scenarioStore.recordChoice('product', state.product); }, [state.product]);
  useEffect(() => { scenarioStore.recordChoice('cur', state.cur); }, [state.cur]);
  useEffect(() => { scenarioStore.recordChoice('tariff', state.tariff); }, [state.tariff]);

  // Auto-advance when step done
  useEffect(() => {
    if (!stepDone[curId]) return;
    if (idx === AO_STEPS.length - 1) {
      const tm = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(tm);
    }
    const tm = setTimeout(() => setIdx(idx + 1), 600);
    return () => clearTimeout(tm);
  }, [stepDone[curId], idx]);

  const progressPct = Math.round(((idx + (stepDone[curId] ? 1 : 0)) / AO_STEPS.length) * 100);

  const handleComplete = () => {
    buildAndSaveRun('accounts');
    navigate('/results');
  };

  const handleRetry = () => {
    setIdx(0);
    setState({ customer: null, product: null, cur: null, tariff: null, otp: '', accountNumber: '' });
    setDone(false);
    scenarioStore.startScenario('accounts');
  };

  return (
    <div className="scenario-page">
      <div className="scenario-content">
        {done && (
          <ScDone
            title="Счёт открыт"
            lines={[
              `Счёт ${state.accountNumber} успешно открыт для клиента ${state.customer?.name?.split(' ').slice(0, 2).join(' ')}.`,
              'Договор отправлен в личный кабинет клиента и наставнику на проверку.',
            ]}
            xpEarned={50}
            onContinue={handleComplete}
            onRetry={handleRetry}
          />
        )}
        {!done && curId === 'customer' && <AoCustomerStep state={state} setState={setState} />}
        {!done && curId === 'product'  && <AoProductStep  state={state} setState={setState} />}
        {!done && curId === 'terms'    && <AoTermsStep    state={state} setState={setState} />}
        {!done && curId === 'sign'     && <AoSignStep     state={state} setState={setState} />}
      </div>

      {!done && (
        <aside className="scenario-rail">
          <ScSteps steps={AO_STEPS} idx={idx} />
          <ScHint step={AO_STEPS[idx]} autoOk={stepDone[curId]} />
          <ScRailMeta session="acc-1f02" />
        </aside>
      )}

      {!done && (
        <div className="scenario-foot">
          <div className="left">Сценарий <b>OPEN-ACC v2.1</b> · автопереход когда шаг готов</div>
          <div className="spacer" />
          <button className="btn btn-ghost" onClick={() => navigate('/simulator/accounts')}>
            <I.Doc size={13} /> Журнал
          </button>
          <button className="btn btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← Назад</button>
          <button className="btn btn-ghost" onClick={() => scenarioStore.useHint()}>
            <I.Help size={13} /> Спросить Клика
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { if (idx === AO_STEPS.length - 1) setDone(true); else setIdx(idx + 1); }}
          >
            {idx === AO_STEPS.length - 1 ? 'Подтвердить' : 'Подтвердить шаг'} <I.Arrow size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. DEPOSIT
// ════════════════════════════════════════════════════════════════════════════

const DEP_STEPS = [
  { id: 'client',  title: 'Клиент и сумма',   code: 'DEPOSIT-OPS v2.1',
    hint: 'Выберите вкладчика и введите сумму. От 50 млн UZS — обязательна декларация ИС.' },
  { id: 'terms',   title: 'Срок и ставка',     code: 'DEPOSIT-OPS v2.1',
    hint: 'Чем длиннее срок, тем выше ставка. Минимум — 3 месяца.', source: 'DEPOSIT-OPS §2.4' },
  { id: 'sof',     title: 'Источник средств',  code: 'AML-HB v2.9',
    hint: 'При сумме ≥ 50 млн UZS — нужна декларация и подтверждающий документ.', source: 'AML-HB §4.7' },
  { id: 'confirm', title: 'Подтверждение',     code: 'DEPOSIT-OPS v2.1',
    hint: 'Проверьте параметры, оформите договор и отправьте на одобрение.' },
];

interface TermOpt {
  id: number;
  months: number;
  rate: number;
  maturity: string;
  pop: boolean;
}

interface DepState {
  customer: typeof CUST_S[0] | null;
  amount: number;
  term: TermOpt | null;
  sofUploaded: boolean;
  confirmed: boolean;
}

function DepClientStep({ state, setState }: { state: DepState; setState: React.Dispatch<React.SetStateAction<DepState>> }) {
  return (
    <div className="crm-card" data-clicky-target="dep-client">
      <div className="crm-head"><h3>Шаг 1 · Клиент и сумма</h3></div>
      <div className="crm-body">
        <div className="crm-grid cols-2">
          <div className="field">
            <label>Вкладчик</label>
            <select
              value={state.customer?.id ?? ''}
              onChange={(e) => setState(s => ({ ...s, customer: CUST_S.find(c => c.id === e.target.value) ?? null }))}
            >
              <option value="">Выберите клиента…</option>
              {CUST_S.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Сумма вклада (UZS)</label>
            <input
              className="mono"
              type="number"
              placeholder="50 000 000"
              value={state.amount || ''}
              onChange={(e) => setState(s => ({ ...s, amount: Number(e.target.value) }))}
            />
            {state.amount > 0 && <span className="hint">{state.amount.toLocaleString('ru-RU')} UZS</span>}
          </div>
        </div>
        <div className="amount-presets">
          {[10_000_000, 50_000_000, 100_000_000, 250_000_000].map(a => (
            <button key={a} className="preset-chip" onClick={() => setState(s => ({ ...s, amount: a }))}>
              {a / 1_000_000} млн
            </button>
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

function DepTermsStep({ state, setState }: { state: DepState; setState: React.Dispatch<React.SetStateAction<DepState>> }) {
  const today = new Date();
  const mkDate = (m: number) =>
    new Date(today.getFullYear(), today.getMonth() + m, today.getDate()).toLocaleDateString('ru-RU');
  const opts: TermOpt[] = [
    { id: 3,  months: 3,  rate: 21.0, maturity: mkDate(3),  pop: false },
    { id: 6,  months: 6,  rate: 22.5, maturity: mkDate(6),  pop: true  },
    { id: 12, months: 12, rate: 23.5, maturity: mkDate(12), pop: true  },
    { id: 24, months: 24, rate: 24.0, maturity: mkDate(24), pop: false },
  ];
  const projected = state.amount && state.term
    ? Math.round(state.amount * (state.term.rate / 100) * (state.term.months / 12))
    : 0;
  return (
    <div className="crm-card" data-clicky-target="dep-terms">
      <div className="crm-head"><h3>Шаг 2 · Срок и ставка</h3></div>
      <div className="crm-body">
        <label className="field-label-block">Срок вклада</label>
        <div className="term-grid">
          {opts.map(o => (
            <button
              key={o.id}
              className={`term-tile ${state.term?.id === o.id ? 'active' : ''}`}
              onClick={() => setState(s => ({ ...s, term: o }))}
            >
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
              <div className="proj-value mono">+ {projected.toLocaleString('ru-RU')} UZS</div>
            </div>
            <div className="proj-meta">
              {state.term!.rate}% × {state.term!.months} мес · базис 365 дней
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DepSofStep({
  state,
  setState,
  needs,
}: {
  state: DepState;
  setState: React.Dispatch<React.SetStateAction<DepState>>;
  needs: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startUpload = () => {
    if (state.sofUploaded || uploading) return;
    setUploading(true);
    setUploadPct(0);
    // Kick the progress bar — CSS transition handles the animation
    requestAnimationFrame(() => setUploadPct(100));
    setTimeout(() => {
      setState(s => ({ ...s, sofUploaded: true }));
      setUploading(false);
    }, 1600);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) startUpload();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    startUpload();
  };

  if (!needs) {
    return (
      <div className="crm-card">
        <div className="crm-head">
          <h3>Шаг 3 · Источник средств</h3>
          <span className="tag good">Не требуется</span>
        </div>
        <div className="crm-body">
          <p className="sub">Сумма меньше 50 млн UZS — декларация источника не требуется по AML-HB §4.7. Шаг пропускается автоматически.</p>
        </div>
      </div>
    );
  }

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
                <span>Подписан · OCR совпал на 97.8% · <span style={{ color: 'var(--good)' }}>Принят</span></span>
              </div>
              <button className="btn btn-ghost btn-xs">Открыть</button>
            </div>
          ) : (
            <>
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                <I.Upload size={20} />
                <span>Перетащи файл или</span>
                <label className="btn ghost">
                  выбери
                  <input type="file" style={{ display: 'none' }} onChange={handleFile} />
                </label>
              </div>
              {uploading && (
                <div className="upload-progress" style={{ marginTop: 8 }}>
                  <div className="upload-progress-bar" style={{ width: `${uploadPct}%` }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DepConfirmStep({ state, setState }: { state: DepState; setState: React.Dispatch<React.SetStateAction<DepState>> }) {
  return (
    <div className="crm-card" data-clicky-target="dep-confirm">
      <div className="crm-head"><h3>Шаг 4 · Подтверждение</h3></div>
      <div className="crm-body">
        <div className="confirm-grid">
          <Field label="Вкладчик" v={state.customer?.name ?? '—'} />
          <Field label="Сумма" v={`${(state.amount / 1_000_000).toLocaleString('ru-RU')} млн UZS`} mono />
          <Field label="Срок" v={`${state.term?.months ?? '—'} мес`} mono />
          <Field label="Ставка" v={`${state.term?.rate ?? '—'}%`} mono />
          <Field label="Дата окончания" v={state.term?.maturity ?? '—'} mono />
          <Field label="Декларация ИС" v={state.sofUploaded ? 'Загружена · 2-НДФЛ' : 'Не требуется'} />
        </div>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className={`btn ${state.confirmed ? 'btn-ghost' : 'btn-primary'}`}
            onClick={() => setState(s => ({ ...s, confirmed: true }))}
            disabled={state.confirmed}
          >
            {state.confirmed ? <><I.Check size={12} /> Подтверждено</> : <>Оформить вклад</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DepositScenario() {
  const navigate = useNavigate();
  const scenarioStore = useScenarioStore();

  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<DepState>({
    customer: null, amount: 0, term: null, sofUploaded: false, confirmed: false,
  });
  const [done, setDone] = useState(false);
  const needsSof = state.amount >= 50_000_000;

  useEffect(() => {
    scenarioStore.startScenario('deposits');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepDone: Record<string, boolean> = {
    client:  !!state.customer && state.amount > 0,
    terms:   !!state.term,
    sof:     !needsSof || state.sofUploaded,
    confirm: state.confirmed,
  };
  const curId = DEP_STEPS[idx].id;

  // Record choices
  useEffect(() => { scenarioStore.recordChoice('amount', state.amount); }, [state.amount]);
  useEffect(() => { scenarioStore.recordChoice('sofUploaded', state.sofUploaded); }, [state.sofUploaded]);

  useEffect(() => {
    if (!stepDone[curId]) return;
    if (idx === DEP_STEPS.length - 1) {
      const tm = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(tm);
    }
    const tm = setTimeout(() => setIdx(idx + 1), 600);
    return () => clearTimeout(tm);
  }, [stepDone[curId], idx]);

  const handleComplete = () => {
    buildAndSaveRun('deposits');
    navigate('/results');
  };

  const handleRetry = () => {
    setIdx(0);
    setState({ customer: null, amount: 0, term: null, sofUploaded: false, confirmed: false });
    setDone(false);
    scenarioStore.startScenario('deposits');
  };

  return (
    <div className="scenario-page">
      <div className="scenario-content">
        {done && (
          <ScDone
            title="Вклад оформлен"
            lines={[
              `Срочный депозит на ${(state.amount / 1_000_000).toLocaleString('ru-RU')} млн UZS принят. Договор подписан, средства переведены на накопительный.`,
              `Дата окончания: ${state.term?.maturity ?? '—'}. Итоговая ставка: ${state.term?.rate ?? '—'}% годовых.`,
            ]}
            xpEarned={70}
            onContinue={handleComplete}
            onRetry={handleRetry}
          />
        )}
        {!done && curId === 'client'  && <DepClientStep  state={state} setState={setState} />}
        {!done && curId === 'terms'   && <DepTermsStep   state={state} setState={setState} />}
        {!done && curId === 'sof'     && <DepSofStep     state={state} setState={setState} needs={needsSof} />}
        {!done && curId === 'confirm' && <DepConfirmStep state={state} setState={setState} />}
      </div>

      {!done && (
        <aside className="scenario-rail">
          <ScSteps steps={DEP_STEPS} idx={idx} />
          <ScHint step={DEP_STEPS[idx]} autoOk={stepDone[curId]} />
          <ScRailMeta session="dep-7a14" />
        </aside>
      )}

      {!done && (
        <div className="scenario-foot">
          <div className="left">Сценарий <b>DEPOSIT-OPS v2.1</b> · автопроверка значений на каждом шаге</div>
          <div className="spacer" />
          <button className="btn btn-ghost" onClick={() => navigate('/simulator/deposits')}>
            <I.Doc size={13} /> Журнал
          </button>
          <button className="btn btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← Назад</button>
          <button className="btn btn-ghost" onClick={() => scenarioStore.useHint()}>
            <I.Help size={13} /> Спросить Клика
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { if (idx === DEP_STEPS.length - 1) setDone(true); else setIdx(idx + 1); }}
          >
            {idx === DEP_STEPS.length - 1 ? 'Оформить вклад' : 'Подтвердить шаг'} <I.Arrow size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. TRANSFER
// ════════════════════════════════════════════════════════════════════════════

const TR_STEPS = [
  { id: 'from', title: 'Отправитель',    code: 'TRANSFER-OPS v3.0',
    hint: 'Выберите счёт отправителя — со списанием комиссии и проверкой остатка.' },
  { id: 'to',   title: 'Получатель',     code: 'TRANSFER-OPS v3.0',
    hint: 'Внутренний клиент, ИБАН или SWIFT. SWIFT требует точный BIC и адрес банка-получателя.' },
  { id: 'amt',  title: 'Сумма',          code: 'TRANSFER-OPS v3.0',
    hint: 'Введите сумму. Выше $10 000/сутки — расширенная AML-проверка.', source: 'TRANSFER-OPS §6.4' },
  { id: 'aml',  title: 'AML · проверка', code: 'AML-HB v2.9',
    hint: 'Система запустит проверку. Эскалируйте, если флаг жёлтый.', source: 'AML-HB §5.0' },
  { id: 'conf', title: 'Подтверждение',  code: 'TRANSFER-OPS v3.0',
    hint: 'Финальный обзор + OTP. Возврат невозможен после подтверждения.' },
];

interface TrAccount { id: string; customer: string; cur: string; bal: number; status: string }

interface TrState {
  from: TrAccount | null;
  channel: string;
  to: string;
  amount: number;
  cur: string;
  amlChoice: string | null;
  confirmed: boolean;
}

function TrFromStep({ state, setState }: { state: TrState; setState: React.Dispatch<React.SetStateAction<TrState>> }) {
  const accounts = ACCOUNTS.filter(a => a.status === 'Активен').slice(0, 5);
  return (
    <div className="crm-card" data-clicky-target="tr-from">
      <div className="crm-head"><h3>Шаг 1 · Счёт отправителя</h3></div>
      <div className="crm-body">
        <div className="acc-list">
          {accounts.map(a => (
            <button
              key={a.id}
              className={`acc-row ${state.from?.id === a.id ? 'active' : ''}`}
              onClick={() => setState(s => ({ ...s, from: a }))}
            >
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

function TrToStep({ state, setState }: { state: TrState; setState: React.Dispatch<React.SetStateAction<TrState>> }) {
  return (
    <div className="crm-card" data-clicky-target="tr-to">
      <div className="crm-head"><h3>Шаг 2 · Получатель</h3></div>
      <div className="crm-body">
        <label className="field-label-block">Канал</label>
        <div className="tab-pill" style={{ width: 'fit-content' }}>
          <button className={state.channel === 'internal' ? 'active' : ''} onClick={() => setState(s => ({ ...s, channel: 'internal' }))}>Внутренний</button>
          <button className={state.channel === 'iban' ? 'active' : ''}     onClick={() => setState(s => ({ ...s, channel: 'iban' }))}>ИБАН</button>
          <button className={state.channel === 'swift' ? 'active' : ''}    onClick={() => setState(s => ({ ...s, channel: 'swift' }))}>SWIFT</button>
        </div>
        <div style={{ marginTop: 14 }} className="crm-grid cols-2">
          <div className="field">
            <label>Имя получателя</label>
            <input
              value={state.to}
              onChange={(e) => setState(s => ({ ...s, to: e.target.value }))}
              placeholder="Например, Петров Д.С. или Anonymous Corp."
            />
          </div>
          {state.channel === 'swift' && (
            <div className="field">
              <label>BIC получателя</label>
              <input className="mono" placeholder="DEUTDEFFXXX" defaultValue="GARABAEUXXX" />
            </div>
          )}
          {state.channel === 'iban' && (
            <div className="field">
              <label>ИБАН</label>
              <input className="mono" placeholder="UZ00 ____ ____ ____ ____" defaultValue="UZ12 0010 8800 4471 0023" />
            </div>
          )}
        </div>
        {state.channel === 'swift' && (
          <div className="info-banner warn" style={{ marginTop: 14 }}>
            <I.Globe size={12} /> SWIFT-переводы свыше эквивалента $10 000/сутки проходят расширенную AML-проверку.
          </div>
        )}
      </div>
    </div>
  );
}

function TrAmtStep({ state, setState }: { state: TrState; setState: React.Dispatch<React.SetStateAction<TrState>> }) {
  const feeRate = state.channel === 'swift' ? 1.0025 : state.channel === 'iban' ? 1.001 : 1.0005;
  const feeLabel = state.channel === 'swift' ? '0.25%' : state.channel === 'iban' ? '0.1%' : '0.05%';
  return (
    <div className="crm-card" data-clicky-target="tr-amt">
      <div className="crm-head"><h3>Шаг 3 · Сумма</h3></div>
      <div className="crm-body">
        <div className="crm-grid cols-2">
          <div className="field">
            <label>Сумма</label>
            <input
              className="mono"
              type="number"
              placeholder="0"
              value={state.amount || ''}
              onChange={(e) => setState(s => ({ ...s, amount: Number(e.target.value) }))}
            />
          </div>
          <div className="field">
            <label>Валюта</label>
            <select value={state.cur} onChange={(e) => setState(s => ({ ...s, cur: e.target.value }))}>
              <option>UZS</option><option>USD</option><option>EUR</option><option>RUB</option>
            </select>
          </div>
        </div>
        <div className="amount-presets">
          {[100_000, 1_000_000, 10_000_000, 100_000_000].map(a => (
            <button key={a} className="preset-chip" onClick={() => setState(s => ({ ...s, amount: a }))}>
              {a / 1_000_000 >= 1 ? `${a / 1_000_000} млн` : `${a / 1000}k`}
            </button>
          ))}
        </div>
        {state.amount > 0 && (
          <div className="info-banner" style={{ marginTop: 14 }}>
            Комиссия: <b className="mono">{feeLabel}</b> · итого к списанию{' '}
            <b className="mono">
              {(state.amount * feeRate).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} {state.cur}
            </b>
          </div>
        )}
      </div>
    </div>
  );
}

function TrAmlStep({
  state,
  setState,
  highRisk,
}: {
  state: TrState;
  setState: React.Dispatch<React.SetStateAction<TrState>>;
  highRisk: boolean;
}) {
  const navigate = useNavigate();
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
                <div style={{ fontSize: 12, color: 'var(--warn)', marginTop: 3 }}>
                  Эквивалент превышает $10 000. По <span className="cite-mono">AML-HB §5.0</span> — запросить декларацию цели и эскалировать в комплаенс.
                </div>
              </div>
              <div className="hit-id"><div>ID</div><div className="hit-id-num">AML-9c41</div></div>
            </div>
            <label className="field-label-block" style={{ marginTop: 14 }}>Ваше решение</label>
            <div className="action-grid">
              <button
                className={`action-chip ${state.amlChoice === 'proceed' ? 'sel-bad' : ''}`}
                onClick={() => setState(s => ({ ...s, amlChoice: 'proceed' }))}
              >
                <div className="ac-row">
                  <span className={`ac-dot ${state.amlChoice === 'proceed' ? 'bad' : ''}`}>{state.amlChoice === 'proceed' && <span />}</span>
                  Провести как есть
                </div>
                <div className="ac-sub">Не рекомендуется при превышении</div>
              </button>
              <button
                className={`action-chip ${state.amlChoice === 'escal' ? 'sel-good' : ''}`}
                onClick={() => setState(s => ({ ...s, amlChoice: 'escal' }))}
              >
                <div className="ac-row">
                  <span className={`ac-dot ${state.amlChoice === 'escal' ? 'good' : ''}`}>{state.amlChoice === 'escal' && <span />}</span>
                  Эскалировать в комплаенс
                </div>
                <div className="ac-sub">Создать тикет, дождаться решения</div>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost btn-xs" onClick={() => navigate('/simulator/sanctions')}>
                <I.Shield size={12} /> Открыть санкционный список
              </button>
              <button className="btn btn-ghost btn-xs" onClick={() => navigate('/simulator/handbook')}>
                <I.Book size={12} /> Открыть процедуру
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <I.Check size={20} style={{ color: 'var(--good)' }} />
            <div>
              <b>AML-проверка пройдена</b>
              <p className="sub" style={{ marginTop: 2 }}>Сумма в пределах суточного лимита. Дополнительные действия не требуются.</p>
            </div>
            <div className="spacer" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={() => setState(s => ({ ...s, amlChoice: 'ok' }))}>
              <I.Check size={12} /> Принять
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TrConfStep({ state, setState }: { state: TrState; setState: React.Dispatch<React.SetStateAction<TrState>> }) {
  return (
    <div className="crm-card" data-clicky-target="tr-conf">
      <div className="crm-head"><h3>Шаг 5 · Подтверждение</h3></div>
      <div className="crm-body">
        <div className="confirm-grid">
          <Field label="От" v={state.from?.customer ?? '—'} />
          <Field label="Кому" v={state.to || '—'} />
          <Field label="Канал" v={state.channel === 'swift' ? 'SWIFT' : state.channel === 'iban' ? 'ИБАН' : 'Внутренний'} />
          <Field label="Сумма" v={`${state.cur} ${state.amount.toLocaleString('ru-RU')}`} mono />
          <Field label="AML" v={state.amlChoice === 'escal' ? 'Эскалирован' : state.amlChoice === 'proceed' ? 'Принудительно проведён' : 'Пройдено'} />
          <Field label="Статус" v={state.amlChoice === 'escal' ? 'Ожидает комплаенс' : 'Готов к проведению'} />
        </div>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className={`btn ${state.confirmed ? 'btn-ghost' : 'btn-primary'}`}
            onClick={() => setState(s => ({ ...s, confirmed: true }))}
            disabled={state.confirmed}
          >
            {state.confirmed ? <><I.Check size={12} /> Подтверждено</> : 'Провести перевод'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TransferScenario() {
  const navigate = useNavigate();
  const scenarioStore = useScenarioStore();

  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<TrState>({
    from: null, channel: 'internal', to: '', amount: 0, cur: 'UZS', amlChoice: null, confirmed: false,
  });
  const [done, setDone] = useState(false);
  const highRisk = state.amount > (state.cur === 'UZS' ? 100_000_000 : 10_000);

  useEffect(() => {
    scenarioStore.startScenario('transfers');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepDone: Record<string, boolean> = {
    from: !!state.from,
    to:   !!state.to && state.to.length >= 3,
    amt:  state.amount > 0,
    aml:  state.amlChoice !== null,
    conf: state.confirmed,
  };
  const curId = TR_STEPS[idx].id;
  const isCorrect = !highRisk || state.amlChoice === 'escal';

  // Record choices
  useEffect(() => { scenarioStore.recordChoice('amount', state.amount); }, [state.amount]);
  useEffect(() => { scenarioStore.recordChoice('cur', state.cur); }, [state.cur]);
  useEffect(() => { scenarioStore.recordChoice('amlChoice', state.amlChoice); }, [state.amlChoice]);

  useEffect(() => {
    if (!stepDone[curId]) return;
    if (idx === TR_STEPS.length - 1) {
      const tm = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(tm);
    }
    const tm = setTimeout(() => setIdx(idx + 1), 600);
    return () => clearTimeout(tm);
  }, [stepDone[curId], idx]);

  const handleComplete = () => {
    buildAndSaveRun('transfers');
    navigate('/results');
  };

  const handleRetry = () => {
    setIdx(0);
    setState({ from: null, channel: 'internal', to: '', amount: 0, cur: 'UZS', amlChoice: null, confirmed: false });
    setDone(false);
    scenarioStore.startScenario('transfers');
  };

  return (
    <div className="scenario-page">
      <div className="scenario-content">
        {done && (
          <ScDone
            title={isCorrect ? 'Перевод проведён' : 'Перевод проведён · с инцидентом'}
            lines={isCorrect
              ? [
                  `${state.cur} ${state.amount.toLocaleString('ru-RU')} отправлено получателю «${state.to}» через ${state.channel === 'swift' ? 'SWIFT' : 'внутреннюю систему'}.`,
                  'Подтверждение отправлено клиенту по СМС. Журнал событий обновлён.',
                ]
              : [
                  'Сумма провёдена без AML-эскалации, хотя превышение лимита было. В журнал создан инцидент комплаенса.',
                  'Наставник свяжется с вами в течение дня для разбора.',
                ]}
            xpEarned={isCorrect ? 65 : 30}
            onContinue={handleComplete}
            onRetry={handleRetry}
          />
        )}
        {!done && curId === 'from' && <TrFromStep state={state} setState={setState} />}
        {!done && curId === 'to'   && <TrToStep   state={state} setState={setState} />}
        {!done && curId === 'amt'  && <TrAmtStep  state={state} setState={setState} />}
        {!done && curId === 'aml'  && <TrAmlStep  state={state} setState={setState} highRisk={highRisk} />}
        {!done && curId === 'conf' && <TrConfStep state={state} setState={setState} />}
      </div>

      {!done && (
        <aside className="scenario-rail">
          <ScSteps steps={TR_STEPS} idx={idx} errorIdx={done && !isCorrect ? 3 : undefined} />
          <ScHint step={TR_STEPS[idx]} autoOk={stepDone[curId]} />
          <ScRailMeta session="trn-9c41" />
        </aside>
      )}

      {!done && (
        <div className="scenario-foot">
          <div className="left">
            Сценарий <b>TRANSFER-OPS v3.0</b> · {highRisk ? 'обнаружен жёлтый флаг' : 'обычный поток'}
          </div>
          <div className="spacer" />
          <button className="btn btn-ghost" onClick={() => navigate('/simulator/transfers')}>
            <I.Doc size={13} /> Журнал
          </button>
          <button className="btn btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← Назад</button>
          <button className="btn btn-ghost" onClick={() => scenarioStore.useHint()}>
            <I.Help size={13} /> Спросить Клика
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { if (idx === TR_STEPS.length - 1) setDone(true); else setIdx(idx + 1); }}
          >
            {idx === TR_STEPS.length - 1 ? 'Провести перевод' : 'Подтвердить шаг'} <I.Arrow size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. CARD ISSUE
// ════════════════════════════════════════════════════════════════════════════

const CI_STEPS = [
  { id: 'client',  title: 'Клиент',    code: 'CARD-ISSUE v1.8',
    hint: 'Выберите держателя — карта будет привязана к его профилю.' },
  { id: 'product', title: 'Тип карты', code: 'CARD-ISSUE v1.8',
    hint: 'UZCARD / HUMO — местные. VISA / Mastercard — для зарубежных платежей.', source: 'CARD-ISSUE §2.1' },
  { id: 'params',  title: 'Параметры', code: 'CARD-ISSUE v1.8',
    hint: 'Лимиты, цифровая копия, доставка. Все параметры можно поменять позже.' },
  { id: 'review',  title: 'Заявка',    code: 'CARD-ISSUE v1.8',
    hint: 'Финальная проверка. Заявка уйдёт в персонализацию.' },
];

interface CiState {
  customer: typeof CUST_S[0] | null;
  brand: string | null;
  type: string | null;
  digital: boolean;
  delivery: string;
  confirmed: boolean;
}

function CiProductStep({ state, setState }: { state: CiState; setState: React.Dispatch<React.SetStateAction<CiState>> }) {
  const brands = [
    { id: 'UZCARD', sub: 'Внутри Узбекистана · Pay Me' },
    { id: 'HUMO',   sub: 'Внутри Узбекистана · мобильные платежи' },
    { id: 'VISA',   sub: 'Международная · 200+ стран' },
    { id: 'MC',     sub: 'Mastercard · международная' },
  ];
  const types = [
    { id: 'debit', label: 'Дебетовая',   sub: 'Стандарт · мгновенная' },
    { id: 'gold',  label: 'Gold',         sub: 'Премиум · кешбэк до 5%' },
    { id: 'youth', label: 'Молодёжная',   sub: 'До 23 лет · сниженный тариф' },
  ];
  return (
    <div className="crm-card" data-clicky-target="ci-product">
      <div className="crm-head"><h3>Шаг 2 · Тип карты</h3></div>
      <div className="crm-body">
        <label className="field-label-block">Бренд</label>
        <div className="prod-grid">
          {brands.map(b => (
            <button
              key={b.id}
              className={`prod-tile ${state.brand === b.id ? 'active' : ''}`}
              onClick={() => setState(s => ({ ...s, brand: b.id }))}
            >
              <b>{b.id}</b>
              <span>{b.sub}</span>
            </button>
          ))}
        </div>
        <label className="field-label-block" style={{ marginTop: 16 }}>Категория</label>
        <div className="prod-grid">
          {types.map(t => (
            <button
              key={t.id}
              className={`prod-tile ${state.type === t.id ? 'active' : ''}`}
              onClick={() => setState(s => ({ ...s, type: t.id }))}
            >
              <b>{t.label}</b>
              <span>{t.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CiParamsStep({ state, setState }: { state: CiState; setState: React.Dispatch<React.SetStateAction<CiState>> }) {
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
          <ToggleRow
            label="Цифровая копия"
            sub="Доступ к карте через мобильное приложение"
            v={state.digital}
            on={() => setState(s => ({ ...s, digital: !s.digital }))}
          />
          <div className="param-delivery">
            <label className="field-label-block">Доставка пластика</label>
            <div className="tab-pill" style={{ width: 'fit-content' }}>
              <button className={state.delivery === 'office' ? 'active' : ''}  onClick={() => setState(s => ({ ...s, delivery: 'office' }))}>В отделение</button>
              <button className={state.delivery === 'courier' ? 'active' : ''} onClick={() => setState(s => ({ ...s, delivery: 'courier' }))}>Курьером</button>
              <button className={state.delivery === 'none' ? 'active' : ''}    onClick={() => setState(s => ({ ...s, delivery: 'none' }))}>Только цифровая</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CiReviewStep({ state, setState }: { state: CiState; setState: React.Dispatch<React.SetStateAction<CiState>> }) {
  return (
    <div className="crm-card" data-clicky-target="ci-review">
      <div className="crm-head"><h3>Шаг 4 · Финальная проверка</h3></div>
      <div className="crm-body">
        <div className="confirm-grid">
          <Field label="Держатель" v={state.customer?.name ?? '—'} />
          <Field label="Бренд" v={state.brand ?? '—'} />
          <Field label="Категория" v={state.type ?? '—'} />
          <Field label="Цифровая копия" v={state.digital ? 'Да' : 'Нет'} />
          <Field label="Доставка пластика" v={state.delivery === 'office' ? 'В отделение' : state.delivery === 'courier' ? 'Курьером' : 'Только цифровая'} />
          <Field label="SLA" v="до 3 рабочих дней" />
        </div>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className={`btn ${state.confirmed ? 'btn-ghost' : 'btn-primary'}`}
            onClick={() => setState(s => ({ ...s, confirmed: true }))}
            disabled={state.confirmed}
          >
            {state.confirmed ? <><I.Check size={12} /> Отправлено</> : 'Отправить в персонализацию'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CardIssueScenario() {
  const navigate = useNavigate();
  const scenarioStore = useScenarioStore();

  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<CiState>({
    customer: null, brand: null, type: null, digital: true, delivery: 'office', confirmed: false,
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    scenarioStore.startScenario('cards');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepDone: Record<string, boolean> = {
    client:  !!state.customer,
    product: !!state.brand && !!state.type,
    params:  true,
    review:  state.confirmed,
  };
  const curId = CI_STEPS[idx].id;

  useEffect(() => {
    if (!stepDone[curId]) return;
    if (idx === CI_STEPS.length - 1) {
      const tm = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(tm);
    }
    const tm = setTimeout(() => setIdx(idx + 1), 600);
    return () => clearTimeout(tm);
  }, [stepDone[curId], idx]);

  const handleComplete = () => {
    buildAndSaveRun('cards');
    navigate('/results');
  };

  const handleRetry = () => {
    setIdx(0);
    setState({ customer: null, brand: null, type: null, digital: true, delivery: 'office', confirmed: false });
    setDone(false);
    scenarioStore.startScenario('cards');
  };

  return (
    <div className="scenario-page">
      <div className="scenario-content">
        {done && (
          <ScDone
            title="Заявка отправлена"
            lines={[
              `Карта ${state.brand} ${state.type} для ${state.customer?.name?.split(' ').slice(0, 2).join(' ')} отправлена в персонализацию.`,
              state.digital
                ? 'Цифровая копия будет доступна в течение 10 минут.'
                : 'Пластик будет готов к выдаче через 1–3 рабочих дня.',
            ]}
            xpEarned={40}
            onContinue={handleComplete}
            onRetry={handleRetry}
          />
        )}
        {!done && curId === 'client'  && <AoCustomerStep state={state as unknown as AoState} setState={setState as unknown as React.Dispatch<React.SetStateAction<AoState>>} />}
        {!done && curId === 'product' && <CiProductStep  state={state} setState={setState} />}
        {!done && curId === 'params'  && <CiParamsStep   state={state} setState={setState} />}
        {!done && curId === 'review'  && <CiReviewStep   state={state} setState={setState} />}
      </div>

      {!done && (
        <aside className="scenario-rail">
          <ScSteps steps={CI_STEPS} idx={idx} />
          <ScHint step={CI_STEPS[idx]} autoOk={stepDone[curId]} />
          <ScRailMeta session="card-2e09" />
        </aside>
      )}

      {!done && (
        <div className="scenario-foot">
          <div className="left">Сценарий <b>CARD-ISSUE v1.8</b> · SLA выпуска до 3 дней</div>
          <div className="spacer" />
          <button className="btn btn-ghost" onClick={() => navigate('/simulator/cards')}>
            <I.Doc size={13} /> Журнал
          </button>
          <button className="btn btn-ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>← Назад</button>
          <button className="btn btn-ghost" onClick={() => scenarioStore.useHint()}>
            <I.Help size={13} /> Спросить Клика
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { if (idx === CI_STEPS.length - 1) setDone(true); else setIdx(idx + 1); }}
          >
            {idx === CI_STEPS.length - 1 ? 'Отправить в выпуск' : 'Подтвердить шаг'} <I.Arrow size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
