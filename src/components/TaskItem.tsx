import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Task, PRIORITY_COLORS } from '@/types'
import { TaskEditor } from './TaskEditor'
import {
  Check, Calendar, Tag, Trash2, Edit3,
  MoreVertical, Copy, FolderOpen, Paperclip, Bell, User, Clock, Star, Sun
} from 'lucide-react'
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'

interface TaskItemProps {
  task: Task
  showProject?: boolean
}

export function TaskItem({ task, showProject = true }: TaskItemProps) {
  const { toggleTask, deleteTask, duplicateTask, moveTask, toggleMyDay, toggleStarred, projects, labels } = useStore()
  const [editing, setEditing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const project = projects.find((p) => p.id === task.projectId)
  const taskLabels = labels.filter((l) => task.labelIds.includes(l.id))

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
        setShowMoveMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  const formatDueDate = (date: string) => {
    const d = parseISO(date)
    if (isToday(d)) return 'Today'
    if (isTomorrow(d)) return 'Tomorrow'
    return format(d, 'MMM d')
  }

  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) && !task.completed

  return (
    <>
      <div
        className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-800/50 transition-colors ${
          task.completed ? 'opacity-50' : ''
        }`}
      >
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className="task-checkbox mt-0.5"
          style={{ borderColor: task.completed ? '#555' : PRIORITY_COLORS[task.priority] }}
        >
          {task.completed && <Check size={12} className="text-surface-300" />}
        </button>

        {/* Content — click opens TaskEditor */}
        <div className="flex-1 min-w-0" onClick={() => setEditing(true)}>
          <p className={`text-sm leading-snug ${task.completed ? 'line-through text-surface-400' : 'text-surface-50'}`}>
            {task.title}
          </p>

          {task.description && (
            <p className="text-xs text-surface-400 mt-0.5 line-clamp-1">{task.description}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-surface-400'}`}>
                <Calendar size={11} />
                {formatDueDate(task.dueDate)}
                {task.dueTime && (
                  <span className="flex items-center gap-0.5">
                    <Clock size={10} />
                    {task.dueTime}
                  </span>
                )}
              </span>
            )}
            {showProject && project && (
              <span className="flex items-center gap-1 text-xs text-surface-400">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                {project.name}
              </span>
            )}
            {task.assignee && (
              <span className="flex items-center gap-1 text-xs text-surface-400">
                <User size={10} />
                {task.assignee}
              </span>
            )}
            {task.attachments && task.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-surface-400">
                <Paperclip size={10} />
                {task.attachments.length}
              </span>
            )}
            {task.reminder && (
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <Bell size={10} />
              </span>
            )}
            {task.recurring && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                ↻
              </span>
            )}
            {taskLabels.map((l) => (
              <span key={l.id} className="flex items-center gap-1 text-xs" style={{ color: l.color }}>
                <Tag size={10} />
                {l.name}
              </span>
            ))}
          </div>
        </div>

        {/* Star button (visible on hover or when starred) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleStarred(task.id)
          }}
          title={task.isStarred ? 'Unstar' : 'Star (Important)'}
          className={`p-1.5 rounded transition-colors ${
            task.isStarred
              ? 'text-yellow-400'
              : 'text-surface-600 opacity-0 group-hover:opacity-100 hover:text-yellow-400'
          }`}
        >
          <Star size={14} className={task.isStarred ? 'fill-yellow-400' : ''} />
        </button>

        {/* 3-dot menu button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
              setShowMoveMenu(false)
            }}
            className="p-1.5 text-surface-500 hover:text-white rounded transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {/* Popup menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-700 rounded-lg shadow-xl py-1 z-50 animate-scale-in">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMyDay(task.id)
                  setShowMenu(false)
                }}
                className="flex items-center gap-2.5 px-3 py-2 w-full text-sm text-surface-200 hover:bg-surface-600 transition-colors"
              >
                <Sun size={14} className="text-yellow-400" />
                <span>{task.isMyDay ? 'Remove from My Day' : 'Add to My Day'}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditing(true)
                  setShowMenu(false)
                }}
                className="flex items-center gap-2.5 px-3 py-2 w-full text-sm text-surface-200 hover:bg-surface-600 transition-colors"
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  duplicateTask(task.id)
                  setShowMenu(false)
                }}
                className="flex items-center gap-2.5 px-3 py-2 w-full text-sm text-surface-200 hover:bg-surface-600 transition-colors"
              >
                <Copy size={14} />
                <span>Duplicate</span>
              </button>

              {/* Move to project */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMoveMenu(!showMoveMenu)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 w-full text-sm text-surface-200 hover:bg-surface-600 transition-colors"
                >
                  <FolderOpen size={14} />
                  <span>Move to</span>
                </button>
                {showMoveMenu && (
                  <div className="absolute left-full top-0 ml-1 w-44 bg-surface-700 rounded-lg shadow-xl py-1 z-50 animate-scale-in">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveTask(task.id, null)
                        setShowMenu(false)
                        setShowMoveMenu(false)
                      }}
                      className={`flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-surface-600 transition-colors ${
                        task.projectId === null ? 'text-primary-400' : 'text-surface-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-surface-400" />
                      <span>Inbox</span>
                      {task.projectId === null && <Check size={12} className="ml-auto text-primary-400" />}
                    </button>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveTask(task.id, p.id)
                          setShowMenu(false)
                          setShowMoveMenu(false)
                        }}
                        className={`flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-surface-600 transition-colors ${
                          task.projectId === p.id ? 'text-primary-400' : 'text-surface-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span>{p.name}</span>
                        {task.projectId === p.id && <Check size={12} className="ml-auto text-primary-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-surface-600 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteTask(task.id)
                  setShowMenu(false)
                }}
                className="flex items-center gap-2.5 px-3 py-2 w-full text-sm text-red-400 hover:bg-red-900/30 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {editing && <TaskEditor task={task} onClose={() => setEditing(false)} />}
    </>
  )
}
