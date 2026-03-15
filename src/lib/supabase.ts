import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Task, Project, Label, Habit, PomodoroSettings, Priority, Quadrant, GtdContext, RecurringConfig, Attachment, Reminder } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string | undefined

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// ── DB row type (loose — Supabase returns plain objects) ─────────────────
type DbRow = Record<string, unknown>

// ── Converters: TypeScript ↔ Supabase snake_case ─────────────────────────

export function taskToDb(task: Task, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    project_id: task.projectId,
    label_ids: task.labelIds,
    due_date: task.dueDate,
    due_time: task.dueTime,
    parent_id: task.parentId,
    order: task.order,
    created_at: task.createdAt,
    completed_at: task.completedAt,
    recurring: task.recurring,
    quadrant: task.quadrant,
    gtd_context: task.gtdContext,
    attachments: task.attachments,
    reminder: task.reminder,
    assignee: task.assignee,
    is_my_day: task.isMyDay,
    is_starred: task.isStarred,
  }
}

export function taskFromDb(row: DbRow): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    completed: row.completed as boolean,
    priority: row.priority as Priority,
    projectId: row.project_id as string | null,
    labelIds: (row.label_ids as string[]) || [],
    dueDate: row.due_date as string | null,
    dueTime: row.due_time as string | null,
    parentId: row.parent_id as string | null,
    order: row.order as number,
    createdAt: row.created_at as string,
    completedAt: row.completed_at as string | null,
    recurring: row.recurring as RecurringConfig | null,
    quadrant: row.quadrant as Quadrant | null,
    gtdContext: row.gtd_context as GtdContext | null,
    attachments: (row.attachments as Attachment[]) || [],
    reminder: row.reminder as Reminder | null,
    assignee: row.assignee as string | null,
    isMyDay: (row.is_my_day as boolean) ?? false,
    isStarred: (row.is_starred as boolean) ?? false,
  }
}

export function projectToDb(project: Project, userId: string) {
  return {
    id: project.id,
    user_id: userId,
    name: project.name,
    color: project.color,
    icon: project.icon,
    order: project.order,
    is_favorite: project.isFavorite,
    area_id: project.areaId,
    due_date: project.dueDate,
  }
}

export function projectFromDb(row: DbRow): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
    icon: row.icon as string,
    order: row.order as number,
    isFavorite: row.is_favorite as boolean,
    areaId: (row.area_id as string | null) ?? null,
    dueDate: (row.due_date as string | null) ?? null,
  }
}

export function labelToDb(label: Label, userId: string) {
  return {
    id: label.id,
    user_id: userId,
    name: label.name,
    color: label.color,
  }
}

export function labelFromDb(row: DbRow): Label {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
  }
}

export function habitToDb(habit: Habit, userId: string) {
  return {
    id: habit.id,
    user_id: userId,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    custom_days: habit.customDays,
    target_count: habit.targetCount,
    completions: habit.completions,
    created_at: habit.createdAt,
    streak: habit.streak,
    best_streak: habit.bestStreak,
    order: habit.order,
  }
}

export function habitFromDb(row: DbRow): Habit {
  return {
    id: row.id as string,
    name: row.name as string,
    icon: row.icon as string,
    color: row.color as string,
    frequency: row.frequency as 'daily' | 'weekly' | 'custom',
    customDays: (row.custom_days as number[]) || [],
    targetCount: row.target_count as number,
    completions: (row.completions as Record<string, number>) || {},
    createdAt: row.created_at as string,
    streak: row.streak as number,
    bestStreak: row.best_streak as number,
    order: row.order as number,
  }
}

// ── Load all user data from Supabase ─────────────────────────────────────

