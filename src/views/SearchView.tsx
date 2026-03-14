import { useStore } from '@/store/useStore'
import { TaskList } from '@/components/TaskList'
import { Search, X } from 'lucide-react'
import { useRef, useEffect } from 'react'

export function SearchView() {
  const { tasks, searchQuery, setSearchQuery } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filteredTasks = searchQuery.trim()
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      {/* Search input */}
      <div className="flex items-center gap-3 bg-surface-800 rounded-xl px-4 py-3 mb-6">
        <Search size={20} className="text-surface-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="flex-1 text-base"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-surface-400 hover:text-surface-50">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results */}
      {searchQuery.trim() ? (
        <>
          <p className="text-xs text-surface-400 mb-3 px-3">
            {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''}
          </p>
          <TaskList tasks={filteredTasks} emptyMessage="No matching tasks" />
        </>
      ) : (
        <div className="text-center py-16 text-surface-500">
          <Search size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Type to search your tasks</p>
        </div>
      )}
    </div>
  )
}
