'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>
      {/* Ambient glows */}
      <div className="absolute w-96 h-96 rounded-full pointer-events-none -top-24 -left-24 opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(0,208,132,.15) 0%, transparent 70%)' }} />
      <div className="absolute w-80 h-80 rounded-full pointer-events-none -bottom-16 -right-16 opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(79,142,247,.15) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden relative"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          {/* Top accent */}
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, var(--green), #4f8ef7)' }} />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl shadow-xl"
                style={{ background: 'linear-gradient(135deg, var(--green), var(--green2))', boxShadow: '0 8px 24px var(--green-glow)' }}>
                🐄
              </div>
              <h1 className="text-xl font-bold tracking-tight">PRD.143 THONDAPADI</h1>
              <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>Milk Co-op Management — Admin Portal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@coop.com" required autoFocus />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required />
              </div>

              {error && (
                <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,92,92,.1)', color: 'var(--red)', border: '1px solid rgba(255,92,92,.2)' }}>
                  ⚠ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-black transition-all duration-150 disabled:opacity-60"
                style={{ background: 'var(--green)', boxShadow: loading ? 'none' : '0 4px 16px var(--green-glow)' }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <div className="mt-5 text-center text-[11px] rounded-lg p-2.5 font-mono"
              style={{ background: 'var(--card2)', color: 'var(--muted)' }}>
              TNSC0011400 · Thondapadi Village Dairy
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
