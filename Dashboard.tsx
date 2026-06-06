'use client'
import { useMemo } from 'react'
import { StatCard, BankBadge } from '@/components/ui'
import { Member, MilkEntry } from '@/lib/types'

interface Props {
  members: Member[]
  entries: MilkEntry[]
  milkPrice: number
}

export default function Dashboard({ members, entries, milkPrice }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = today.slice(0, 7)

  const stats = useMemo(() => {
    const mE = entries.filter(e => e.entry_date.startsWith(thisMonth))
    const tE = entries.filter(e => e.entry_date === today)
    return {
      monthLitres: mE.reduce((s, e) => s + Number(e.litres), 0),
      monthAmount: mE.reduce((s, e) => s + Number(e.amount), 0),
      todayLitres: tE.reduce((s, e) => s + Number(e.litres), 0),
      todayCount: tE.length,
    }
  }, [entries, thisMonth, today])

  const memberTotals = useMemo(() => {
    const map: Record<string, { litres: number; amount: number; last: string }> = {}
    entries.forEach(e => {
      if (!map[e.member_id]) map[e.member_id] = { litres: 0, amount: 0, last: '' }
      map[e.member_id].litres += Number(e.litres)
      map[e.member_id].amount += Number(e.amount)
      if (!map[e.member_id].last || e.entry_date > map[e.member_id].last)
        map[e.member_id].last = e.entry_date
    })
    return map
  }, [entries])

  const topProducers = useMemo(() => {
    return members
      .map(m => ({ ...m, litres: memberTotals[m.id]?.litres || 0 }))
      .sort((a, b) => b.litres - a.litres)
      .slice(0, 8)
  }, [members, memberTotals])

  const maxLitres = topProducers[0]?.litres || 1

  const recent = useMemo(() =>
    [...entries].sort((a, b) => b.entry_date.localeCompare(a.entry_date)).slice(0, 8),
    [entries])

  return (
    <div className="fade-up">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Month Litres" value={stats.monthLitres.toFixed(1)} sub="Total collected" icon="🥛" accent="green" />
        <StatCard label="Month Amount" value={`₹${Math.round(stats.monthAmount).toLocaleString('en-IN')}`} sub={`@₹${milkPrice}/L`} icon="💰" accent="amber" />
        <StatCard label="Today's Collection" value={`${stats.todayLitres.toFixed(1)}L`} sub={`${stats.todayCount} entries`} icon="📅" accent="blue" />
        <StatCard label="Active Members" value={String(members.length)} sub="Producers" icon="👥" accent="red" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Top Producers */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Top Producers
            <span className="ml-auto text-[11px] text-[var(--muted)]">By litres</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {topProducers.map(m => (
              <div key={m.id} className="flex items-center gap-2.5">
                <div className="w-[100px] text-[11.5px] text-[var(--muted2)] text-right truncate flex-shrink-0">
                  {m.name.split('.')[1]?.trim() || m.name}
                </div>
                <div className="flex-1 bg-[var(--card2)] rounded h-5 overflow-hidden">
                  <div className="h-full rounded flex items-center pl-2 text-[10.5px] text-black font-semibold transition-all duration-700"
                    style={{
                      width: `${Math.round((m.litres / maxLitres) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--green), var(--green2))',
                      minWidth: m.litres > 0 ? '36px' : '0',
                    }}>
                    {m.litres > 0 ? `${m.litres.toFixed(0)}L` : ''}
                  </div>
                </div>
                <div className="w-14 text-right text-[11px] font-mono" style={{ color: 'var(--muted2)' }}>
                  ₹{Math.round(m.litres * milkPrice).toLocaleString('en-IN', { notation: 'compact' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-sm font-semibold mb-4 flex items-center gap-2"><span>🕐</span> Recent Entries</div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {recent.map(e => {
              const initials = ((e.member as any)?.name || '??').replace(/[^A-Z.]/g, '').slice(0, 2)
              return (
                <div key={e.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--card2)] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--green), var(--green2))' }}>
                    {initials || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium truncate">{(e.member as any)?.name}</div>
                    <div className="text-[10.5px]" style={{ color: 'var(--muted)' }}>{e.entry_date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold font-mono" style={{ color: 'var(--green)' }}>{e.litres}L</div>
                    <div className="text-[10.5px]" style={{ color: 'var(--muted)' }}>₹{e.amount?.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )
            })}
            {recent.length === 0 && <div className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>No entries yet</div>}
          </div>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-sm font-semibold mb-4 flex items-center gap-2">
          <span>👥</span> Member Overview
          <span className="ml-auto text-[11px]" style={{ color: 'var(--muted)' }}>Rate: ₹{milkPrice}/L</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>SL</th><th>MEM.NO</th><th>Name</th><th>Bank</th>
                <th className="r">Total Litres</th><th className="r">Amount (₹)</th><th>Last Entry</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const t = memberTotals[m.id] || { litres: 0, amount: 0, last: '' }
                return (
                  <tr key={m.id}>
                    <td className="text-[11px]" style={{ color: 'var(--muted)' }}>{i + 1}</td>
                    <td className="font-mono text-[11px]" style={{ color: 'var(--muted2)' }}>{m.mem_no}</td>
                    <td className="font-medium">{m.name}</td>
                    <td><BankBadge bank={m.bank_name} /></td>
                    <td className="r">{t.litres.toFixed(1)}</td>
                    <td className="r" style={{ color: 'var(--green)', fontWeight: 600 }}>₹{Math.round(t.amount).toLocaleString('en-IN')}</td>
                    <td className="text-[11px]" style={{ color: 'var(--muted)' }}>{t.last || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}><b>TOTAL</b></td>
                <td className="r">{Object.values(memberTotals).reduce((s, t) => s + t.litres, 0).toFixed(1)}</td>
                <td className="r">₹{Math.round(Object.values(memberTotals).reduce((s, t) => s + t.amount, 0)).toLocaleString('en-IN')}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
