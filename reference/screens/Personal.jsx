// Personal.jsx — Knowledge, Badges, Profile, Settings pages
const { useState: useState_p, useMemo: useMemo_p } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Knowledge base — searchable, grounded, with the chat below

function KnowledgePage({ openChat, lang }) {
  const [query, setQuery] = useState_p("");
  const [selected, setSelected] = useState_p(null);

  const articles = [
    { id: "KYC-PROC §2.1", title: "Какие документы нужны для KYC?", excerpt: "Паспорт/ID-карта, подтверждение адреса не старше 90 дней, декларация ИС при депозите ≥ 50 млн UZS.", tag: "KYC", reads: 1240, fresh: "2 нед" },
    { id: "AML-HB §4.7",   title: "Порог декларации источника средств", excerpt: "49 999 999 UZS — без декларации. Совокупные депозиты за 7 дней суммируются.", tag: "AML", reads: 982, fresh: "1 нед" },
    { id: "SANCTIONS-PROC §1.4", title: "Что делать с возможным санкционным хитом", excerpt: "≥50% уверенности ⇒ эскалация в комплаенс. Игнор разрешён только старшим офицерам.", tag: "Sanctions", reads: 1610, fresh: "3 дн" },
    { id: "DEPOSIT-OPS §3.2", title: "Сроки досрочного закрытия вклада", excerpt: "До 30 дней — без начисления процентов. От 30 до 90 — 50% ставки. После 90 — полная ставка.", tag: "Deposits", reads: 740, fresh: "1 мес" },
    { id: "TRANSFER-OPS §6.4", title: "Лимиты SWIFT-переводов физлиц", excerpt: "$10 000 в сутки без дополнительной проверки. Свыше — расширенная AML-проверка и декларация цели.", tag: "Transfers", reads: 1102, fresh: "4 дн" },
    { id: "CARD-ISSUE §2.1", title: "Сколько времени занимает выпуск карты?", excerpt: "UZCARD/HUMO — до 3 рабочих дней. VISA/Mastercard — до 10 дней с курьерской доставкой.", tag: "Cards", reads: 612, fresh: "3 нед" },
    { id: "FX-RATE §1.0", title: "Где смотреть актуальные курсы конвертации?", excerpt: "BankSandbox → FX → Курсы. Внутренний курс отличается от ЦБ на ±0.5–1.5%.", tag: "FX", reads: 488, fresh: "сегодня" },
    { id: "INCIDENT-RESP §3.2", title: "Что считается инцидентом и кому сообщать", excerpt: "Любое подозрение на утечку, ошибку перевода или некорректную идентификацию. Канал — горячая линия Compliance.", tag: "Security", reads: 1380, fresh: "1 нед" },
    { id: "OPS-ESC §2.1", title: "Эскалация: когда и как", excerpt: "15 минут — для санкционных хитов. 2 часа — для подозрительных операций. 24 часа — для прочих несоответствий.", tag: "Operations", reads: 920, fresh: "2 нед" },
  ];

  const rows = useMemo_p(() => articles.filter(a =>
    !query || a.title.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase()) || a.excerpt.toLowerCase().includes(query.toLowerCase())
  ), [query]);

  return (
    <div className="page screen-in" data-screen-label="Knowledge">
      <p className="h-eyebrow">База знаний · с опорой на документы</p>
      <h1 className="h1">Спросите <em>справочник</em>.</h1>
      <p className="sub" style={{ marginTop: 8, maxWidth: 620 }}>
        Все ответы привязаны к параграфам внутренних процедур. Если в индексе нет ответа — система так и скажет, а не выдумает.
      </p>

      <div className="kb-search">
        <I.Search size={16} />
        <input placeholder="Поиск по справочнику · «лимит SWIFT», «эскалация санкции»…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn btn-primary" onClick={openChat}><I.Chat size={13} /> Открыть чат</button>
      </div>

      <div className="kb-topics">
        {["KYC", "AML", "Sanctions", "Deposits", "Transfers", "Cards", "FX", "Security"].map((t, i) => (
          <button key={t} className="kb-topic" onClick={() => setQuery(t)}>
            <span className={`kb-topic-mark kb-topic-${i % 4}`} />
            {t}
          </button>
        ))}
      </div>

      <h2 className="h2" style={{ marginTop: 28, marginBottom: 12 }}>Часто спрашивают</h2>
      <div className="kb-list">
        {rows.map((a) => (
          <button className="kb-row" key={a.id} onClick={() => setSelected(a)}
                  style={{ font: "inherit", color: "inherit", textAlign: "left", cursor: "pointer", border: "1px solid var(--line)", background: "var(--surface)" }}>
            <div className="kb-row-meta">
              <span className="cite-mono">{a.id}</span>
              <span className="kb-tag tag mute">{a.tag}</span>
            </div>
            <div className="kb-row-body">
              <b>{a.title}</b>
              <p>{a.excerpt}</p>
            </div>
            <div className="kb-row-stats">
              <div><span className="mono">{a.reads}</span> прочтений</div>
              <div className="mute-x">обновлено {a.fresh}</div>
            </div>
          </button>
        ))}
        {rows.length === 0 && <div className="dt-empty">Ничего не найдено по запросу «{query}»</div>}
      </div>

      {selected && <KbArticleDrawer article={selected} onClose={() => setSelected(null)} openChat={openChat} />}

      <div className="kb-cta">
        <div>
          <b>Не нашли ответ?</b>
          <small>Можно задать вопрос в чат — он ответит из тех же документов, либо честно скажет «нет в индексе».</small>
        </div>
        <button className="btn btn-primary" onClick={openChat}><I.Chat size={13} /> Спросить помощника</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Badges

function BadgesPage() {
  const [selected, setSelected] = useState_p(null);
  const cats = [
    { name: "Операции", badges: [
      { name: "Первый KYC",       desc: "Первая полная верификация",  emoji: "🎯", cls: "gold",  unlocked: true,  date: "Вчера" },
      { name: "Первый депозит",   desc: "Открыли первый депозит",      emoji: "💰", cls: "gold",  unlocked: true,  date: "3 дня назад" },
      { name: "Первый SWIFT",     desc: "Провели первый SWIFT",         emoji: "🌐", cls: "teal",  unlocked: false },
      { name: "Первая карта",     desc: "Выпустили первую карту",       emoji: "💳", cls: "lilac", unlocked: false },
    ]},
    { name: "Качество", badges: [
      { name: "Перфекционист",     desc: "100 баллов за KYC",            emoji: "💎", cls: "",      unlocked: false },
      { name: "Без подсказок",     desc: "Сценарий без единой подсказки", emoji: "🧠", cls: "lilac", unlocked: false },
      { name: "Точность 95+",      desc: "5 сценариев подряд 95+",        emoji: "🎖️", cls: "gold",  unlocked: false },
    ]},
    { name: "Комплаенс", badges: [
      { name: "Комплаенс-про",     desc: "0 пропусков по санкциям ×3", emoji: "🛡️", cls: "",      unlocked: false },
      { name: "Анти-AML",         desc: "10 STR без ошибок",           emoji: "🔎", cls: "teal",  unlocked: false },
    ]},
    { name: "Привычка", badges: [
      { name: "Серия 7",          desc: "7 дней практики подряд",       emoji: "🔥", cls: "rose",  unlocked: false, progress: "5/7" },
      { name: "Серия 30",         desc: "30 дней практики подряд",      emoji: "🔥", cls: "rose",  unlocked: false, progress: "5/30" },
      { name: "Полуночник",       desc: "Практика после 21:00",          emoji: "🌙", cls: "lilac", unlocked: true,  date: "На прошлой неделе" },
      { name: "Ранняя пташка",    desc: "Практика до 08:00",             emoji: "🌅", cls: "gold",  unlocked: false },
    ]},
    { name: "Сообщество", badges: [
      { name: "Полиглот",         desc: "Интерфейс RU + UZ",            emoji: "🌐", cls: "teal",  unlocked: true,  date: "2 нед назад" },
      { name: "Спросил наставника", desc: "Первый вопрос наставнику",   emoji: "💬", cls: "lilac", unlocked: true,  date: "1 нед назад" },
      { name: "Топ-3 потока",     desc: "Войти в топ-3 текущего потока", emoji: "🥉", cls: "gold",  unlocked: false, progress: "место #5" },
    ]},
  ];

  const total = cats.reduce((s, c) => s + c.badges.length, 0);
  const unlocked = cats.reduce((s, c) => s + c.badges.filter(b => b.unlocked).length, 0);

  return (
    <div className="page screen-in" data-screen-label="Badges">
      <p className="h-eyebrow">Прогресс · {unlocked} из {total} наград</p>
      <h1 className="h1">Награды и <em>достижения</em>.</h1>
      <p className="sub" style={{ marginTop: 8, maxWidth: 560 }}>
        Награды — это память о пройденных сценариях и привычках. Каждая открывается за конкретное действие, а не за время в системе.
      </p>

      <div className="badges-progress">
        <div className="bp-bar"><i style={{ width: `${(unlocked / total) * 100}%` }} /></div>
        <span><b>{unlocked}</b> / {total}</span>
      </div>

      {cats.map(cat => (
        <div className="badges-section" key={cat.name}>
          <h2 className="h2 badges-h">{cat.name}</h2>
          <div className="badges-grid-full">
            {cat.badges.map((b, i) => (
              <button className={`badge-full ${b.unlocked ? "" : "locked"}`} key={i}
                      onClick={() => setSelected({ ...b, cat: cat.name })}
                      style={{ font: "inherit", color: "inherit", cursor: "pointer" }}>
                <div className={`badge-glyph ${b.cls}`}>{b.emoji}</div>
                <b>{b.name}</b>
                <span>{b.desc}</span>
                {b.unlocked ? (
                  <span className="badge-meta good">Получено · {b.date}</span>
                ) : b.progress ? (
                  <span className="badge-meta cobalt">{b.progress}</span>
                ) : (
                  <span className="badge-meta mute"><I.Lock size={10} /> Заблокировано</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selected && <BadgeDrawer badge={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function BadgeDrawer({ badge, onClose }) {
  return (
    <Drawer
      eyebrow={`Награда · ${badge.cat}`}
      title={badge.name}
      onClose={onClose}
      foot={!badge.unlocked && <button className="btn btn-primary">Показать путь</button>}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 14, background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
        <div className={`badge-glyph ${badge.cls}`} style={{ width: 72, height: 72, fontSize: 32 }}>{badge.emoji}</div>
        <div>
          <b style={{ fontSize: 16, fontWeight: 500 }}>{badge.name}</b>
          <p style={{ fontSize: 13, color: "var(--mute)", margin: "4px 0 0" }}>{badge.desc}</p>
          {badge.unlocked
            ? <span className="badge-meta good" style={{ marginTop: 8 }}>Получено · {badge.date}</span>
            : badge.progress ? <span className="badge-meta cobalt" style={{ marginTop: 8 }}>{badge.progress}</span>
            : <span className="badge-meta mute" style={{ marginTop: 8 }}><I.Lock size={10} /> Заблокировано</span>}
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Что нужно для получения</h3>
        <p className="sub" style={{ marginBottom: 12 }}>{badge.desc} Прогресс фиксируется автоматически при выполнении сценариев и задач.</p>
        <div className="info-banner">
          <I.Spark size={12} /> Совет от Mentora: входите в тренажёр хотя бы на 5 минут в день — это уже считается для серии.
        </div>
      </div>

      {badge.unlocked && (
        <div>
          <h3 className="h3" style={{ marginBottom: 10 }}>История получения</h3>
          <div className="log-list">
            <div className="log-row" style={{ gridTemplateColumns: "110px 18px 1fr auto" }}>
              <span className="mono mute-x">{badge.date}</span>
              <span className="log-dot" />
              <span><b>Система</b> выдала награду «Alexey П.»</span>
              <span className="tag good">выдача</span>
            </div>
            <div className="log-row" style={{ gridTemplateColumns: "110px 18px 1fr auto" }}>
              <span className="mono mute-x">{badge.date}</span>
              <span className="log-dot" />
              <span><b>Наставник Татьяна К.</b> поздравила в чате потока</span>
              <span className="tag cobalt">community</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="h3" style={{ marginBottom: 10 }}>Похожие награды</h3>
        <div className="badges-grid-full" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { e: "💫", n: "Спортсмен", d: "5 сценариев за день" },
            { e: "🎯", n: "Снайпер", d: "100% без пересдачи" },
            { e: "🚀", n: "Пионер", d: "Первый в новом модуле" },
          ].map((r, i) => (
            <div className="badge-full locked" key={i}>
              <div className="badge-glyph">{r.e}</div>
              <b>{r.n}</b><span>{r.d}</span>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile

function ProfilePage({ xp, level, streak }) {
  const skills = [
    { name: "KYC и идентификация", pct: 78, hours: "12.4 ч" },
    { name: "Депозиты",             pct: 42, hours: "3.1 ч" },
    { name: "Переводы и SWIFT",      pct: 28, hours: "1.8 ч" },
    { name: "Санкции и ПДЛ",         pct: 64, hours: "5.7 ч" },
    { name: "Карты",                pct: 18, hours: "0.6 ч" },
    { name: "AML отчётность",        pct: 12, hours: "0.4 ч" },
  ];

  return (
    <div className="page screen-in" data-screen-label="Profile">
      <p className="h-eyebrow">Профиль стажёра · поток Q2-26</p>
      <h1 className="h1">Алексей <em>Петров</em></h1>
      <p className="sub" style={{ marginTop: 8 }}>
        Стажёр · отделение «Tashkent City» · начал 12 мая · поток Q2-26 · наставник Татьяна К.
      </p>

      <div className="profile-hero">
        <div className="profile-card">
          <div className="profile-avatar">АП</div>
          <div className="profile-meta">
            <b>Алексей Петров</b>
            <span>Стажёр банковских операций</span>
            <div className="profile-tags">
              <span className="tag cobalt">RU</span>
              <span className="tag mute">UZ · базовый</span>
              <span className="tag mute">EN · B2</span>
            </div>
          </div>
        </div>
        <div className="profile-stats">
          <div className="ps-cell">
            <div className="ps-label">Уровень</div>
            <div className="ps-val mono">{level}</div>
            <div className="ps-sub">Банковский подмастерье</div>
          </div>
          <div className="ps-cell">
            <div className="ps-label">XP</div>
            <div className="ps-val mono">{xp.toLocaleString("ru-RU")}</div>
            <div className="ps-sub">240 до ур. 4</div>
          </div>
          <div className="ps-cell">
            <div className="ps-label">Серия</div>
            <div className="ps-val mono">{streak}<small>дней</small></div>
            <div className="ps-sub">Лучшая · 12</div>
          </div>
          <div className="ps-cell">
            <div className="ps-label">Средний балл</div>
            <div className="ps-val mono">87<small>/100</small></div>
            <div className="ps-sub">+4 за неделю</div>
          </div>
        </div>
      </div>

      <h2 className="h2" style={{ marginTop: 28, marginBottom: 12 }}>Навыки</h2>
      <div className="skills">
        {skills.map(s => (
          <div className="skill-row" key={s.name}>
            <span className="skill-name">{s.name}</span>
            <div className="skill-bar"><i style={{ width: `${s.pct}%` }} /></div>
            <span className="skill-pct mono">{s.pct}%</span>
            <span className="skill-hours mono">{s.hours}</span>
          </div>
        ))}
      </div>

      <div className="prof-grid">
        <div className="card card-pad">
          <h3 className="h3" style={{ marginBottom: 12 }}>Заметки наставника</h3>
          <div className="note-list">
            <div className="note">
              <div className="note-head">
                <b>Татьяна К.</b>
                <span className="mono mute-x">Вчера · 16:48</span>
              </div>
              <p>«На SOF Алексей задумывается на лишние 30 секунд. Стоит пройти AML-HB §4.7 ещё раз — пороги должны быть в голове наизусть».</p>
            </div>
            <div className="note">
              <div className="note-head">
                <b>Татьяна К.</b>
                <span className="mono mute-x">Пн · 11:12</span>
              </div>
              <p>«Хорошее ощущение KYC-флоу. На скрининг реагирует быстро, не паникует на жёлтых флагах. Готов пробовать открытие счёта на следующей неделе».</p>
            </div>
            <div className="note">
              <div className="note-head">
                <b>HR Ольга Р.</b>
                <span className="mono mute-x">2 нед назад</span>
              </div>
              <p>«Стартовал на 2 дня раньше плана. Высокая мотивация, активно использует Клика. Сильный кандидат на ускоренный трек».</p>
            </div>
          </div>
        </div>
        <div className="card card-pad">
          <h3 className="h3" style={{ marginBottom: 12 }}>План недели</h3>
          <ol className="week-plan">
            <li><b>Пн</b> <span>KYC: разбор инцидента с PEP — 30 мин с наставником</span></li>
            <li><b>Вт</b> <span>Открытие счёта: сценарий-репетиция</span> <span className="tag cobalt">сегодня</span></li>
            <li><b>Ср</b> <span>Депозиты: расчёт ставок и досрочное закрытие</span></li>
            <li><b>Чт</b> <span>SWIFT: введение, документация SWIFT MT103</span></li>
            <li><b>Пт</b> <span>Финальный микс-сценарий + ретро с потоком</span></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings

function SettingsPage({ t, setTweak, lang, setLang }) {
  return (
    <div className="page screen-in" data-screen-label="Settings">
      <p className="h-eyebrow">Настройки приложения</p>
      <h1 className="h1">Настройки</h1>
      <p className="sub" style={{ marginTop: 8 }}>Эти параметры применяются только к вашему аккаунту и сохраняются между сессиями.</p>

      <div className="settings-list">
        <SettingSection title="Аккаунт">
          <SettingRow label="Имя" sub="Отображается наставнику и в журнале событий" v="Алексей Петров" />
          <SettingRow label="Email" v="a.petrov@bank-intern.uz" />
          <SettingRow label="Отделение" v="Tashkent City" />
          <SettingRow label="Поток" v="Q2-26 · 13 стажёров" />
        </SettingSection>

        <SettingSection title="Локаль">
          <SettingRow label="Язык интерфейса" sub="Сохраняется отдельно от языка ответов чата">
            <div className="tab-pill">
              {["RU","UZ","EN"].map(l => (
                <button key={l} className={lang === l ? "active" : ""} onClick={() => setLang(l)}>{l}</button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Дата и время" v="ru-RU · 24ч · Asia/Tashkent" />
          <SettingRow label="Формат валюты" v="UZS · разделитель пробел · без копеек" />
        </SettingSection>

        <SettingSection title="Клик (Clicky)">
          <SettingRow label="Показывать Клика" sub="Маленький светящийся курсор-помощник">
            <SwitchToggle v={t.clickyEnabled} on={() => setTweak("clickyEnabled", !t.clickyEnabled)} />
          </SettingRow>
          <SettingRow label="Режим" sub="«Умный» подсвечивает следующие шаги · «Тихий» не открывает пузыри сам">
            <div className="tab-pill">
              <button className={t.clickyMode === "smart" ? "active" : ""} onClick={() => setTweak("clickyMode", "smart")}>умный</button>
              <button className={t.clickyMode === "ghost" ? "active" : ""} onClick={() => setTweak("clickyMode", "ghost")}>тихий</button>
            </div>
          </SettingRow>
          <SettingRow label="Голосовой ввод" sub="Push-to-talk на клавише `" v="включено · 22 ответа за неделю" />
        </SettingSection>

        <SettingSection title="Конфиденциальность">
          <SettingRow label="Среда" v="Синтетическая · реальные клиентские данные недоступны" />
          <SettingRow label="Журнал событий" sub="Все ваши действия видны вашему наставнику и HR" v="включено · отключение невозможно" />
          <SettingRow label="Аналитика" sub="Агрегированные данные о времени и точности">
            <SwitchToggle v={true} on={() => {}} />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Уведомления">
          <SettingRow label="Заметки наставника" v="email + в приложении" />
          <SettingRow label="Награды и серии" v="только в приложении" />
          <SettingRow label="Новые модули" v="email · еженедельный дайджест" />
        </SettingSection>
      </div>
    </div>
  );
}

function SettingSection({ title, children }) {
  return (
    <div className="setting-section">
      <h3 className="h3 setting-title">{title}</h3>
      <div className="setting-rows">{children}</div>
    </div>
  );
}
function SettingRow({ label, sub, v, children }) {
  return (
    <div className="setting-row">
      <div>
        <b>{label}</b>
        {sub && <span>{sub}</span>}
      </div>
      <div className="setting-val">
        {children || <span className="setting-v">{v}</span>}
      </div>
    </div>
  );
}
function SwitchToggle({ v, on }) {
  return (
    <button className={`switch ${v ? "on" : ""}`} onClick={on} aria-pressed={v}>
      <i />
    </button>
  );
}

window.KnowledgePage = KnowledgePage;
window.BadgesPage = BadgesPage;
window.ProfilePage = ProfilePage;
window.SettingsPage = SettingsPage;


// ─────────────────────────────────────────────────────────────────────────────
// KB article drawer — synthetic full content per topic

const KB_ARTICLE_BODIES = {
  "KYC-PROC §2.1": {
    sections: [
      ["§2.1 Список документов", "Для верификации физлица-резидента требуются три документа: документ, удостоверяющий личность; подтверждение адреса; декларация источника средств (для крупных сумм)."],
      ["§2.2 Документ, удостоверяющий личность", "Принимаются: паспорт гражданина РУз, ID-карта, паспорт иностранца с действующей регистрацией. Срок действия — не менее 30 дней на момент верификации."],
      ["§2.3 Подтверждение адреса", "Квитанция за коммунальные услуги, выписка из банка, договор аренды. Документ должен быть выдан не более 90 дней назад."],
      ["§2.4 Декларация источника средств", "Обязательна при одиночном депозите ≥ 50 000 000 UZS, а также при совокупных депозитах за 7 дней, превышающих этот порог (см. AML-HB §4.7)."],
      ["§2.5 Биометрия", "С 2025 года — обязательное селфи с документом. OCR-сверка минимум на 95%."],
    ],
    examples: [
      "При сумме 49 999 999 UZS — декларация ИС НЕ требуется.",
      "При двух депозитах по 30 млн в течение 5 дней — суммарно 60 млн ⇒ ТРЕБУЕТСЯ.",
      "Если паспорт истекает через 25 дней — НЕ принимаем, просим перевыпустить."
    ],
  },
  "AML-HB §4.7": {
    sections: [
      ["§4.7 Порог декларации источника средств", "49 999 999 UZS — максимальная сумма одиночной операции без декларации. От 50 млн — обязательна."],
      ["§4.7.1 Совокупный порог", "Депозиты от одного клиента за 7 календарных дней суммируются. При превышении порога — декларация запрашивается задним числом."],
      ["§4.7.2 Подтверждающие документы", "2-НДФЛ за последний год · справка работодателя · договор продажи имущества · нотариально заверенный договор дарения."],
      ["§4.7.3 Срок действия декларации", "12 месяцев с даты подачи. После — обновление автоматическое при следующей крупной операции."],
    ],
    examples: [
      "Депозит 75 млн UZS, источник «зарплата» — 2-НДФЛ за 2024 год + декларация цели вклада.",
      "Депозит 200 млн UZS, источник «продажа квартиры» — нотариальный договор + платёжное поручение покупателя.",
      "Совокупно 4×15 млн за 6 дней — на 4-м платеже система запросит декларацию.",
    ],
  },
  "SANCTIONS-PROC §1.4": {
    sections: [
      ["§1.4 Действия при возможном совпадении", "Уверенность ≥ 50% — обязательная эскалация в комплаенс. Уверенность < 50% и без совпадения ДР — можно очистить с обоснованием."],
      ["§1.4.1 Запрещённые действия", "Игнорировать жёлтый флаг. Очищать без обоснования. Продолжать операцию до решения комплаенса."],
      ["§1.4.2 Сроки эскалации", "Тикет открывается в течение 15 минут. Решение комплаенса — в течение 2 рабочих часов."],
      ["§1.4.3 Override", "Игнорирование флага разрешено только старшим комплаенс-офицерам с документированным основанием. Действие фиксируется в журнале и проверяется аудитом."],
    ],
    examples: [
      "«Sokolov Ivan» с уверенностью 72% и ДР через 4 дня — ЭСКАЛАЦИЯ.",
      "«Petrov A.» с уверенностью 38% и разными ДР — можно очистить.",
      "«ABC Trading FZ-LLC» — точное совпадение названия и страны — БЛОКИРОВКА операции.",
    ],
  },
};

function KbArticleDrawer({ article, onClose, openChat }) {
  const body = KB_ARTICLE_BODIES[article.id] || {
    sections: [["§1 Общие положения", "Полный текст документа доступен в электронной системе банка. Этот блок — выдержка для тренировочной среды."]],
    examples: ["Тренировочные примеры появятся после ближайшего обновления контента."],
  };
  return (
    <Drawer
      eyebrow={`${article.tag} · ${article.fresh}`}
      title={article.title}
      onClose={onClose}
      foot={<>
        <button className="btn btn-ghost"><I.Doc size={13} /> PDF</button>
        <button className="btn btn-primary" onClick={() => { openChat(); onClose(); }}><I.Chat size={13} /> Спросить чат</button>
      </>}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="cite-mono">{article.id}</span>
        <span style={{ fontSize: 11.5, color: "var(--mute)" }}>{article.reads.toLocaleString("ru-RU")} прочтений</span>
      </div>

      <p className="sub">{article.excerpt}</p>

      <div>
        <h3 className="h3" style={{ marginBottom: 12 }}>Содержание</h3>
        <div className="hb-doc-body">
          {body.sections.map(([h, t], i) => (
            <section key={i}>
              <h4>{h}</h4>
              {t.split("\n").map((p, j) => <p key={j}>{p}</p>)}
            </section>
          ))}
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 12 }}>Учебные примеры</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {body.examples.map((ex, i) => (
            <div key={i} className="info-banner" style={{ alignItems: "flex-start" }}>
              <span className="mono" style={{ color: "var(--cobalt)", flexShrink: 0 }}>#{i + 1}</span>
              <span>{ex}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 8 }}>Связанные документы</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span className="cite-mono">KYC-PROC §2.1</span>
          <span className="cite-mono">AML-HB §4.7</span>
          <span className="cite-mono">OPS-ESC §2.1</span>
          <span className="cite-mono">SANCTIONS-PROC §1.4</span>
        </div>
      </div>
    </Drawer>
  );
}
window.KbArticleDrawer = KbArticleDrawer;
