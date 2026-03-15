import { useStore } from '@/store/useStore'
import { TaskList } from '@/components/TaskList'
import { TaskEditor } from '@/components/TaskEditor'
import { Star, Plus } from 'lucide-react'
import { useState } from 'react'

export function ImportantView() {
  const tasks = useStore((s) => s.tasks)
  const [adding, setAdding] = useState(false)

  const starredTasks = tasks.filter((t) => t.isStarred && !t.completed)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star size={24} className="text-yellow-400 fill-yellow-400" />
            Important
          </h1>
          <p className="text-sm text-surface-400 mt-0.5">
            {starredTasks.length} starred {starredTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add task
        </button>
      </div>

      <TaskList
        tasks={starredTasks}
        emptyMessage="No starred tasks. Star a task to see it here."
        showProject
      />

      {adding && <TaskEditor onClose={() => setAdding(false)} />}
    </div>
  )
}
