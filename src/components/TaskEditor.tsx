import { useState, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { Priority, Task, PRIORITY_COLORS, Quadrant, GtdContext, RecurringConfig, Attachment, Reminder } from '@/types'
import { v4 as uuid } from 'uuid'
import {
  X, Flag, Calendar, FolderOpen, Tag, AlignLeft,
  Check, Clock, Paperclip, Bell, Repeat, User,
  Plus, Trash2, ListTree, ChevronDown
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

  // Subtask state
  const [subtaskTitle, setSubtaskTitle] = useState('')

  // Dropdown toggles
  const [showPriority, setShowPriority] = useState(false)
  const [showProject, setShowProject] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [showRecurring, setShowRecurring] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get subtasks if editing
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
      // Add subtasks if any typed
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
        const newAttachment: Attachment = {
          id: uuid(),
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
          addedAt: new Date().toISOString(),
        }
        setAttachments((prev) => [...prev, newAttachment])
      }
      reader.readAsDataURL(file)
    })
    // Reset input
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
        className="w-full md:max-w-lg bg-surface-800 rounded-t-2xl md:rounded-2xl animate-slide-up p-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task name"
          className="w-full text-lg font-medium mb-2 placeholder:text-surface-300/50"
          autoFocus
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={2}
          className="w-full text-sm text-surface-300 mb-3 resize-none placeholder:text-surface-300/30"
        />

        {/* Quick options row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Due date */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-700 text-sm cursor-pointer hover:bg-surface-600 transition-colors">
            <Calendar size={14} className="text-surface-300" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-transparent text-sm w-[110px]"
            />
          </label>

          {/* Due time */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-700 text-sm cursor-pointer hover:bg-surface-600 transition-colors">
            <Clock size={14} className="text-surface-300" />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="bg-transparent text-sm w-[80px]"
            />
          </label>

          {/* Priority */}
          <div className="relative">
            <button
              onClick={() => setShowPriority(!showPriority)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-700 text-sm hover:bg-surface-600 transition-colors"
            >
              <Flag size={14} style={{ color: PRIORITY_COLORS[priority] }} />
              <span>P{priority}</span>
            </button>
            {showPriority && (
              <div className="absolute top-full mt-1 left-0 bg-surface-700 rounded-lg shadow-xl py-1 z-10 animate-scale-in">
                {([1, 2, 3, 4] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPriority(p); setShowPriority(false) }}
                    className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-surface-600 transition-colors"
                  >
                    <Flag size={14} style={{ color: PRIORITY_COLORS[p] }} />
                    <span>Priority {p}</span>
                    {priority === p && <Check size={14} className="ml-auto text-primary-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project */}
          <div className="relative">
            <button
              onClick={() => setShowProject(!showProject)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-700 text-sm hover:bg-surface-600 transition-colors"
            >
              <FolderOpen size={14} className="text-surface-300" />
              <span>{projects.find((p) => p.id === projectId)?.name || 'Project'}</span>
            </button>
            {showProject && (
              <div className="absolute top-full mt-1 left-0 bg-surface-700 rounded-lg shadow-xl py-1 z-10 animate-scale-in min-w-[160px]">
                <button
                  onClick={() => { setProjectId(null); setShowProject(false) }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-surface-600 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-surface-400" />
                  <span>No Project</span>
                </button>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setProjectId(p.id); setShowProject(false) }}
                    className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-surface-600 transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.name}</span>
                    {projectId === p.id && <Check size={14} className="ml-auto text-primary-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="relative">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-700 text-sm hover:bg-surface-600 transition-colors"
            >
              <Tag size={14} className="text-surface-300" />
              <span>{labelIds.length > 0 ? `${labelIds.length} labels` : 'Labels'}</span>
            </button>
            {showLabels && (
              <div className="absolute top-full mt-1 right-0 bg-surface-700 rounded-lg shadow-xl py-1 z-10 animate-scale-in min-w-[160px]">
                {labels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setLabelIds((prev) =>
                        prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id]
                      )
                    }}
                    className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-surface-600 transition-colors"
                  >
                    <Tag size={14} style={{ color: l.color }} />
                    <span>{l.name}</span>
                    {labelIds.includes(l.id) && <Check size={14} className="ml-auto text-primary-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Extended options */}
        <div className="space-y-3 mb-3">
          {/* Assignee */}
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-700/50 rounded-lg">
            <User size={14} className="text-surface-400 flex-shrink-0" />
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Assign to someone..."
              className="flex-1 text-sm bg-transparent placeholder:text-surface-400"
            />
          </div>

          {/* Reminder */}
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-700/50 rounded-lg">
            <Bell size={14} className="text-surface-400 flex-shrink-0" />
            <span className="text-sm text-surface-400 flex-shrink-0">Reminder</span>
            <input
              type="date"
              value={reminder?.date || ''}
              onChange={(e) => {
                if (e.target.value) {
                  setReminder({ date: e.target.value, time: reminder?.time || '09:00' })
                } else {
                  setReminder(null)
                }
              }}
              className="bg-transparent text-sm w-[110px]"
            />
            {reminder && (
              <input
                type="time"
                value={reminder.time}
                onChange={(e) => setReminder({ ...reminder, time: e.target.value })}
                className="bg-transparent text-sm w-[80px]"
              />
            )}
            {reminder && (
              <button
                onClick={() => setReminder(null)}
                className="ml-auto p-0.5 text-surface-400 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Recurring */}
          <div className="bg-surface-700/50 rounded-lg">
            <button
              onClick={() => setShowRecurring(!showRecurring)}
              className="flex items-center gap-2 px-3 py-2 w-full"
            >
              <Repeat size={14} className="text-surface-400" />
              <span className="text-sm text-surface-400">
                {recurring
                  ? `Repeats ${recurring.type}${recurring.interval > 1 ? ` every ${recurring.interval}` : ''}`
                  : 'Recurring'
                }
              </span>
              {recurring && (
                <button
                  onClick={(e) => { e.stopPropagation(); setRecurring(null) }}
                  className="ml-auto p-0.5 text-surface-400 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
              <ChevronDown size={14} className={`ml-auto text-surface-400 transition-transform ${showRecurring ? 'rotate-180' : ''}`} />
            </button>
            {showRecurring && (
              <div className="px-3 pb-3 space-y-2 animate-fade-in">
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setRecurring({ type, interval: recurring?.interval || 1, daysOfWeek: recurring?.daysOfWeek })}
                      className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                        recurring?.type === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-surface-600 text-surface-300 hover:bg-surface-500'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                {recurring && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-400">Every</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={recurring.interval}
                      onChange={(e) => setRecurring({ ...recurring, interval: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-14 px-2 py-1 text-xs bg-surface-600 rounded text-center"
                    />
                    <span className="text-xs text-surface-400">
                      {recurring.type === 'daily' ? 'day(s)' : recurring.type === 'weekly' ? 'week(s)' : recurring.type === 'monthly' ? 'month(s)' : 'year(s)'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File attachments */}
          <div className="bg-surface-700/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={14} className="text-surface-400" />
              <span className="text-sm text-surface-400">Attachments</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="ml-auto flex items-center gap-1 px-2 py-0.5 text-xs bg-surface-600 text-surface-300 rounded hover:bg-surface-500 transition-colors"
              >
                <Plus size={12} />
                Add file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileAttach}
                className="hidden"
              />
            </div>
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 px-2 py-1.5 bg-surface-600/50 rounded text-xs">
                    <Paperclip size={11} className="text-surface-400 flex-shrink-0" />
                    <span className="truncate flex-1 text-surface-200">{att.name}</span>
                    <span className="text-surface-500 flex-shrink-0">{formatFileSize(att.size)}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="p-0.5 text-surface-400 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div className="bg-surface-700/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <ListTree size={14} className="text-surface-400" />
              <span className="text-sm text-surface-400">Sub-tasks</span>
            </div>
            {/* Existing subtasks (edit mode) */}
            {subtasks.length > 0 && (
              <div className="space-y-1 mb-2">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-2 px-2 py-1.5 bg-surface-600/50 rounded text-xs">
                    <span className={`flex-1 ${st.completed ? 'line-through text-surface-500' : 'text-surface-200'}`}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && task) { handleAddSubtask(); e.preventDefault() }
                }}
                placeholder="Add a sub-task..."
                className="flex-1 text-xs bg-transparent placeholder:text-surface-500"
              />
              {task && subtaskTitle.trim() && (
                <button
                  onClick={handleAddSubtask}
                  className="p-1 text-primary-500 hover:text-primary-400 transition-colors"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-surface-300 hover:text-surface-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {task ? 'Save' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
