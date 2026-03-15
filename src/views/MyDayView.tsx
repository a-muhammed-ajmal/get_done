import { useStore } from '@/store/useStore'
import { TaskList } from '@/components/TaskList'
import { TaskEditor } from '@/components/TaskEditor'
import { Sun, Plus } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'

export function MyDayView() {
  const tasks = useStore((s) => s.tasks)
  const [adding, setAdding] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < today && !t.completed
  )

  const myDayTasks = tasks.filter((t) => t.isMyDay && !t.completed && t.dueDate !== today)
    .filter((t) => !t.dueDate || t.dueDate >= today) // exclude overdue already shown above

  const todayScheduledTasks = tasks.filter(
    (t) => t.dueDate === today && !t.isMyDay
  )

  const allMyDayActive = tasks.filter(
    (t) => (t.isMyDay || t.dueDate === today) && !t.completed
  )
  const deduped = [...new Map([...overdueTasks, ...allMyDayActive].map(t => [t.id, t])).values()]

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sun size={24} className="text-yellow-400" />
            My Day
          </h1>
          <p className="text-sm text-surface-400 mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
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
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider px-3 mb-2">
            Overdue ({overdueTasks.length})
          </h2>
          <TaskList tasks={overdueTasks} showProject />
        </div>
      )}

      <TaskList
        tasks={[...tasks.filter(t => t.isMyDay && !t.completed && (!t.dueDate || t.dueDate >= today)), ...todayScheduledTasks].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)}
        emptyMessage="Start your day — add tasks to My Day."
        showProject
      />

      {adding && (
        <TaskEditor
          onClose={() => setAdding(false)}
          defaultDueDate={today}
        />
      )}
    </div>
  )
}
