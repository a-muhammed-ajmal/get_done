import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TaskEditor } from './TaskEditor'

export function QuickAddButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-20 w-14 h-14 rounded-full bg-primary-600 shadow-lg shadow-primary-600/30 flex items-center justify-center text-white hover:bg-primary-500 active:scale-95 transition-all"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {open && <TaskEditor onClose={() => setOpen(false)} />}
    </>
  )
}
