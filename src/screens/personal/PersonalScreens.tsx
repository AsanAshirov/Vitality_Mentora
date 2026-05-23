// PersonalScreens.tsx — Knowledge, Badges, Profile, Settings pages
import React, { useState, useMemo, useEffect } from 'react'
import { useUserStore } from '../../store/userStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useMessagesStore } from '../../store/messagesStore'
import { SYNTH } from '../../data/synth'
import { I } from '../../components/Icons'
import { BADGE_DEFS } from '../../lib/badges'
import { levelProgress, xpToNextLevel, LEVEL_NAMES, computeLevel } from '../../lib/progression'

// ─────────────────────────────────────────────────────────────────────────────
// Drawer (local, self-contained)

interface DrawerProps {
  title: string
  eyebrow?: string
  onClose: () => void
  foot?: React.ReactNode
  children: React.ReactNode
}

function Drawer({ title, eyebrow, onClose, foot, children }: DrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KB article bodies — full content for all 9 articles

interface KbArticleBody {
  sections: [string, string][]
  examples: string[]
}

const KB_ARTICLE_BODIES: Record<string, KbArticleBody> = {
  'KYC-PROC §2.1': {
    sections: [
      ['§2.1 Список документов', 'Для верификации физлица-резидента требуются три документа: документ, удостоверяющий личность; подтверждение адреса; декларация источника средств (для крупных сумм).'],
      ['§2.2 Документ, удостоверяющий личность', 'Принимаются: паспорт гражданина РУз, ID-карта, паспорт иностранца с действующей регистрацией. Срок действия — не менее 30 дней на момент верификации.'],
      ['§2.3 Подтверждение адреса', 'Квитанция за коммунальные услуги, выписка из банка, договор аренды. Документ должен быть выдан не более 90 дней назад.'],
      ['§2.4 Декларация источника средств', 'Обязательна при одиночном депозите ≥ 50 000 000 UZS, а также при совокупных депозитах за 7 дней, превышающих этот порог (см. AML-HB §4.7).'],
      ['§2.5 Биометрия', 'С 2025 года — обязательное селфи с документом. OCR-сверка минимум на 95%.'],
    ],
    examples: [
      'При сумме 49 999 999 UZS — декларация ИС НЕ требуется.',
      'При двух депозитах по 30 млн в течение 5 дней — суммарно 60 млн ⇒ ТРЕБУЕТСЯ.',
      'Если паспорт истекает через 25 дней — НЕ принимаем, просим перевыпустить.',
    ],
  },
  'AML-HB §4.7': {
    sections: [
      ['§4.7 Порог декларации источника средств', '49 999 999 UZS — максимальная сумма одиночной операции без декларации. От 50 млн — обязательна.'],
      ['§4.7.1 Совокупный порог', 'Депозиты от одного клиента за 7 календарных дней суммируются. При превышении порога — декларация запрашивается задним числом.'],
      ['§4.7.2 Подтверждающие документы', '2-НДФЛ за последний год · справка работодателя · договор продажи имущества · нотариально заверенный договор дарения.'],
      ['§4.7.3 Срок действия декларации', '12 месяцев с даты подачи. После — обновление автоматическое при следующей крупной операции.'],
    ],
    examples: [
      'Депозит 75 млн UZS, источник «зарплата» — 2-НДФЛ за 2024 год + декларация цели вклада.',
      'Депозит 200 млн UZS, источник «продажа квартиры» — нотариальный договор + платёжное поручение покупателя.',
      'Совокупно 4×15 млн за 6 дней — на 4-м платеже система запросит декларацию.',
    ],
  },
  'SANCTIONS-PROC §1.4': {
    sections: [
      ['§1.4 Действия при возможном совпадении', 'Уверенность ≥ 50% — обязательная эскалация в комплаенс. Уверенность < 50% и без совпадения ДР — можно очистить с обоснованием.'],
      ['§1.4.1 Запрещённые действия', 'Игнорировать жёлтый флаг. Очищать без обоснования. Продолжать операцию до решения комплаенса.'],
      ['§1.4.2 Сроки эскалации', 'Тикет открывается в течение 15 минут. Решение комплаенса — в течение 2 рабочих часов.'],
      ['§1.4.3 Override', 'Игнорирование флага разрешено только старшим комплаенс-офицерам с документированным основанием. Действие фиксируется в журнале и проверяется аудитом.'],
    ],
    examples: [
      '«Sokolov Ivan» с уверенностью 72% и ДР через 4 дня — ЭСКАЛАЦИЯ.',
      '«Petrov A.» с уверенностью 38% и разными ДР — можно очистить.',
      '«ABC Trading FZ-LLC» — точное совпадение названия и страны — БЛОКИРОВКА операции.',
    ],
  },
  'OPS-ESC §2.1': {
    sections: [
      ['§1 Когда эскалировать', 'Эскалация обязательна при: совпадении в санкционных списках (уверенность ≥ 50%); подозрительных операциях, превышающих AML-пороги; несоответствии документов, которое невозможно устранить на месте; угрозах или нестандартном поведении клиента.'],
      ['§2 Уровни эскалации', 'Уровень 1 — старший операционист отделения. Уровень 2 — дежурный комплаенс-офицер. Уровень 3 — руководитель службы комплаенс. Уровень 4 — специальный комитет (критические инциденты). Каждый уровень привлекается только при невозможности решить на предыдущем.'],
      ['§3 Время реагирования', 'Санкционный хит — тикет в течение 15 минут, решение за 2 рабочих часа. Подозрительная операция — эскалация в течение 2 часов, решение за 24 часа. Несоответствие документов — уведомление в течение 24 часов. Прочие несоответствия — до 48 рабочих часов.'],
      ['§4 Документирование', 'Каждый факт эскалации регистрируется в системе с указанием: номера операции или клиента; типа несоответствия; ФИО эскалирующего; времени обнаружения и передачи. Незадокументированная эскалация приравнивается к её отсутствию.'],
    ],
    examples: [
      'Клиент настаивает на операции после жёлтого флага — немедленная эскалация на Уровень 2.',
      'Документ адреса — 95 дней назад, клиент не может предоставить свежий — эскалация на Уровень 1 для согласования исключения.',
      'Совокупные депозиты за неделю превысили порог в момент 4-й операции — эскалация + запрос декларации ИС.',
    ],
  },
  'DEPOSIT-OPS §3.2': {
    sections: [
      ['§1 Открытие вклада', 'Для открытия вклада необходимы: верифицированная личность (KYC-статус «Одобрен»), действующий текущий счёт в банке, заявление на открытие вклада по форме DF-01. При сумме ≥ 50 млн UZS — дополнительно декларация источника средств.'],
      ['§2 Требования SOF (≥50M UZS)', 'Декларация источника средств (SOF) обязательна при одноразовом взносе ≥ 50 000 000 UZS или при совокупных взносах от одного клиента за 7 дней ≥ 50 000 000 UZS. Принимаемые документы: 2-НДФЛ, справка работодателя, договор продажи имущества, нотариально заверенное дарение. Отсутствие SOF блокирует открытие.'],
      ['§3 Тарифная линейка', '3 месяца — 14% годовых. 6 месяцев — 16% годовых. 12 месяцев — 18% годовых. 24 месяца — 19% годовых. Ставки действуют на дату открытия и фиксируются на весь срок. Капитализация процентов — ежемесячная или в конце срока по выбору клиента.'],
      ['§4 Досрочное расторжение', 'До 30 дней с момента открытия — проценты не начисляются. От 30 до 90 дней — 50% от договорной ставки за фактический срок. После 90 дней — полная ставка за фактический срок. Комиссия за досрочное расторжение — 0,1% от суммы вклада, минимум 10 000 UZS.'],
    ],
    examples: [
      'Вклад 80 млн UZS на 12 месяцев — требуется SOF. Клиент предоставляет 2-НДФЛ, начисление 18% годовых.',
      'Вклад закрыт через 45 дней — начисляется 50% от ставки за 45 дней + комиссия 0,1%.',
      'Вклад 30 млн UZS на 6 месяцев — SOF не нужен, ставка 16%, капитализация ежемесячно.',
    ],
  },
  'TRANSFER-OPS §6.4': {
    sections: [
      ['§1 Внутренние переводы', 'Переводы между счетами одного клиента или между клиентами банка — мгновенные, без комиссии. Суточный лимит для физлиц: 100 000 000 UZS без дополнительного подтверждения. При превышении — OTP + подтверждение цели.'],
      ['§2 IBAN-переводы', 'Переводы на счета других банков внутри страны. Время зачисления: 1–3 рабочих дня. Комиссия: 0,1% от суммы, минимум 5 000 UZS, максимум 500 000 UZS. Требуется IBAN получателя, ФИО и ИНН при суммах ≥ 10 000 000 UZS.'],
      ['§3 SWIFT (лимиты, документы)', 'Для физлиц: до $10 000 в сутки без расширенной проверки. Свыше $10 000 — расширенная AML-проверка, декларация цели, документы подтверждения (инвойс, договор). Запрещённые направления: страны в санкционном списке ЦБ РУз. Срок исполнения: 1–5 банковских дней.'],
      ['§4 AML-мониторинг', 'Автоматическая система анализирует каждый перевод по алгоритмам типологий отмывания. Пороги: одиночный перевод ≥ 50 млн UZS; совокупные переводы одного клиента за день ≥ 100 млн UZS; перевод в страну с высоким риском. При срабатывании флага — обязательная пауза и эскалация в комплаенс.'],
    ],
    examples: [
      'SWIFT на $15 000 в США — расширенная AML-проверка, требуется инвойс или договор.',
      'Внутренний перевод 200 млн UZS — превышение лимита, нужно OTP + цель.',
      'Перевод на 60 млн UZS в другой банк — AML-флаг, пауза, эскалация в комплаенс.',
    ],
  },
  'CARD-ISSUE §2.1': {
    sections: [
      ['§1 Типы карт', 'UZCARD — национальная дебетовая карта в UZS. HUMO — национальная дебетовая карта в UZS (альтернативная сеть). VISA Debit/Credit — международная карта, мультивалютная. Mastercard — международная карта, принимается в 210+ странах. Для нерезидентов — только VISA/Mastercard при наличии действующей регистрации.'],
      ['§2 Процедура выпуска', 'Клиент должен иметь верифицированный счёт в банке. Заявление на выпуск — форма CI-02. Для VISA/Mastercard — дополнительно заявление на тарифный пакет. Карта привязывается к основному счёту; возможна привязка к дополнительному счёту по заявлению. PIN устанавливается клиентом самостоятельно через банкомат или приложение.'],
      ['§3 Лимиты', 'UZCARD/HUMO: снятие наличных — до 5 000 000 UZS в сутки; безналичные операции — до 20 000 000 UZS в сутки. VISA/Mastercard Debit: снятие — $2 000 в сутки; покупки — $5 000 в сутки. VISA/Mastercard Credit: кредитный лимит по решению кредитного комитета; минимум 500 000 UZS, максимум 30 000 000 UZS.'],
      ['§4 Доставка', 'UZCARD/HUMO: изготовление и выдача в отделении — до 3 рабочих дней. VISA/Mastercard: изготовление — до 7 рабочих дней; доставка курьером — дополнительно 1–3 дня. Курьерская доставка доступна только в пределах Ташкента и областных центров.'],
      ['§5 Активация', 'Активация в банкомате: вставить карту, ввести PIN, подтвердить активацию. Активация через мобильное приложение: раздел «Карты» → «Активировать». Активация по телефону: горячая линия 1234. Карта автоматически блокируется после 3 неудачных попыток ввода PIN.'],
    ],
    examples: [
      'Клиент хочет VISA Debit — проверяем счёт, берём форму CI-02, срок 7 + до 3 дней доставки.',
      'UZCARD на имя нерезидента — отказываем, предлагаем VISA/Mastercard.',
      'Клиент забыл PIN — направляем в банкомат для смены или в контакт-центр.',
    ],
  },
  'FX-RATE §1.0': {
    sections: [
      ['§1 Утверждённые курсы', 'Внутренние курсы конвертации утверждаются ежедневно в 09:00 ташкентского времени. Источник: BankSandbox → модуль FX → раздел «Текущие курсы». Разница с официальным курсом ЦБ РУз: ±0,5–1,5% в зависимости от валюты. Использование неутверждённых курсов запрещено и фиксируется как нарушение.'],
      ['§2 Конвертация', 'Минимальная сумма конвертации: 100 000 UZS или эквивалент. Комиссия за конвертацию: 0% для UZS↔USD при суммах до $5 000; 0,3% для прочих пар или при превышении лимита. Конвертация проводится только по утверждённому курсу дня. Результат зачисляется на счёт клиента немедленно.'],
      ['§3 FX-счета', 'Клиент может открыть валютный счёт в USD, EUR, RUB, CNY. Требования: верифицированный UZS-счёт, заявление FX-01. Для EUR и CNY — расширенная документация по цели открытия. Остатки по FX-счетам страхуются в рамках системы гарантирования вкладов в UZS-эквиваленте.'],
      ['§4 Отчётность', 'Все конвертационные операции автоматически отражаются в FX-журнале. Операции свыше $10 000 или эквивалента — обязательная отметка в AML-системе. Ежедневный отчёт по FX направляется в казначейство до 17:00. Расхождения между фактическим и утверждённым курсом — немедленная эскалация.'],
    ],
    examples: [
      'Клиент меняет 5 000 000 UZS на USD — применяем утверждённый курс дня, комиссия 0%.',
      'Конвертация $15 000 из USD в EUR — комиссия 0,3% от суммы + AML-отметка.',
      'Курс изменился после 09:00 — операция по курсу начала дня, новый курс с завтра.',
    ],
  },
  'PEP-HB §1.0': {
    sections: [
      ['§1 Идентификация ПДЛ', 'Политически значимое лицо (ПДЛ) — лицо, занимающее или занимавшее значимую публичную должность в течение последних 12 месяцев: президент, министр, депутат, судья, прокурор, высокопоставленный военный, руководитель госкорпорации. Также — близкие родственники и деловые партнёры ПДЛ.'],
      ['§2 Расширенная проверка', 'При выявлении ПДЛ или связанного лица: немедленная пауза операции; уведомление дежурного комплаенс-офицера; запрос расширенного пакета документов (декларация доходов, документы об источнике средств, справка о должности). Открытие отношений с ПДЛ — только с письменного одобрения руководителя службы комплаенс.'],
      ['§3 Мониторинг', 'Счета ПДЛ находятся на расширенном мониторинге. Транзакции ≥ 10 000 000 UZS — автоматический флаг в AML-системе. Ежеквартальный пересмотр статуса. При выходе клиента из категории ПДЛ — снятие статуса через 12 месяцев. Любое подозрительное поведение — STR (отчёт о подозрительной транзакции) в течение 5 рабочих дней.'],
    ],
    examples: [
      'Клиент — действующий депутат парламента: все счета на расширенном мониторинге, транзакции флагируются от 10 млн.',
      'Клиент — супруга экс-министра (ушёл 8 месяцев назад): статус ПДЛ-связанный, расширенная проверка обязательна.',
      'ПДЛ хочет депозит на 200 млн UZS: SOF + одобрение руководителя комплаенс + расширенная проверка.',
    ],
  },
  'INCIDENT-RESP §3.2': {
    sections: [
      ['§1 Классификация', 'Инцидент — любое событие, нарушающее нормальный операционный процесс или создающее риск нарушения. Критический (P1): подозрение на утечку данных, несанкционированный доступ, ошибка перевода > 1 млн UZS. Высокий (P2): некорректная идентификация клиента, пропущенный санкционный флаг. Средний (P3): технический сбой, задержка операции. Низкий (P4): прочие несоответствия процедурам.'],
      ['§2 Эскалация', 'P1 — немедленно, горячая линия Compliance + руководитель отделения. P2 — в течение 30 минут, дежурный комплаенс-офицер. P3 — в течение 2 часов, старший операционист. P4 — в рабочем порядке, до конца рабочего дня. Канал для всех уровней: система тикетов IncidentTrack или горячая линия 1234 (только P1–P2).'],
      ['§3 Сроки отчётности', 'P1 — предварительный отчёт через 2 часа; полный отчёт через 24 часа; уведомление регулятора (при необходимости) через 72 часа. P2 — отчёт через 4 рабочих часа. P3 — отчёт до конца рабочего дня. P4 — отчёт в недельном своде. Все отчёты хранятся 5 лет.'],
      ['§4 Восстановление', 'Ошибочный перевод: немедленная заморозка суммы (при возможности); запрос на возврат через межбанковскую систему; уведомление клиента. Утечка данных: изоляция скомпрометированных систем; смена учётных данных затронутых пользователей; уведомление пострадавших клиентов. Каждый инцидент завершается разбором и планом устранения причин.'],
    ],
    examples: [
      'Перевод ушёл не тому получателю на 500 000 UZS — P3, старший операционист, заморозка и возврат.',
      'Операционист пропустил санкционный флаг с уверенностью 80% — P2, немедленно комплаенс.',
      'Подозрение на несанкционированный доступ к системе — P1, горячая линия + руководитель + блокировка сессий.',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// KB Article Drawer

interface KbArticle {
  id: string
  title: string
  excerpt: string
  tag: string
  reads: number
  fresh: string
}

interface KbArticleDrawerProps {
  article: KbArticle
  onClose: () => void
  openChat: () => void
}

function KbArticleDrawer({ article, onClose, openChat }: KbArticleDrawerProps) {
  const body: KbArticleBody = KB_ARTICLE_BODIES[article.id] ?? {
    sections: [['§1 Общие положения', 'Полный текст документа доступен в электронной системе банка. Этот блок — выдержка для тренировочной среды.']],
    examples: ['Тренировочные примеры появятся после ближайшего обновления контента.'],
  }

  const handleAskChat = () => {
    useSettingsStore.getState().setPanelTab('chat')
    useSettingsStore.getState().setPanelOpen(true)
    onClose()
  }

  return (
    <Drawer
      eyebrow={`${article.tag} · ${article.fresh}`}
      title={article.title}
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={() => window.print()}><I.Doc size={13} /> PDF</button>
          <button className="btn btn-primary" onClick={handleAskChat}><I.Chat size={13} /> Спросить чат</button>
        </>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="cite-mono">{article.id}</span>
        <span style={{ fontSize: 11.5, color: 'var(--mute)' }}>{article.reads.toLocaleString('ru-RU')} прочтений</span>
      </div>

      <p className="sub">{article.excerpt}</p>

      <div>
        <h3 className="h3" style={{ marginBottom: 12 }}>Содержание</h3>
        <div className="hb-doc-body">
          {body.sections.map(([h, t], i) => (
            <section key={i}>
              <h4>{h}</h4>
              {t.split('\n').map((p, j) => <p key={j}>{p}</p>)}
            </section>
          ))}
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 12 }}>Учебные примеры</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {body.examples.map((ex, i) => (
            <div key={i} className="info-banner" style={{ alignItems: 'flex-start' }}>
              <span className="mono" style={{ color: 'var(--cobalt)', flexShrink: 0 }}>#{i + 1}</span>
              <span>{ex}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="h3" style={{ marginBottom: 8 }}>Связанные документы</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span className="cite-mono">KYC-PROC §2.1</span>
          <span className="cite-mono">AML-HB §4.7</span>
          <span className="cite-mono">OPS-ESC §2.1</span>
          <span className="cite-mono">SANCTIONS-PROC §1.4</span>
        </div>
      </div>
    </Drawer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgePage

export function KnowledgePage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<KbArticle | null>(null)

  const openChat = () => {
    useSettingsStore.getState().setPanelTab('chat')
    useSettingsStore.getState().setPanelOpen(true)
  }

  const articles: KbArticle[] = [
    { id: 'KYC-PROC §2.1',       title: 'Какие документы нужны для KYC?',              excerpt: 'Паспорт/ID-карта, подтверждение адреса не старше 90 дней, декларация ИС при депозите ≥ 50 млн UZS.',                   tag: 'KYC',        reads: 1240, fresh: '2 нед' },
    { id: 'AML-HB §4.7',         title: 'Порог декларации источника средств',           excerpt: '49 999 999 UZS — без декларации. Совокупные депозиты за 7 дней суммируются.',                                           tag: 'AML',        reads: 982,  fresh: '1 нед' },
    { id: 'SANCTIONS-PROC §1.4', title: 'Что делать с возможным санкционным хитом',     excerpt: '≥50% уверенности ⇒ эскалация в комплаенс. Игнор разрешён только старшим офицерам.',                                    tag: 'Sanctions',  reads: 1610, fresh: '3 дн' },
    { id: 'DEPOSIT-OPS §3.2',    title: 'Сроки досрочного закрытия вклада',             excerpt: 'До 30 дней — без начисления процентов. От 30 до 90 — 50% ставки. После 90 — полная ставка.',                           tag: 'Deposits',   reads: 740,  fresh: '1 мес' },
    { id: 'TRANSFER-OPS §6.4',   title: 'Лимиты SWIFT-переводов физлиц',               excerpt: '$10 000 в сутки без дополнительной проверки. Свыше — расширенная AML-проверка и декларация цели.',                     tag: 'Transfers',  reads: 1102, fresh: '4 дн' },
    { id: 'CARD-ISSUE §2.1',     title: 'Сколько времени занимает выпуск карты?',       excerpt: 'UZCARD/HUMO — до 3 рабочих дней. VISA/Mastercard — до 10 дней с курьерской доставкой.',                              tag: 'Cards',      reads: 612,  fresh: '3 нед' },
    { id: 'FX-RATE §1.0',        title: 'Где смотреть актуальные курсы конвертации?',   excerpt: 'BankSandbox → FX → Курсы. Внутренний курс отличается от ЦБ на ±0.5–1.5%.',                                           tag: 'FX',         reads: 488,  fresh: 'сегодня' },
    { id: 'INCIDENT-RESP §3.2',  title: 'Что считается инцидентом и кому сообщать',     excerpt: 'Любое подозрение на утечку, ошибку перевода или некорректную идентификацию. Канал — горячая линия Compliance.',        tag: 'Security',   reads: 1380, fresh: '1 нед' },
    { id: 'OPS-ESC §2.1',        title: 'Эскалация: когда и как',                       excerpt: '15 минут — для санкционных хитов. 2 часа — для подозрительных операций. 24 часа — для прочих несоответствий.',         tag: 'Operations', reads: 920,  fresh: '2 нед' },
  ]

  const rows = useMemo(() =>
    articles.filter(a =>
      !query ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(query.toLowerCase())
    ),
    [query]
  )

  return (
    <div className="page screen-in" data-screen-label="Knowledge">
      <p className="h-eyebrow">База знаний · с опорой на документы</p>
      <h1 className="h1">Спросите <em>справочник</em>.</h1>
      <p className="sub" style={{ marginTop: 8, maxWidth: 620 }}>
        Все ответы привязаны к параграфам внутренних процедур. Если в индексе нет ответа — система так и скажет, а не выдумает.
      </p>

      <div className="kb-search">
        <I.Search size={16} />
        <input
          placeholder="Поиск по справочнику · «лимит SWIFT», «эскалация санкции»…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={openChat}><I.Chat size={13} /> Открыть чат</button>
      </div>

      <div className="kb-topics">
        {['KYC', 'AML', 'Sanctions', 'Deposits', 'Transfers', 'Cards', 'FX', 'Security'].map((t, i) => (
          <button key={t} className="kb-topic" onClick={() => setQuery(t)}>
            <span className={`kb-topic-mark kb-topic-${i % 4}`} />
            {t}
          </button>
        ))}
      </div>

      <h2 className="h2" style={{ marginTop: 28, marginBottom: 12 }}>Часто спрашивают</h2>
      <div className="kb-list">
        {rows.map((a) => (
          <button
            className="kb-row"
            key={a.id}
            onClick={() => setSelected(a)}
            style={{ font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--surface)' }}
          >
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

      {selected && (
        <KbArticleDrawer
          article={selected}
          onClose={() => setSelected(null)}
          openChat={openChat}
        />
      )}

      <div className="kb-cta">
        <div>
          <b>Не нашли ответ?</b>
          <small>Можно задать вопрос в чат — он ответит из тех же документов, либо честно скажет «нет в индексе».</small>
        </div>
        <button className="btn btn-primary" onClick={openChat}><I.Chat size={13} /> Спросить помощника</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BadgeDrawer

interface BadgeDrawerItem {
  id: string
  name: string
  glyph: string
  desc: string
  cls: string
  cat: string
  unlocked: boolean
  date?: string
  progressLabel?: string
}

function BadgeDrawer({ badge, onClose }: { badge: BadgeDrawerItem; onClose: () => void }) {
  return (
    <Drawer
      eyebrow={`Награда · ${badge.cat}`}
      title={badge.name}
      onClose={onClose}
      foot={!badge.unlocked ? <button className="btn btn-primary">Показать путь</button> : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}>
        <div className={`badge-glyph ${badge.cls}`} style={{ width: 72, height: 72, fontSize: 32 }}>{badge.glyph}</div>
        <div>
          <b style={{ fontSize: 16, fontWeight: 500 }}>{badge.name}</b>
          <p style={{ fontSize: 13, color: 'var(--mute)', margin: '4px 0 0' }}>{badge.desc}</p>
          {badge.unlocked
            ? <span className="badge-meta good" style={{ marginTop: 8 }}>Получено · {badge.date}</span>
            : badge.progressLabel
              ? <span className="badge-meta cobalt" style={{ marginTop: 8 }}>{badge.progressLabel}</span>
              : <span className="badge-meta mute" style={{ marginTop: 8 }}><I.Lock size={10} /> Заблокировано</span>
          }
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
            <div className="log-row" style={{ gridTemplateColumns: '110px 18px 1fr auto' }}>
              <span className="mono mute-x">{badge.date}</span>
              <span className="log-dot" />
              <span><b>Система</b> выдала награду «Alexey П.»</span>
              <span className="tag good">выдача</span>
            </div>
            <div className="log-row" style={{ gridTemplateColumns: '110px 18px 1fr auto' }}>
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
        <div className="badges-grid-full" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { e: '💫', n: 'Спортсмен', d: '5 сценариев за день' },
            { e: '🎯', n: 'Снайпер', d: '100% без пересдачи' },
            { e: '🚀', n: 'Пионер', d: 'Первый в новом модуле' },
          ].map((r, i) => (
            <div className="badge-full locked" key={i}>
              <div className="badge-glyph">{r.e}</div>
              <b>{r.n}</b><span>{r.d}</span>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BadgesPage

// Category label mapping from BADGE_DEFS categories
const CAT_LABELS: Record<string, string> = {
  ops: 'Операции',
  quality: 'Качество',
  compliance: 'Комплаенс',
  streak: 'Привычка',
  community: 'Сообщество',
}

// CSS class mapping by badge id / category for glyph color
const BADGE_CLS: Record<string, string> = {
  'first-kyc': 'gold',
  'first-deposit': 'gold',
  'swift-master': 'teal',
  'card-issuer': 'lilac',
  'perfectionist': '',
  'no-hints': 'lilac',
  'accuracy-95': 'gold',
  'compliance-pro': '',
  'anti-aml': 'teal',
  'streak-7': 'rose',
  'streak-30': 'rose',
  'night-owl': 'lilac',
  'early-bird': 'gold',
  'polyglot': 'teal',
  'asked-mentor': 'lilac',
  'top-3': 'gold',
}

export function BadgesPage() {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDrawerItem | null>(null)
  const userBadges = useUserStore(s => s.badges)
  const streak = useUserStore(s => s.streak)
  const now = Date.now()

  // Build the categorised structure from BADGE_DEFS + userStore state
  const catOrder: string[] = ['ops', 'quality', 'compliance', 'streak', 'community']

  const categories = catOrder.map(catId => {
    const defs = BADGE_DEFS.filter(d => d.category === catId)
    const badges = defs.map(def => {
      const state = userBadges.find(b => b.id === def.id)
      const unlocked = !!(state?.unlockedAt)
      const isNew = unlocked && state?.unlockedAt ? (now - new Date(state.unlockedAt).getTime()) < 60_000 : false

      let progressLabel: string | undefined
      if (!unlocked && def.maxProgress !== undefined) {
        const currentProg = def.id === 'streak-7' || def.id === 'streak-30'
          ? streak
          : (state?.progress ?? 0)
        progressLabel = `${currentProg}/${def.maxProgress}`
      }
      if (def.id === 'top-3' && !unlocked) {
        progressLabel = 'место #5'
      }

      let dateLabel: string | undefined
      if (unlocked && state?.unlockedAt) {
        const daysDiff = Math.floor((now - new Date(state.unlockedAt).getTime()) / 86400000)
        if (daysDiff === 0) dateLabel = 'Сегодня'
        else if (daysDiff === 1) dateLabel = 'Вчера'
        else if (daysDiff < 7) dateLabel = `${daysDiff} дня назад`
        else if (daysDiff < 14) dateLabel = 'На прошлой неделе'
        else if (daysDiff < 30) dateLabel = `${Math.floor(daysDiff / 7)} нед назад`
        else dateLabel = `${Math.floor(daysDiff / 30)} мес назад`
      }

      return {
        id: def.id,
        name: def.name,
        glyph: def.glyph,
        desc: def.desc,
        cls: BADGE_CLS[def.id] ?? '',
        unlocked,
        isNew,
        date: dateLabel,
        progressLabel,
        cat: CAT_LABELS[catId] ?? catId,
      }
    })
    return { catId, label: CAT_LABELS[catId] ?? catId, badges }
  })

  const total = BADGE_DEFS.length
  const unlocked = userBadges.filter(b => b.unlockedAt).length

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

      {categories.map(cat => (
        <div className="badges-section" key={cat.catId}>
          <h2 className="h2 badges-h">{cat.label}</h2>
          <div className="badges-grid-full">
            {cat.badges.map((b) => (
              <button
                className={`badge-full ${b.unlocked ? (b.isNew ? 'badge-new' : '') : 'locked'}`}
                key={b.id}
                onClick={() => setSelectedBadge(b)}
                style={{ font: 'inherit', color: 'inherit', cursor: 'pointer' }}
              >
                <div className={`badge-glyph ${b.cls}`}>{b.glyph}</div>
                <b>{b.name}</b>
                <span>{b.desc}</span>
                {b.unlocked ? (
                  <span className="badge-meta good">Получено · {b.date}</span>
                ) : b.progressLabel ? (
                  <span className="badge-meta cobalt">{b.progressLabel}</span>
                ) : (
                  <span className="badge-meta mute"><I.Lock size={10} /> Заблокировано</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedBadge && (
        <BadgeDrawer badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfilePage

const SKILL_LABELS: Record<string, string> = {
  kyc: 'KYC и идентификация',
  deposits: 'Депозиты',
  transfers: 'Переводы и SWIFT',
  sanctions: 'Санкции и ПДЛ',
  cards: 'Карты',
  aml: 'AML отчётность',
}

export function ProfilePage() {
  const xp = useUserStore(s => s.xp)
  const level = useUserStore(s => s.level)
  const streak = useUserStore(s => s.streak)
  const skills = useUserStore(s => s.skills)
  const completedRuns = useUserStore(s => s.completedRuns)

  const levelName = LEVEL_NAMES[level] ?? 'Подмастерье'
  const lvlPct = levelProgress(xp)
  const xpToNext = xpToNextLevel(xp)

  const avgScore = completedRuns.length > 0
    ? Math.round(completedRuns.reduce((s, r) => s + r.score, 0) / completedRuns.length)
    : 87

  const skillKeys = ['kyc', 'deposits', 'transfers', 'sanctions', 'cards', 'aml'] as const

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
            <div className="ps-sub">{levelName}</div>
          </div>
          <div className="ps-cell">
            <div className="ps-label">XP</div>
            <div className="ps-val mono">{xp.toLocaleString('ru-RU')}</div>
            <div className="ps-sub">{xpToNext} до ур. {level + 1}</div>
          </div>
          <div className="ps-cell">
            <div className="ps-label">Серия</div>
            <div className="ps-val mono">{streak}<small>дней</small></div>
            <div className="ps-sub">Лучшая · 12</div>
          </div>
          <div className="ps-cell">
            <div className="ps-label">Средний балл</div>
            <div className="ps-val mono">{avgScore}<small>/100</small></div>
            <div className="ps-sub">+4 за неделю</div>
          </div>
        </div>
      </div>

      <div style={{ margin: '16px 0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--mute)', marginBottom: 6 }}>
          <span>Прогресс уровня {level} → {level + 1}</span>
          <span className="mono">{lvlPct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--cobalt-tint)', borderRadius: 3, overflow: 'hidden' }}>
          <i style={{ display: 'block', height: '100%', background: 'var(--cobalt)', width: `${lvlPct}%`, borderRadius: 3 }} />
        </div>
      </div>

      <h2 className="h2" style={{ marginTop: 28, marginBottom: 12 }}>Навыки</h2>
      <div className="skills">
        {skillKeys.map(sk => {
          const s = skills[sk]
          return (
            <div className="skill-row" key={sk}>
              <span className="skill-name">{SKILL_LABELS[sk]}</span>
              <div className="skill-bar"><i style={{ width: `${s.pct}%` }} /></div>
              <span className="skill-pct mono">{s.pct}%</span>
              <span className="skill-hours mono">{s.hours.toFixed(1)} ч</span>
            </div>
          )
        })}
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

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--mute)' }}>
        Завершено сценариев: <b style={{ color: 'var(--ink)' }}>{completedRuns.length}</b>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings helpers

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="setting-section">
      <h3 className="h3 setting-title">{title}</h3>
      <div className="setting-rows">{children}</div>
    </div>
  )
}

function SettingRow({
  label,
  sub,
  v,
  children,
}: {
  label: string
  sub?: string
  v?: string
  children?: React.ReactNode
}) {
  return (
    <div className="setting-row">
      <div>
        <b>{label}</b>
        {sub && <span>{sub}</span>}
      </div>
      <div className="setting-val">
        {children ?? <span className="setting-v">{v}</span>}
      </div>
    </div>
  )
}

function SwitchToggle({ v, on }: { v: boolean; on: () => void }) {
  return (
    <button className={`switch ${v ? 'on' : ''}`} onClick={on} aria-pressed={v}>
      <i />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SettingsPage

export function SettingsPage() {
  const lang = useSettingsStore(s => s.lang)
  const density = useSettingsStore(s => s.density)
  const accent = useSettingsStore(s => s.accent)
  const clickyEnabled = useSettingsStore(s => s.clickyEnabled)
  const clickyMode = useSettingsStore(s => s.clickyMode)
  const setLang = useSettingsStore(s => s.setLang)
  const setDensity = useSettingsStore(s => s.setDensity)
  const setAccent = useSettingsStore(s => s.setAccent)
  const setClicky = useSettingsStore(s => s.setClicky)

  const [analyticsOn, setAnalyticsOn] = useState(true)

  const handleLang = (l: 'RU' | 'UZ' | 'EN') => {
    setLang(l)
    useUserStore.getState().unlockBadge('polyglot')
  }

  const ACCENT_COLORS = [
    '#2046FF', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2',
  ]

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
              {(['RU', 'UZ', 'EN'] as const).map(l => (
                <button key={l} className={lang === l ? 'active' : ''} onClick={() => handleLang(l)}>{l}</button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Дата и время" v={`${lang === 'RU' ? 'ru-RU' : lang === 'UZ' ? 'uz-UZ' : 'en-US'} · 24ч · Asia/Tashkent`} />
          <SettingRow label="Формат валюты" v="UZS · разделитель пробел · без копеек" />
        </SettingSection>

        <SettingSection title="Внешний вид">
          <SettingRow label="Плотность интерфейса" sub="Влияет на отступы и размеры элементов">
            <div className="tab-pill">
              {(['compact', 'regular', 'comfy'] as const).map(d => (
                <button key={d} className={density === d ? 'active' : ''} onClick={() => setDensity(d)}>
                  {d === 'compact' ? 'компакт' : d === 'regular' ? 'обычный' : 'просторный'}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Акцентный цвет" sub="Основной цвет интерфейса">
            <div style={{ display: 'flex', gap: 8 }}>
              {ACCENT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: c, border: accent === c ? '2px solid var(--ink)' : '2px solid transparent',
                    cursor: 'pointer', outline: accent === c ? '2px solid white' : 'none',
                    outlineOffset: -4,
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </SettingRow>
        </SettingSection>

        <SettingSection title="Клик (Clicky)">
          <SettingRow label="Показывать Клика" sub="Маленький светящийся курсор-помощник">
            <SwitchToggle v={clickyEnabled} on={() => setClicky({ clickyEnabled: !clickyEnabled })} />
          </SettingRow>
          <SettingRow label="Режим" sub="«Умный» подсвечивает следующие шаги · «Тихий» не открывает пузыри сам">
            <div className="tab-pill">
              <button className={clickyMode === 'smart' ? 'active' : ''} onClick={() => setClicky({ clickyMode: 'smart' })}>умный</button>
              <button className={clickyMode === 'ghost' ? 'active' : ''} onClick={() => setClicky({ clickyMode: 'ghost' })}>тихий</button>
            </div>
          </SettingRow>
          <SettingRow label="Голосовой ввод" sub="Push-to-talk на клавише `" v="включено · 22 ответа за неделю" />
        </SettingSection>

        <SettingSection title="Конфиденциальность">
          <SettingRow label="Среда" v="Синтетическая · реальные клиентские данные недоступны" />
          <SettingRow label="Журнал событий" sub="Все ваши действия видны вашему наставнику и HR" v="включено · отключение невозможно" />
          <SettingRow label="Аналитика" sub="Агрегированные данные о времени и точности">
            <SwitchToggle v={analyticsOn} on={() => setAnalyticsOn(v => !v)} />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Уведомления">
          <SettingRow label="Заметки наставника" v="email + в приложении" />
          <SettingRow label="Награды и серии" v="только в приложении" />
          <SettingRow label="Новые модули" v="email · еженедельный дайджест" />
        </SettingSection>
      </div>
    </div>
  )
}
