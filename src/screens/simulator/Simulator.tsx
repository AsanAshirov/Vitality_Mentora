// Simulator.tsx — KYC scenario (6-step), ported from reference/screens/Simulator.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { I } from '../../components/Icons';
import { useScenarioStore } from '../../store/scenarioStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUserStore } from '../../store/userStore';
import { scoreScenario } from '../../lib/scoring';
import { checkBadgeUnlocks } from '../../lib/badges';
import { getMentorFeedback } from '../../lib/progression';

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS = [
  { id: 'lookup',    title: 'Поиск клиента',        hint: 'Найдите профиль Ивана Соколова и откройте черновик.' },
  { id: 'id',        title: 'Проверка личности',    hint: 'Сверьте загруженный паспорт с данными формы.' },
  { id: 'sanctions', title: 'Санкционный скрининг', hint: 'Запустите скрининг и действуйте по результату — включая неоднозначные совпадения.' },
  { id: 'sof',       title: 'Источник средств',     hint: 'Соберите декларацию ИС при депозите ≥ 50 млн UZS.' },
  { id: 'risk',      title: 'Оценка риска',         hint: 'Назначьте итоговый уровень риска по результату скрининга.' },
  { id: 'submit',    title: 'Отправить на проверку', hint: 'Отправьте досье наставнику или комплаенс-офицеру.' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Field({ label, v, mono, span }: { label: string; v: React.ReactNode; mono?: boolean; span?: number }) {
  return (
    <div className="field" style={span ? { gridColumn: `1 / span ${span}` } : undefined}>
      <label>{label}</label>
      <div className={`val ${mono ? 'mono' : ''}`}>{v}</div>
    </div>
  );
}

function CustomerCard() {
  return (
    <div className="crm-card" data-clicky-target="customer-card">
      <div className="crm-head">
        <h3>Профиль клиента <span className="id">SYN-2847102</span></h3>
        <span className="tag mute">Черновик · физлицо</span>
        <span className="tag cobalt">Синтетический</span>
        <div className="right">
          <button className="btn btn-ghost btn-xs">Изменить</button>
        </div>
      </div>
      <div className="crm-body">
        <div className="crm-grid cols-3">
          <Field label="ФИО" v="Соколов Иван Алексеевич" />
          <Field label="Дата рождения" v="1989-03-14" mono />
          <Field label="Гражданство" v="Узбекистан 🇺🇿" />
          <Field label="ИНН" v="3094 8826 5571" mono />
          <Field label="Мобильный" v="+998 90 348 12 04" mono />
          <Field label="Email" v="i.sokolov@example.uz" />
          <Field label="Адрес проживания" v="ул. Шахрисабз 14/2, кв. 47 · Ташкент, 100015" span={2} />
          <Field label="Клиент с" v="— (новый)" mono />
        </div>
      </div>
    </div>
  );
}

function IdentityCard({ step }: { step: number }) {
  const verified = step > 1;
  return (
    <div className="crm-card" data-clicky-target="identity-card">
      <div className="crm-head">
        <h3>Проверка личности</h3>
        {verified
          ? <span className="tag good"><I.Check size={11} /> Подтверждено</span>
          : <span className="tag warn">Ожидает проверки</span>}
        <div className="right">
          <button className="btn btn-ghost btn-xs"><I.Upload size={12} /> Загрузить снова</button>
        </div>
      </div>
      <div className="crm-body">
        <div className="crm-grid">
          <Field label="Тип документа" v="Паспорт · UZ" />
          <Field label="Номер документа" v="AB 5174839" mono />
          <Field label="Выдан" v="2019-07-22" mono />
          <Field label="Действителен до" v="2029-07-22" mono />
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="doc-row uploaded">
            <div className="doc-thumb" />
            <div className="doc-meta">
              <b>passport_sokolov_AB5174839.pdf</b>
              <span>Загружен 3 мин назад · 2 стр. · <span style={{ color: 'var(--good)' }}>OCR совпал на 98.4%</span></span>
            </div>
            <button className="btn btn-ghost btn-xs">Открыть</button>
          </div>
          <div className="doc-row uploaded">
            <div className="doc-thumb" />
            <div className="doc-meta">
              <b>utility_bill_2026-04.pdf</b>
              <span>Загружен 2 мин назад · 1 стр. · <span style={{ color: 'var(--good)' }}>Адрес совпадает</span></span>
            </div>
            <button className="btn btn-ghost btn-xs">Открыть</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SanctionsCard({
  step,
  action,
  setAction,
}: {
  step: number;
  action: string | undefined;
  setAction: (a: string) => void;
}) {
  const screened = step >= 2;
  return (
    <div className="crm-card" data-clicky-target="sanctions-card">
      <div className="crm-head">
        <h3>Скрининг санкций и ПДЛ</h3>
        {!screened && <span className="tag mute">Не запущен</span>}
        {screened && <span className="tag warn">⚠ Возможное совпадение · 1 хит</span>}
        <div className="right">
          <span style={{ font: '500 11px/1 var(--font-mono)', color: 'var(--mute)' }}>
            Списки: <b style={{ color: 'var(--ink)' }}>OFAC · EU · UN · CBU-AML</b>
          </span>
        </div>
      </div>
      <div className="crm-body">
        {!screened ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '8px 0' }}>
            <div className="sub" style={{ flex: 1 }}>
              Скрининг для этого профиля ещё не запускался. Запустите его, чтобы увидеть хиты, степень совпадения и рекомендации.
            </div>
            <button className="btn btn-primary"><I.Shield size={13} /> Запустить скрининг</button>
          </div>
        ) : (
          <>
            <div className="sanctions-hit">
              <div className="hit-mark">!</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                  Возможное совпадение ПДЛ · 1 хит в <span className="val mono inline-mono">CBU-AML</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--warn)', marginTop: 3 }}>
                  «Соколов Иван А.» — частичное совпадение имени + ДР в пределах 4 дней. Уверенность: <b>72%</b>.
                </div>
              </div>
              <div className="hit-id">
                <div>ID хита</div>
                <div className="hit-id-num">HIT-7741</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="field-label-block">Рекомендуемое действие</label>
              <div className="action-grid">
                {([
                  { id: 'clear',    label: 'Отметить как очищенное',   sub: 'Ложное срабатывание · продолжить', correct: false },
                  { id: 'escal',    label: 'Эскалировать в комплаенс', sub: 'Открыть тикет, приостановить KYC', correct: true },
                  { id: 'override', label: 'Игнорировать и продолжить', sub: 'Не рекомендуется',                correct: false },
                ] as Array<{ id: string; label: string; sub: string; correct: boolean }>).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAction(opt.id)}
                    className={`action-chip ${action === opt.id ? (opt.correct ? 'sel-good' : 'sel-bad') : ''}`}
                  >
                    <div className="ac-row">
                      <span className={`ac-dot ${action === opt.id ? (opt.correct ? 'good' : 'bad') : ''}`}>
                        {action === opt.id && <span />}
                      </span>
                      {opt.label}
                    </div>
                    <div className="ac-sub">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SourceOfFundsCard() {
  return (
    <div className="crm-card" data-clicky-target="sof-card">
      <div className="crm-head">
        <h3>Декларация источника средств</h3>
        <span className="tag warn">Требуется · депозит 75 000 000 UZS</span>
      </div>
      <div className="crm-body">
        <div className="crm-grid">
          <Field label="Заявленный источник" v="Зарплата и бонусы · «ООО ТехноТрейд»" />
          <Field label="Годовой доход" v="~ 220 000 000 UZS" mono />
          <Field
            label="Подтверждающий документ"
            v={<span>2NDFL_2025_signed.pdf · <span style={{ color: 'var(--good)' }}>Проверен</span></span>}
          />
          <Field label="Дата декларации" v="2026-05-23 09:14" mono />
        </div>
      </div>
    </div>
  );
}

function RiskRatingCard({ sanctionsAction }: { sanctionsAction: string | undefined }) {
  const tier =
    sanctionsAction === 'escal' ? 'Высокий · ожидает комплаенс'
    : sanctionsAction === 'override' ? 'Низкий (игнор)'
    : 'Средний';
  const tierClass =
    sanctionsAction === 'escal' ? 'warn'
    : sanctionsAction === 'override' ? 'bad'
    : 'cobalt';
  return (
    <div className="crm-card" data-clicky-target="risk-card">
      <div className="crm-head">
        <h3>Оценка риска</h3>
        <span className={`tag ${tierClass}`}>{tier}</span>
      </div>
      <div className="crm-body">
        <div className="crm-grid cols-3">
          <Field label="Страновой риск" v="Низкий (резидент UZ)" />
          <Field label="Продуктовый риск" v="Средний (срочный депозит)" />
          <Field label="Клиентский риск" v={sanctionsAction === 'escal' ? 'Высокий (проверка ПДЛ)' : 'Средний'} />
        </div>
      </div>
    </div>
  );
}

function StepsPanel({ stepIndex, sanctionsAction }: { stepIndex: number; sanctionsAction: string | undefined }) {
  return (
    <div className="steps-panel">
      <h4>Сценарий · KYC v3.4</h4>
      {STEPS.map((s, i) => {
        const status = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending';
        const isSanctionsError = s.id === 'sanctions' && i < stepIndex && sanctionsAction === 'override';
        return (
          <div key={s.id} className={`step ${isSanctionsError ? 'error' : status}`}>
            <div className="marker">{i < stepIndex && !isSanctionsError ? '✓' : isSanctionsError ? '!' : i + 1}</div>
            <div>
              <b>{s.title}</b>
              <span>{s.hint}</span>
            </div>
            <span className="pts">
              {i < stepIndex
                ? isSanctionsError ? '−20' : '+15'
                : i === stepIndex ? '···' : '0'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HintCard({ step }: { step: typeof STEPS[number] }) {
  return (
    <div className="hint-card">
      <h5><I.Spark size={11} /> Подсказка · из документов</h5>
      <p>{step.hint}</p>
      <p style={{ fontSize: 11.5, color: 'var(--mute)' }}>
        Источник: <span className="cite-mono">KYC-PROC §{2 + (step.id.length % 4)}.{1 + (step.id.length % 5)}</span>
      </p>
    </div>
  );
}

function RailMeta() {
  return (
    <div className="rail-meta">
      <div><span>Дежурный наставник</span> <b>Татьяна К.</b></div>
      <div><span>SLA подсказки &lt; 2с</span> <b style={{ color: 'var(--good)' }}>● онлайн</b></div>
      <div><span>Списки обновлены</span> <b className="mono">06:00 UTC</b></div>
    </div>
  );
}

// ─── KycScenario ─────────────────────────────────────────────────────────────

export function KycScenario() {
  const navigate = useNavigate();

  // Store hooks
  const scenarioStore = useScenarioStore();
  const stepIndex = useScenarioStore(s => s.stepIndex);
  const sanctionsAction = useScenarioStore(s => s.choices['sanctions'] as string | undefined);
  const { tutorialMode } = useSettingsStore();
  void tutorialMode; // available for conditional hints if needed

  // Start scenario on mount
  useEffect(() => {
    scenarioStore.startScenario('kyc');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeStep = STEPS[stepIndex];

  const setStep = (idx: number) => {
    scenarioStore.setStep(idx);
  };

  const next = () => {
    if (stepIndex < STEPS.length - 1) {
      setStep(stepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const back = () => {
    setStep(Math.max(0, stepIndex - 1));
  };

  const handleComplete = () => {
    const { id, startTime, hintsUsed, choices } = useScenarioStore.getState();
    const timeMs = Date.now() - startTime;
    const breakdown = scoreScenario('kyc', choices, { timeMs, hintsUsed });

    const userState = useUserStore.getState();
    const existingRuns = userState.completedRuns;
    const newBadges = checkBadgeUnlocks(
      [...existingRuns, {
        id: `kyc-${Date.now()}`,
        scenarioId: 'kyc',
        completedAt: new Date().toISOString(),
        score: breakdown.total,
        grade: breakdown.grade,
        xpEarned: breakdown.xpEarned,
        timeMs,
        hintsUsed,
        steps: breakdown.steps,
        choices,
        newBadges: [],
      }],
      userState.badges,
      userState.streak
    );

    const run = {
      id: `kyc-${Date.now()}`,
      scenarioId: 'kyc' as const,
      completedAt: new Date().toISOString(),
      score: breakdown.total,
      grade: breakdown.grade,
      xpEarned: breakdown.xpEarned,
      timeMs,
      hintsUsed,
      steps: breakdown.steps,
      choices,
      newBadges,
    };

    useUserStore.getState().addRun(run);
    useUserStore.getState().addXp(run.xpEarned);
    for (const badgeId of newBadges) {
      useUserStore.getState().unlockBadge(badgeId);
    }
    navigate('/results');
  };

  const progressPct = Math.round((stepIndex / (STEPS.length - 1)) * 100);

  // Rail and foot are rendered inline since this component is the Outlet content
  // and SimShell renders Outlet inside sim-main. We render rail/foot as portals-like
  // or as a self-contained layout here. Since the TSX SimShell uses Outlet for
  // sim-main content, we render a wrapper that provides its own rail + foot.
  return (
    <div className="scenario-page">
      {/* Main content */}
      <div className="scenario-content">
        <CustomerCard />
        <div style={{ height: 16 }} />
        <IdentityCard step={stepIndex} />
        <div style={{ height: 16 }} />
        <SanctionsCard
          step={stepIndex}
          action={sanctionsAction}
          setAction={(a) => scenarioStore.recordChoice('sanctions', a)}
        />
        <div style={{ height: 16 }} />
        {stepIndex >= 3 && <SourceOfFundsCard />}
        {stepIndex >= 3 && <div style={{ height: 16 }} />}
        {stepIndex >= 4 && <RiskRatingCard sanctionsAction={sanctionsAction} />}
      </div>

      {/* Rail */}
      <aside className="scenario-rail">
        <StepsPanel stepIndex={stepIndex} sanctionsAction={sanctionsAction} />
        <HintCard step={activeStep} />
        <RailMeta />
      </aside>

      {/* Footer */}
      <div className="scenario-foot">
        <div className="left">
          ID клиента <b>SYN-2847102</b> · Сессия <b>kyc-7f3a</b> ·{' '}
          <span style={{ color: 'var(--synth)' }}>синтетические данные — никаких боевых систем</span>
        </div>
        <div className="spacer" />
        <button className="btn btn-ghost" onClick={back} disabled={stepIndex === 0}>← Назад</button>
        <button className="btn btn-ghost" onClick={() => scenarioStore.useHint()}>
          <I.Help size={13} /> Спросить Клика <kbd className="kbd-inline">`</kbd>
        </button>
        <button className="btn btn-primary" onClick={next}>
          {stepIndex === STEPS.length - 1 ? 'Отправить на проверку' : 'Шаг выполнен'} <I.Arrow size={13} />
        </button>
      </div>
    </div>
  );
}
