import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import { Task, Project, Label, Habit, PomodoroSettings, Priority, Quadrant, GtdContext, ViewType, ThemeMode, Attachment } from '@/types'
import {
  supabase,
  loadAllUserData,
  migrateLocalDataToSupabase,
  syncTask,
  syncDeleteTask,
  syncProject,
  syncDeleteProject,
  syncLabel,
  syncDeleteLabel,
  syncHabit,
  syncDeleteHabit,
  syncPomodoroSettings,
} from '@/lib/supabase'

interface AppState {
  // Data
  tasks: Task[]
  projects: Project[]
  labels: Label[]
  habits: Habit[]

  // UI State
  currentView: ViewType
  currentProjectId: string | null
  currentLabelId: string | null
  sidebarOpen: boolean
  searchQuery: string
  showCompleted: boolean

  // Pomodoro
  pomodoroSettings: PomodoroSettings

  // Theme
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void

  // Auth state (not persisted)
  userId: string | null
  isAuthLoading: boolean

  // Task actions
  addTask: (task: Partial<Task>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  toggleMyDay: (id: string) => void
  toggleStarred: (id: string) => void
  duplicateTask: (id: string) => void
  moveTask: (id: string, projectId: string | null) => void
  reorderTask: (id: string, newOrder: number) => void

  // Project actions
  addProject: (project: Partial<Project>) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Label actions
  addLabel: (label: Partial<Label>) => Label
  updateLabel: (id: string, updates: Partial<Label>) => void
  deleteLabel: (id: string) => void

  // Habit actions
  addHabit: (habit: Partial<Habit>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleHabitCompletion: (id: string, date: string) => void

  // UI actions
  setView: (view: ViewType, id?: string | null) => void
  toggleSidebar: () => void
  setSearchQuery: (q: string) => void
  setShowCompleted: (show: boolean) => void
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void

  // Auth actions
  setUserId: (id: string | null) => void
  setAuthLoading: (loading: boolean) => void
  loadFromSupabase: (userId: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [
        { id: 'default', name: 'Personal', color: '#4073ff', icon: 'user', order: 0, isFavorite: false, areaId: 'personal', dueDate: null },
        { id: 'work', name: 'Work', color: '#db4035', icon: 'briefcase', order: 1, isFavorite: false, areaId: 'professional', dueDate: null },
      ],
      labels: [
        { id: 'l1', name: 'urgent', color: '#800080' },
        { id: 'l2', name: 'focus', color: '#4073ff' },
        { id: 'l3', name: 'quick-win', color: '#299438' },
      ],
      habits: [],
      currentView: 'myday',
      currentProjectId: null,
      currentLabelId: null,
      sidebarOpen: false,
      searchQuery: '',
      showCompleted: false,
      pomodoroSettings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        autoStartBreak: false,
        autoStartWork: false,
      },

      theme: 'dark' as ThemeMode,
      setTheme: (theme) => set({ theme }),

      // Auth state (defaults — not restored from localStorage)
      userId: null,
      isAuthLoading: true,

      // ── Auth actions ────────────────────────────────────────────────────

      setUserId: (id) => set({ userId: id }),
      setAuthLoading: (loading) => set({ isAuthLoading: loading }),

      loadFromSupabase: async (userId) => {
        set({ isAuthLoading: true })
        const data = await loadAllUserData(userId)
        const hasSupabaseData =
          data.tasks.length > 0 || data.projects.length > 0 || data.habits.length > 0

        if (!hasSupabaseData) {
          // First sign-in: migrate existing local data to Supabase
          const state = get()
          await migrateLocalDataToSupabase(
            state.tasks,
            state.projects,
            state.labels,
            state.habits,
            state.pomodoroSettings,
            userId
          )
        } else {
          // Returning user: replace local state with Supabase data (authoritative)
          set({
            tasks: data.tasks,
            projects: data.projects,
            labels: data.labels,
            habits: data.habits,
            pomodoroSettings: data.pomodoroSettings ?? get().pomodoroSettings,
          })
        }
        set({ userId, isAuthLoading: false })
      },

      signOut: async () => {
        await supabase?.auth.signOut()
        set({ userId: null })
      },

      // ── Task actions ────────────────────────────────────────────────────

      addTask: (partial) => {
        const task: Task = {
          id: uuid(),
          title: partial.title || '',
          description: partial.description || '',
          completed: false,
          priority: (partial.priority || 4) as Priority,
          projectId: partial.projectId ?? null,
          labelIds: partial.labelIds || [],
          dueDate: partial.dueDate || null,
          dueTime: partial.dueTime || null,
          parentId: partial.parentId || null,
          order: get().tasks.length,
          createdAt: new Date().toISOString(),
          completedAt: null,
          recurring: partial.recurring || null,
          quadrant: (partial.quadrant || null) as Quadrant | null,
          gtdContext: (partial.gtdContext || null) as GtdContext | null,
          attachments: partial.attachments || [],
          reminder: partial.reminder || null,
          assignee: partial.assignee || null,
          isMyDay: partial.isMyDay ?? false,
          isStarred: partial.isStarred ?? false,
        }
        set((s) => ({ tasks: [...s.tasks, task] }))
        const { userId } = get()
        if (userId) syncTask(task, userId)
        return task
      },

      updateTask: (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
        const { userId, tasks } = get()
        if (userId) {
          const updated = tasks.find((t) => t.id === id)
          if (updated) syncTask(updated, userId)
        }
      },

      deleteTask: (id) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id && t.parentId !== id),
        }))
        const { userId } = get()
        if (userId) syncDeleteTask(id)
      },

      toggleTask: (id) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
              : t
          ),
        }))
        const { userId, tasks } = get()
        if (userId) {
          const updated = tasks.find((t) => t.id === id)
          if (updated) syncTask(updated, userId)
        }
      },

      toggleMyDay: (id) => {
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === id ? { ...t, isMyDay: !t.isMyDay } : t),
        }))
        const { userId, tasks } = get()
        if (userId) {
          const updated = tasks.find((t) => t.id === id)
          if (updated) syncTask(updated, userId)
        }
      },

      toggleStarred: (id) => {
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === id ? { ...t, isStarred: !t.isStarred } : t),
        }))
        const { userId, tasks } = get()
        if (userId) {
          const updated = tasks.find((t) => t.id === id)
          if (updated) syncTask(updated, userId)
        }
      },

      reorderTask: (id, newOrder) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, order: newOrder } : t)),
        }))
        const { userId, tasks } = get()
        if (userId) {
          const updated = tasks.find((t) => t.id === id)
          if (updated) syncTask(updated, userId)
        }
      },

      duplicateTask: (id) => {
        const original = get().tasks.find((t) => t.id === id)
        if (!original) return
        const duplicate: Task = {
          ...original,
          id: uuid(),
          title: `${original.title} (copy)`,
          completed: false,
          completedAt: null,
          order: get().tasks.length,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ tasks: [...s.tasks, duplicate] }))
        const { userId } = get()
        if (userId) syncTask(duplicate, userId)
      },

      moveTask: (id, projectId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, projectId } : t)),
        }))
        const { userId, tasks } = get()
        if (userId) {
          const updated = tasks.find((t) => t.id === id)
          if (updated) syncTask(updated, userId)
        }
      },

      // ── Project actions ─────────────────────────────────────────────────

      addProject: (partial) => {
        const project: Project = {
          id: uuid(),
          name: partial.name || 'New Goal',
          color: partial.color || '#808080',
          icon: partial.icon || 'hash',
          order: get().projects.length,
          isFavorite: false,
          areaId: partial.areaId ?? null,
          dueDate: partial.dueDate ?? null,
        }
        set((s) => ({ projects: [...s.projects, project] }))
        const { userId } = get()
        if (userId) syncProject(project, userId)
        return project
      },

      updateProject: (id, updates) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
        const { userId, projects } = get()
        if (userId) {
          const updated = projects.find((p) => p.id === id)
          if (updated) syncProject(updated, userId)
        }
      },

      deleteProject: (id) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
        }))
        const { userId } = get()
        if (userId) syncDeleteProject(id)
      },

      // ── Label actions ───────────────────────────────────────────────────

      addLabel: (partial) => {
        const label: Label = {
          id: uuid(),
          name: partial.name || 'New Label',
          color: partial.color || '#808080',
        }
        set((s) => ({ labels: [...s.labels, label] }))
        const { userId } = get()
        if (userId) syncLabel(label, userId)
        return label
      },

      updateLabel: (id, updates) => {
        set((s) => ({
          labels: s.labels.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }))
        const { userId, labels } = get()
        if (userId) {
          const updated = labels.find((l) => l.id === id)
          if (updated) syncLabel(updated, userId)
        }
      },

      deleteLabel: (id) => {
        // Capture which tasks had this label before removing it
        const affectedTaskIds = get().tasks
          .filter((t) => t.labelIds.includes(id))
          .map((t) => t.id)

        set((s) => ({
          labels: s.labels.filter((l) => l.id !== id),
          tasks: s.tasks.map((t) => ({ ...t, labelIds: t.labelIds.filter((lid) => lid !== id) })),
        }))

        const { userId, tasks } = get()
        if (userId) {
          syncDeleteLabel(id)
          // Re-sync affected tasks so their label_ids array is updated in DB
          tasks
            .filter((t) => affectedTaskIds.includes(t.id))
            .forEach((t) => syncTask(t, userId))
        }
      },

      // ── Habit actions ───────────────────────────────────────────────────

      addHabit: (partial) => {
        const habit: Habit = {
          id: uuid(),
          name: partial.name || 'New Habit',
          icon: partial.icon || 'check-circle',
          color: partial.color || '#299438',
          frequency: partial.frequency || 'daily',
          customDays: partial.customDays || [],
          targetCount: partial.targetCount || 1,
          completions: {},
          createdAt: new Date().toISOString(),
          streak: 0,
          bestStreak: 0,
          order: get().habits.length,
        }
        set((s) => ({ habits: [...s.habits, habit] }))
        const { userId } = get()
        if (userId) syncHabit(habit, userId)
      },

      updateHabit: (id, updates) => {
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }))
        const { userId, habits } = get()
        if (userId) {
          const updated = habits.find((h) => h.id === id)
          if (updated) syncHabit(updated, userId)
        }
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
        const { userId } = get()
        if (userId) syncDeleteHabit(id)
      },

      toggleHabitCompletion: (id, date) => {
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h
            const current = h.completions[date] || 0
            const newCount = current >= h.targetCount ? 0 : current + 1
            const completions = { ...h.completions, [date]: newCount }

            // Recalculate streak
            let streak = 0
            const today = new Date()
            for (let i = 0; i < 365; i++) {
              const d = new Date(today)
              d.setDate(d.getDate() - i)
              const key = d.toISOString().split('T')[0]
              if ((completions[key] || 0) >= h.targetCount) {
                streak++
              } else if (i > 0) break
            }

            return {
              ...h,
              completions,
              streak,
              bestStreak: Math.max(h.bestStreak, streak),
            }
          }),
        }))
        const { userId, habits } = get()
        if (userId) {
          const updated = habits.find((h) => h.id === id)
          if (updated) syncHabit(updated, userId)
        }
      },

      // ── UI actions ──────────────────────────────────────────────────────

      setView: (view, id = null) =>
        set({
          currentView: view,
          currentProjectId: view === 'project' ? id : null,
          currentLabelId: view === 'label' ? id : null,
          sidebarOpen: false,
        }),

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setShowCompleted: (show) => set({ showCompleted: show }),

      updatePomodoroSettings: (settings) => {
        set((s) => ({ pomodoroSettings: { ...s.pomodoroSettings, ...settings } }))
        const { userId, pomodoroSettings } = get()
        if (userId) syncPomodoroSettings(pomodoroSettings, userId)
      },
    }),
    {
      name: 'get-done-storage',
      version: 1,
      // Exclude auth state from localStorage persistence
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        labels: state.labels,
        habits: state.habits,
        currentView: state.currentView,
        currentProjectId: state.currentProjectId,
        currentLabelId: state.currentLabelId,
        sidebarOpen: state.sidebarOpen,
        searchQuery: state.searchQuery,
        showCompleted: state.showCompleted,
        pomodoroSettings: state.pomodoroSettings,
        theme: state.theme,
      }),
    }
  )
)
