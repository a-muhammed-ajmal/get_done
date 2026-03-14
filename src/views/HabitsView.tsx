import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Habit, PROJECT_COLORS } from '@/types'
import { Target, Plus, Flame, Trophy, X, Check, Trash2, Edit3 } from 'lucide-react'
import { format, subDays, startOfWeek, addDays } from 'date-fns'

export function HabitsView() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabitCompletion } = useStore()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#299438')
  const [targetCount, setTargetCount] = useState(1)

  const today = format(new Date(), 'yyyy-MM-dd')
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), day: format(d, 'd') }
  })

  const handleSave = () => {
    if (!name.trim()) return
    if (editingId) {
      updateHabit(editingId, { name, color, targetCount })
    } else {
      addHabit({ name, color, targetCount })
    }
    setName('')
    setColor('#299438')
    setTargetCount(1)
    setAdding(false)
    setEditingId(null)
  }

  const getCompletionPercent = (habit: Habit, date: string) => {
    const count = habit.completions[date] || 0
    return Math.min(count / habit.targetCount, 1)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target size={24} className="text-green-500" />
          Habits
        </h1>
        <button
          onClick={() => { setAdding(true); setEditingId(null); setName(''); setColor('#299438'); setTargetCount(1) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Week header */}
      <div className="flex items-center gap-1 mb-4 px-3">
        <div className="flex-1" />
        {last7Days.map((day) => (
          <div
            key={day.date}
            className={`w-9 text-center text-[10px] font-medium ${
              day.date === today ? 'text-primary-500' : 'text-surface-400'
            }`}
          >
            <div>{day.label}</div>
            <div className="text-xs font-bold mt-0.5">{day.day}</div>
          </div>
        ))}
      </div>

      {/* Habit list */}
      <div className="space-y-2">
        {habits.map((habit) => (
          <div key={habit.id} className="bg-surface-800 rounded-xl p-3">
            <div className="flex items-center gap-2">
              {/* Habit info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                  <span className="text-sm font-medium truncate">{habit.name}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {habit.streak > 0 && (
                    <span className="flex items-center gap-1 text-xs text-orange-400">
                      <Flame size={12} /> {habit.streak}d
                    </span>
                  )}
                  {habit.bestStreak > 0 && (
                    <span className="flex items-center gap-1 text-xs text-surface-400">
                      <Trophy size={11} /> {habit.bestStreak}d best
                    </span>
                  )}
                </div>
              </div>

              {/* Day circles */}
              {last7Days.map((day) => {
                const pct = getCompletionPercent(habit, day.date)
                const count = habit.completions[day.date] || 0
                const isComplete = count >= habit.targetCount
                return (
                  <button
                    key={day.date}
                    onClick={() => toggleHabitCompletion(habit.id, day.date)}
                    className="relative w-9 h-9 flex items-center justify-center flex-shrink-0"
                  >
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor"
                        className="text-surface-700" strokeWidth="3" />
                      <circle cx="16" cy="16" r="13" fill="none"
                        stroke={habit.color} strokeWidth="3"
                        strokeDasharray={`${pct * 81.68} 81.68`}
                        className="habit-ring" strokeLinecap="round" />
                    </svg>
                    {isComplete && (
                      <Check size={12} className="absolute" style={{ color: habit.color }} />
                    )}
                    {!isComplete && count > 0 && (
                      <span className="absolute text-[9px] font-bold" style={{ color: habit.color }}>{count}</span>
                    )}
                  </button>
                )
              })}

              {/* Actions */}
              <div className="flex flex-col gap-1 ml-1">
                <button
                  onClick={() => {
                    setEditingId(habit.id)
                    setName(habit.name)
                    setColor(habit.color)
                    setTargetCount(habit.targetCount)
                    setAdding(true)
                  }}
                  className="p-1 text-surface-500 hover:text-surface-50 transition-colors"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-1 text-surface-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {habits.length === 0 && !adding && (
        <div className="text-center py-16 text-surface-400">
          <Target size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No habits yet. Start building good habits!</p>
        </div>
      )}

      {/* Add/Edit modal */}
      {adding && (
        <div className="modal-backdrop flex items-end md:items-center justify-center" onClick={() => { setAdding(false); setEditingId(null) }}>
          <div className="w-full md:max-w-md bg-surface-800 rounded-t-2xl md:rounded-2xl animate-slide-up p-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Habit' : 'New Habit'}</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit name (e.g., Exercise, Read)"
              className="w-full text-sm mb-3 border-b border-surface-600 pb-2 placeholder:text-surface-400"
              autoFocus
            />
            <div className="mb-3">
              <label className="text-xs text-surface-400 mb-1 block">Daily target</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-20 text-sm border border-surface-600 rounded-lg px-3 py-1.5 bg-surface-700"
                />
                <span className="text-xs text-surface-400">times per day</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-surface-400 mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.slice(0, 12).map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                      color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-800' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-surface-700">
              <button onClick={() => { setAdding(false); setEditingId(null) }} className="px-4 py-2 text-sm text-surface-400">Cancel</button>
              <button onClick={handleSave} disabled={!name.trim()} className="px-6 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg disabled:opacity-40">
                {editingId ? 'Save' : 'Add Habit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
