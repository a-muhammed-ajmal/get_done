import { useStore } from '@/store/useStore'
import { TaskList } from '@/components/TaskList'
import { TaskEditor } from '@/components/TaskEditor'
import { Plus, MoreHorizontal, Edit3, Trash2, Star } from 'lucide-react'
import { useState } from 'react'
import { PROJECT_COLORS } from '@/types'

export function ProjectView() {
  const { tasks, projects, currentProjectId, updateProject, deleteProject, setView } = useStore()
  const [adding, setAdding] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingColor, setEditingColor] = useState(false)
  const [name, setName] = useState('')

  const project = projects.find((p) => p.id === currentProjectId)
  if (!project) return <div className="p-4 text-surface-400">Project not found</div>

  const projectTasks = tasks.filter((t) => t.projectId === project.id)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: project.color }} />
          {editingName ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name.trim()) updateProject(project.id, { name: name.trim() })
                setEditingName(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (name.trim()) updateProject(project.id, { name: name.trim() })
                  setEditingName(false)
                }
              }}
              className="text-2xl font-bold bg-transparent border-b border-primary-500"
              autoFocus
            />
          ) : (
            <h1 className="text-2xl font-bold">{project.name}</h1>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-surface-400 hover:text-surface-50 rounded-lg transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-surface-700 rounded-lg shadow-xl py-1 z-10 min-w-[180px] animate-scale-in">
                <button
                  onClick={() => {
                    setName(project.name)
                    setEditingName(true)
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm text-surface-200 hover:bg-surface-600"
                >
                  <Edit3 size={14} /> Rename
                </button>
                <button
                  onClick={() => {
                    updateProject(project.id, { isFavorite: !project.isFavorite })
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm text-surface-200 hover:bg-surface-600"
                >
                  <Star size={14} /> {project.isFavorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button
                  onClick={() => { setEditingColor(!editingColor); setShowMenu(false) }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm text-surface-200 hover:bg-surface-600"
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: project.color }} />
                  Change color
                </button>
                <hr className="my-1 border-surface-600" />
                <button
                  onClick={() => {
                    deleteProject(project.id)
                    setView('inbox')
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm text-red-400 hover:bg-surface-600"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Color picker */}
      {editingColor && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-surface-800 rounded-lg animate-fade-in">
          {PROJECT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                updateProject(project.id, { color })
                setEditingColor(false)
              }}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                project.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-800' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      <TaskList
        tasks={projectTasks}
        showProject={false}
        emptyMessage="No tasks in this project"
      />

      {adding && (
        <TaskEditor
          onClose={() => setAdding(false)}
          defaultProjectId={project.id}
        />
      )}
    </div>
  )
}
