import { Task } from '@/types'
import { TaskItem } from './TaskItem'
import { useStore } from '@/store/useStore'

interface TaskListProps {
  tasks: Task[]
  showProject?: boolean
  emptyMessage?: string
}

export function TaskList({ tasks, showProject = true, emptyMessage = 'No tasks' }: TaskListProps) {
  const showCompleted = useStore((s) => s.showCompleted)

  const activeTasks = tasks.filter((t) => !t.completed).sort((a, b) => a.order - b.order)
  const completedTasks = tasks.filter((t) => t.completed).sort(
    (a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
  )

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-surface-400">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {activeTasks.map((task) => (
        <TaskItem key={task.id} task={task} showProject={showProject} />
      ))}

      {completedTasks.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => useStore.getState().setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-surface-400 hover:text-surface-300 transition-colors"
          >
            <span>{showCompleted ? 'Hide' : 'Show'} completed ({completedTasks.length})</span>
          </button>
          {showCompleted && completedTasks.map((task) => (
            <TaskItem key={task.id} task={task} showProject={showProject} />
          ))}
        </div>
      )}
    </div>
  )
}