export async function loadAllUserData(userId: string) {
  if (!supabase) return { tasks: [], projects: [], labels: [], habits: [], pomodoroSettings: null }

  const [tasksRes, projectsRes, labelsRes, habitsRes, pomRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).order('order'),
    supabase.from('projects').select('*').eq('user_id', userId).order('order'),
    supabase.from('labels').select('*').eq('user_id', userId),
    supabase.from('habits').select('*').eq('user_id', userId).order('order'),
    supabase.from('pomodoro_settings').select('*').eq('user_id', userId).maybeSingle(),
  ])

  const pomRow = pomRes.data as DbRow | null
  const pomodoroSettings: PomodoroSettings | null = pomRow
    ? {
        workDuration: pomRow.work_duration as number,
        shortBreakDuration: pomRow.short_break_duration as number,
        longBreakDuration: pomRow.long_break_duration as number,
        sessionsBeforeLongBreak: pomRow.sessions_before_long_break as number,
        autoStartBreak: pomRow.auto_start_break as boolean,
        autoStartWork: pomRow.auto_start_work as boolean,
      }
    : null

  return {
    tasks: ((tasksRes.data as DbRow[]) || []).map(taskFromDb),
    projects: ((projectsRes.data as DbRow[]) || []).map(projectFromDb),
    labels: ((labelsRes.data as DbRow[]) || []).map(labelFromDb),
    habits: ((habitsRes.data as DbRow[]) || []).map(habitFromDb),
    pomodoroSettings,
  }
}

// ── Upsert / Delete operations (fire-and-forget from store) ──────────────

export function syncTask(task: Task, userId: string) {
  supabase?.from('tasks').upsert(taskToDb(task, userId)).then(() => {})
}

export function syncDeleteTask(id: string) {
  supabase?.from('tasks').delete().eq('id', id).then(() => {})
}

export function syncProject(project: Project, userId: string) {
  supabase?.from('projects').upsert(projectToDb(project, userId)).then(() => {})
}

export function syncDeleteProject(id: string) {
  supabase?.from('projects').delete().eq('id', id).then(() => {})
}

export function syncLabel(label: Label, userId: string) {
  supabase?.from('labels').upsert(labelToDb(label, userId)).then(() => {})
}

export function syncDeleteLabel(id: string) {
  supabase?.from('labels').delete().eq('id', id).then(() => {})
}

export function syncHabit(habit: Habit, userId: string) {
  supabase?.from('habits').upsert(habitToDb(habit, userId)).then(() => {})
}

export function syncDeleteHabit(id: string) {
  supabase?.from('habits').delete().eq('id', id).then(() => {})
}

export function syncPomodoroSettings(settings: PomodoroSettings, userId: string) {
  supabase?.from('pomodoro_settings').upsert({
    user_id: userId,
    work_duration: settings.workDuration,
    short_break_duration: settings.shortBreakDuration,
    long_break_duration: settings.longBreakDuration,
    sessions_before_long_break: settings.sessionsBeforeLongBreak,
    auto_start_break: settings.autoStartBreak,
    auto_start_work: settings.autoStartWork,
    updated_at: new Date().toISOString(),
  }).then(() => {})
}

// ── Bulk migrate local data to Supabase (used on first sign-up) ──────────

export async function migrateLocalDataToSupabase(
  tasks: Task[],
  projects: Project[],
  labels: Label[],
  habits: Habit[],
  pomodoroSettings: PomodoroSettings,
  userId: string
) {
  if (!supabase) return

  const ops: PromiseLike<unknown>[] = []

  if (projects.length > 0) {
    ops.push(supabase.from('projects').upsert(projects.map((p) => projectToDb(p, userId))))
  }
  if (labels.length > 0) {
    ops.push(supabase.from('labels').upsert(labels.map((l) => labelToDb(l, userId))))
  }
  if (tasks.length > 0) {
    ops.push(supabase.from('tasks').upsert(tasks.map((t) => taskToDb(t, userId))))
  }
  if (habits.length > 0) {
    ops.push(supabase.from('habits').upsert(habits.map((h) => habitToDb(h, userId))))
  }
  ops.push(
    supabase.from('pomodoro_settings').upsert({
      user_id: userId,
      work_duration: pomodoroSettings.workDuration,
      short_break_duration: pomodoroSettings.shortBreakDuration,
      long_break_duration: pomodoroSettings.longBreakDuration,
      sessions_before_long_break: pomodoroSettings.sessionsBeforeLongBreak,
      auto_start_break: pomodoroSettings.autoStartBreak,
      auto_start_work: pomodoroSettings.autoStartWork,
      updated_at: new Date().toISOString(),
    })
  )

  await Promise.all(ops)
}
