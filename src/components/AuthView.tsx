import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'

export function AuthView() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadFromSupabase = useStore((s) => s.loadFromSupabase)
  const setUserId = useStore((s) => s.setUserId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (mode === 'signin') {
      const { data, error: authError } = await supabase!.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }
      if (data.user) {
        setUserId(data.user.id)
        await loadFromSupabase(data.user.id)
      }
    } else {
      const { data, error: authError } = await supabase!.auth.signUp({ email, password })
      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }
      if (data.user && !data.user.identities?.length) {
        setError('An account with this email already exists. Please sign in.')
        setLoading(false)
        return
      }
      if (data.session) {
        // Auto-confirmed (email confirmation disabled in Supabase)
        setUserId(data.user!.id)
        await loadFromSupabase(data.user!.id)
      } else {
        setMessage('Account created! Check your email to confirm your account, then sign in.')
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-50">Get Done</h1>
          <p className="text-surface-400 text-sm mt-1">Your personal productivity hub</p>
        </div>

        {/* Card */}
        <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
          {/* Tab switcher */}
          <div className="flex rounded-lg bg-surface-900 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setMessage(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-primary-600 text-white'
                  : 'text-surface-400 hover:text-surface-50'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setMessage(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-primary-600 text-white'
                  : 'text-surface-400 hover:text-surface-50'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-surface-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder-surface-500 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder-surface-500 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-colors outline-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-green-400 bg-green-900/20 border border-green-800/40 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-surface-500 text-xs mt-6">
          Your data syncs across all devices.
        </p>
      </div>
    </div>
  )
}
