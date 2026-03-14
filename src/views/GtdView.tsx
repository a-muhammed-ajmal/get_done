import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { GtdContext, GTD_LABELS, Task } from '@/types'
import {
  ListTodo, Inbox, Zap, Clock, Cloud, Bookmark, FolderOpen, Plus, Check, Trash2
} from 'lucide-react'
import { TaskEditor } from '@/components/TaskEditor'

const iconMap: Record<string, any> = {
  inbox: Inbox, zap: Zap, clock: Clock, cloud: Cloud, bookmark: Bookmark, 'folder': FolderOpen,
}

export function GtdView() {
  const { tasks, toggleTask, deleteTask, updateTask } = useStore()
  const [activeContext, setActiveContext] = useState<GtdContext>('inbox')
  const [adding, setAdding] = useState(false)

  const contexts: GtdContext[] = ['inbox', 'next-action', 'waiting-for', 'someday-maybe', 'reference', 'project-support']

  const getContextTasks = (ctx: GtdContext) =>
    tasks.filter((t) => t.gtdContext === ctx && !t.completed).sort((a, b) => a.order - b.order)

  const currentTasks = getContextTasks(activeContext)
  const info = GTD_LABELS[activeContext]
  const Icon = iconMap[info.icon] || Inbox

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <ListTodo size={24} className="text-blue-500" />
        Getting Things Done
      </h1>

      {/* Context tabs - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
        {contexts.map((ctx) => {
          const ctxInfo = GTD_LABELS[ctx]
          const CtxIcon = iconMap[ctxInfo.icon] || Inbox
          const count = getContextTasks(ctx).length
          return (
            <button
              key={ctx}
              onClick={() => setActiveContext(ctx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0
                ${activeContext === ctx
                  ? 'text-white'
                  : 'bg-surface-800 text-surface-400 hover:text-surface-200'
                }`}
              style={activeContext === ctx ? { backgroundColor: ctxInfo.color + '25', color: ctxInfo.color } : {}}
            >
              <CtxIcon size={16} />
              <span className="font-medium">{ctxInfo.title}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeContext === ctx ? 'bg-white/20' : 'bg-surface-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={20} style={{ color: info.color }} />
          <h2 className="text-lg font-semibold">{info.title}</h2>
          <span className="text-xs text-surface-400 bg-surface-800 px-2 py-0.5 rounded-full">
            {currentTasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* GTD workflow hint */}
      {activeContext === 'inbox' && (
        <div className="bg-surface-800/50 rounded-lg p-3 mb-4 text-xs text-surface-400 leading-relaxed">
          <strong className="text-surface-300">GTD Inbox:</strong> Capture everything here, then process:
          Is it actionable? If yes, do it (2 min), delegate, or defer. If no, trash it, file it, or add to Someday/Maybe.
        </div>
      )}

      {/* Task list */}
      <div className="space-y-1">
        {currentTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-800/50 group transition-colors">
            <button
              onClick={() => toggleTask(task.id)}
              className="task-checkbox"
              style={{ borderColor: info.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{task.title}</p>
              {task.description && <p className="text-xs text-surface-400 mt-0.5">{task.description}</p>}
            </div>

            {/* Move to different context */}
            <select
              value={task.gtdContext || ''}
              onChange={(e) => updateTask(task.id, { gtdContext: e.target.value as GtdContext })}
              className="text-xs bg-surface-700 rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {contexts.map((ctx) => (
                <option key={ctx} value={ctx}>{GTD_LABELS[ctx].title}</option>
              ))}
            </select>

            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-surface-500 hover:text-red-400 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {currentTasks.length === 0 && (
        <div className="text-center py-12 text-surface-500">
          <Icon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No items in {info.title}</p>
        </div>
      )}

      {adding && (
        <TaskEditor
          onClose={() => setAdding(false)}
          defaultGtdContext={activeContext}
        />
      )}
    </div>
  )
}
