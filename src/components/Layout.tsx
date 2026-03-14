import { ReactNode } from 'react'
import { useStore } from '@/store/useStore'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { QuickAddButton } from './QuickAddButton'

export function Layout({ children }: { children: ReactNode }) {
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const toggleSidebar = useStore((s) => s.toggleSidebar)

  return (
    <div className="h-full flex flex-col bg-surface-900">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="modal-backdrop md:hidden" onClick={toggleSidebar} />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - mobile drawer + desktop permanent */}
        <aside
          className={`
            fixed md:relative inset-y-0 left-0 z-50 w-72 bg-surface-800
            transform transition-transform duration-300 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            md:flex md:flex-col hidden md:w-64
          `}
        >
          <Sidebar />
        </aside>

        {/* Mobile sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-surface-800
            transform transition-transform duration-300 ease-out md:hidden
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-4">
          {children}
        </main>
      </div>

      {/* Quick add FAB */}
      <QuickAddButton />

      {/* Bottom navigation - mobile only */}
      <BottomNav />
    </div>
  )
}
