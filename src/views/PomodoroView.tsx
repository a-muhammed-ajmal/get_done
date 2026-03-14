import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { Timer, Play, Pause, SkipForward, RotateCcw, Settings, X } from 'lucide-react'

type Phase = 'work' | 'short-break' | 'long-break'

export function PomodoroView() {
  const { pomodoroSettings, updatePomodoroSettings, tasks } = useStore()
  const [phase, setPhase] = useState<Phase>('work')
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)
  const sessionsRef = useRef(sessionsCompleted)
  sessionsRef.current = sessionsCompleted

  const activeTasks = tasks.filter((t) => !t.completed)

  const getDuration = useCallback((p: Phase) => {
    switch (p) {
      case 'work': return pomodoroSettings.workDuration * 60
      case 'short-break': return pomodoroSettings.shortBreakDuration * 60
      case 'long-break': return pomodoroSettings.longBreakDuration * 60
    }
  }, [pomodoroSettings])

  const totalDuration = getDuration(phase)
  const progress = 1 - timeLeft / totalDuration

  const switchPhase = useCallback((newPhase: Phase) => {
    setPhase(newPhase)
    setTimeLeft(getDuration(newPhase))
    setIsRunning(false)
    // Auto-start if enabled
    if (
      (newPhase !== 'work' && pomodoroSettings.autoStartBreak) ||
      (newPhase === 'work' && pomodoroSettings.autoStartWork)
    ) {
      setIsRunning(true)
    }
  }, [getDuration, pomodoroSettings.autoStartBreak, pomodoroSettings.autoStartWork])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Phase complete
      if (phase === 'work') {
        const newSessions = sessionsRef.current + 1
        setSessionsCompleted(newSessions)
        if (newSessions % pomodoroSettings.sessionsBeforeLongBreak === 0) {
          switchPhase('long-break')
        } else {
          switchPhase('short-break')
        }
      } else {
        switchPhase('work')
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, timeLeft, phase, pomodoroSettings.sessionsBeforeLongBreak, switchPhase])

  const reset = () => {
    setIsRunning(false)
    setTimeLeft(getDuration(phase))
  }

  const skip = () => {
    if (phase === 'work') {
      const newSessions = sessionsCompleted + 1
      setSessionsCompleted(newSessions)
      if (newSessions % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        switchPhase('long-break')
      } else {
        switchPhase('short-break')
      }
    } else {
      switchPhase('work')
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const phaseColor = phase === 'work' ? '#dc4c3e' : phase === 'short-break' ? '#299438' : '#4073ff'
  const circumference = 2 * Math.PI * 120

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Timer size={24} style={{ color: phaseColor }} />
          Pomodoro
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-surface-400 hover:text-surface-50 rounded-lg transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-1 bg-surface-800 rounded-xl p-1 mb-8">
        {(['work', 'short-break', 'long-break'] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              phase === p ? 'bg-surface-700 text-surface-50' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            {p === 'work' ? 'Focus' : p === 'short-break' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="120" fill="none" stroke="currentColor"
              className="text-surface-800" strokeWidth="6" />
            <circle cx="130" cy="130" r="120" fill="none"
              stroke={phaseColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="timer-circle" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold tracking-wider">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-surface-400 mt-2 capitalize">
              {phase.replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={reset}
          className="p-3 text-surface-400 hover:text-surface-50 hover:bg-surface-700 rounded-full transition-all"
        >
          <RotateCcw size={22} />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
          style={{ backgroundColor: phaseColor }}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button
          onClick={skip}
          className="p-3 text-surface-400 hover:text-surface-50 hover:bg-surface-700 rounded-full transition-all"
        >
          <SkipForward size={22} />
        </button>
      </div>

      {/* Session count */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: pomodoroSettings.sessionsBeforeLongBreak }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < sessionsCompleted % pomodoroSettings.sessionsBeforeLongBreak
                ? 'bg-primary-500'
                : 'bg-surface-700'
            }`}
          />
        ))}
        <span className="text-xs text-surface-400 ml-2">
          #{sessionsCompleted + 1}
        </span>
      </div>

      {/* Task selector */}
      <div className="bg-surface-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-surface-300 mb-2">Working on</h3>
        <select
          value={selectedTaskId || ''}
          onChange={(e) => setSelectedTaskId(e.target.value || null)}
          className="w-full bg-surface-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select a task...</option>
          {activeTasks.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="modal-backdrop flex items-end md:items-center justify-center" onClick={() => setShowSettings(false)}>
          <div className="w-full md:max-w-md bg-surface-800 rounded-t-2xl md:rounded-2xl animate-slide-up p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Timer Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-surface-400"><X size={20} /></button>
            </div>
            {[
              { label: 'Focus duration (min)', key: 'workDuration' as const, value: pomodoroSettings.workDuration },
              { label: 'Short break (min)', key: 'shortBreakDuration' as const, value: pomodoroSettings.shortBreakDuration },
              { label: 'Long break (min)', key: 'longBreakDuration' as const, value: pomodoroSettings.longBreakDuration },
              { label: 'Sessions before long break', key: 'sessionsBeforeLongBreak' as const, value: pomodoroSettings.sessionsBeforeLongBreak },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-3 border-b border-surface-700 last:border-0">
                <span className="text-sm text-surface-300">{setting.label}</span>
                <input
                  type="number"
                  value={setting.value}
                  onChange={(e) => updatePomodoroSettings({ [setting.key]: Math.max(1, parseInt(e.target.value) || 1) })}
                  min={1}
                  className="w-16 text-sm text-right bg-surface-700 rounded-lg px-2 py-1"
                />
              </div>
            ))}
            <div className="flex items-center justify-between py-3 border-b border-surface-700">
              <span className="text-sm text-surface-300">Auto-start breaks</span>
              <button
                onClick={() => updatePomodoroSettings({ autoStartBreak: !pomodoroSettings.autoStartBreak })}
                className={`w-10 h-6 rounded-full transition-colors ${pomodoroSettings.autoStartBreak ? 'bg-primary-600' : 'bg-surface-600'}`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform mx-1 ${pomodoroSettings.autoStartBreak ? 'translate-x-4' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-surface-300">Auto-start focus</span>
              <button
                onClick={() => updatePomodoroSettings({ autoStartWork: !pomodoroSettings.autoStartWork })}
                className={`w-10 h-6 rounded-full transition-colors ${pomodoroSettings.autoStartWork ? 'bg-primary-600' : 'bg-surface-600'}`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform mx-1 ${pomodoroSettings.autoStartWork ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
