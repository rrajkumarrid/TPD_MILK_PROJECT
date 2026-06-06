'use client'
import { useState, useMemo } from 'react'
import { Btn, Card, BankBadge, toast } from '@/components/ui'
import { Member, MilkEntry } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  members: Member[]
  entries: MilkEntry[]
  onDelete: (id: string) => Promise<{ error: any }>
}

export default function RecordsPage({ members, entries, onDelete }: Props) {
  const { role } = useAuth()
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [memberId, setMemberId] = useState('')

  const filtered = useMemo(() => entries.filter(e => {
    const name = (e.member as any)?.name || ''
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false
    if (from && e.entry_date < from) return false
    if (to && e.entry_date > to) return false
    if (memberId && e.member_id !== memberId) return false
    return true
  }).sort((a, b) => b.entry_date.localeCompare(a.entry_date)), [entries, search, from, to, memberId])

  const totalLitres = filtered.reduce((s, e) => s + Number(e.litres), 0)
  const totalAmount = filtered.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="fade-up">
      <Card>
        <div className="text-sm font-semibold mb-4 flex items-center gap-2"><span>📋</span> All Records</div>

        <div className="flex gap-3 flex-wrap mb-4">
          <input placeholder="Search name..." value={search} onChange={e => setSearch(e.target.value)} className="!w-44" />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="!w-auto" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="!w-auto" />
          <select value={memberId} onChange={e => setMemberId(e.target.value)} className="!w-44">
            <option value="">All Members</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <Btn size="sm" variant="ghost" onClick={() => { setSearch(''); setFrom(''); setTo(''); setMemberId('') }}>Reset</Btn>
        </div>

        {/* Summary */}
        <div className="flex gap-6 mb-4 p-3 rounded-lg" style={{ background: 'var(--card2)' }}>
          <div><div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Records</div><div className="font-bold font-mono">{filtered.length}</div></div>
          <div><div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Total Litres</div><div className="font-bold font-mono">{totalLitres.toFixed(1)}</div></div>
          <div><div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Total Amount</div><div className="font-bold font-mono" style={{ color: 'var(--green)' }}>₹{Math.round(totalAmount).toLocaleString('en-IN')}</div></div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Member</th><th>Bank</th>
                <th className="r">Litres</th><th className="r">Rate</th><th className="r">Amount</th>
                <th>Note</th>{role === 'admin' && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="text-[12px]">{e.entry_date}</td>
                  <td className="font-medium">{(e.member as any)?.name}</td>
                  <td><BankBadge bank={(e.member as any)?.bank_name || '—'} /></td>
                  <td className="r">{e.litres}</td>
                  <td className="r text-xs font-mono">₹{e.rate}</td>
                  <td className="r font-semibold" style={{ color: 'var(--green)' }}>₹{e.amount?.toLocaleString('en-IN')}</td>
                  <td className="text-[11px]" style={{ color: 'var(--muted)' }}>{e.note || '—'}</td>
                  {role === 'admin' && (
                    <td>
                      <Btn size="sm" variant="red" onClick={async () => {
                        const { error } = await onDelete(e.id)
                        if (error) toast(error.message, true); else toast('Deleted')
                      }}>✕</Btn>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={role === 'admin' ? 8 : 7} className="text-center py-10 text-sm" style={{ color: 'var(--muted)' }}>No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
