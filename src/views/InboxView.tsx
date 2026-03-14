import { useStore } from '@/store/useStore'
import { TaskList } from '@/components/TaskList'
import { Inbox, Plus } from 'lucide-react'
import { useState } from 'react'
import { TaskEditor } from '@/components/TaskEditor'

export function InboxView() {
  const tasks = useStore((s) => s.tasks)
  const [adding, setAdding] = useState(false)

  const inboxTasks = tasks.filter((t) => !t.projectId)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Inbox size={24} className="text-primary-500" />
          Inbox
        </h1>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add task
        </button>
      </div>

      <TaskList
        tasks={inboxTasks}
        showProject={false}
        emptyMessage="Your inbox is empty"
      />

      {adding && <TaskEditor onClose={() => setAdding(false)} />}
    </div>
  )
}
