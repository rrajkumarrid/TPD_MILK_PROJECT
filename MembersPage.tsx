'use client'
import { useState } from 'react'
import { Btn, Card, Modal, Field, BankBadge, toast } from '@/components/ui'
import { Member } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  members: Member[]
  onAdd: (m: any) => Promise<{ error: any }>
  onUpdate: (id: string, m: any) => Promise<{ error: any }>
  onDelete: (id: string) => Promise<{ error: any }>
}

const EMPTY = { sl_no: 0, mem_no: '', name: '', bank_name: '', ifsc_code: '', account_no: '', phone: '' }

export default function MembersPage({ members, onAdd, onUpdate, onDelete }: Props) {
  const { role } = useAuth()
  const isAdmin = role === 'admin'
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.bank_name.toLowerCase().includes(search.toLowerCase()) ||
    m.mem_no.includes(search)
  )

  function openAdd() { setEditId(null); setForm({ ...EMPTY, sl_no: members.length + 1 }); setModal(true) }
  function openEdit(m: Member) { setEditId(m.id); setForm({ sl_no: m.sl_no, mem_no: m.mem_no, name: m.name, bank_name: m.bank_name, ifsc_code: m.ifsc_code, account_no: m.account_no, phone: m.phone }); setModal(true) }

  const f = (id: string) => (e: any) => setForm(prev => ({ ...prev, [id]: e.target.value }))

  async function handleSave() {
    if (!form.name || !form.phone || !form.bank_name || !form.ifsc_code || !form.account_no) {
      toast('Fill all required fields!', true); return
    }
    setSaving(true)
    const payload = { ...form, ifsc_code: form.ifsc_code.toUpperCase() }
    const { error } = editId ? await onUpdate(editId, payload) : await onAdd(payload)
    setSaving(false)
    if (error) { toast(error.message, true); return }
    toast(editId ? 'Member updated!' : 'Member added!'); setModal(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from active members?`)) return
    const { error } = await onDelete(id)
    if (error) toast(error.message, true); else toast('Member removed')
  }

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-base font-bold">Members</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{members.length} active producers</div>
        </div>
        {isAdmin && <Btn variant="green" onClick={openAdd}>+ Add Member</Btn>}
      </div>

      <Card>
        <div className="mb-4">
          <input placeholder="Search name, bank, member no..." value={search}
            onChange={e => setSearch(e.target.value)} className="!w-72" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>SL</th><th>MEM.NO</th><th>Name</th><th>Bank Name</th><th>IFSC Code</th><th>Account No.</th><th>Phone</th>{isAdmin && <th></th>}</tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id}>
                  <td className="text-[11px]" style={{ color: 'var(--muted)' }}>{i + 1}</td>
                  <td className="font-mono text-[11px]" style={{ color: 'var(--muted2)' }}>{m.mem_no}</td>
                  <td className="font-medium">{m.name}</td>
                  <td><BankBadge bank={m.bank_name} /></td>
                  <td className="font-mono text-[11px]">{m.ifsc_code}</td>
                  <td className="font-mono text-[11px]">{m.account_no}</td>
                  <td className="text-[12px]">{m.phone}</td>
                  {isAdmin && (
                    <td>
                      <div className="flex gap-1.5">
                        <Btn size="sm" variant="ghost" onClick={() => openEdit(m)}>Edit</Btn>
                        <Btn size="sm" variant="red" onClick={() => handleDelete(m.id, m.name)}>Del</Btn>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>No members found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Member' : 'Add New Member'} wide>
        <div className="grid grid-cols-2 gap-4">
          <Field label="SL No"><input type="number" value={form.sl_no} onChange={f('sl_no')} /></Field>
          <Field label="Member No (MEM.NO) *"><input value={form.mem_no} onChange={f('mem_no')} placeholder="e.g. 21" /></Field>
          <Field label="Full Name *" className="col-span-2"><input value={form.name} onChange={f('name')} placeholder="Member full name" /></Field>
          <Field label="Phone *"><input value={form.phone} onChange={f('phone')} placeholder="10-digit number" /></Field>
          <Field label="Bank Name *"><input value={form.bank_name} onChange={f('bank_name')} placeholder="e.g. TDCC, UBI, CNR" /></Field>
          <Field label="IFSC Code *"><input value={form.ifsc_code} onChange={f('ifsc_code')} placeholder="e.g. TNSC0011400" style={{ textTransform: 'uppercase' }} /></Field>
          <Field label="Account Number *"><input value={form.account_no} onChange={f('account_no')} placeholder="Account number" /></Field>
        </div>
        <div className="flex gap-2.5 mt-5 justify-end">
          <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="green" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Member'}</Btn>
        </div>
      </Modal>
    </div>
  )
}
