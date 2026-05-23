export type AvClass = 'av-1' | 'av-2' | 'av-3' | 'av-4' | 'av-5' | 'av-6' | 'av-7' | 'av-8'
export type EmployeeStatus = 'online' | 'busy' | 'away' | 'offline'
export type RequestStatus = 'pending' | 'review' | 'approved'
export type TagKind = 'good' | 'bad' | 'warn' | ''
export type RewardKind = 'cobalt' | 'good' | 'warn' | 'synth'
export type EventKind = 'cobalt' | 'good' | 'warn'
export type ThreadItemKind = 'msg' | 'divider' | 'scenario' | 'file' | 'call' | 'system'

export interface HrUser {
  id: 0
  name: string
  role: string
  initials: string
  avClass: AvClass
}

export interface Employee {
  id: number
  name: string
  role: string
  team: string
  status: EmployeeStatus
  score: number
  delta: number
  scenarios: number
  lastActive: string
  trend: number[]
  hasUnread: number
  initials: string
  avClass: AvClass
}

export interface FeedItem {
  id: number
  who: number
  action: string
  target: string
  tag: string
  tagKind: TagKind
  when: string
}

export interface ScheduleItem {
  id: string
  time: string
  end: string
  title: string
  context: string
  with: number[]
}

export interface PerfKpi {
  lbl: string
  val: number
  suffix: string
  delta: string
  dir: 'up' | 'down' | 'flat'
  spark: number[]
}

export interface Group {
  id: string
  type: string
  name: string
  members: number[]
  unread: number
  preview: string
  lastAt: string
}

export interface DirectConv {
  id: string
  with: number
  unread: number
  preview: string
  lastAt: string
}

export interface SharedFile {
  name: string
  size: string
  kind: string
}

export interface ThreadMsg {
  kind: ThreadItemKind
  from?: number
  text?: string
  time?: string
  title?: string
  progress?: number
  status?: string
  name?: string
  size?: string
  kindLabel?: string
  direction?: 'outgoing' | 'incoming' | 'missed'
  kind2?: 'voice' | 'video'
  duration?: string
  by?: number
  count?: number
  label?: string
}

export interface RequestItem {
  id: string
  who: number
  kind: string
  subject: string
  submitted: string
  status: RequestStatus
  note: string
}

export interface RewardItem {
  id: string
  name: string
  desc: string
  kind: RewardKind
  recipients: number[]
  pct: number
  foot: string
}

export interface CalendarEvent {
  day: number
  start: number
  end: number
  kind: EventKind
  title: string
  sub: string
}

export interface HrData {
  HR_USER: HrUser
  EMPLOYEES: Employee[]
  COHORTS: string[]
  FEED: FeedItem[]
  SCHEDULE: ScheduleItem[]
  PERF_KPIS: PerfKpi[]
  MODULES: string[]
  HEATMAP: Record<string, number[]>
  GROUPS: Group[]
  DIRECT: DirectConv[]
  THREAD_D1: ThreadMsg[]
  SHARED_FILES: SharedFile[]
  REQUESTS: RequestItem[]
  REWARDS: RewardItem[]
  CALENDAR_EVENTS: CalendarEvent[]
  avClassFromId: (id: number) => AvClass
  initials: (name: string) => string
}
