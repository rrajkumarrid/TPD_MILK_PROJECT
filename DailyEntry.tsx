'use client'
import { useState } from 'react'
import { Btn, Card, Field, toast } from '@/components/ui'
import { Member, MilkEntry } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useEntries } from '@/hooks/useData'

interface Props {
  members: Member[]
  milkPrice: number
}

export default function DailyEntry({ members, milkPrice }: Props) {
  const { user } = useAuth()
  const today = new Date().toISOString().split('T')[0]
  const { entries, loading, addEntry, deleteEntry } = useEntries({ from: today, to: today })

  const [form, setForm] = useState({ member_id: '', date: today, litres: '', rate: String(milkPrice), note: '' })
  const [saving, setSaving] = useState(false)

  const amount = parseFloat(form.litres || '0') * parseFloat(form.rate || '0')

  const handleSubmit = async () => {
    if (!form.member_id || !form.date || !form.litres || parseFloat(form.litres) <= 0) {
      toast('Please fill all required fields!', true); return
    }
    setSaving(true)
    const { error } = await addEntry({
      member_id: form.member_id,
      entry_date: form.date,
      litres: parseFloat(form.litres),
      rate: parseFloat(form.rate),
      note: form.note,
      created_by: user!.id,
    })
    setSaving(false)
    if (error) { toast(error.message, true); return }
    toast('Entry saved!')
    setForm(f => ({ ...f, member_id: '', litres: '', note: '' }))
  }

  return (
    <div className="fade-up space-y-4 max-w-3xl">
      <Card>
        <div className="text-sm font-semibold mb-4 flex items-center gap-2"><span>➕</span> New Milk Entry</div>

        {/* Rate box */}
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ background: 'rgba(245,166,35,.1)', border: '1px solid rgba(245,166,35,.25)' }}>
          <span className="font-semibold" style={{ color: 'var(--amber)' }}>💰 Rate/Litre</span>
          <input type="number" value={form.rate} step={0.5} min={1}
            onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
            className="!w-24 !bg-black/20 !border-amber-500/30 font-bold font-mono !text-[var(--amber)]" />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Change rate for this entry only</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Member *">
            <select value={form.member_id} onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}>
              <option value="">-- Select Member --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.mem_no}. {m.name}</option>)}
            </select>
          </Field>
          <Field label="Date *">
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </Field>
          <Field label="Litres Given *">
            <input type="number" value={form.litres} step={0.1} min={0.1} placeholder="e.g. 12.5"
              onChange={e => setForm(f => ({ ...f, litres: e.target.value }))} />
          </Field>
          <Field label="Amount (Auto-calculated)">
            <input readOnly value={amount > 0 ? `₹${amount.toFixed(2)}` : ''} placeholder="₹0.00" />
          </Field>
          <Field label="Note" className="col-span-2">
            <input value={form.note} placeholder="Optional note..."
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </Field>
        </div>

        <div className="flex gap-2.5 mt-5">
          <Btn variant="green" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Entry'}
          </Btn>
          <Btn variant="ghost" onClick={() => setForm(f => ({ ...f, member_id: '', litres: '', note: '' }))}>
            Clear
          </Btn>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold mb-4 flex items-center gap-2">
          <span>📅</span> Today's Entries
          <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>{today}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Member</th><th>Date</th><th className="r">Litres</th><th className="r">Rate</th><th className="r">Amount</th><th>Note</th><th></th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-5 text-sm" style={{ color: 'var(--muted)' }}>Loading...</td></tr>}
              {!loading && entries.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>No entries today</td></tr>
              )}
              {entries.map(e => (
                <tr key={e.id}>
                  <td className="font-medium">{(e.member as any)?.name}</td>
                  <td className="text-xs" style={{ color: 'var(--muted)' }}>{e.entry_date}</td>
                  <td className="r">{e.litres}</td>
                  <td className="r font-mono text-xs">₹{e.rate}</td>
                  <td className="r font-semibold" style={{ color: 'var(--green)' }}>₹{e.amount?.toLocaleString('en-IN')}</td>
                  <td className="text-xs" style={{ color: 'var(--muted)' }}>{e.note || '—'}</td>
                  <td>
                    <Btn size="sm" variant="red" onClick={async () => {
                      const { error } = await deleteEntry(e.id)
                      if (error) toast(error.message, true); else toast('Deleted')
                    }}>✕</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
