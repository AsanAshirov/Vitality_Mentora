// Tasks.jsx — banking task list. Each task opens a scenario in the simulator.

const { useState: useState_tk } = React;

const TASK_DEFS = [
  // ── Mandatory / today
  { id: "T-2148", scenario: "kyc", title: "Завершить KYC клиента Соколов И.А.",
    desc: "Новый профиль ожидает верификации. В скрининге уже есть жёлтый флаг — обработайте его корректно.",
    cat: "today", xp: 80, time: 12, diff: "medium", due: "до конца дня", source: "Наставник", priority: "high" },
  { id: "T-2150", scenario: "open_account", title: "Открыть текущий счёт для Каримовой Д.Р.",
    desc: "Клиент попросил счёт в UZS с подключением мобильного приложения. Сверьте паспорт, выберите тариф.",
    cat: "today", xp: 50, time: 6, diff: "easy", due: "сегодня · 14:00", source: "HR", priority: "med" },
  { id: "T-2155", scenario: "new_transfer", title: "Обработать SWIFT-перевод $1 400 (Турсунов А.Б.)",
    desc: "Сейчас на проверке AML. Решите: пропустить или эскалировать в комплаенс по причине источника.",
    cat: "today", xp: 65, time: 8, diff: "medium", due: "сегодня · 16:30", source: "Авто-AML", priority: "high" },

  // ── This week
  { id: "T-2160", scenario: "open_deposit", title: "Оформить срочный вклад 24 мес (Петров Д.С.)",
    desc: "Сумма выше 50 млн UZS — потребуется декларация ИС и проверка работодателя.",
    cat: "week", xp: 70, time: 10, diff: "medium", due: "Чт · 12:00", source: "Клиент", priority: "med" },
  { id: "T-2161", scenario: "issue_card", title: "Выпустить карту HUMO для Юлдашева Б.Ш.",
    desc: "Заявка одобрена. Подтвердите параметры и отправьте в очередь персонализации.",
    cat: "week", xp: 40, time: 5, diff: "easy", due: "Пт", source: "Клиент", priority: "low" },
  { id: "T-2163", scenario: "open_account", title: "Открыть валютный счёт USD (Иванова О.В.)",
    desc: "Клиент-резидент, без подключения SWIFT. Тариф «Резидент · валютный базовый».",
    cat: "week", xp: 50, time: 6, diff: "easy", due: "Чт", source: "Клиент", priority: "med" },

  // ── Practice
  { id: "T-2170", scenario: "kyc", title: "Тренировка: KYC нерезидента",
    desc: "Дополнительная практика. Нерезидент с белорусским паспортом и адресом регистрации в РФ.",
    cat: "practice", xp: 45, time: 10, diff: "hard", due: "—", source: "Mentora", priority: "low" },
  { id: "T-2173", scenario: "new_transfer", title: "Тренировка: AML-эскалация подозрительной операции",
    desc: "Серия мелких переводов от одного отправителя на разных получателей.",
    cat: "practice", xp: 55, time: 8, diff: "hard", due: "—", source: "Mentora", priority: "low" },
  { id: "T-2174", scenario: "open_deposit", title: "Тренировка: досрочное закрытие вклада",
    desc: "Расчёт пеней и перерасчёт ставки по правилам DEPOSIT-OPS §3.2.",
    cat: "practice", xp: 60, time: 12, diff: "hard", due: "—", source: "Mentora", priority: "low" },

  // ── Completed
  { id: "T-2140", scenario: "kyc", title: "KYC дебютной серии (тренировка)",
    desc: "Первая полная верификация — пройдена с оценкой 87/100.",
    cat: "done", xp: 80, time: 12, diff: "easy", due: "Вчера", source: "Mentora", priority: "low", done: true, score: 87 },
  { id: "T-2141", scenario: "issue_card", title: "Выпуск дебетовой карты UZCARD",
    desc: "Тренировочный сценарий — пройден с оценкой 92/100.",
    cat: "done", xp: 40, time: 5, diff: "easy", due: "3 дня назад", source: "Mentora", priority: "low", done: true, score: 92 },
];

