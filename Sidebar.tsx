'use client'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

const NAV = [
  { id: 'dashboard',       label: 'Dashboard',       icon: '📊', roles: ['admin','data_entry'] },
  { id: 'entry',           label: 'Daily Entry',     icon: '➕', roles: ['admin','data_entry'] },
  { id: 'records',         label: 'All Records',     icon: '📋', roles: ['admin','data_entry'] },
  { id: 'members',         label: 'Members',         icon: '👥', roles: ['admin','data_entry'] },
  { id: 'company-report',  label: 'Company Report',  icon: '🏭', roles: ['admin'] },
  { id: 'bank-report',     label: 'Bank Report',     icon: '🏦', roles: ['admin'] },
  { id: 'users',           label: 'User Management', icon: '🔐', roles: ['admin'] },
]

interface Props {
  page: string
  onNav: (p: string) => void
  milkPrice: number
}

export default function Sidebar({ page, onNav, milkPrice }: Props) {
  const { role, fullName, signOut } = useAuth()

  return (
    <aside className="w-[220px] flex flex-col flex-shrink-0 relative overflow-hidden"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      {/* glow */}
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,208,132,.07) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="p-5 border-b border-[var(--border)]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl mb-3 shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--green), var(--green2))', boxShadow: '0 4px 16px var(--green-glow)' }}>
          🐄
        </div>
        <div className="text-sm font-bold leading-tight">Village Milk Co-op</div>
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>THONDAPADI — PRD.143</div>
        <div className="mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono"
          style={{ background: 'rgba(0,208,132,.12)', color: 'var(--green)', border: '1px solid rgba(0,208,132,.25)' }}>
          TNSC0011400
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {['Overview', 'Reports'].map((section, si) => {
          const items = si === 0
            ? NAV.filter(n => ['dashboard','entry','records','members'].includes(n.id))
            : NAV.filter(n => !['dashboard','entry','records','members'].includes(n.id))
          const visible = items.filter(n => !role || n.roles.includes(role))
          if (!visible.length) return null
          return (
            <div key={section} className="mb-1">
              <div className="px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-widest opacity-50"
                style={{ color: 'var(--muted)' }}>{section}</div>
              {visible.map(n => (
                <button key={n.id} onClick={() => onNav(n.id)}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left border-l-2 transition-all duration-150',
                    page === n.id
                      ? 'border-l-[var(--green)] font-medium'
                      : 'border-l-transparent hover:bg-white/3'
                  )}
                  style={page === n.id
                    ? { background: 'linear-gradient(90deg,rgba(0,208,132,.1),transparent)', color: 'var(--green)' }
                    : { color: 'var(--muted2)' }
                  }>
                  <span className="text-base opacity-80">{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="rounded-lg px-3 py-2.5 mb-3" style={{ background: 'rgba(245,166,35,.1)', border: '1px solid rgba(245,166,35,.25)' }}>
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Current Rate</div>
          <div className="text-base font-bold font-mono" style={{ color: 'var(--amber)' }}>₹{milkPrice}/Litre</div>
        </div>
        <div className="text-xs mb-2 font-medium" style={{ color: 'var(--muted2)' }}>
          {fullName || 'User'} <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: role === 'admin' ? 'rgba(0,208,132,.12)' : 'rgba(79,142,247,.12)',
                     color: role === 'admin' ? 'var(--green)' : '#4f8ef7' }}>
            {role}
          </span>
        </div>
        <button onClick={() => signOut()} className="w-full py-2 text-xs rounded-lg transition-colors"
          style={{ background: 'rgba(255,92,92,.08)', border: '1px solid rgba(255,92,92,.2)', color: 'var(--red)' }}>
          ← Sign Out
        </button>
      </div>
    </aside>
  )
}
