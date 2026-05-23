// SimPages.jsx — all simulator sub-pages except the KYC scenario.
const { useState: useState_sp, useMemo: useMemo_sp } = React;

const { CUSTOMERS, ACCOUNTS, DEPOSITS, TRANSFERS, CARDS, SANCTIONS, PEP, AML_REPORTS, HANDBOOK, ACTIVITY, fmt } = window.SYNTH;

// ─────────────────────────────────────────────────────────────────────────────
// Generic helpers

function PageHeader({ title, sub, eyebrow, actions, children }) {
  return (
    <div className="sim-page-head">
      <div>
        {eyebrow && <p className="h-eyebrow">{eyebrow}</p>}
        <h1 className="sim-page-h1">{title}</h1>
        {sub && <p className="sub" style={{ marginTop: 6, maxWidth: 720 }}>{sub}</p>}
        {children}
      </div>
      {actions && <div className="sim-page-actions">{actions}</div>}
    </div>
  );
}

function StatStrip({ items }) {
  return (
    <div className="stat-strip">
      {items.map((s, i) => (
        <div className="stat-strip-cell" key={i}>
          <div className="stat-strip-label">{s.label}</div>
          <div className="stat-strip-value">{s.value}{s.unit && <small> {s.unit}</small>}</div>
          {s.sub && <div className="stat-strip-sub">{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function SearchFilter({ query, setQuery, placeholder, right }) {
  return (
    <div className="filter-row">
      <div className="filter-input">
        <I.Search size={14} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder || "Поиск…"} />
      </div>
      {right}
    </div>
  );
}

function Table({ cols, rows, onRowClick }) {
  return (
    <div className="data-table">
      <div className="dt-head" style={{ gridTemplateColumns: cols.map(c => c.w || "1fr").join(" ") }}>
        {cols.map((c, i) => <div key={i} className={`dt-h ${c.align || ""}`}>{c.label}</div>)}
      </div>
      {rows.map((r, ri) => (
        <div className="dt-row" key={ri} onClick={onRowClick ? () => onRowClick(r) : undefined}
             style={{ gridTemplateColumns: cols.map(c => c.w || "1fr").join(" "), cursor: onRowClick ? "pointer" : "default" }}>
          {cols.map((c, i) => <div key={i} className={`dt-c ${c.align || ""}`}>{c.render ? c.render(r) : r[c.key]}</div>)}
        </div>
      ))}
      {rows.length === 0 && <div className="dt-empty">Ничего не найдено</div>}
    </div>
  );
}

window.PageHeader = PageHeader;
window.StatStrip = StatStrip;
window.SearchFilter = SearchFilter;
window.Table = Table;

// ─────────────────────────────────────────────────────────────────────────────
// Accounts — Открытие счёта

function AccountsPage({ setSimPage, onSwitchScenario }) {
  const [query, setQuery] = useState_sp("");
  const [selected, setSelected] = useState_sp(null);
  const rows = useMemo_sp(() => ACCOUNTS.filter(a =>
    !query || a.customer.toLowerCase().includes(query.toLowerCase()) || a.id.includes(query)
  ), [query]);

  return (
    <SimShell simPage="accounts" setSimPage={setSimPage} crumb={["Операции", "Открытие счёта", "Журнал"]}>
      <PageHeader
        eyebrow="Операция · счета клиентов"
        title="Счета клиентов"
        sub="Нажмите на строку — вся история, транзакции, овердрафты. Для открытия нового — запустите сценарий."
        actions={onSwitchScenario && <button className="btn btn-primary" onClick={onSwitchScenario}><I.Play size={12} /> Открыть новый счёт</button>}
      />

      <StatStrip items={[
        { label: "Всего счетов",    value: ACCOUNTS.length },
        { label: "Активных",        value: ACCOUNTS.filter(a => a.status === "Активен").length },
        { label: "В UZS",           value: ACCOUNTS.filter(a => a.cur === "UZS").length },
        { label: "Иностранная валюта", value: ACCOUNTS.filter(a => a.cur !== "UZS").length },
        { label: "Общий баланс UZS", value: "537 295 500", unit: "UZS" },
      ]} />

      <SearchFilter query={query} setQuery={setQuery} placeholder="Поиск по клиенту или номеру счёта…" />
      <Table cols={[
        { key: "id",       label: "Номер счёта", w: "2.4fr", render: (r) => <span className="mono">{r.id}</span> },
        { key: "customer", label: "Клиент", w: "1.6fr" },
        { key: "type",     label: "Тип", w: "1.1fr" },
        { key: "cur",      label: "Валюта", w: "0.7fr", render: (r) => <span className="tag mute">{r.cur}</span> },
        { key: "bal",      label: "Баланс", w: "1.2fr", align: "right", render: (r) => <span className="mono">{fmt(r.bal, r.cur)}</span> },
        { key: "status",   label: "Статус", w: "1fr", render: (r) => <span className={`tag ${r.status === "Активен" ? "good" : r.status === "Заморожен" ? "bad" : "mute"}`}>{r.status}</span> },
        { key: "opened",   label: "Открыт", w: "0.9fr", render: (r) => <span className="mono mute-x">{r.opened}</span> },
      ]} rows={rows} onRowClick={setSelected} />
      {selected && <AccountDrawer account={selected} onClose={() => setSelected(null)} />}
    </SimShell>
  );
}

function NewAccountForm({ onCancel }) {
  const [customer, setCustomer] = useState_sp("SYN-1840553");
  const [cur, setCur] = useState_sp("UZS");
  const [type, setType] = useState_sp("Текущий");
  return (
    <div className="crm-card" data-clicky-target="new-account-form">
      <div className="crm-head">
        <h3>Открытие счёта · черновик</h3>
        <span className="tag cobalt">Шаг 1 из 3</span>
      </div>
      <div className="crm-body">
        <div className="crm-grid cols-3">
          <div className="field">
            <label>Клиент</label>
            <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
              {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name} · {c.id}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Тип счёта</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>Текущий</option>
              <option>Сберегательный</option>
              <option>Срочный депозит</option>
              <option>Карточный</option>
            </select>
          </div>
          <div className="field">
            <label>Валюта</label>
            <select value={cur} onChange={(e) => setCur(e.target.value)}>
              <option>UZS</option><option>USD</option><option>EUR</option><option>RUB</option>
            </select>
          </div>
          <Field label="Балансовый счёт" v={cur === "UZS" ? "20208 860 0 00012" : cur === "USD" ? "20208 840 0 00012" : "20208 978 0 00012"} mono />
          <Field label="Назначение" v="Личные средства · зачисление зарплаты" />
          <Field label="Тариф" v="Резидент · базовый (0 UZS/мес)" />
        </div>
        <div style={{ marginTop: 16, padding: 14, background: "var(--cobalt-tint)", border: "1px solid var(--cobalt-tint-2)", borderRadius: "var(--r-md)", fontSize: 12.5, color: "var(--cobalt-ink)" }}>
          <b>Дальше:</b> система сгенерирует номер счёта по плану счетов, прикрепит к клиенту и отправит черновик на проверку наставнику.
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onCancel}>Отмена</button>
          <button className="btn btn-primary">Сгенерировать номер →</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Deposits

function DepositsPage({ setSimPage, onSwitchScenario }) {
  const [query, setQuery] = useState_sp("");
  const [selected, setSelected] = useState_sp(null);
  const rows = useMemo_sp(() => DEPOSITS.filter(d =>
    !query || d.customer.toLowerCase().includes(query.toLowerCase()) || d.id.includes(query)
  ), [query]);
  const totalUZS = DEPOSITS.filter(d => d.cur === "UZS").reduce((s, d) => s + d.amount, 0);
  const overdue = DEPOSITS.filter(d => d.status === "Просрочен").length;
  return (
    <SimShell simPage="deposits" setSimPage={setSimPage} crumb={["Операции", "Депозиты"]}>
      <PageHeader
        eyebrow="Операция · приём и оформление вкладов"
        title="Срочные депозиты"
        sub="Открытие срочных вкладов, продление, досрочное закрытие. Лимиты определяются процедурой DEPOSIT-OPS."
        actions={onSwitchScenario && <button className="btn btn-primary" onClick={onSwitchScenario}><I.Plus size={13} /> Новый депозит</button>}
      />

      <StatStrip items={[
        { label: "Активных",            value: DEPOSITS.filter(d => d.status === "Действует").length },
        { label: "Просроченных",         value: overdue, sub: overdue > 0 ? "требуют действия" : "—" },
        { label: "Объём в UZS",          value: totalUZS.toLocaleString("ru-RU"), unit: "UZS" },
        { label: "Средняя ставка",       value: "23.1", unit: "%" },
        { label: "Средний срок",         value: "11.4", unit: "мес" },
      ]} />

      <SearchFilter query={query} setQuery={setQuery} placeholder="Поиск по клиенту или номеру депозита…" />

      <Table cols={[
        { key: "id",       label: "Номер",   w: "1.1fr", render: (r) => <span className="mono">{r.id}</span> },
        { key: "customer", label: "Клиент",  w: "1.4fr" },
        { key: "amount",   label: "Сумма",   w: "1.4fr", align: "right", render: (r) => <span className="mono">{fmt(r.amount, r.cur)}</span> },
        { key: "rate",     label: "Ставка",  w: "0.7fr", align: "right", render: (r) => <span className="mono">{r.rate}%</span> },
        { key: "term",     label: "Срок",    w: "0.7fr", align: "center" },
        { key: "maturity", label: "Дата окончания", w: "1fr", render: (r) => <span className="mono">{r.maturity}</span> },
        { key: "status",   label: "Статус",  w: "0.9fr", render: (r) => <span className={`tag ${r.status === "Действует" ? "good" : "warn"}`}>{r.status}</span> },
      ]} rows={rows} onRowClick={setSelected} />
      {selected && <DepositDrawer deposit={selected} onClose={() => setSelected(null)} />}
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Transfers

function TransfersPage({ setSimPage, onSwitchScenario }) {
  const [tab, setTab] = useState_sp("incoming");
  const [query, setQuery] = useState_sp("");
  const [selected, setSelected] = useState_sp(null);
  const rows = useMemo_sp(() => TRANSFERS.filter(t =>
    !query || t.from.toLowerCase().includes(query.toLowerCase()) || t.to.toLowerCase().includes(query.toLowerCase()) || t.id.includes(query)
  ), [query]);
  return (
    <SimShell simPage="transfers" setSimPage={setSimPage} crumb={["Операции", "Переводы"]}>
      <PageHeader
        eyebrow="Операция · внутренние, межбанк, SWIFT"
        title="Переводы за сегодня"
        sub="Все исходящие SWIFT-переводы свыше эквивалента $1 000 проходят AML-фильтр. Эскалация в комплаенс — по жёлтому флагу."
        actions={onSwitchScenario && <button className="btn btn-primary" onClick={onSwitchScenario}><I.Plus size={13} /> Новый перевод</button>}
      />

      <StatStrip items={[
        { label: "Всего за день",          value: TRANSFERS.length },
        { label: "Внутренних",             value: TRANSFERS.filter(t => t.channel === "Внутренний").length },
        { label: "SWIFT",                  value: TRANSFERS.filter(t => t.channel === "SWIFT").length },
        { label: "Эскалировано",           value: TRANSFERS.filter(t => t.status === "Эскалирован").length, sub: "в комплаенс" },
        { label: "Отклонено",              value: TRANSFERS.filter(t => t.status === "Отклонён").length },
      ]} />

      <SearchFilter query={query} setQuery={setQuery} placeholder="Поиск по отправителю, получателю или ID…" />

      <Table cols={[
        { key: "t",        label: "Время",    w: "0.7fr", render: (r) => <span className="mono mute-x">{r.t}</span> },
        { key: "id",       label: "ID",       w: "1.1fr", render: (r) => <span className="mono">{r.id}</span> },
        { key: "from",     label: "От",       w: "1.3fr" },
        { key: "to",       label: "Кому",     w: "1.3fr" },
        { key: "amount",   label: "Сумма",    w: "1.3fr", align: "right", render: (r) => <span className="mono">{fmt(r.amount, r.cur)}</span> },
        { key: "channel",  label: "Канал",    w: "0.8fr", render: (r) => <span className="tag mute">{r.channel}</span> },
        { key: "status",   label: "Статус",   w: "1.4fr", render: (r) => (
          <span className={`tag ${r.status === "Проведён" ? "good" : r.status === "Отклонён" ? "bad" : "warn"}`}>
            {r.status}{r.reason && <span style={{ opacity: 0.7, marginLeft: 4 }}>· {r.reason}</span>}
          </span>
        )},
      ]} rows={rows} onRowClick={setSelected} />
      {selected && <TransferDrawer transfer={selected} onClose={() => setSelected(null)} />}
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cards

function CardsPage({ setSimPage, onSwitchScenario }) {
  const [selected, setSelected] = useState_sp(null);
  return (
    <SimShell simPage="cards" setSimPage={setSimPage} crumb={["Операции", "Выпуск карт"]}>
      <PageHeader
        eyebrow="Операция · выпуск и активация карт"
        title="Карты клиентов"
        sub="Создание заявки, перевыпуск, блокировка/разблокировка. Поддерживаются UZCARD, HUMO, VISA. Все номера — синтетические."
        actions={onSwitchScenario && <button className="btn btn-primary" onClick={onSwitchScenario}><I.Plus size={13} /> Новая заявка</button>}
      />

      <StatStrip items={[
        { label: "Всего карт",      value: CARDS.length },
        { label: "Активных",        value: CARDS.filter(c => c.status === "Активна").length },
        { label: "Заявок",          value: CARDS.filter(c => c.status === "Заявка").length },
        { label: "Заблокировано",   value: CARDS.filter(c => c.status === "Заблок.").length },
        { label: "SLA выпуска",     value: "≤ 3", unit: "дня", sub: "по процедуре" },
      ]} />

      <div className="cards-grid">
        {CARDS.map((c, i) => (
          <div key={i} className={`card-tile brand-${c.brand.toLowerCase()}`} onClick={() => setSelected(c)} style={{ cursor: "pointer" }}>
            <div className="card-tile-top">
              <span className="card-brand">{c.brand}</span>
              <span className={`tag ${c.status === "Активна" ? "good" : c.status === "Заявка" ? "cobalt" : "bad"}`}>{c.status}</span>
            </div>
            <div className="card-chip"><i/><i/><i/></div>
            <div className="card-num mono">{c.num}</div>
            <div className="card-tile-foot">
              <div>
                <div className="card-tile-label">Держатель</div>
                <div className="card-tile-val">{c.customer}</div>
              </div>
              <div>
                <div className="card-tile-label">До</div>
                <div className="card-tile-val mono">{c.exp}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected && <CardDrawer card={selected} onClose={() => setSelected(null)} />}
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sanctions list

function SanctionsListPage({ setSimPage }) {
  const [query, setQuery] = useState_sp("");
  const [list, setList] = useState_sp("all");
  const [selected, setSelected] = useState_sp(null);
  const rows = useMemo_sp(() => SANCTIONS.filter(s => {
    if (list !== "all" && !s.list.toLowerCase().includes(list)) return false;
    if (!query) return true;
    return s.name.toLowerCase().includes(query.toLowerCase()) || s.id.includes(query);
  }), [query, list]);

  return (
    <SimShell simPage="sanctions" setSimPage={setSimPage} crumb={["Комплаенс", "Санкционный список"]}>
      <PageHeader
        eyebrow="Комплаенс · санкционная база"
        title="Санкционный список"
        sub="OFAC SDN, EU 833/2014, UN 1267/1718 и внутренний watchlist CBU-AML. Обновляется автоматически в 06:00 UTC."
        actions={
          <div className="tab-pill">
            <button className={list === "all" ? "active" : ""} onClick={() => setList("all")}>Все</button>
            <button className={list === "ofac" ? "active" : ""} onClick={() => setList("ofac")}>OFAC</button>
            <button className={list === "eu"   ? "active" : ""} onClick={() => setList("eu")}>EU</button>
            <button className={list === "un"   ? "active" : ""} onClick={() => setList("un")}>UN</button>
            <button className={list === "cbu"  ? "active" : ""} onClick={() => setList("cbu")}>CBU</button>
          </div>
        }
      />

      <StatStrip items={[
        { label: "Записей",                value: SANCTIONS.length.toLocaleString("ru-RU") },
        { label: "Высокий риск",           value: SANCTIONS.filter(s => s.risk === "high").length },
        { label: "Возможных хитов",        value: SANCTIONS.filter(s => s.hit).length, sub: "сейчас в работе" },
        { label: "Списков",                value: 4 },
        { label: "Обновлено",              value: "06:00", unit: "UTC", sub: "сегодня" },
      ]} />

      <SearchFilter query={query} setQuery={setQuery} placeholder="Поиск по имени или ID…" />

      <Table cols={[
        { key: "id",     label: "ID",       w: "0.9fr", render: (r) => <span className="mono">{r.id}</span> },
        { key: "name",   label: "Имя / организация", w: "2fr", render: (r) => (
            <span>{r.name} {r.hit && <span className="tag warn" style={{ marginLeft: 6 }}>HIT-7741</span>}</span>
        )},
        { key: "list",   label: "Список",   w: "1fr", render: (r) => <span className="tag cobalt">{r.list}</span> },
        { key: "country",label: "Страна",   w: "0.6fr", align: "center" },
        { key: "type",   label: "Тип",      w: "1.2fr" },
        { key: "reason", label: "Причина",  w: "1.8fr", render: (r) => <span style={{ color: "var(--mute)" }}>{r.reason}</span> },
        { key: "added",  label: "Добавлено", w: "0.9fr", render: (r) => <span className="mono mute-x">{r.added}</span> },
        { key: "risk",   label: "Риск",     w: "0.6fr", align: "center", render: (r) => <span className={`risk-dot risk-${r.risk}`}>●</span> },
      ]} rows={rows} onRowClick={setSelected} />
      {selected && <SanctionDrawer entry={selected} onClose={() => setSelected(null)} />}
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PEP register

function PepPage({ setSimPage }) {
  const [query, setQuery] = useState_sp("");
  const [selected, setSelected] = useState_sp(null);
  const rows = useMemo_sp(() => PEP.filter(p =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.id.includes(query)
  ), [query]);
  return (
    <SimShell simPage="pep" setSimPage={setSimPage} crumb={["Комплаенс", "Реестр ПДЛ"]}>
      <PageHeader
        eyebrow="Комплаенс · публичные должностные лица"
        title="Реестр ПДЛ"
        sub="Действующие, бывшие и родственники ПДЛ. Каждое срабатывание автоматически создаёт тикет на расширенную проверку."
      />
      <StatStrip items={[
        { label: "Записей",            value: PEP.length },
        { label: "Действующих",        value: PEP.filter(p => p.status === "Активен").length },
        { label: "Пост-ПДЛ",           value: PEP.filter(p => p.status.startsWith("Пост")).length },
        { label: "Расширенная проверка", value: PEP.filter(p => p.status.includes("Расш")).length },
      ]} />
      <SearchFilter query={query} setQuery={setQuery} placeholder="Поиск по имени или ID…" />
      <Table cols={[
        { key: "id",       label: "ID",         w: "0.7fr", render: (r) => <span className="mono">{r.id}</span> },
        { key: "name",     label: "Имя",        w: "1.6fr" },
        { key: "country",  label: "Страна",     w: "0.6fr", align: "center" },
        { key: "position", label: "Должность",  w: "2.2fr" },
        { key: "since",    label: "С",          w: "0.6fr", render: (r) => <span className="mono">{r.since}</span> },
        { key: "status",   label: "Статус",     w: "1.2fr", render: (r) => <span className={`tag ${r.status === "Активен" ? "warn" : r.status.includes("Расш") ? "bad" : "mute"}`}>{r.status}</span> },
      ]} rows={rows} onRowClick={setSelected} />
      {selected && <PepDrawer entry={selected} onClose={() => setSelected(null)} />}
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AML reports

function AmlPage({ setSimPage }) {
  const [selected, setSelected] = useState_sp(null);
  return (
    <SimShell simPage="aml" setSimPage={setSimPage} crumb={["Комплаенс", "Отчёты AML"]}>
      <PageHeader
        eyebrow="Комплаенс · отчётность"
        title="Отчёты AML"
        sub="STR (подозрительные операции) и CTR (крупные операции). Все отчёты подаются в CBU-AML в течение установленных регулятором сроков."
        actions={<button className="btn btn-primary"><I.Plus size={13} /> Новый STR</button>}
      />
      <StatStrip items={[
        { label: "За месяц",          value: AML_REPORTS.length + 12 },
        { label: "STR",               value: AML_REPORTS.filter(r => r.type === "STR").length },
        { label: "CTR",               value: AML_REPORTS.filter(r => r.type === "CTR").length },
        { label: "На проверке",       value: AML_REPORTS.filter(r => r.status.includes("проверке")).length },
        { label: "Подано",            value: AML_REPORTS.filter(r => r.status.includes("Подан") || r.status.includes("CBU")).length },
      ]} />
      <Table cols={[
        { key: "id",       label: "ID",       w: "1.3fr", render: (r) => <span className="mono">{r.id}</span> },
        { key: "type",     label: "Тип",      w: "0.6fr", render: (r) => <span className={`tag ${r.type === "STR" ? "warn" : "cobalt"}`}>{r.type}</span> },
        { key: "customer", label: "Клиент",   w: "1.3fr" },
        { key: "amount",   label: "Сумма",    w: "1.8fr", render: (r) => <span className="mono">{r.amount}</span> },
        { key: "status",   label: "Статус",   w: "1.4fr", render: (r) => <span className={`tag ${r.status.includes("CBU") || r.status === "Подан" ? "good" : r.status === "Закрыт" ? "mute" : "warn"}`}>{r.status}</span> },
        { key: "filed",    label: "Подан",    w: "0.9fr", render: (r) => <span className="mono mute-x">{r.filed}</span> },
      ]} rows={AML_REPORTS} onRowClick={setSelected} />
      {selected && <AmlDrawer report={selected} onClose={() => setSelected(null)} />}
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Handbook

function HandbookPage({ setSimPage }) {
  const [sel, setSel] = useState_sp(HANDBOOK[0]);
  return (
    <SimShell simPage="handbook" setSimPage={setSimPage} crumb={["Справка", "Справочник процедур"]}>
      <PageHeader
        eyebrow="Справка · нормативные документы"
        title="Справочник процедур"
        sub="Внутренние политики и процедуры банка. Поиск, перекрёстные ссылки, версионность."
      />
      <div className="handbook-layout">
        <div className="handbook-toc">
          {HANDBOOK.map(h => (
            <button key={h.id}
                    className={`hb-item ${sel.id === h.id ? "active" : ""}`}
                    onClick={() => setSel(h)}>
              <div className="hb-item-id mono">{h.id}</div>
              <div className="hb-item-title">{h.title}</div>
              <div className="hb-item-meta">{h.ver} · {h.sections} разд.</div>
            </button>
          ))}
        </div>
        <div className="handbook-doc">
          <div className="hb-doc-head">
            <div>
              <span className="cite-mono">{sel.id}</span>
              <span className="hb-doc-ver">{sel.ver} · обновлено {sel.upd}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {sel.tags.map(t => <span key={t} className="tag mute">{t}</span>)}
            </div>
          </div>
          <h2 className="hb-doc-title">{sel.title}</h2>
          <HandbookContent id={sel.id} />
        </div>
      </div>
    </SimShell>
  );
}

function HandbookContent({ id }) {
  // Lightweight synthetic doc body for each handbook entry.
  const sections = {
    "KYC-PROC": [
      ["§1 Область применения", "Процедура распространяется на верификацию физлиц-резидентов и нерезидентов, открывающих счета, оформляющих карты или совершающих операции свыше регуляторных порогов. Не применяется к юридическим лицам — для них действует процедура KYB-PROC."],
      ["§2 Требуемые документы", "1) Документ, удостоверяющий личность (паспорт/ID).\n2) Подтверждение адреса (не старше 90 дней).\n3) Декларация источника средств для депозитов ≥ 50 000 000 UZS.\n4) Заполненная анкета FATCA/CRS."],
      ["§3 Порядок верификации", "Сверка фотографии с биометрией, OCR-сверка реквизитов, проверка адреса по реестру. Результат фиксируется в карточке клиента."],
      ["§4 Эскалация", "Любое несоответствие на этапе верификации эскалируется наставнику в течение 15 минут с момента обнаружения."],
    ],
    "SANCTIONS-PROC": [
      ["§1 Скрининг", "Все клиенты при создании профиля и при любой существенной операции проходят скрининг по 4 спискам: OFAC SDN, EU 833/2014, UN 1267/1718, CBU-AML."],
      ["§1.4 Действия по результату", "≥ 50% уверенности ⇒ Эскалация в комплаенс. Отметка «очищено» допустима только при < 50% и отсутствии совпадения ДР. Игнор (override) — только за подписью старшего комплаенс-офицера."],
      ["§2 Сроки", "Эскалация — в течение 15 минут. Решение комплаенса — в течение 2 рабочих часов."],
      ["§3 Документация", "Решение фиксируется в журнале событий с цитированием пункта процедуры и идентификатором сотрудника."],
    ],
    "AML-HB": [
      ["§4.3 Базовые требования", "Каждый клиент при первичной идентификации заполняет декларацию о бенефициарном владельце и источнике средств."],
      ["§4.7 Источник средств", "Декларация ИС обязательна для одиночных депозитов ≥ 50 000 000 UZS либо для совокупных депозитов, превышающих порог в течение 7 календарных дней."],
      ["§5 Подача STR", "Подозрительные операции подаются в CBU-AML в течение 24 часов с момента возникновения подозрения."],
    ],
  };
  const fallback = [["§1 Общие положения", "Полный текст документа доступен в электронной системе банка. Этот блок — выдержка для тренировочной среды."]];
  const body = sections[id] || fallback;
  return (
    <div className="hb-doc-body">
      {body.map(([h, t], i) => (
        <section key={i}>
          <h4>{h}</h4>
          {t.split("\n").map((p, j) => <p key={j}>{p}</p>)}
        </section>
      ))}
      <div className="hb-doc-foot">
        Версия документа загружена с внутреннего портала · контрольная сумма <span className="cite-mono">sha256:7f3a…b8</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity log

function ActivityPage({ setSimPage }) {
  const [filter, setFilter] = useState_sp("all");
  const [selected, setSelected] = useState_sp(null);
  const rows = useMemo_sp(() => ACTIVITY.filter(a =>
    filter === "all" || a.tag.toLowerCase().includes(filter.toLowerCase())
  ), [filter]);
  return (
    <SimShell simPage="activity" setSimPage={setSimPage} crumb={["Справка", "Журнал событий"]}>
      <PageHeader
        eyebrow="Справка · аудит"
        title="Журнал событий"
        sub="Иммутабельный append-only журнал. Все действия — ваши, мастеров, авто-систем — фиксируются с временной меткой и хешем."
        actions={
          <div className="tab-pill">
            <button className={filter === "all"      ? "active" : ""} onClick={() => setFilter("all")}>Все</button>
            <button className={filter === "kyc"      ? "active" : ""} onClick={() => setFilter("kyc")}>KYC</button>
            <button className={filter === "sanctions"? "active" : ""} onClick={() => setFilter("sanctions")}>Санкции</button>
            <button className={filter === "transfer" ? "active" : ""} onClick={() => setFilter("transfer")}>Переводы</button>
            <button className={filter === "system"   ? "active" : ""} onClick={() => setFilter("system")}>Система</button>
          </div>
        }
      />

      <div className="log-list">
        {rows.map((a, i) => (
          <button className="log-row" key={i} onClick={() => setSelected(a)}
                  style={{ font: "inherit", color: "inherit", border: 0, background: "transparent", textAlign: "left", cursor: "pointer", width: "100%" }}>
            <span className="log-t mono">{a.t}</span>
            <span className="log-dot" />
            <span className="log-text"><b>{a.actor}</b> {a.action} <b>{a.what}</b></span>
            <span className={`tag ${a.tag === "System" ? "mute" : a.tag === "Sanctions" ? "warn" : a.tag === "AML" ? "warn" : "cobalt"}`}>{a.tag}</span>
          </button>
        ))}
        {rows.length === 0 && <div className="dt-empty">Ничего не найдено</div>}
      </div>
      {selected && <ActivityDrawer entry={selected} onClose={() => setSelected(null)} />}
    </SimShell>
  );
}

window.AccountsPage = AccountsPage;
window.DepositsPage = DepositsPage;
window.TransfersPage = TransfersPage;
window.CardsPage = CardsPage;
window.SanctionsListPage = SanctionsListPage;
window.PepPage = PepPage;
window.AmlPage = AmlPage;
window.HandbookPage = HandbookPage;
window.ActivityPage = ActivityPage;


// ─────────────────────────────────────────────────────────────────────────────
// Detail drawers (click a row/card → full details)

function Drawer({ title, eyebrow, onClose, foot, children }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <>
      <div className="drawer-bg" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div>
            {eyebrow && <p className="h-eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</p>}
            <h2>{title}</h2>
          </div>
          <button className="close" onClick={onClose}><I.X size={16} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {foot && <div className="drawer-foot">{foot}</div>}
      </div>
    </>
  );
}
window.Drawer = Drawer;

function DetailGrid({ items }) {
  return (
    <div className="crm-grid cols-2" style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--r-md)" }}>
      {items.map(([label, val, mono], i) => (
        <div className="field" key={i}>
          <label>{label}</label>
          <div className={`val ${mono ? "mono" : ""}`}>{val}</div>
        </div>
      ))}
    </div>
  );
}

function AccountDrawer({ account, onClose }) {
  const recentTx = [
    { t: "Сегодня · 09:42", desc: "Перевод от Иванова О.В.", amt: 3_200_000, dir: "in", cur: account.cur },
    { t: "Сегодня · 07:18", desc: "Платёж: Узбекистон Алока", amt: 220_000,   dir: "out", cur: account.cur },
    { t: "Вчера · 21:04",   desc: "Зачисление зарплаты «ТехноТрейд»", amt: 14_800_000, dir: "in", cur: account.cur },
    { t: "Вчера · 16:22",   desc: "Снятие · банкомат TAS-091", amt: 800_000,  dir: "out", cur: account.cur },
    { t: "3 дня назад",      desc: "Покупка · Korzinka.uz",     amt: 412_400,  dir: "out", cur: account.cur },
  ];
  return (
    <Drawer
      eyebrow="Счёт клиента"
      title={account.customer}
      onClose={onClose}
      foot={<>
        <button className="btn btn-ghost">Заморозить</button>
        <button className="btn btn-ghost">Выписка</button>
        <button className="btn btn-primary">Перевести</button>
      </>}
    >
      <DetailGrid items={[
        ["Номер счёта",    account.id, true],
        ["Валюта",         account.cur],
        ["Тип",            account.type],
        ["Текущий баланс", fmt(account.bal, account.cur), true],
        ["Открыт",         account.opened, true],
        ["Статус",         account.status],
        ["Тариф",          "Резидент · базовый"],
        ["IBAN",           "UZ12 0010 8800 4471 0023 0011 9280", true],
      ]} />

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Последние операции</h3>
        <div className="data-table" style={{ background: "var(--surface)" }}>
          {recentTx.map((t, i) => (
            <div key={i} className="dt-row" style={{ gridTemplateColumns: "120px 1fr auto" }}>
              <span className="mono" style={{ color: "var(--mute)", fontSize: 12 }}>{t.t}</span>
              <span>{t.desc}</span>
              <span className="mono" style={{ color: t.dir === "in" ? "var(--good)" : "var(--ink)" }}>
                {t.dir === "in" ? "+" : "−"}{fmt(t.amt, t.cur)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Связанные продукты</h3>
        <div className="info-banner">2 действующих карты, 1 срочный депозит, 0 кредитов. Все привязки актуальны.</div>
      </div>
    </Drawer>
  );
}
window.AccountDrawer = AccountDrawer;

function DepositDrawer({ deposit, onClose }) {
  const interestPaid = Math.round(deposit.amount * (deposit.rate / 100) * 0.4);
  const interestProj = Math.round(deposit.amount * (deposit.rate / 100));
  return (
    <Drawer
      eyebrow="Срочный депозит"
      title={`${deposit.id} · ${deposit.customer}`}
      onClose={onClose}
      foot={<>
        <button className="btn btn-ghost">Условия (PDF)</button>
        <button className="btn btn-ghost">Досрочное закрытие</button>
        <button className="btn btn-primary">Продлить</button>
      </>}
    >
      <DetailGrid items={[
        ["Номер",          deposit.id, true],
        ["Вкладчик",       deposit.customer],
        ["Сумма",          fmt(deposit.amount, deposit.cur), true],
        ["Ставка",         `${deposit.rate}% годовых`, true],
        ["Срок",           deposit.term],
        ["Открыт",         "2025-09-12", true],
        ["Окончание",      deposit.maturity, true],
        ["Статус",         deposit.status],
      ]} />

      <div className="proj-card">
        <div>
          <div className="proj-label">Уже начислено</div>
          <div className="proj-value mono">+ {interestPaid.toLocaleString("ru-RU")} {deposit.cur}</div>
        </div>
        <div className="proj-meta">из ожидаемых {interestProj.toLocaleString("ru-RU")} {deposit.cur}<br/>на конец срока</div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>График выплат процентов</h3>
        <div className="data-table" style={{ background: "var(--surface)" }}>
          {["2025-10-12", "2025-11-12", "2025-12-12", "2026-01-12", "2026-02-12"].map((d, i) => (
            <div key={i} className="dt-row" style={{ gridTemplateColumns: "150px 1fr auto" }}>
              <span className="mono" style={{ color: "var(--mute)" }}>{d}</span>
              <span>Ежемесячные проценты</span>
              <span className="mono" style={{ color: "var(--good)" }}>+ {Math.round(deposit.amount * deposit.rate / 100 / 12).toLocaleString("ru-RU")} {deposit.cur}</span>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
window.DepositDrawer = DepositDrawer;

function TransferDrawer({ transfer, onClose }) {
  return (
    <Drawer
      eyebrow={`Перевод · ${transfer.channel}`}
      title={transfer.id}
      onClose={onClose}
      foot={<>
        {transfer.status === "Эскалирован" && <button className="btn btn-ghost">Открыть тикет комплаенса</button>}
        <button className="btn btn-ghost">Распечатать</button>
        <button className="btn btn-primary">Подтверждение клиенту</button>
      </>}
    >
      <DetailGrid items={[
        ["Отправитель", transfer.from],
        ["Получатель",  transfer.to],
        ["Сумма",       fmt(transfer.amount, transfer.cur), true],
        ["Канал",       transfer.channel],
        ["Время",       `${new Date().toLocaleDateString("ru-RU")} ${transfer.t}`, true],
        ["Статус",      transfer.status],
        ["Комиссия",    `${(transfer.amount * 0.001).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${transfer.cur}`, true],
        ["MT тип",      transfer.channel === "SWIFT" ? "MT103" : "—", true],
      ]} />

      {transfer.reason && (
        <div className="info-banner warn">
          <I.Shield size={12} /> {transfer.reason}: {transfer.status === "Эскалирован" ? "ожидается решение комплаенс-офицера." : "перевод отклонён системой."}
        </div>
      )}

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Журнал AML</h3>
        <div className="log-list">
          <div className="log-row" style={{ gridTemplateColumns: "100px 18px 1fr auto" }}>
            <span className="mono mute-x">{transfer.t}</span>
            <span className="log-dot" />
            <span><b>Авто-AML</b> запустил скрининг отправителя</span>
            <span className="tag mute">scan</span>
          </div>
          <div className="log-row" style={{ gridTemplateColumns: "100px 18px 1fr auto" }}>
            <span className="mono mute-x">{transfer.t}</span>
            <span className="log-dot" />
            <span><b>Система</b> рассчитала риск-балл: <b className="mono">72</b></span>
            <span className="tag warn">score</span>
          </div>
          {transfer.status === "Эскалирован" && (
            <div className="log-row" style={{ gridTemplateColumns: "100px 18px 1fr auto" }}>
              <span className="mono mute-x">{transfer.t}</span>
              <span className="log-dot" />
              <span><b>Алексей П.</b> эскалировал в комплаенс</span>
              <span className="tag cobalt">escalation</span>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
window.TransferDrawer = TransferDrawer;

function CardDrawer({ card, onClose }) {
  return (
    <Drawer
      eyebrow={`${card.brand} · ${card.type}`}
      title={card.customer}
      onClose={onClose}
      foot={<>
        <button className="btn btn-ghost">Заблокировать</button>
        <button className="btn btn-ghost">Перевыпустить</button>
        <button className="btn btn-primary">Добавить в кошелёк</button>
      </>}
    >
      <div className={`card-tile brand-${card.brand.toLowerCase()}`} style={{ maxWidth: 320, margin: "0 auto" }}>
        <div className="card-tile-top">
          <span className="card-brand">{card.brand}</span>
          <span className={`tag ${card.status === "Активна" ? "good" : "mute"}`}>{card.status}</span>
        </div>
        <div className="card-chip"><i/><i/><i/></div>
        <div className="card-num mono">{card.num}</div>
        <div className="card-tile-foot">
          <div>
            <div className="card-tile-label">Держатель</div>
            <div className="card-tile-val">{card.customer}</div>
          </div>
          <div>
            <div className="card-tile-label">До</div>
            <div className="card-tile-val mono">{card.exp}</div>
          </div>
        </div>
      </div>

      <DetailGrid items={[
        ["Номер",        card.num, true],
        ["Бренд",         card.brand],
        ["Категория",     card.type],
        ["Действительна до", card.exp, true],
        ["Дневной лимит", "5 000 000 UZS", true],
        ["Снятие в банкомате", "2 000 000 UZS / день", true],
        ["Цифровая",       "Apple Pay · Google Pay"],
        ["Тариф",          "Базовый · 0 UZS/мес"],
      ]} />

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Последние транзакции по карте</h3>
        <div className="data-table" style={{ background: "var(--surface)" }}>
          {[
            { t: "Сегодня · 13:24", merchant: "Korzinka.uz · Tashkent",       amt: 412400 },
            { t: "Сегодня · 11:02", merchant: "Yandex Go",                     amt: 28000  },
            { t: "Вчера · 19:47",   merchant: "Lavash House",                  amt: 86000  },
            { t: "Вчера · 14:18",   merchant: "Uzum Market",                    amt: 1240000},
            { t: "2 дня назад",     merchant: "Apple App Store",                amt: 49000  },
          ].map((t, i) => (
            <div key={i} className="dt-row" style={{ gridTemplateColumns: "130px 1fr auto" }}>
              <span className="mono mute-x" style={{ fontSize: 12 }}>{t.t}</span>
              <span>{t.merchant}</span>
              <span className="mono">− {t.amt.toLocaleString("ru-RU")} UZS</span>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
window.CardDrawer = CardDrawer;


// ─────────────────────────────────────────────────────────────────────────────
// Compliance / Activity drawers

function SanctionDrawer({ entry, onClose }) {
  return (
    <Drawer
      eyebrow={`Санкционная запись · ${entry.list}`}
      title={entry.name}
      onClose={onClose}
      foot={<>
        <button className="btn btn-ghost">Связанные хиты</button>
        <button className="btn btn-primary">Открыть процедуру SANCTIONS-PROC</button>
      </>}
    >
      <DetailGrid items={[
        ["ID записи",     entry.id, true],
        ["Список",        entry.list],
        ["Тип",            entry.type],
        ["Страна",         entry.country],
        ["Причина",        entry.reason],
        ["Добавлено",      entry.added, true],
        ["Уровень риска",  entry.risk === "high" ? "Высокий" : entry.risk === "med" ? "Средний" : "Низкий"],
        ["Активные хиты",  entry.hit ? "HIT-7741 (в работе)" : "—"],
      ]} />

      {entry.hit && (
        <div className="info-banner warn">
          <I.Shield size={12} /> Эта запись активно сопоставляется с открытым KYC <span className="mono">SYN-2847102</span> (Соколов Иван). Уверенность 72%. Эскалация в комплаенс открыта.
        </div>
      )}

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Альтернативные написания</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[entry.name, entry.name.replace(/\./g, ""), entry.name + " (вариант)"].map((n, i) => (
            <span key={i} className="tag mute" style={{ padding: "5px 10px" }}>{n}</span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Источники</h3>
        <div className="info-banner" style={{ alignItems: "flex-start" }}>
          <I.Doc size={12} />
          <div>
            <div><b>{entry.list}</b> · официальная публикация регулятора</div>
            <div style={{ fontSize: 11.5, color: "var(--mute)", marginTop: 4 }}>Файл загружен автоматически в 06:00 UTC. Контрольная сумма sha256:7f3a…b8.</div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
window.SanctionDrawer = SanctionDrawer;

function PepDrawer({ entry, onClose }) {
  return (
    <Drawer
      eyebrow={`Реестр ПДЛ · ${entry.country}`}
      title={entry.name}
      onClose={onClose}
      foot={<>
        <button className="btn btn-ghost">История изменений</button>
        <button className="btn btn-primary">Открыть PEP-HB</button>
      </>}
    >
      <DetailGrid items={[
        ["ID",            entry.id, true],
        ["Страна",        entry.country],
        ["Должность",     entry.position],
        ["Должность с",   entry.since, true],
        ["Статус",        entry.status],
        ["Категория",     entry.status.includes("relative") ? "Близкий родственник" : "Прямое лицо"],
        ["Контроль",      "Расширенная проверка операций"],
        ["Тикетов открыто", "0", true],
      ]} />

      <div className="info-banner">
        <I.Shield size={12} /> Все операции по этому лицу автоматически попадают в очередь расширенной проверки AML, независимо от суммы.
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Связанные счета и операции</h3>
        <div className="data-table" style={{ background: "var(--surface)" }}>
          <div className="dt-row" style={{ gridTemplateColumns: "140px 1fr auto" }}>
            <span className="mono mute-x">3 дня назад</span>
            <span>Открытие текущего счёта в UZS</span>
            <span className="tag good">проверено</span>
          </div>
          <div className="dt-row" style={{ gridTemplateColumns: "140px 1fr auto" }}>
            <span className="mono mute-x">1 нед назад</span>
            <span>SWIFT-перевод USD 8 200 → IST</span>
            <span className="tag warn">в проверке</span>
          </div>
          <div className="dt-row" style={{ gridTemplateColumns: "140px 1fr auto" }}>
            <span className="mono mute-x">2 нед назад</span>
            <span>Срочный депозит 120 млн UZS</span>
            <span className="tag good">проверено</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
window.PepDrawer = PepDrawer;

function AmlDrawer({ report, onClose }) {
  return (
    <Drawer
      eyebrow={`Отчёт AML · ${report.type}`}
      title={report.id}
      onClose={onClose}
      foot={<>
        <button className="btn btn-ghost">Скачать PDF</button>
        {report.status.includes("проверке") && <button className="btn btn-primary">Отправить в CBU-AML</button>}
      </>}
    >
      <DetailGrid items={[
        ["ID отчёта",   report.id, true],
        ["Тип",          report.type === "STR" ? "STR · подозрительная операция" : "CTR · крупная операция"],
        ["Клиент",       report.customer],
        ["Сумма",        report.amount, true],
        ["Статус",       report.status],
        ["Дата подачи",  report.filed, true],
        ["Срок CBU",     report.type === "STR" ? "24 часа с момента подозрения" : "5 рабочих дней"],
        ["Подписал",     "Алексей П. · стажёр"],
      ]} />

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Причина подачи</h3>
        <p className="sub">{report.type === "STR"
          ? "Серия мелких переводов от одного отправителя на разные счета в течение 7 дней. Совокупный объём превышает порог разовой операции, при этом каждая транзакция в отдельности выглядит обычной."
          : "Депозит на сумму выше регуляторного порога CTR (50 млн UZS). Автоматически фиксируется в CBU-AML вместе с подтверждением источника средств."}</p>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Журнал отчёта</h3>
        <div className="log-list">
          <div className="log-row" style={{ gridTemplateColumns: "140px 18px 1fr auto" }}>
            <span className="mono mute-x">{report.filed}</span>
            <span className="log-dot" />
            <span><b>Алексей П.</b> создал черновик отчёта</span>
            <span className="tag cobalt">draft</span>
          </div>
          <div className="log-row" style={{ gridTemplateColumns: "140px 18px 1fr auto" }}>
            <span className="mono mute-x">{report.filed}</span>
            <span className="log-dot" />
            <span><b>Татьяна К.</b> утвердила, передано в CBU-AML</span>
            <span className="tag good">approved</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
window.AmlDrawer = AmlDrawer;

function ActivityDrawer({ entry, onClose }) {
  return (
    <Drawer
      eyebrow={`Журнал · ${entry.tag}`}
      title={`${entry.actor} ${entry.action}`}
      onClose={onClose}
      foot={<button className="btn btn-primary">Перейти к объекту</button>}
    >
      <DetailGrid items={[
        ["Время",      entry.t, true],
        ["Актор",      entry.actor],
        ["Действие",   entry.action],
        ["Объект",     entry.what],
        ["Категория",  entry.tag],
        ["IP",         "10.244.18.27", true],
        ["Устройство", "BankSandbox Web · Chrome 138"],
        ["Хеш записи", "7f3a…b8df", true],
      ]} />

      <div className="info-banner">
        <I.Shield size={12} /> Запись неизменяема. Любая попытка модификации создаёт инцидент безопасности.
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Контекст</h3>
        <p className="sub">{entry.actor.includes("вы")
          ? "Это ваше действие. Журнал виден вашему наставнику и HR — это часть прозрачности обучения."
          : "Действие выполнено в рамках обычной работы сервиса. Дополнительные подтверждения не требуются."}</p>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Соседние события</h3>
        <div className="log-list">
          <div className="log-row" style={{ gridTemplateColumns: "100px 18px 1fr auto" }}>
            <span className="mono mute-x">за 2 мин до</span>
            <span className="log-dot" />
            <span>Авто-AML запустил скрининг отправителя</span>
            <span className="tag mute">system</span>
          </div>
          <div className="log-row" style={{ gridTemplateColumns: "100px 18px 1fr auto" }}>
            <span className="mono mute-x">через 5 мин</span>
            <span className="log-dot" />
            <span>Татьяна К. оставила фидбэк в карточке клиента</span>
            <span className="tag cobalt">mentor</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
window.ActivityDrawer = ActivityDrawer;
