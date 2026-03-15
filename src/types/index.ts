export type Priority = 1 | 2 | 3 | 4

export interface Attachment {
  id: string
  name: string
  size: number       // bytes
  type: string       // MIME type
  dataUrl: string    // base64 data URL
  addedAt: string    // ISO timestamp
}

export interface Reminder {
  date: string       // 'yyyy-MM-dd'
  time: string       // 'HH:mm'
}

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: Priority
  projectId: string | null
  labelIds: string[]
  dueDate: string | null
  dueTime: string | null
  parentId: string | null
  order: number
  createdAt: string
  completedAt: string | null
  recurring: RecurringConfig | null
  quadrant: Quadrant | null
  gtdContext: GtdContext | null
  attachments: Attachment[]
  reminder: Reminder | null
  assignee: string | null
  isMyDay: boolean           // Added to My Day smart list
  isStarred: boolean         // Starred = appears in Important view
}

export interface Project {
  id: string
  name: string
  color: string
  icon: string
  order: number
  isFavorite: boolean
  areaId: string | null  // null = not linked to any Life Area
  dueDate: string | null // Goal target date 'yyyy-MM-dd'
}

// Fixed Life Areas — not stored in state, defined as a constant
export interface Area {
  id: string
  name: string
  emoji: string
  description: string
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly' | 'custom'
  customDays: number[]
  targetCount: number
  completions: Record<string, number>
  createdAt: string
  streak: number
  bestStreak: number
  order: number
}

export interface RecurringConfig {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  daysOfWeek?: number[]
}

export type Quadrant = 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important'

export type GtdContext = 'inbox' | 'next-action' | 'waiting-for' | 'someday-maybe' | 'reference' | 'project-support'

export interface PomodoroSession {
  id: string
  taskId: string | null
  startedAt: string
  duration: number
  type: 'work' | 'short-break' | 'long-break'
  completed: boolean
}

export interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
  autoStartBreak: boolean
  autoStartWork: boolean
}

export type ViewType = 'inbox' | 'today' | 'upcoming' | 'project' | 'label' | 'habits' | 'pomodoro' | 'matrix' | 'gtd' | 'search' | 'myday' | 'important' | 'completed'

export type ThemeMode = 'system' | 'light' | 'dark'

export const PROJECT_COLORS = [
  '#b8255f', '#db4035', '#ff9933', '#fad000',
  '#7ecc49', '#299438', '#6accbc', '#158fad',
  '#14aaf5', '#96c3eb', '#4073ff', '#884dff',
  '#af38eb', '#eb96eb', '#e05194', '#ff8d85',
  '#808080', '#b8b8b8', '#ccac93',
]

// Fixed Life Areas (Professional, Personal, Financial, Wellness, Relationship, Vision)
export const FIXED_AREAS: Area[] = [
  { id: 'professional', name: 'Professional', emoji: '💼', description: 'Work, career, business, and professional commitments' },
  { id: 'personal',     name: 'Personal',     emoji: '🧑',  description: 'Personal errands, self-management, and individual responsibilities' },
  { id: 'financial',   name: 'Financial',    emoji: '💰', description: 'Budgeting, bills, savings, investments, and money tasks' },
  { id: 'wellness',    name: 'Wellness',     emoji: '💪', description: 'Health, fitness, habits, and self-care routines' },
  { id: 'relationship',name: 'Relationship', emoji: '💖', description: 'Family, friends, partner, and social commitments' },
  { id: 'vision',      name: 'Vision',       emoji: '🎯', description: 'Long-term goals, aspirations, and life planning' },
]

export const PRIORITY_COLORS: Record<Priority, string> = {
  1: '#dc4c3e',
  2: '#f49c18',
  3: '#4073ff',
  4: '#808080',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  1: 'Priority 1',
  2: 'Priority 2',
  3: 'Priority 3',
  4: 'Priority 4',
}

export const QUADRANT_LABELS: Record<Quadrant, { title: string; subtitle: string; color: string }> = {
  'urgent-important': { title: 'Do First', subtitle: 'Urgent & Important', color: '#dc4c3e' },
  'not-urgent-important': { title: 'Schedule', subtitle: 'Not Urgent & Important', color: '#4073ff' },
  'urgent-not-important': { title: 'Delegate', subtitle: 'Urgent & Not Important', color: '#f49c18' },
  'not-urgent-not-important': { title: 'Eliminate', subtitle: 'Not Urgent & Not Important', color: '#808080' },
}

export const GTD_LABELS: Record<GtdContext, { title: string; icon: string; color: string }> = {
  'inbox': { title: 'Inbox', icon: 'inbox', color: '#4073ff' },
  'next-action': { title: 'Next Actions', icon: 'zap', color: '#dc4c3e' },
  'waiting-for': { title: 'Waiting For', icon: 'clock', color: '#f49c18' },
  'someday-maybe': { title: 'Someday/Maybe', icon: 'cloud', color: '#808080' },
  'reference': { title: 'Reference', icon: 'bookmark', color: '#299438' },
  'project-support': { title: 'Project Support', icon: 'folder', color: '#884dff' },
}
