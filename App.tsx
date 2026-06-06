'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMembers, useEntries, useMilkPrice } from '@/hooks/useData'
import Sidebar from '@/components/Sidebar'
import LoginPage from '@/pages/LoginPage'
import Dashboard from '@/pages/Dashboard'
import DailyEntry from '@/pages/DailyEntry'
import RecordsPage from '@/pages/RecordsPage'
import MembersPage from '@/pages/MembersPage'
import ReportPage from '@/pages/ReportPage'
import UsersPage from '@/pages/UsersPage'
import { ToastProvider, Modal, toast } from '@/components/ui'

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard', entry: 'Daily Entry', records: 'All Records',
  members: 'Members', 'company-report': 'Company Report',
  'bank-report': 'Bank Report', users: 'User Management',
}

export default function App() {
  const { user, role, fullName, loading } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [priceModal, setPriceModal] = useState(false)
  const [newPrice, setNewPrice] = useState(33)

  const { members, addMember, updateMember, deleteMember } = useMembers()
  const { entries, deleteEntry } = useEntries()
  const { price: milkPrice, updatePrice } = useMilkPrice()

  useEffect(() => { setNewPrice(milkPrice) }, [milkPrice])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🐄</div>
        <div className="text-sm" style={{ color: 'var(--muted)' }}>Loading...</div>
      </div>
    </div>
  )

  if (!user) return <><LoginPage /><ToastProvider /></>

  async function handlePriceSave() {
    if (isNaN(newPrice) || newPrice <= 0) { toast('Invalid price!', true); return }
    const { error } = await updatePrice(newPrice)
    if (error) toast(error.message, true)
    else { toast(`Rate updated to ₹${newPrice}/L`); setPriceModal(false) }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar page={page} onNav={setPage} milkPrice={milkPrice} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="text-base font-bold">{PAGE_TITLES[page] || page}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>PRD.143 · THONDAPADI · Milk Co-op</div>
          </div>
          <div className="flex items-center gap-3">
            {role === 'admin' && (
              <button onClick={() => { setNewPrice(milkPrice); setPriceModal(true) }}
                className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                style={{ background: 'rgba(245,166,35,.1)', color: 'var(--amber)', border: '1px solid rgba(245,166,35,.25)' }}>
                ₹{milkPrice}/L · Change Rate
              </button>
            )}
            <span className="text-xs px-2 py-1 rounded"
              style={{ background: 'var(--card2)', color: 'var(--muted2)' }}>
              {fullName || user.email}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {page === 'dashboard'      && <Dashboard members={members} entries={entries} milkPrice={milkPrice} />}
          {page === 'entry'          && <DailyEntry members={members} milkPrice={milkPrice} />}
          {page === 'records'        && <RecordsPage members={members} entries={entries} onDelete={deleteEntry} />}
          {page === 'members'        && <MembersPage members={members} onAdd={addMember} onUpdate={updateMember} onDelete={deleteMember} />}
          {page === 'company-report' && <ReportPage members={members} entries={entries} type="company" />}
          {page === 'bank-report'    && <ReportPage members={members} entries={entries} type="bank" />}
          {page === 'users'          && role === 'admin' && <UsersPage />}
        </main>
      </div>

      {/* Price modal */}
      <Modal open={priceModal} onClose={() => setPriceModal(false)} title="Update Milk Rate">
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>New Price per Litre (₹)</label>
            <input type="number" value={newPrice} step={0.5} min={1} onChange={e => setNewPrice(parseFloat(e.target.value))} />
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>This updates the global rate. Each report also has its own rate input for flexible export.</p>
          <div className="flex gap-2.5 justify-end pt-2">
            <button onClick={() => setPriceModal(false)} className="px-4 py-2 rounded-lg text-sm"
              style={{ background: 'var(--card2)', color: 'var(--muted2)' }}>Cancel</button>
            <button onClick={handlePriceSave}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-black"
              style={{ background: 'var(--green)' }}>Update Rate</button>
          </div>
        </div>
      </Modal>

      <ToastProvider />
    </div>
  )
}
