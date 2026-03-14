import { useStore } from '@/store/useStore'
import {
  Inbox, CalendarDays, Calendar, Hash, Tag, Target,
  Timer, Grid3X3, ListTodo, Plus, Star, ChevronDown, ChevronRight,
  Heart, Briefcase, User, Search, Menu, Sun, Moon, Monitor
} from 'lucide-react'
import { useState } from 'react'
import { ViewType, ThemeMode } from '@/types'

const iconMap: Record<string, any> = {
  user: User, briefcase: Briefcase, hash: Hash, heart: Heart, star: Star,
}

export function Sidebar() {
  const { currentView, currentProjectId, projects, labels, setView, toggleSidebar } = useStore()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [labelsOpen, setLabelsOpen] = useState(true)
  const [toolsOpen, setToolsOpen] = useState(true)
  const addProject = useStore((s) => s.addProject)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  const themeOptions: { value: ThemeMode; label: string; icon: any }[] = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light',  label: 'Light',  icon: Sun },
    { value: 'dark',   label: 'Dark',   icon: Moon },
  ]

  const navItems: { view: ViewType; icon: any; label: string }[] = [
    { view: 'inbox', icon: Inbox, label: 'Inbox' },
    { view: 'today', icon: CalendarDays, label: 'Today' },
    { view: 'upcoming', icon: Calendar, label: 'Upcoming' },
  ]

  const toolItems: { view: ViewType; icon: any; label: string }[] = [
    { view: 'habits', icon: Target, label: 'Habits' },
    { view: 'pomodoro', icon: Timer, label: 'Pomodoro' },
    { view: 'matrix', icon: Grid3X3, label: '4 Quadrants' },
    { view: 'gtd', icon: ListTodo, label: 'GTD' },
  ]

  const NavItem = ({ view, icon: Icon, label, active }: any) => (
    <button
      onClick={() => setView(view)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
        ${active ? 'bg-primary-600/20 text-primary-400' : 'text-surface-200 hover:bg-surface-700'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 pt-4 pb-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <ListTodo size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg">Get Done</span>
      </div>

      {/* Search */}
      <button
        onClick={() => setView('search')}
        className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg text-sm text-surface-300 hover:bg-surface-700 transition-colors"
      >
        <Search size={18} />
        <span>Search</span>
      </button>

      {/* Main navigation */}
      <nav className="space-y-0.5 mb-4">
        {navItems.map((item) => (
          <NavItem key={item.view} {...item} active={currentView === item.view} />
        ))}
      </nav>

      {/* Productivity tools */}
      <div className="mb-4">
        <button
          onClick={() => setToolsOpen(!toolsOpen)}
          className="flex items-center gap-2 px-3 py-1.5 w-full text-xs font-semibold text-surface-300 uppercase tracking-wider"
        >
          {toolsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Tools
        </button>
        {toolsOpen && (
          <div className="space-y-0.5 mt-1">
            {toolItems.map((item) => (
              <NavItem key={item.view} {...item} active={currentView === item.view} />
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="mb-4">
        <div className="flex items-center justify-between px-3 py-1.5">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-surface-300 uppercase tracking-wider"
          >
            {projectsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Projects
          </button>
          <button
            onClick={() => {
              const p = addProject({ name: 'New Project', color: '#808080' })
              setView('project', p.id)
            }}
            className="text-surface-400 hover:text-surface-50 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        {projectsOpen && (
          <div className="space-y-0.5 mt-1">
            {projects.map((project) => {
              const Icon = iconMap[project.icon] || Hash
              return (
                <button
                  key={project.id}
                  onClick={() => setView('project', project.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${currentView === 'project' && currentProjectId === project.id
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-surface-200 hover:bg-surface-700'
                    }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                  <span className="truncate">{project.name}</span>
                  {project.isFavorite && <Star size={12} className="text-yellow-500 ml-auto flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="mb-4">
        <div className="flex items-center justify-between px-3 py-1.5">
          <button
            onClick={() => setLabelsOpen(!labelsOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-surface-300 uppercase tracking-wider"
          >
            {labelsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Labels
          </button>
        </div>
        {labelsOpen && (
          <div className="space-y-0.5 mt-1">
            {labels.map((label) => (
              <button
                key={label.id}
                onClick={() => setView('label', label.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-200 hover:bg-surface-700 transition-colors"
              >
                <Tag size={14} style={{ color: label.color }} />
                <span>{label.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggle — pinned to bottom */}
      <div className="mt-auto sticky bottom-0 bg-surface-800 pt-2 pb-3 border-t border-surface-700">
        <p className="px-3 py-1.5 text-xs font-semibold text-surface-400 uppercase tracking-wider">Theme</p>
        <div className="flex items-center gap-1 px-3">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              title={label}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-colors
                ${theme === value
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-surface-400 hover:bg-surface-700 hover:text-surface-200'
                }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
