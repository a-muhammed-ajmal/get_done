import { useState, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { Priority, Task, PRIORITY_COLORS, Quadrant, GtdContext, RecurringConfig, Attachment, Reminder } from '@/types'
import { v4 as uuid } from 'uuid'
import {
  X, Flag, Calendar, FolderOpen, Tag, AlignLeft,
  Check, Clock, Paperclip, Bell, Repeat, User,
  Plus, Trash2, ListTree, ChevronDown, ChevronUp
} from 'lucide-react'

interface TaskEditorProps {
  task?: Task
  onClose: () => void
  defaultProjectId?: string | null
  defaultDueDate?: string | null
  defaultQuadrant?: Quadrant | null
  defaultGtdContext?: GtdContext | null
}

export function TaskEditor({ task, onClose, defaultProjectId, defaultDueDate, defaultQuadrant, defaultGtdContext }: TaskEditorProps) {
  const { addTask, updateTask, projects, labels, tasks } = useStore()

  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<Priority>(task?.priority || 4)
  const [projectId, setProjectId] = useState<string | null>(task?.projectId ?? defaultProjectId ?? null)
  const [labelIds, setLabelIds] = useState<string[]>(task?.labelIds || [])
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDueDate ?? '')
  const [dueTime, setDueTime] = useState(task?.dueTime ?? '')
  const [assignee, setAssignee] = useState(task?.assignee ?? '')
  const [attachments, setAttachments] = useState<Attachment[]>(task?.attachments || [])
  const [reminder, setReminder] = useState<Reminder | null>(task?.reminder ?? null)
  const [recurring, setRecurring] = useState<RecurringConfig | null>(task?.recurring ?? null)
  const [parentId] = useState<string | null>(task?.parentId ?? null)
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [showPriority, setShowPriority] = useState(false)
  const [showProject, setShowProject] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [showRecurring, setShowRecurring] = useState(false)
  const [expandAdvanced, setExpandAdvanced] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const subtasks = task ? tasks.filter((t) => t.parentId === task.id) : []

  const handleSave = () => {
    if (!title.trim()) return
    if (task) {
      updateTask(task.id, {
        title, description, priority, projectId, labelIds,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        assignee: assignee.trim() || null,
        attachments,
        reminder,
        recurring,
      })
    } else {
      const newTask = addTask({
        title, description, priority, projectId, labelIds,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        quadrant: defaultQuadrant || null,
        gtdContext: defaultGtdContext || null,
        assignee: assignee.trim() || null,
        attachments,
        reminder,
        recurring,
        parentId,
      })
      if (subtaskTitle.trim()) {
        addTask({
          title: subtaskTitle.trim(),
          parentId: newTask.id,
        })
      }
    }
    onClose()
  }

  const handleAddSubtask = () => {
    if (!subtaskTitle.trim() || !task) return
    addTask({
      title: subtaskTitle.trim(),
      parentId: task.id,
      projectId: task.projectId,
    })
    setSubtaskTitle('')
  }

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments((prev) => [...prev, {
          id: uuid(),
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
          addedAt: new Date().toISOString(),
        }])
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="modal-backdrop flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="w-full md:max-w-lg bg-surface-800 rounded-t-2xl md:rounded-2xl animate-slide-up p-5 max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-surface-700">
          <h2 className="text-lg font-semibold text-surface-50">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1.5 text-surface-400 hover:text-surface-50 hover:bg-surface-700 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-3 mb-5 pb-4 border-b border-surface-700">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full text-lg font-semibold bg-transparent text-surface-50 placeholder:text-surface-500 outline-none"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes or details..."
            rows={2}
            className="w-full text-sm bg-transparent text-surface-400 placeholder:text-surface-500 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Essential Fields */}
        <div className="space-y-3 mb-5 pb-4 border-b border-surface-700">
          <div className="flex items-center gap-2">
            <Flag size={14} className="text-primary-500" />
            <h3 className="text-xs font-semibold text-surface-300 uppercase tracking-wide">Essential</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-surface-700/50 hover:bg-surface-700 transition-colors cursor-pointer group">
              <span className="text-xs text-surface-400 group-hover:text-surface-300 font-medium">Due Date</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-transparent text-sm text-surface-50 font-medium focus:outline-none" />
            </label>
            <label className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-surface-700/50 hover:bg-surface-700 transition-colors cursor-pointer group">
              <span className="text-xs text-surface-400 group-hover:text-surface-300 font-medium">Time</span>
              <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="bg-transparent text-sm text-surface-50 font-medium focus:outline-none" />
            </label>
            <div className="relative">
              <button onClick={() => setShowPriority(!showPriority)} className="w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-surface-700/50 hover:bg-surface-700 transition-colors text-left">
                <span className="text-xs text-surface-400 font-medium">Priority</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-surface-50">
                  <Flag size={12} style={{ color: PRIORITY_COLORS[priority] }} />
                  P{priority}
                </span>
              </button>
              {showPriority && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-surface-700 rounded-lg shadow-xl py-1 z-10 animate-scale-in">
                  {([1, 2, 3, 4] as Priority[]).map((p) => (
                    <button key={p} onClick={() => { setPriority(p); setShowPriority(false) }} className="flex items-center gap-2 px-3 py-2.5 w-full text-sm hover:bg-surface-600 transition-colors">
                      <Flag size={12} style={{ color: PRIORITY_COLORS[p] }} />
                      <span>Priority {p}</span>
                      {priority === p && <Check size={14} className="ml-auto text-primary-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowProject(!showProject)} className="w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-surface-700/50 hover:bg-surface-700 transition-colors text-left">
                <span className="text-xs text-surface-400 font-medium">Goal</span>
                <span className="text-sm font-medium text-surface-50 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: projects.find((p) => p.id === projectId)?.color || '#666' }} />
                  {projects.find((p) => p.id === projectId)?.name || 'Inbox'}
                </span>
              </button>
              {showProject && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-surface-700 rounded-lg shadow-xl py-1 z-10 animate-scale-in">
                  <button onClick={() => { setProjectId(null); setShowProject(false) }} className="flex items-center gap-2 px-3 py-2.5 w-full text-sm hover:bg-surface-600 transition-colors">
                    <span className="w-2.5 h-2.5 rounded-full bg-surface-500" />
                    <span>Inbox</span>
                  </button>
                  {projects.map((p) => (
                    <button key={p.id} onClick={() => { setProjectId(p.id); setShowProject(false) }} className="flex items-center gap-2 px-3 py-2.5 w-full text-sm hover:bg-surface-600 transition-colors">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>{p.name}</span>
                      {projectId === p.id && <Check size={14} className="ml-auto text-primary-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-3 flex-1">
          <button onClick={() => setExpandAdvanced(!expandAdvanced)} className="flex items-center justify-between w-full px-3 py-2.5 bg-gradient-to-r from-surface-700/50 to-primary-600/5 hover:from-surface-700 rounded-lg transition-colors group">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-primary-500" />
              <h3 className="text-xs font-semibold text-surface-300 uppercase tracking-wide">Advanced</h3>
            </div>
            {expandAdvanced ? <ChevronUp size={16} className="text-surface-400 group-hover:text-surface-300 transition-colors" /> : <ChevronDown size={16} className="text-surface-400 group-hover:text-surface-300 transition-colors" />}
          </button>

          {expandAdvanced && (
            <div className="space-y-3 animate-fade-in">
              {/* Labels */}
              <div className="relative">
                <button onClick={() => setShowLabels(!showLabels)} className="flex items-center gap-2 px-3 py-2.5 w-full rounded-lg bg-surface-700/50 hover:bg-surface-700 transition-colors text-left">
                  <Tag size={14} className="text-surface-400" />
                  <span className="text-sm text-surface-300">Labels</span>
                  <span className="ml-auto text-xs text-surface-500">{labelIds.length > 0 ? labelIds.length : 'None'}</span>
                </button>
                {showLabels && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-surface-700 rounded-lg shadow-xl py-1 z-10 animate-scale-in">
                    {labels.map((l) => (
                      <button key={l.id} onClick={() => { setLabelIds((prev) => prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id]) }} className="flex items-center gap-2 px-3 py-2.5 w-full text-sm hover:bg-surface-600 transition-colors">
                        <Tag size={12} style={{ color: l.color }} />
                        <span>{l.name}</span>
                        {labelIds.includes(l.id) && <Check size={14} className="ml-auto text-primary-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface-700/50 hover:bg-surface-700 transition-colors">
                <User size={14} className="text-surface-400 flex-shrink-0" />
                <input type="text" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Assign to..." className="flex-1 text-sm bg-transparent text-surface-50 placeholder:text-surface-500 outline-none" />
              </div>

              {/* Reminder */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface-700/50 hover:bg-surface-700 transition-colors flex-wrap">
                <Bell size={14} className="text-surface-400 flex-shrink-0" />
                <input type="date" value={reminder?.date || ''} onChange={(e) => { if (e.target.value) setReminder({ date: e.target.value, time: reminder?.time || '09:00' }); else setReminder(null) }} className="flex-1 min-w-[100px] bg-transparent text-sm text-surface-50 outline-none" />
                {reminder && (
                  <>
                    <input type="time" value={reminder.time} onChange={(e) => setReminder({ ...reminder, time: e.target.value })} className="flex-1 min-w-[80px] bg-transparent text-sm text-surface-50 outline-none" />
                    <button onClick={() => setReminder(null)} className="p-1 text-surface-400 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* Recurring */}
              <div className="rounded-lg bg-surface-700/50">
                <button onClick={() => setShowRecurring(!showRecurring)} className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-surface-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <Repeat size={14} className="text-surface-400" />
                    <span className="text-sm text-surface-300">
                      {recurring ? `Repeats ${recurring.type === 'daily' ? 'Daily' : recurring.type === 'weekly' ? 'Weekly' : recurring.type === 'monthly' ? 'Monthly' : 'Yearly'}` : 'Add Recurring'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {recurring && (
                      <button onClick={(e) => { e.stopPropagation(); setRecurring(null) }} className="p-0.5 text-surface-400 hover:text-red-400 transition-colors">
                        <X size={12} />
                      </button>
                    )}
                    <ChevronDown size={14} className={`text-surface-400 transition-transform ${showRecurring ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {showRecurring && (
                  <div className="px-3 pb-3 space-y-2.5 border-t border-surface-600 animate-fade-in">
                    <div className="flex gap-2 flex-wrap pt-2">
                      {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((type) => (
                        <button key={type} onClick={() => setRecurring({ type, interval: recurring?.interval || 1, daysOfWeek: recurring?.daysOfWeek })} className={`px-2.5 py-1 text-xs rounded-full transition-colors ${recurring?.type === type ? 'bg-primary-600 text-white' : 'bg-surface-600 text-surface-400 hover:bg-surface-500'}`}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    {recurring && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-surface-400">Every</span>
                        <input type="number" min={1} max={99} value={recurring.interval} onChange={(e) => setRecurring({ ...recurring, interval: Math.max(1, parseInt(e.target.value) || 1) })} className="w-12 px-2 py-1 bg-surface-600 rounded text-center text-surface-50" />
                        <span className="text-surface-400">{recurring.type === 'daily' ? 'day(s)' : recurring.type === 'weekly' ? 'week(s)' : recurring.type === 'monthly' ? 'month(s)' : 'year(s)'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="rounded-lg bg-surface-700/50">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-surface-600">
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} className="text-surface-400" />
                    <span className="text-sm text-surface-300">Attachments</span>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-500 transition-colors">
                    <Plus size={12} />
                    Add
                  </button>
                  <input ref={fileInputRef} type="file" multiple onChange={handleFileAttach} className="hidden" />
                </div>
                {attachments.length > 0 && (
                  <div className="space-y-1.5 px-3 py-2.5">
                    {attachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-2 px-2 py-1.5 bg-surface-600/50 rounded text-xs">
                        <Paperclip size={11} className="text-surface-400 flex-shrink-0" />
                        <span className="truncate flex-1 text-surface-200">{att.name}</span>
                        <span className="text-surface-500 flex-shrink-0">{formatFileSize(att.size)}</span>
                        <button onClick={() => removeAttachment(att.id)} className="p-0.5 text-surface-400 hover:text-red-400 transition-colors flex-shrink-0">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div className="rounded-lg bg-surface-700/50">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-surface-600">
                  <ListTree size={14} className="text-surface-400" />
                  <span className="text-sm text-surface-300">Sub-tasks</span>
                </div>
                {subtasks.length > 0 && (
                  <div className="space-y-1 px-3 py-2.5 border-b border-surface-600">
                    {subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2 px-2 py-1.5 bg-surface-600/50 rounded text-xs">
                        <Check size={12} className="text-surface-400 flex-shrink-0" />
                        <span className={`flex-1 ${st.completed ? 'line-through text-surface-500' : 'text-surface-200'}`}>{st.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <input type="text" value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && task) { handleAddSubtask(); e.preventDefault() } }} placeholder="Add a sub-task..." className="flex-1 text-xs bg-transparent text-surface-50 placeholder:text-surface-500 outline-none" />
                  {task && subtaskTitle.trim() && (
                    <button onClick={handleAddSubtask} className="p-1 text-primary-500 hover:text-primary-400 transition-colors">
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-surface-700">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-surface-400 hover:text-surface-50 hover:bg-surface-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!title.trim()} className="flex-1 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-500 hover:to-primary-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-primary-500 transition-all">
            {task ? 'Save' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
