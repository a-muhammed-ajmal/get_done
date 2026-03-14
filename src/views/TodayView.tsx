import { useStore } from '@/store/useStore'
import { TaskList } from '@/components/TaskList'
import { format } from 'date-fns'
import { CalendarDays, Plus } from 'lucide-react'
import { useState } from 'react'
import { TaskEditor } from '@/components/TaskEditor'

export function TodayView() {
  const tasks = useStore((s) => s.tasks)
  const [adding, setAdding] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  const todayTasks = tasks.filter(
    (t) => t.dueDate === today || (t.dueDate && t.dueDate < today && !t.completed)
  )

  const overdueTasks = todayTasks.filter((t) => t.dueDate && t.dueDate < today && !t.completed)
  const todayOnlyTasks = todayTasks.filter((t) => t.dueDate === today)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Today
          </h1>
          <p className="text-sm text-surface-400 mt-0.5">{format(new Date(), 'EEE, MMM d')}</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add task
        </button>
      </div>

      {overdueTasks.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider px-3 mb-2">
            Overdue
          </h2>
          <TaskList tasks={overdueTasks} />
        </div>
      )}

      <TaskList
        tasks={todayOnlyTasks}
        emptyMessage="No tasks for today. Enjoy your day!"
      />

      {adding && <TaskEditor onClose={() => setAdding(false)} defaultDueDate={today} />}
    </div>
  )
}
