import { useStore } from '@/store/useStore'
import {
  Sun, Star, Calendar, Inbox, CheckCircle2, Plus,
  ChevronDown, ChevronRight, Search, ListTodo,
  Timer, Grid3X3, Target, Sun as SunIcon,
  Moon, Monitor, X
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { ViewType, ThemeMode, FIXED_AREAS, PROJECT_COLORS } from '@/types'
import { format } from 'date-fns'

// ── New Goal Modal ────────────────────────────────────────────────────────────

interface NewGoalModalProps {
  onClose: () => void
}

function NewGoalModal({ onClose }: NewGoalModalProps) {
  const addProject = useStore((s) => s.addProject)
  const setView = useStore((s) => s.setView)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[11]) // purple default
  const [areaId, setAreaId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleCreate = () => {
    if (!name.trim()) return
    const project = addProject({
      name: name.trim(),
      color,
      icon: 'hash',
      areaId,
      dueDate: dueDate || null,
    })
    setView('project', project.id)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="bg-surface-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">New Goal</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Name */}
        <div className="mb-3">
          <label className="text-xs font-medium text-surface-400 mb-1 block">Goal name</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            placeholder="e.g. Launch product, Learn guitar…"
            className="w-full bg-surface-700 text-surface-50 text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary-600 placeholder-surface-500"
          />
        </div>

        {/* Color swatches */}
        <div className="mb-3">
          <label className="text-xs font-medium text-surface-400 mb-2 block">Color</label>
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-1 ring-offset-surface-800 ring-primary-400 scale-110' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Area */}
        <div className="mb-3">
          <label className="text-xs font-medium text-surface-400 mb-1 block">Life Area</label>
          <select
            value={areaId || ''}
            onChange={(e) => setAreaId(e.target.value || null)}
            className="w-full bg-surface-700 text-surface-50 text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary-600"
          >
            <option value="">No Area (General)</option>
            {FIXED_AREAS.map((area) => (
              <option key={area.id} value={area.id}>
                {area.emoji} {area.name}
              </option>
            ))}
          </select>
        </div>

        {/* Due date */}
        <div className="mb-5">
          <label className="text-xs font-medium text-surface-400 mb-1 block">Target Date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-surface-700 text-surface-50 text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm text-surface-300 hover:bg-surface-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded-lg text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Goal
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const {
    currentView, currentProjectId, tasks, projects,
    setView, theme, setTheme
  } = useStore()
  const userId = useStore((s) => s.userId)
  const signOut = useStore((s) => s.signOut)

  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({})
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showTools, setShowTools] = useState(false)

  const themeOptions: { value: ThemeMode; label: string; icon: any }[] = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light',  label: 'Light',  icon: SunIcon },
    { value: 'dark',   label: 'Dark',   icon: Moon },
  ]

  const toggleArea = (areaId: string) =>
    setExpandedAreas((prev) => ({ ...prev, [areaId]: !prev[areaId] }))

  // ── Badge counts ───────────────────────
  const today = format(new Date(), 'yyyy-MM-dd')
  const myDayCount = tasks.filter((t) => !t.completed && t.isMyDay).length
  const importantCount = tasks.filter((t) => !t.completed && t.isStarred).length
  const upcomingCount = tasks.filter((t) => !t.completed && t.dueDate).length
  const inboxCount = tasks.filter((t) => !t.completed && !t.projectId).length

  // ── System list items ──────────────────
  const systemItems = [
    {
      view: 'myday' as ViewType,
      icon: Sun,
      label: 'My Day',
      iconClassName: 'text-yellow-400',
      badge: myDayCount,
    },
    {
      view: 'important' as ViewType,
      icon: Star,
      label: 'Important',
      iconClassName: 'text-pink-400',
      badge: importantCount,
    },
    {
      view: 'upcoming' as ViewType,
      icon: Calendar,
      label: 'Upcoming',
      iconClassName: 'text-blue-400',
      badge: upcomingCount,
    },
    {
      view: 'completed' as ViewType,
      icon: CheckCircle2,
      label: 'Completed',
      iconClassName: 'text-green-400',
      badge: null, // hidden by default
    },
    {
      view: 'inbox' as ViewType,
      icon: Inbox,
      label: 'Inbox',
      iconClassName: 'text-surface-400',
      badge: inboxCount,
    },
  ]

  // ── Tool items ─────────────────────────
  const toolItems: { view: ViewType; icon: any; label: string }[] = [
    { view: 'habits',  icon: Target,    label: 'Habits' },
    { view: 'pomodoro',icon: Timer,     label: 'Pomodoro' },
    { view: 'matrix',  icon: Grid3X3,   label: '4 Quadrants' },
    { view: 'gtd',     icon: ListTodo,  label: 'GTD' },
  ]

  return (
    <>
      <div className="flex flex-col h-full overflow-y-auto pb-0">

        {/* ── User Profile ─────────────────── */}
        <div className="px-4 pt-4 pb-3 border-b border-surface-700/60">
          {/* App logo row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <ListTodo size={15} className="text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">Get Done</span>
          </div>
          {/* Profile pill */}
          {userId ? (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-surface-700/50 group">
              <div className="w-7 h-7 rounded-full bg-primary-600/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-400">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-surface-50 truncate leading-tight">Muhammed Ajmal</p>
                <p className="text-[10px] text-surface-400 truncate leading-tight">Signed in</p>
              </div>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="text-surface-500 hover:text-surface-200 transition-colors opacity-0 group-hover:opacity-100 text-[10px]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-surface-700/50">
              <div className="w-7 h-7 rounded-full bg-surface-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-surface-400">G</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-surface-50 truncate leading-tight">Guest</p>
                <p className="text-[10px] text-surface-400 truncate leading-tight">Local mode</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Search ───────────────────────── */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => setView('search')}
            className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors
              ${currentView === 'search'
                ? 'bg-surface-700 text-surface-50'
                : 'text-surface-400 hover:bg-surface-700/60 hover:text-surface-200'}`}
          >
            <Search size={15} />
            <span>Search</span>
            <kbd className="ml-auto text-[10px] text-surface-500 bg-surface-700 rounded px-1">⌘K</kbd>
          </button>
        </div>

        {/* ── System Lists ─────────────────── */}
        <nav className="px-3 pt-2 space-y-0.5">
          {systemItems.map(({ view, icon: Icon, label, iconClassName, badge }) => {
            const isActive = currentView === view
            return (
              <button
                key={view}
                onClick={() => setView(view)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                  ${isActive
                    ? 'bg-primary-600/20 text-primary-400 font-medium'
                    : 'text-surface-200 hover:bg-surface-700/60'}`}
              >
                <Icon size={16} className={isActive ? 'text-primary-400' : iconClassName} />
                <span className="flex-1 text-left truncate">{label}</span>
                {badge !== null && badge > 0 && (
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full leading-none
                    ${isActive ? 'bg-primary-600/30 text-primary-300' : 'bg-surface-700 text-surface-400'}`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Divider ──────────────────────── */}
        <div className="mx-3 my-3 border-t border-surface-700/60" />

        {/* ── Life Areas + Goals ───────────── */}
        <div className="px-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">Life Areas</span>
            <button
              onClick={() => setShowNewGoal(true)}
              title="New Goal"
              className="flex items-center gap-1 text-[11px] text-surface-500 hover:text-primary-400 transition-colors px-1 py-0.5 rounded"
            >
              <Plus size={13} />
              <span>New Goal</span>
            </button>
          </div>

          <div className="space-y-0.5">
            {FIXED_AREAS.map((area) => {
              const areaGoals = projects.filter((p) => p.areaId === area.id)
              const isExpanded = expandedAreas[area.id] ?? false
              const hasActiveGoal = areaGoals.some(
                (g) => currentView === 'project' && currentProjectId === g.id
              )

              return (
                <div key={area.id}>
                  {/* Area header row */}
                  <button
                    onClick={() => toggleArea(area.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all
                      ${hasActiveGoal && !isExpanded ? 'text-primary-400' : 'text-surface-300 hover:text-surface-50 hover:bg-surface-700/50'}`}
                  >
                    <span className="text-base leading-none">{area.emoji}</span>
                    <span className="flex-1 text-left text-sm font-medium truncate">{area.name}</span>
                    {areaGoals.length > 0 && (
                      <span className="text-[10px] text-surface-500 mr-1">{areaGoals.length}</span>
                    )}
                    {isExpanded
                      ? <ChevronDown size={13} className="text-surface-500 flex-shrink-0" />
                      : <ChevronRight size={13} className="text-surface-500 flex-shrink-0" />
                    }
                  </button>

                  {/* Goals under this area */}
                  {isExpanded && (
                    <div className="ml-3 mt-0.5 space-y-0.5 border-l border-surface-700/60 pl-2">
                      {areaGoals.length === 0 ? (
                        <p className="text-[11px] text-surface-500 py-1.5 px-2 italic">No goals yet</p>
                      ) : (
                        areaGoals
                          .sort((a, b) => a.order - b.order)
                          .map((goal) => {
                            const isGoalActive = currentView === 'project' && currentProjectId === goal.id
                            const goalTaskCount = tasks.filter(
                              (t) => t.projectId === goal.id && !t.completed
                            ).length
                            return (
                              <button
                                key={goal.id}
                                onClick={() => setView('project', goal.id)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all
                                  ${isGoalActive
                                    ? 'bg-primary-600/20 text-primary-400 font-medium'
                                    : 'text-surface-300 hover:bg-surface-700/50 hover:text-surface-50'}`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: goal.color }}
                                />
                                <span className="flex-1 text-left truncate text-sm">{goal.name}</span>
                                {goalTaskCount > 0 && (
                                  <span className={`text-[11px] px-1 leading-none
                                    ${isGoalActive ? 'text-primary-300' : 'text-surface-500'}`}>
                                    {goalTaskCount}
                                  </span>
                                )}
                              </button>
                            )
                          })
                      )}
                      {/* Add goal to this area shortcut */}
                      <button
                        onClick={() => setShowNewGoal(true)}
                        className="flex items-center gap-1.5 px-2 py-1 w-full text-[11px] text-surface-500 hover:text-primary-400 transition-colors rounded"
                      >
                        <Plus size={11} />
                        Add goal
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Goals without a specific area */}
            {projects.filter((p) => !p.areaId).length > 0 && (
              <div className="mt-1">
                <p className="text-[10px] text-surface-500 px-2 py-1 uppercase tracking-widest">Other Goals</p>
                {projects
                  .filter((p) => !p.areaId)
                  .sort((a, b) => a.order - b.order)
                  .map((goal) => {
                    const isGoalActive = currentView === 'project' && currentProjectId === goal.id
                    const goalTaskCount = tasks.filter((t) => t.projectId === goal.id && !t.completed).length
                    return (
                      <button
                        key={goal.id}
                        onClick={() => setView('project', goal.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                          ${isGoalActive
                            ? 'bg-primary-600/20 text-primary-400 font-medium'
                            : 'text-surface-200 hover:bg-surface-700/60'}`}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: goal.color }} />
                        <span className="flex-1 text-left truncate">{goal.name}</span>
                        {goalTaskCount > 0 && (
                          <span className="text-[11px] text-surface-500">{goalTaskCount}</span>
                        )}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>
        </div>

        {/* ── Divider ──────────────────────── */}
        <div className="mx-3 my-3 border-t border-surface-700/60" />

        {/* ── Tools (collapsible) ───────────── */}
        <div className="px-3 mb-2">
          <button
            onClick={() => setShowTools(!showTools)}
            className="flex items-center gap-2 w-full mb-1.5"
          >
            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest flex-1 text-left px-1">Tools</span>
            {showTools
              ? <ChevronDown size={13} className="text-surface-500" />
              : <ChevronRight size={13} className="text-surface-500" />
            }
          </button>
          {showTools && (
            <div className="space-y-0.5">
              {toolItems.map(({ view, icon: Icon, label }) => {
                const isActive = currentView === view
                return (
                  <button
                    key={view}
                    onClick={() => setView(view)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                      ${isActive
                        ? 'bg-primary-600/20 text-primary-400 font-medium'
                        : 'text-surface-300 hover:bg-surface-700/60 hover:text-surface-50'}`}
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Theme toggle — pinned to bottom ── */}
        <div className="mt-auto sticky bottom-0 bg-surface-800 border-t border-surface-700/60 px-3 py-2">
          <div className="flex items-center gap-1">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] transition-colors
                  ${theme === value
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-surface-500 hover:bg-surface-700/60 hover:text-surface-200'}`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoal && <NewGoalModal onClose={() => setShowNewGoal(false)} />}
    </>
  )
}
