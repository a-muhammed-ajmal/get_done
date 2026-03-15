import { useStore } from '@/store/useStore'
import { TaskItem } from '@/components/TaskItem'
import { CheckCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export function CompletedView() {
  const tasks = useStore((s) => s.tasks)

  const completedTasks = tasks
    .filter((t) => t.completed)
    .sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0
      return bTime - aTime
    })

  // Group by completion date
  const groups: Record<string, typeof completedTasks> = {}
  for (const task of completedTasks) {
    const dateKey = task.completedAt
      ? format(parseISO(task.completedAt), 'yyyy-MM-dd')
      : 'Unknown'
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(task)
  }

  const formatGroupDate = (dateKey: string) => {
    if (dateKey === 'Unknown') return 'Unknown date'
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
    if (dateKey === today) return 'Today'
    if (dateKey === yesterday) return 'Yesterday'
    return format(parseISO(dateKey), 'EEE, MMM d')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle size={24} className="text-green-400" />
        <div>
          <h1 className="text-2xl font-bold">Completed</h1>
          <p className="text-sm text-surface-400 mt-0.5">
            {completedTasks.length} completed {completedTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
      </div>

      {completedTasks.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No completed tasks yet.</p>
        </div>
      ) : (
        Object.entries(groups).map(([dateKey, tasks]) => (
          <div key={dateKey} className="mb-6">
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-3 mb-2">
              {formatGroupDate(dateKey)} · {tasks.length}
            </h2>
            <div>
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} showProject />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
