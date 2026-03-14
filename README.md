# ✅ Get Done

> A modern, offline-first task management PWA built with React & TypeScript — featuring GTD workflows, Eisenhower Matrix, Pomodoro timer, habit tracking, and smart project organization.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 📥 Smart Task Management
- **Inbox** — Capture tasks quickly and organize later
- **Today View** — Focus on what matters today
- **Upcoming View** — Plan ahead with a calendar-style overview
- **Priority Levels** — 4-tier priority system (P1–P4) with color coding
- **Subtasks** — Break tasks into manageable sub-items
- **Recurring Tasks** — Daily, weekly, monthly, or yearly recurrence

### 📂 Projects & Labels
- Create and organize tasks into **color-coded projects**
- Tag tasks with **labels** for flexible categorization
- Favorite projects for quick access

### 🧠 GTD (Getting Things Done)
- Full GTD workflow with contexts:
  - **Inbox** — Capture everything
  - **Next Actions** — Actionable tasks to do now
  - **Waiting For** — Tasks delegated or pending
  - **Someday/Maybe** — Ideas for the future
  - **Reference** — Non-actionable reference material
  - **Project Support** — Supporting material for projects

### 📊 Eisenhower Matrix
- Organize tasks into 4 quadrants:
  - 🔴 **Do First** — Urgent & Important
  - 🔵 **Schedule** — Not Urgent & Important
  - 🟠 **Delegate** — Urgent & Not Important
  - ⚪ **Eliminate** — Not Urgent & Not Important

### 🍅 Pomodoro Timer
- Built-in Pomodoro timer with customizable durations
- Work sessions, short breaks, and long breaks
- Link sessions to specific tasks
- Auto-start options for seamless flow

### 📈 Habit Tracker
- Create habits with custom icons and colors
- Daily, weekly, or custom frequency tracking
- Streak tracking with best streak records
- Visual completion tracking

### 🔍 Search
- Instant search across all tasks

### 📱 Progressive Web App (PWA)
- **Install on any device** — works like a native app
- **Offline-first** — full functionality without internet
- **Responsive design** — optimized for mobile and desktop

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite 6](https://vite.dev/) | Build tool & dev server |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| [Framer Motion](https://www.framer.com/motion/) | Smooth animations |
| [Lucide React](https://lucide.dev/) | Beautiful icons |
| [date-fns](https://date-fns.org/) | Date utilities |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | PWA support |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ajmal-repo/get_done.git
cd get-done

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
get-done/
├── public/              # Static assets & PWA icons
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout.tsx       # App layout with sidebar & nav
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── BottomNav.tsx    # Mobile bottom navigation
│   │   ├── TaskEditor.tsx   # Task creation & editing
│   │   ├── TaskItem.tsx     # Individual task display
│   │   ├── TaskList.tsx     # Task list container
│   │   └── QuickAddButton.tsx
│   ├── views/           # Application views/pages
│   │   ├── TodayView.tsx
│   │   ├── InboxView.tsx
│   │   ├── UpcomingView.tsx
│   │   ├── ProjectView.tsx
│   │   ├── HabitsView.tsx
│   │   ├── PomodoroView.tsx
│   │   ├── MatrixView.tsx
│   │   ├── GtdView.tsx
│   │   └── SearchView.tsx
│   ├── store/           # Zustand state management
│   │   └── useStore.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx          # Root application component
│   └── main.tsx         # Entry point
├── vite.config.ts       # Vite & PWA configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for productivity enthusiasts
</p>
