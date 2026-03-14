import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Quadrant, QUADRANT_LABELS, Task } from '@/types'
import { Grid3X3, Plus, Check, Trash2 } from 'lucide-react'
import { TaskEditor } from '@/components/TaskEditor'

export function MatrixView() {
  const { tasks, toggleTask, deleteTask } = useStore()
  const [adding, setAdding] = useState<Quadrant | null>(null)

  const quadrants: Quadrant[] = [
    'urgent-important',
    'not-urgent-important',
    'urgent-not-important',
    'not-urgent-not-important',
  ]

  const getQuadrantTasks = (q: Quadrant) =>
    tasks.filter((t) => t.quadrant === q && !t.completed).sort((a, b) => a.order - b.order)

  const QuadrantCell = ({ quadrant }: { quadrant: Quadrant }) => {
    const info = QUADRANT_LABELS[quadrant]
    const qTasks = getQuadrantTasks(quadrant)

    return (
      <div className="bg-surface-800 rounded-xl p-3 flex flex-col min-h-[200px]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold" style={{ color: info.color }}>{info.title}</h3>
            <p className="text-[10px] text-surface-400">{info.subtitle}</p>
          </div>
          <button
            onClick={() => setAdding(quadrant)}
            className="p-1 text-surface-500 hover:text-surface-50 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-1">
          {qTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 group">
              <button
                onClick={() => toggleTask(task.id)}
                className="task-checkbox flex-shrink-0"
                style={{ borderColor: info.color, width: '16px', height: '16px' }}
              >
                {task.completed && <Check size={9} />}
              </button>
              <span className="text-xs text-surface-200 flex-1 leading-tight">{task.title}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-surface-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          {qTasks.length === 0 && (
            <p className="text-[10px] text-surface-500 italic mt-2">Empty</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Grid3X3 size={24} className="text-purple-500" />
        Eisenhower Matrix
      </h1>

      {/* Axis labels */}
      <div className="mb-2 flex items-center justify-center gap-4 text-xs text-surface-400">
        <span>URGENT</span>
        <span className="text-surface-600">|</span>
        <span>NOT URGENT</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quadrants.map((q) => (
          <QuadrantCell key={q} quadrant={q} />
        ))}
      </div>

      {adding && (
        <TaskEditor
          onClose={() => setAdding(null)}
          defaultQuadrant={adding}
        />
      )}
    </div>
  )
}
