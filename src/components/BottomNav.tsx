import { useStore } from '@/store/useStore'
import { Inbox, CalendarDays, Calendar, Search, Menu } from 'lucide-react'
import { ViewType } from '@/types'

export function BottomNav() {
  const { currentView, setView, toggleSidebar } = useStore()

  const items: { view: ViewType | 'menu'; icon: any; label: string }[] = [
    { view: 'today', icon: CalendarDays, label: 'Today' },
    { view: 'inbox', icon: Inbox, label: 'Inbox' },
    { view: 'search', icon: Search, label: 'Search' },
    { view: 'menu', icon: Menu, label: 'Browse' },
  ]

  return (
    <nav className="bottom-nav md:hidden fixed bottom-0 inset-x-0 bg-surface-800 border-t border-surface-700 z-30">
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.view !== 'menu' && currentView === item.view
          return (
            <button
              key={item.view}
              onClick={() => {
                if (item.view === 'menu') toggleSidebar()
                else setView(item.view as ViewType)
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[60px]
                ${isActive ? 'text-primary-500' : 'text-surface-400'}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
