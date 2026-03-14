import { useStore } from '@/store/useStore'
import { TaskList } from '@/components/TaskList'
import { TaskEditor } from '@/components/TaskEditor'
import { Calendar, Plus } from 'lucide-react'
import { useState } from 'react'
import { format, addDays, parseISO, startOfDay } from 'date-fns'

export function UpcomingView() {
  const tasks = useStore((s) => s.tasks)
  const [adding, setAdding] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const today = startOfDay(new Date())
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, i)
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEE, MMM d'),
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    }
  })

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < format(today, 'yyyy-MM-dd') && !t.completed
  )

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar size={24} className="text-primary-500" />
          Upcoming
        </h1>
      </div>

      {/* Date pills - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-hide">
        {days.map((day) => {
          const count = tasks.filter((t) => t.dueDate === day.date && !t.completed).length
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`flex flex-col items-center min-w-[52px] px-2 py-2 rounded-xl text-xs transition-all
                ${selectedDate === day.date
                  ? 'bg-primary-600 text-white'
                  : day.isWeekend
                    ? 'bg-surface-800 text-surface-400'
                    : 'bg-surface-800 text-surface-200 hover:bg-surface-700'
                }`}
            >
              <span className="text-[10px] font-medium opacity-70">{day.dayName}</span>
              <span className="text-base font-bold mt-0.5">{day.dayNum}</span>
              {count > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                  selectedDate === day.date ? 'bg-white' : 'bg-primary-500'
                }`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Overdue */}
      {overdueTasks.length > 0 && !selectedDate && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider px-3 mb-2">
            Overdue ({overdueTasks.length})
          </h2>
          <TaskList tasks={overdueTasks} />
        </div>
      )}

      {/* Day sections */}
      {selectedDate ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-surface-300 px-3">
              {days.find((d) => d.date === selectedDate)?.label}
            </h2>
            <button
              onClick={() => setAdding(true)}
              className="text-primary-500 p-1"
            >
              <Plus size={18} />
            </button>
          </div>
          <TaskList
            tasks={tasks.filter((t) => t.dueDate === selectedDate)}
            emptyMessage="No tasks scheduled"
          />
        </div>
      ) : (
        days.map((day) => {
          const dayTasks = tasks.filter((t) => t.dueDate === day.date && !t.completed)
          if (dayTasks.length === 0) return null
          return (
            <div key={day.date} className="mb-4">
              <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-3 mb-1.5">
                {day.label}
              </h2>
              <TaskList tasks={dayTasks} />
            </div>
          )
        })
      )}

      {adding && (
        <TaskEditor
          onClose={() => setAdding(false)}
          defaultDueDate={selectedDate}
        />
      )}
    </div>
  )
}
