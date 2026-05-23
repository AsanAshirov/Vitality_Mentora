import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  from: 'me' | 'them'
  t: string
  text?: string
  kind?: 'voice' | 'file' | 'photo'
  who?: string
  dur?: number
}

export interface Chat {
  id: string
  name: string
  short: string
  cls: string
  type: 'dm' | 'group' | 'bot'
  last: string
  lastT: string
  unread: number
  online: boolean
  msgs: ChatMessage[]
}

const INITIAL_CHATS: Chat[] = [
  {
    id: 'hr-olga', name: 'Ольга Р. (HR)', short: 'ОР', cls: 'lilac', type: 'dm',
    last: 'Хорошей смены, Алексей!', lastT: '09:10', unread: 1, online: true,
    msgs: [
      { from: 'them', t: '09:08', text: 'Доброе утро, Алексей! Сегодня у тебя 3 задачи в очереди.' },
      { from: 'them', t: '09:10', text: 'Хорошей смены, Алексей!' },
    ]
  },
  {
    id: 'tatiana', name: 'Татьяна К. (наставник)', short: 'ТК', cls: 'cobalt', type: 'dm',
    last: 'Посмотри на шаг «Источник средств» ещё раз.', lastT: '07:38', unread: 2, online: true,
    msgs: [
      { from: 'them', t: '07:31', text: 'Алексей, хороший прогрес по KYC.' },
      { from: 'them', t: '07:38', text: 'Посмотри на шаг «Источник средств» ещё раз. Декларация нужна при сумме ≥ 50 млн UZS.' },
    ]
  },
  {
    id: 'cohort-q2', name: 'Поток Q2-26', short: 'Q2', cls: 'teal', type: 'group',
    last: 'Кто уже прошёл KYC?', lastT: '07:15', unread: 7, online: false,
    msgs: [
      { from: 'them', t: '07:10', who: 'Дмитрий', text: 'Привет всем! Начинаем?' },
      { from: 'them', t: '07:15', who: 'Камола', text: 'Кто уже прошёл KYC?' },
      { from: 'me', t: '07:20', text: 'Я прохожу сейчас.' },
    ]
  },
  {
    id: 'compliance', name: 'Дежурство комплаенс', short: 'КП', cls: 'rose', type: 'group',
    last: 'TRN-77417995 на проверке AML.', lastT: '07:32', unread: 0, online: true,
    msgs: [
      { from: 'them', t: '07:31', who: 'Авто-AML', text: 'TRN-77417995 — превышение порога. На проверке AML.' },
      { from: 'them', t: '07:32', who: 'Авто-AML', text: 'TRN-77417995 на проверке AML.' },
    ]
  },
  {
    id: 'ask-mentora', name: 'База знаний · Бот', short: 'БЗ', cls: 'cobalt', type: 'bot',
    last: 'Спрашивай о процедурах банка.', lastT: '08:00', unread: 0, online: true,
    msgs: [
      { from: 'them', t: '08:00', text: 'Привет! Я бот базы знаний. Спрашивай о KYC, AML, санкциях, депозитах, переводах, картах.' },
    ]
  },
  {
    id: 'tech-help', name: 'Техподдержка', short: 'ТП', cls: 'mute', type: 'group',
    last: 'Система работает штатно.', lastT: '06:00', unread: 0, online: false,
    msgs: [
      { from: 'them', t: '06:00', who: 'Система', text: 'Система работает штатно. Обновление успешно.' },
    ]
  },
]

interface MessagesState {
  chats: Chat[]
  activeId: string | null
  setActiveId: (id: string | null) => void
  sendMessage: (chatId: string, text: string) => void
  markRead: (chatId: string) => void
  openChat: (id: string) => void
  addChat: (chat: Chat) => void
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set) => ({
      chats: INITIAL_CHATS,
      activeId: null,

      setActiveId: (id) => set({ activeId: id }),

      sendMessage: (chatId, text) => set((s) => ({
        chats: s.chats.map(c => c.id === chatId ? {
          ...c,
          last: text,
          lastT: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          msgs: [...c.msgs, { from: 'me' as const, t: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), text }]
        } : c)
      })),

      markRead: (chatId) => set((s) => ({
        chats: s.chats.map(c => c.id === chatId ? { ...c, unread: 0 } : c)
      })),

      openChat: (id) => set({ activeId: id }),

      addChat: (chat) => set((s) => ({
        chats: [chat, ...s.chats],
        activeId: chat.id,
      })),
    }),
    { name: 'vm_messages' }
  )
)