function TasksPage({ onLaunch }) {
  const [filter, setFilter] = useState_tk("today");
  const cats = {
    today:    TASK_DEFS.filter(t => t.cat === "today"),
    week:     TASK_DEFS.filter(t => t.cat === "week"),
    practice: TASK_DEFS.filter(t => t.cat === "practice"),
    done:     TASK_DEFS.filter(t => t.cat === "done"),
  };
  const rows = cats[filter] || [];

  return (
    <div className="page screen-in" data-screen-label="Tasks">
      <p className="h-eyebrow">Задачи · поток Q2-26</p>
      <h1 className="h1">Что <em>сделать</em> сегодня.</h1>
      <p className="sub" style={{ marginTop: 8, maxWidth: 620 }}>
        Реальные банковские задачи в синтетической среде. Каждая открывает сценарий с пошаговым прохождением, автопроверкой и оценкой.
      </p>

      <div className="tasks-stats">
        <div className="ts-cell"><div className="ts-label">К выполнению сегодня</div><div className="ts-val">{cats.today.length}</div></div>
        <div className="ts-cell"><div className="ts-label">XP за сегодня</div><div className="ts-val">{cats.today.reduce((s, t) => s + t.xp, 0)}</div></div>
        <div className="ts-cell"><div className="ts-label">На этой неделе</div><div className="ts-val">{cats.week.length}</div></div>
        <div className="ts-cell"><div className="ts-label">Тренировок доступно</div><div className="ts-val">{cats.practice.length}</div></div>
        <div className="ts-cell"><div className="ts-label">Сдано всего</div><div className="ts-val">{cats.done.length + 8}<small>в потоке</small></div></div>
      </div>

      <div className="tasks-tabs">
        {[
          { id: "today",    label: "Сегодня",   count: cats.today.length },
          { id: "week",     label: "Эта неделя", count: cats.week.length },
          { id: "practice", label: "Тренировки", count: cats.practice.length },
          { id: "done",     label: "Сдано",      count: cats.done.length },
        ].map(t => (
          <button key={t.id}
                  className={`tt-tab ${filter === t.id ? "active" : ""}`}
                  onClick={() => setFilter(t.id)}>
            {t.label}
            <span className="tt-count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="task-list">
        {rows.map(task => <TaskCard key={task.id} task={task} onLaunch={onLaunch} />)}
        {rows.length === 0 && <div className="dt-empty">Здесь пусто. Возьмите задачу из другой вкладки.</div>}
      </div>
    </div>
  );
}

function TaskCard({ task, onLaunch }) {
  const diffLabel = task.diff === "easy" ? "Легко" : task.diff === "medium" ? "Средне" : "Сложно";
  return (
    <div className={`task-card ${task.done ? "done" : ""} pri-${task.priority}`}>
      <div className="tc-marker">
        {task.done ? <I.Check size={14} /> : <I.Play size={12} />}
      </div>
      <div className="tc-body">
        <div className="tc-head">
          <span className={`tag ${task.priority === "high" ? "warn" : task.priority === "med" ? "cobalt" : "mute"}`}>
            {task.priority === "high" ? "Приоритет" : task.priority === "med" ? "Стандарт" : "По желанию"}
          </span>
          <span className="tc-id mono">{task.id}</span>
          <span className="tc-source">от <b>{task.source}</b></span>
        </div>
        <b className="tc-title">{task.title}</b>
        <p className="tc-desc">{task.desc}</p>
        <div className="tc-meta">
          <span><I.Clock size={11} /> ~{task.time} мин</span>
          <span><I.Bolt size={11} /> +{task.xp} XP</span>
          <span><I.Star size={11} /> {diffLabel}</span>
          {task.due && <span className="tc-due">{task.due}</span>}
          {task.done && <span className="tc-score mono">оценка {task.score}/100</span>}
        </div>
      </div>
      <div className="tc-action">
        {task.done ? (
          <button className="btn btn-ghost" onClick={() => onLaunch(task)}>Повторить</button>
        ) : (
          <button className="btn btn-primary" onClick={() => onLaunch(task)}>
            <I.Play size={12} /> Начать
          </button>
        )}
      </div>
    </div>
  );
}

window.TasksPage = TasksPage;
window.TASK_DEFS = TASK_DEFS;
