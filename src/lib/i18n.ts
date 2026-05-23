export type Lang = 'RU' | 'UZ' | 'EN'

export const STRINGS: Record<Lang, Record<string, string>> = {
  RU: {
    // ── Navigation ──────────────────────────────────────────────────────────
    'nav.dashboard':  'Главная',
    'nav.tasks':      'Задачи',
    'nav.simulator':  'Тренажёр',
    'nav.knowledge':  'База знаний',
    'nav.messages':   'Сообщения',
    'nav.badges':     'Достижения',
    'nav.profile':    'Профиль',
    'nav.settings':   'Настройки',

    // ── Simulator section nav items ──────────────────────────────────────────
    'sim.nav.kyc':       'KYC (Знай своего клиента)',
    'sim.nav.accounts':  'Счета и обслуживание',
    'sim.nav.deposits':  'Депозиты и вклады',
    'sim.nav.transfers': 'Переводы и платежи',
    'sim.nav.cards':     'Карточные продукты',
    'sim.nav.sanctions': 'Санкционный скрининг',
    'sim.nav.pep':       'PEP и публичные персоны',
    'sim.nav.aml':       'AML и финансовый мониторинг',
    'sim.nav.handbook':  'Справочник продуктов',
    'sim.nav.activity':  'История действий',

    // ── Common actions ────────────────────────────────────────────────────────
    'action.start':    'Начать',
    'action.back':     'Назад',
    'action.next':     'Далее',
    'action.done':     'Готово',
    'action.cancel':   'Отмена',
    'action.confirm':  'Подтвердить',
    'action.retry':    'Повторить',
    'action.continue': 'Продолжить',
    'action.save':     'Сохранить',
    'action.submit':   'Отправить',
    'action.close':    'Закрыть',
    'action.open':     'Открыть',
    'action.edit':     'Редактировать',
    'action.delete':   'Удалить',
    'action.upload':   'Загрузить',
    'action.download': 'Скачать',
    'action.search':   'Поиск',
    'action.filter':   'Фильтр',
    'action.reset':    'Сбросить',
    'action.apply':    'Применить',
    'action.escalate': 'Эскалировать',
    'action.clear':    'Очистить',
    'action.override': 'Переопределить',

    // ── KYC step labels ───────────────────────────────────────────────────────
    'step.kyc.lookup':    'Поиск клиента',
    'step.kyc.identity':  'Проверка личности',
    'step.kyc.sanctions': 'Санкционная проверка',
    'step.kyc.sof':       'Источник средств',
    'step.kyc.risk':      'Оценка риска',
    'step.kyc.submit':    'Завершение KYC',

    // ── Account step labels ───────────────────────────────────────────────────
    'step.account.customer': 'Выбор клиента',
    'step.account.product':  'Продукт и валюта',
    'step.account.terms':    'Тарифный план',
    'step.account.sign':     'Документы и ОТП',

    // ── Deposit step labels ───────────────────────────────────────────────────
    'step.deposit.client':  'Клиент и сумма',
    'step.deposit.terms':   'Срок и ставка',
    'step.deposit.sof':     'Источник средств',
    'step.deposit.confirm': 'Подтверждение',

    // ── Transfer step labels ──────────────────────────────────────────────────
    'step.transfer.sender':    'Отправитель',
    'step.transfer.recipient': 'Получатель',
    'step.transfer.amount':    'Сумма и валюта',
    'step.transfer.aml':       'AML проверка',
    'step.transfer.confirm':   'Подтверждение',

    // ── Card step labels ──────────────────────────────────────────────────────
    'step.card.client':  'Клиент',
    'step.card.product': 'Тип карты',
    'step.card.params':  'Параметры карты',
    'step.card.review':  'Заявка',

    // ── Dashboard ─────────────────────────────────────────────────────────────
    'dash.greeting.morning':   'Доброе утро',
    'dash.greeting.afternoon': 'Добрый день',
    'dash.greeting.evening':   'Добрый вечер',
    'dash.week.label':         'Неделя {n}',
    'dash.week.progress':      'Прогресс за неделю',
    'dash.week.tasks':         'Задач выполнено: {done} из {total}',
    'dash.quest.title':        'Текущий квест',
    'dash.quest.none':         'Нет активных квестов',
    'dash.quest.complete':     'Квест завершён!',
    'dash.scenario.kyc':       'KYC — клиент под санкциями',
    'dash.scenario.accounts':  'Открытие расчётного счёта',
    'dash.scenario.deposits':  'Срочный вклад с SOF',
    'dash.scenario.transfers': 'Международный SWIFT-перевод',
    'dash.scenario.cards':     'Выпуск дебетовой карты',
    'dash.xp.label':           'Опыт (XP)',
    'dash.level.label':        'Уровень',
    'dash.streak.label':       'Дней подряд',
    'dash.streak.value':       '{n} дней',
    'dash.recent.title':       'Недавние сессии',
    'dash.recent.empty':       'Сессий пока нет',
    'dash.leaderboard.title':  'Лидерборд потока',
    'dash.skills.title':       'Навыки',

    // ── Results / grades ──────────────────────────────────────────────────────
    'result.grade.A':         'Отлично',
    'result.grade.B':         'Хорошо',
    'result.grade.C':         'Удовлетворительно',
    'result.grade.retry':     'Пересдать',
    'result.score.label':     'Балл',
    'result.xp.earned':       '+{n} XP',
    'result.time.label':      'Время',
    'result.hints.label':     'Подсказок использовано',
    'result.breakdown.title': 'Разбор по шагам',
    'result.mentor.title':    'Комментарий наставника',
    'result.try.again':       'Попробовать ещё раз',
    'result.next.scenario':   'Следующий сценарий',

    // ── Settings ──────────────────────────────────────────────────────────────
    'settings.title':               'Настройки',
    'settings.section.account':     'Аккаунт',
    'settings.section.appearance':  'Внешний вид',
    'settings.section.language':    'Язык интерфейса',
    'settings.section.notif':       'Уведомления',
    'settings.section.privacy':     'Конфиденциальность',
    'settings.section.data':        'Данные и прогресс',
    'settings.section.about':       'О приложении',
    'settings.lang.ru':             'Русский',
    'settings.lang.uz':             'Oʻzbekcha',
    'settings.lang.en':             'English',
    'settings.theme.light':         'Светлая',
    'settings.theme.dark':          'Тёмная',
    'settings.theme.system':        'Системная',
    'settings.notif.enabled':       'Включить уведомления',
    'settings.notif.reminders':     'Напоминания о занятиях',
    'settings.notif.badges':        'Новые достижения',
    'settings.reset.label':         'Сбросить прогресс',
    'settings.reset.confirm':       'Вы уверены? Весь прогресс будет удалён.',
    'settings.version.label':       'Версия',

    // ── Common status words ───────────────────────────────────────────────────
    'status.active':    'Активен',
    'status.frozen':    'Заморожен',
    'status.pending':   'В обработке',
    'status.done':      'Выполнено',
    'status.escalated': 'Эскалировано',
    'status.rejected':  'Отклонено',
    'status.locked':    'Заблокировано',
    'status.unlocked':  'Доступно',

    // ── Scenario labels (general) ─────────────────────────────────────────────
    'scenario.locked.hint':  'Завершите предыдущий сценарий для разблокировки',
    'scenario.best.score':   'Лучший балл: {n}',
    'scenario.attempts':     'Попыток: {n}',
    'scenario.duration.est': 'Примерное время: {n} мин',

    // ── Hints ─────────────────────────────────────────────────────────────────
    'hint.label':      'Подсказка',
    'hint.used':       'Использована подсказка (-2 балла)',
    'hint.remaining':  'Подсказок осталось: {n}',

    // ── Sanctions specific ────────────────────────────────────────────────────
    'sanctions.hit.title':    'Возможное совпадение',
    'sanctions.confidence':   'Уверенность: {pct}%',
    'sanctions.action.escal': 'Эскалировать в комплаенс',
    'sanctions.action.clear': 'Отметить как очищенное',
    'sanctions.action.over':  'Переопределить и продолжить',

    // ── Misc ──────────────────────────────────────────────────────────────────
    'misc.loading':    'Загрузка…',
    'misc.error':      'Произошла ошибка',
    'misc.empty':      'Нет данных',
    'misc.yes':        'Да',
    'misc.no':         'Нет',
    'misc.of':         'из',
    'misc.min':        'мин',
    'misc.pts':        'балл',
    'misc.xp':         'XP',
  },

  // ── UZ ─────────────────────────────────────────────────────────────────────
  UZ: {
    // Navigation
    'nav.dashboard':  'Bosh sahifa',
    'nav.tasks':      'Vazifalar',
    'nav.simulator':  'Trenajyor',
    'nav.knowledge':  'Bilimlar bazasi',
    'nav.messages':   'Xabarlar',
    'nav.badges':     'Yutuqlar',
    'nav.profile':    'Profil',
    'nav.settings':   'Sozlamalar',

    // Simulator nav
    'sim.nav.kyc':       'KYC (Mijozingizni biling)',
    'sim.nav.accounts':  'Hisoblar va xizmat',
    'sim.nav.deposits':  'Depozitlar va omonatlar',
    'sim.nav.transfers': "O'tkazmalar va to'lovlar",
    'sim.nav.cards':     'Karta mahsulotlari',
    'sim.nav.sanctions': 'Sanksiya tekshiruvi',
    'sim.nav.pep':       'PEP va ommaviy shaxslar',
    'sim.nav.aml':       'AML va moliyaviy monitoring',
    'sim.nav.handbook':  'Mahsulotlar qoʻllanmasi',
    'sim.nav.activity':  'Harakatlar tarixi',

    // Common actions
    'action.start':    'Boshlash',
    'action.back':     'Orqaga',
    'action.next':     'Keyingi',
    'action.done':     'Tayyor',
    'action.cancel':   'Bekor qilish',
    'action.confirm':  'Tasdiqlash',
    'action.retry':    'Qayta urinish',
    'action.continue': 'Davom etish',
    'action.save':     'Saqlash',
    'action.submit':   'Yuborish',
    'action.close':    'Yopish',
    'action.escalate': 'Eskalatsiya qilish',
    'action.search':   'Qidirish',
    'action.reset':    'Qayta tiklash',

    // KYC step labels
    'step.kyc.lookup':    'Mijozni qidirish',
    'step.kyc.identity':  'Shaxsni tekshirish',
    'step.kyc.sanctions': 'Sanksiya tekshiruvi',
    'step.kyc.sof':       'Mablag\' manbai',
    'step.kyc.risk':      'Riskni baholash',
    'step.kyc.submit':    'KYC yakunlash',

    // Account step labels
    'step.account.customer': 'Mijozni tanlash',
    'step.account.product':  'Mahsulot va valyuta',
    'step.account.terms':    'Tarif rejasi',
    'step.account.sign':     'Hujjatlar va OTP',

    // Deposit step labels
    'step.deposit.client':  'Mijoz va summa',
    'step.deposit.terms':   'Muddat va stavka',
    'step.deposit.sof':     'Mablag\' manbai',
    'step.deposit.confirm': 'Tasdiqlash',

    // Transfer step labels
    'step.transfer.sender':    'Jo\'natuvchi',
    'step.transfer.recipient': 'Qabul qiluvchi',
    'step.transfer.amount':    'Summa va valyuta',
    'step.transfer.aml':       'AML tekshiruvi',
    'step.transfer.confirm':   'Tasdiqlash',

    // Card step labels
    'step.card.client':  'Mijoz',
    'step.card.product': 'Karta turi',
    'step.card.params':  'Karta parametrlari',
    'step.card.review':  'Ariza',

    // Status words
    'status.active':    'Faol',
    'status.frozen':    'Muzlatilgan',
    'status.pending':   'Jarayonda',
    'status.done':      'Bajarildi',
    'status.escalated': 'Eskalatsiya qilindi',
    'status.rejected':  'Rad etildi',
    'status.locked':    'Bloklangan',
    'status.unlocked':  'Mavjud',

    // Result / grades
    'result.grade.A':     'A\'lo',
    'result.grade.B':     'Yaxshi',
    'result.grade.C':     'Qoniqarli',
    'result.grade.retry': 'Qayta topshirish',
    'result.xp.earned':   '+{n} XP',

    // Settings
    'settings.title':            'Sozlamalar',
    'settings.section.language': 'Interfeys tili',
    'settings.lang.ru':          'Русский',
    'settings.lang.uz':          'Oʻzbekcha',
    'settings.lang.en':          'English',
    'settings.theme.light':      'Yorug\'',
    'settings.theme.dark':       'Qoʻngʻir',
    'settings.theme.system':     'Tizim',

    // Misc
    'misc.loading': 'Yuklanmoqda…',
    'misc.error':   'Xatolik yuz berdi',
    'misc.empty':   'Ma\'lumot yo\'q',
    'misc.yes':     'Ha',
    'misc.no':      "Yo'q",
    'misc.of':      'dan',
    'misc.min':     'daq',
    'misc.pts':     'ball',
    'misc.xp':      'XP',
  },

  // ── EN ─────────────────────────────────────────────────────────────────────
  EN: {
    // Navigation
    'nav.dashboard':  'Dashboard',
    'nav.tasks':      'Tasks',
    'nav.simulator':  'Simulator',
    'nav.knowledge':  'Knowledge Base',
    'nav.messages':   'Messages',
    'nav.badges':     'Badges',
    'nav.profile':    'Profile',
    'nav.settings':   'Settings',

    // Simulator nav
    'sim.nav.kyc':       'KYC (Know Your Customer)',
    'sim.nav.accounts':  'Accounts & Servicing',
    'sim.nav.deposits':  'Deposits & Savings',
    'sim.nav.transfers': 'Transfers & Payments',
    'sim.nav.cards':     'Card Products',
    'sim.nav.sanctions': 'Sanctions Screening',
    'sim.nav.pep':       'PEP & Public Figures',
    'sim.nav.aml':       'AML & Financial Monitoring',
    'sim.nav.handbook':  'Product Handbook',
    'sim.nav.activity':  'Activity Log',

    // Common actions
    'action.start':    'Start',
    'action.back':     'Back',
    'action.next':     'Next',
    'action.done':     'Done',
    'action.cancel':   'Cancel',
    'action.confirm':  'Confirm',
    'action.retry':    'Retry',
    'action.continue': 'Continue',
    'action.save':     'Save',
    'action.submit':   'Submit',
    'action.close':    'Close',
    'action.open':     'Open',
    'action.edit':     'Edit',
    'action.delete':   'Delete',
    'action.upload':   'Upload',
    'action.download': 'Download',
    'action.search':   'Search',
    'action.filter':   'Filter',
    'action.reset':    'Reset',
    'action.apply':    'Apply',
    'action.escalate': 'Escalate',
    'action.clear':    'Clear',
    'action.override': 'Override',

    // KYC step labels
    'step.kyc.lookup':    'Customer Lookup',
    'step.kyc.identity':  'Identity Verification',
    'step.kyc.sanctions': 'Sanctions Check',
    'step.kyc.sof':       'Source of Funds',
    'step.kyc.risk':      'Risk Assessment',
    'step.kyc.submit':    'Submit KYC',

    // Account step labels
    'step.account.customer': 'Select Customer',
    'step.account.product':  'Product & Currency',
    'step.account.terms':    'Tariff Plan',
    'step.account.sign':     'Documents & OTP',

    // Deposit step labels
    'step.deposit.client':  'Client & Amount',
    'step.deposit.terms':   'Term & Rate',
    'step.deposit.sof':     'Source of Funds',
    'step.deposit.confirm': 'Confirmation',

    // Transfer step labels
    'step.transfer.sender':    'Sender',
    'step.transfer.recipient': 'Recipient',
    'step.transfer.amount':    'Amount & Currency',
    'step.transfer.aml':       'AML Check',
    'step.transfer.confirm':   'Confirmation',

    // Card step labels
    'step.card.client':  'Client',
    'step.card.product': 'Card Type',
    'step.card.params':  'Card Parameters',
    'step.card.review':  'Application',

    // Dashboard
    'dash.greeting.morning':   'Good morning',
    'dash.greeting.afternoon': 'Good afternoon',
    'dash.greeting.evening':   'Good evening',
    'dash.week.label':         'Week {n}',
    'dash.week.progress':      'Weekly Progress',
    'dash.quest.title':        'Current Quest',
    'dash.quest.none':         'No active quests',
    'dash.scenario.kyc':       'KYC — Sanctioned client',
    'dash.scenario.accounts':  'Current account opening',
    'dash.scenario.deposits':  'Term deposit with SOF',
    'dash.scenario.transfers': 'International SWIFT transfer',
    'dash.scenario.cards':     'Debit card issuance',
    'dash.xp.label':           'Experience (XP)',
    'dash.level.label':        'Level',
    'dash.streak.label':       'Day streak',
    'dash.streak.value':       '{n} days',
    'dash.recent.title':       'Recent Sessions',
    'dash.recent.empty':       'No sessions yet',
    'dash.leaderboard.title':  'Cohort Leaderboard',
    'dash.skills.title':       'Skills',

    // Results / grades
    'result.grade.A':         'Excellent',
    'result.grade.B':         'Good',
    'result.grade.C':         'Satisfactory',
    'result.grade.retry':     'Retake',
    'result.score.label':     'Score',
    'result.xp.earned':       '+{n} XP',
    'result.time.label':      'Time',
    'result.hints.label':     'Hints used',
    'result.breakdown.title': 'Step breakdown',
    'result.mentor.title':    'Mentor comment',
    'result.try.again':       'Try again',
    'result.next.scenario':   'Next scenario',

    // Settings
    'settings.title':               'Settings',
    'settings.section.account':     'Account',
    'settings.section.appearance':  'Appearance',
    'settings.section.language':    'Interface Language',
    'settings.section.notif':       'Notifications',
    'settings.section.privacy':     'Privacy',
    'settings.section.data':        'Data & Progress',
    'settings.section.about':       'About',
    'settings.lang.ru':             'Русский',
    'settings.lang.uz':             'Oʻzbekcha',
    'settings.lang.en':             'English',
    'settings.theme.light':         'Light',
    'settings.theme.dark':          'Dark',
    'settings.theme.system':        'System',
    'settings.notif.enabled':       'Enable notifications',
    'settings.notif.reminders':     'Study reminders',
    'settings.notif.badges':        'New badges',
    'settings.reset.label':         'Reset progress',
    'settings.reset.confirm':       'Are you sure? All progress will be deleted.',
    'settings.version.label':       'Version',

    // Status words
    'status.active':    'Active',
    'status.frozen':    'Frozen',
    'status.pending':   'Pending',
    'status.done':      'Done',
    'status.escalated': 'Escalated',
    'status.rejected':  'Rejected',
    'status.locked':    'Locked',
    'status.unlocked':  'Available',

    // Scenario labels
    'scenario.locked.hint':  'Complete the previous scenario to unlock',
    'scenario.best.score':   'Best score: {n}',
    'scenario.attempts':     'Attempts: {n}',
    'scenario.duration.est': 'Estimated time: {n} min',

    // Hints
    'hint.label':      'Hint',
    'hint.used':       'Hint used (−2 pts)',
    'hint.remaining':  'Hints remaining: {n}',

    // Sanctions
    'sanctions.hit.title':    'Possible match',
    'sanctions.confidence':   'Confidence: {pct}%',
    'sanctions.action.escal': 'Escalate to compliance',
    'sanctions.action.clear': 'Mark as cleared',
    'sanctions.action.over':  'Override and continue',

    // Misc
    'misc.loading': 'Loading…',
    'misc.error':   'An error occurred',
    'misc.empty':   'No data',
    'misc.yes':     'Yes',
    'misc.no':      'No',
    'misc.of':      'of',
    'misc.min':     'min',
    'misc.pts':     'pts',
    'misc.xp':      'XP',
  },
}

/**
 * Translate a key into the given language, falling back to RU if the key is
 * absent in the requested language.  Interpolates `{varName}` placeholders.
 */
export function t(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const str = STRINGS[lang][key] ?? STRINGS['RU'][key] ?? key

  if (!vars) return str

  return Object.entries(vars).reduce<string>(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    str,
  )
}
