// Chat.tsx — Knowledge Base RAG chat widget (RU/UZ/EN)
import React, { useState, useEffect, useRef } from 'react'
import { I } from './Icons'
import { useSettingsStore } from '../store/settingsStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CannedEntry {
  keyword: string
  answer: string[]
  citations: string[]
}

interface Message {
  role: 'bot' | 'user'
  text: string
  sources?: string[]
  streaming?: boolean
}

export interface ChatWidgetProps {
  open: boolean
  onClose: () => void
  lang?: string
}

// ─── Canned answers (15+ entries, keyword-matched) ────────────────────────────

const CANNED_ANSWERS: CannedEntry[] = [
  {
    keyword: 'kyc',
    answer: [
      'Для верификации KYC физлица-резидента нужны <b>три документа</b>:',
      '1. <b>Документ, удостоверяющий личность</b> — паспорт или ID-карта (с фотографией и датой рождения).',
      '2. <b>Подтверждение адреса</b> — квитанция за коммунальные услуги или договор аренды не старше 90 дней.',
      '3. <b>Декларация источника средств</b> — обязательна при любом депозите ≥ 50 000 000 UZS.',
    ],
    citations: ['KYC-PROC §2.1', 'AML-HB §4.3'],
  },
  {
    keyword: 'санкци',
    answer: [
      'Если санкционный скрининг вернул <b>возможное совпадение</b> (жёлтый флаг):',
      '1. <b>Не</b> продолжайте операцию.',
      '2. Откройте тикет комплаенса через меню <i>Комплаенс → Эскалация</i>.',
      '3. Уведомите наставника в течение 15 минут.',
      '4. Дождитесь решения комплаенса — не пытайтесь обойти флаг самостоятельно.',
    ],
    citations: ['SANCTIONS-PROC §1.4', 'OPS-ESC §2.1'],
  },
  {
    keyword: 'депозит',
    answer: [
      'Процедура открытия депозита:',
      '1. Проверьте KYC-статус клиента — должен быть «Активен».',
      '2. Если сумма ≥ 50 000 000 UZS — получите декларацию источника средств.',
      '3. Укажите срок, валюту и ставку согласно тарифной сетке.',
      '4. Распечатайте договор в двух экземплярах, получите подпись клиента.',
      '5. Зарегистрируйте депозит в CBS и выдайте квитанцию.',
    ],
    citations: ['DEPOSIT-OPS §2.1', 'AML-HB §4.3'],
  },
  {
    keyword: 'вклад',
    answer: [
      '<b>Порог вклада без декларации источника средств</b>: 49 999 999 UZS в одной операции.',
      'Совокупные вклады свыше порога в течение 7 дней суммируются и также требуют декларации (<span class="cite">AML-HB §4.7</span>).',
      'Досрочное расторжение: ставка пересчитывается по тарифу «до востребования», штраф за разрыв не предусмотрен.',
    ],
    citations: ['AML-HB §4.7', 'DEPOSIT-OPS §3.2'],
  },
  {
    keyword: 'перевод',
    answer: [
      'Внутренний перевод в UZS: проводится мгновенно, без лимитов (при наличии источника средств).',
      'Межбанковский перевод: обрабатывается в рамках клирингового окна (до 17:00 т/д).',
      'Для сумм свыше 100 000 000 UZS — необходимо одобрение комплаенс-офицера.',
    ],
    citations: ['TRANSFER-OPS §3.1', 'AML-HB §5.2'],
  },
  {
    keyword: 'swift',
    answer: [
      'Правила SWIFT-переводов:',
      '• <b>Физлица</b>: до $10 000 в сутки — без расширенной проверки. Свыше — AML-фильтр и декларация цели перевода.',
      '• <b>Юрлица</b>: без ограничений, но при первом переводе в страну из группы риска — комплаенс-проверка.',
      '• Все SWIFT-переводы проходят скрининг OFAC/EU/UN в режиме реального времени.',
      '• Если скрининг вернул «жёлтый» или «красный» флаг — остановить операцию и эскалировать.',
    ],
    citations: ['TRANSFER-OPS §6.4', 'SANCTIONS-PROC §1.2'],
  },
  {
    keyword: 'карта',
    answer: [
      'Выпуск карты клиенту:',
      '1. Проверьте KYC-статус — «Активен» (не «Черновик» и не «Заморожен»).',
      '2. Выберите тип карты (UZCARD / HUMO / VISA) согласно тарифам.',
      '3. Заполните заявку в CBS: ФИО, счёт привязки, пин-конверт.',
      '4. Срок изготовления: 1–3 рабочих дня.',
      '5. Выдача — лично в отделении при предъявлении паспорта; подпись в журнале выдачи.',
    ],
    citations: ['CARD-ISSUE §2.1', 'KYC-PROC §4.5'],
  },
  {
    keyword: 'aml',
    answer: [
      'Процедуры AML-отчётности:',
      '• <b>CTR (Currency Transaction Report)</b>: автоматически при операции ≥ эквивалент $10 000.',
      '• <b>STR (Suspicious Transaction Report)</b>: при подозрении на отмывание — независимо от суммы. Срок подачи — 3 рабочих дня.',
      '• Все отчёты направляются в CBU-AML через портал финмониторинга.',
      '• Уведомлять клиента о подаче STR <b>ЗАПРЕЩЕНО</b> (tipping-off).',
    ],
    citations: ['AML-HB §3.1', 'AML-HB §3.4'],
  },
  {
    keyword: 'амл',
    answer: [
      'Основания для подачи STR: дробление операций, нетипичные SWIFT-маршруты, несоответствие профилю, отказ от предоставления документов.',
      'После подачи STR — заморозить счёт до получения разрешения CBU-AML.',
    ],
    citations: ['AML-HB §3.3', 'AML-HB §4.7'],
  },
  {
    keyword: 'эскалаци',
    answer: [
      'Шаги эскалации операции:',
      '1. Остановите транзакцию — не нажимайте «Подтвердить».',
      '2. Откройте тикет в Jira: <i>Комплаенс → Эскалация</i>, укажите ID операции и причину.',
      '3. Уведомьте непосредственного наставника в Slack (#compliance-alert) в течение 15 мин.',
      '4. Дождитесь решения комплаенс-офицера — срок ответа 2 часа в рабочее время.',
      '5. Зафиксируйте решение в карточке клиента.',
    ],
    citations: ['OPS-ESC §2.1', 'SANCTIONS-PROC §1.4'],
  },
  {
    keyword: 'escalate',
    answer: [
      'Escalation steps:',
      '1. Stop the transaction — do not confirm.',
      '2. Open a Jira ticket: <i>Compliance → Escalation</i> with the operation ID and reason.',
      '3. Notify your supervisor in Slack (#compliance-alert) within 15 minutes.',
      '4. Await the compliance officer decision — SLA 2 hours during business hours.',
      '5. Record the outcome in the customer card.',
    ],
    citations: ['OPS-ESC §2.1', 'SANCTIONS-PROC §1.4'],
  },
  {
    keyword: 'пдл',
    answer: [
      'Порядок работы с ПДЛ (публичными должностными лицами):',
      '1. При открытии счёта или первом обращении — проверьте по реестру PEP-HB.',
      '2. ПДЛ и их близкие родственники относятся к категории <b>Высокий риск</b>.',
      '3. Обязателен усиленный due diligence (EDD): источник средств, деловая цель.',
      '4. Все операции ПДЛ свыше 5 000 000 UZS — под мониторингом комплаенса.',
      '5. Ежегодная переоценка профиля риска.',
    ],
    citations: ['PEP-HB §1.1', 'AML-HB §6.2'],
  },
  {
    keyword: 'пеп',
    answer: [
      'PEP (Politically Exposed Person) — то же, что ПДЛ.',
      'Ключевое правило: если уровень совпадения при скрининге >50% — обязательна эскалация, даже если вы не уверены.',
      'Пост-PEP: статус сохраняется 12 месяцев после ухода с должности.',
    ],
    citations: ['PEP-HB §2.3', 'SANCTIONS-PROC §1.3'],
  },
  {
    keyword: 'pep',
    answer: [
      'PEP screening rule: if match confidence >50% — escalate immediately.',
      'PEP accounts require Enhanced Due Diligence (EDD) and senior manager approval.',
      'Post-PEP status: maintained for 12 months after leaving public office.',
    ],
    citations: ['PEP-HB §2.3', 'SANCTIONS-PROC §1.3'],
  },
  {
    keyword: 'документ',
    answer: [
      'Список обязательных документов для открытия счёта (физлицо):',
      '• Паспорт или ID-карта (оригинал + копия)',
      '• Подтверждение адреса (коммунальный счёт, не старше 90 дней)',
      '• ИНН (при наличии)',
      '• Для нерезидентов: нотариально заверенный перевод паспорта',
      '• При депозите ≥ 50 млн UZS: декларация источника средств',
    ],
    citations: ['KYC-PROC §2.1', 'KYC-PROC §3.4'],
  },
  {
    keyword: 'лимит',
    answer: [
      'Лимиты по операциям:',
      '• Наличные без идентификации: до 5 000 000 UZS',
      '• Депозит без декларации ИС: до 49 999 999 UZS',
      '• SWIFT (физлицо): до $10 000/сут без AML-фильтра',
      '• Карточные операции (день): до 30 000 000 UZS (зависит от тарифа)',
      '• CTR-порог: эквивалент $10 000 в одной операции',
    ],
    citations: ['AML-HB §4.7', 'TRANSFER-OPS §6.4', 'CARD-ISSUE §5.1'],
  },
  {
    keyword: 'порог',
    answer: [
      'Пороговые значения для AML/CTR:',
      '• CTR (обязательный отчёт): ≥ эквивалент $10 000 в одной операции.',
      '• Совокупный мониторинг: операции одного клиента за 7 дней свыше $20 000 — расширенный мониторинг.',
      '• «Умный» порог: система сигнализирует при нетипичном отклонении от среднемесячного оборота >300%.',
    ],
    citations: ['AML-HB §4.1', 'AML-HB §4.7'],
  },
  {
    keyword: 'курс',
    answer: [
      'Правила конвертации валют:',
      '• Официальный курс CBU обновляется ежедневно в 09:00.',
      '• Клиентский обменный курс = курс CBU ± спред (см. тарифы).',
      '• Конвертация для переводов производится по курсу на момент подтверждения операции.',
      '• Для корпоративных клиентов — индивидуальный курс согласовывается с Treasury.',
    ],
    citations: ['FX-RATE §2.1', 'FX-RATE §3.2'],
  },
  {
    keyword: 'валюта',
    answer: [
      'Поддерживаемые валюты: UZS, USD, EUR, RUB (ограничено), GBP.',
      'Мультивалютный счёт: до 3 валют на одном клиенте (физлицо).',
      'Остатки в иностранной валюте переоцениваются ежедневно по курсу CBU.',
    ],
    citations: ['FX-RATE §1.1', 'DEPOSIT-OPS §1.3'],
  },
  {
    keyword: 'открыть счёт',
    answer: [
      'Шаги для открытия текущего счёта:',
      '1. Встречайте клиента, проверьте паспорт.',
      '2. Запустите KYC-верификацию в CBS (KYC-PROC §2).',
      '3. Проведите санкционный скрининг по имени и ИНН.',
      '4. Заполните анкету клиента: цель счёта, источник средств, деловая деятельность.',
      '5. Распечатайте и подпишите договор банковского обслуживания.',
      '6. Активируйте счёт в CBS — статус изменится на «Активен».',
    ],
    citations: ['KYC-PROC §2.1', 'KYC-PROC §5.1'],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHAT_SEED: Message[] = [
  {
    role: 'bot',
    text: 'Привет! Я — <b>помощник по базе знаний Mentora</b>. Спросите про процедуры KYC, лимиты счетов, санкционные проверки или что угодно из банковского справочника. Все ответы — только из проиндексированных документов, ничего не выдумываю.',
    sources: [],
  },
]

function findCanned(q: string): CannedEntry | null {
  const ql = q.toLowerCase()
  return CANNED_ANSWERS.find(entry => ql.includes(entry.keyword)) ?? null
}

function typewrite(
  setText: (s: string) => void,
  full: string,
  done?: () => void,
): () => void {
  let i = 0
  setText('')
  const id = setInterval(() => {
    i += Math.max(1, Math.floor(full.length / 60))
    if (i >= full.length) {
      setText(full)
      clearInterval(id)
      done?.()
    } else {
      setText(full.slice(0, i))
    }
  }, 18)
  return () => clearInterval(id)
}

// ─── ChatMessage ──────────────────────────────────────────────────────────────

interface ChatMessageProps {
  m: Message
}

function ChatMessage({ m }: ChatMessageProps) {
  const [shown, setShown] = useState(m.streaming ? '' : m.text)

  useEffect(() => {
    if (m.streaming) return typewrite(setShown, m.text)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (m.role === 'user') {
    return <div className="chat-msg user">{m.text}</div>
  }

  const paras = (m.streaming ? shown : m.text).split('\n\n')
  const showSources = m.sources && m.sources.length > 0
  const streamDone = m.streaming && shown === m.text

  return (
    <div className="chat-msg bot">
      {paras.map((p, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
      ))}
      {showSources && (!m.streaming || streamDone) && (
        <div className="sources">
          <div className="sources-label">Источники</div>
          {m.sources!.map(s => (
            <span key={s} className="cite">{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ChatWidget ───────────────────────────────────────────────────────────────

export function ChatWidget({ open, onClose, lang: langProp }: ChatWidgetProps) {
  const storeLang = useSettingsStore(s => s.lang)
  const lang = langProp ?? storeLang

  const [messages, setMessages] = useState<Message[]>(CHAT_SEED)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, typing])

  const ask = (q: string) => {
    if (!q.trim()) return
    setMessages(m => [...m, { role: 'user', text: q }])
    setInput('')
    setTyping(true)

    const match = findCanned(q)
    const canned = match ?? {
      answer: [
        `Не нашёл уверенного совпадения по запросу «${q}» в базе знаний.`,
        'Попробуйте предложенные вопросы или переформулируйте. По политике я отвечаю только по проиндексированным документам — никогда свободным текстом.',
      ],
      citations: ['KB-FALLBACK §0'],
    }

    setTimeout(() => {
      setTyping(false)
      setMessages(m => [
        ...m,
        {
          role: 'bot',
          text: canned.answer.join('\n\n'),
          sources: canned.citations,
          streaming: true,
        },
      ])
    }, 850 + Math.random() * 500)
  }

  if (!open) return null

  const langName =
    lang === 'RU' ? 'Русский' : lang === 'UZ' ? 'Oʻzbekcha' : 'English'
  const placeholder =
    lang === 'RU'
      ? 'Спросите из справочника…'
      : lang === 'UZ'
        ? 'Qoʻllanmadan soʻrang…'
        : 'Ask the handbook…'

  return (
    <div className="chat-panel" role="dialog" aria-label="База знаний">
      <div className="chat-hd">
        <span className="pulse" />
        <div>
          <b>База знаний</b>
          <small>С опорой на документы · {langName} · ~1.2с</small>
        </div>
        <button className="close" onClick={onClose} aria-label="Закрыть">
          <I.X size={14} />
        </button>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <ChatMessage key={i} m={m} />
        ))}
        {typing && (
          <div className="chat-msg typing">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <div className="chat-suggest">
        {CANNED_ANSWERS.slice(0, 6).map(entry => {
          const label = entry.answer[0].replace(/<[^>]+>/g, '').slice(0, 48)
          return (
            <button key={entry.keyword} onClick={() => ask(entry.keyword)}>
              {label}…
            </button>
          )
        })}
      </div>

      <div className="chat-input">
        <button className="lang" title="Сменить язык">
          {lang}
        </button>
        <input
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') ask(input)
          }}
        />
        <button
          onClick={() => ask(input)}
          disabled={!input.trim()}
          aria-label="Отправить"
        >
          <I.Send size={15} />
        </button>
      </div>
    </div>
  )
}

export default ChatWidget
