'use client'
import { useState, useMemo } from 'react'
import { Btn, Card, PriceBox, ColSelector, BankBadge, toast } from '@/components/ui'
import { Member, MilkEntry } from '@/lib/types'
import { exportCompanyExcel, exportBankExcel, exportPdf } from '@/lib/export'

const CR_COLS = [
  { id: 'sl_no', label: 'SL NO' },
  { id: 'mem_no', label: 'MEM.NO' },
  { id: 'name', label: 'NAME' },
  { id: 'bank_name', label: 'BANK NAME' },
  { id: 'ifsc_code', label: 'IFSC CODE' },
  { id: 'account_no', label: 'ACCOUNT NO' },
  { id: 'phone', label: 'CONTACT NO' },
  { id: 'litres', label: 'QTY OF MILK (L)' },
  { id: 'amount', label: 'ELIGIBLE INCEN.(₹)' },
]

const BR_COLS = [
  { id: 'bank_name', label: 'BANK NAME' },
  { id: 'ifsc_code', label: 'IFSC CODE' },
  { id: 'name', label: 'MEMBER NAME' },
  { id: 'phone', label: 'PHONE' },
  { id: 'account_no', label: 'ACCOUNT NO' },
  { id: 'litres', label: 'TOTAL LITRES' },
  { id: 'amount', label: 'AMOUNT (₹)' },
  { id: 'period', label: 'PERIOD' },
]

interface Props {
  members: Member[]
  entries: MilkEntry[]
  type: 'company' | 'bank'
}

export default function ReportPage({ members, entries, type }: Props) {
  const [rate, setRate] = useState(33)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [memberFilter, setMemberFilter] = useState('')
  const [bankFilter, setBankFilter] = useState('')
  const [checkedCols, setCheckedCols] = useState((type === 'company' ? CR_COLS : BR_COLS).map(c => c.id))

  const COLS = type === 'company' ? CR_COLS : BR_COLS

  const period = from && to ? `${from} to ${to}` : from ? `From ${from}` : to ? `To ${to}` : 'All Period'

  const filteredEntries = useMemo(() => entries.filter(e => {
    if (from && e.entry_date < from) return false
    if (to && e.entry_date > to) return false
    return true
  }), [entries, from, to])

  const rows = useMemo(() => {
    if (type === 'company') {
      return members
        .filter(m => !memberFilter || m.id === memberFilter)
        .map((m, i) => {
          const me = filteredEntries.filter(e => e.member_id === m.id)
          const tl = me.reduce((s, e) => s + Number(e.litres), 0)
          return { sl_no: i + 1, mem_no: m.mem_no, name: m.name, bank_name: m.bank_name, ifsc_code: m.ifsc_code, account_no: m.account_no, phone: m.phone, litres: tl, amount: tl * rate }
        })
    } else {
      const banks = bankFilter ? [bankFilter] : [...new Set(members.map(m => m.bank_name))]
      return banks.flatMap(bank =>
        members.filter(m => m.bank_name === bank).map(m => {
          const me = filteredEntries.filter(e => e.member_id === m.id)
          const tl = me.reduce((s, e) => s + Number(e.litres), 0)
          const dates = me.map(e => e.entry_date).sort()
          return { bank_name: m.bank_name, ifsc_code: m.ifsc_code, name: m.name, phone: m.phone, account_no: m.account_no, litres: tl, amount: tl * rate, period: dates.length ? `${dates[0]} to ${dates[dates.length - 1]}` : '—' }
        })
      )
    }
  }, [members, filteredEntries, memberFilter, bankFilter, rate, type])

  const visibleCols = COLS.filter(c => checkedCols.includes(c.id))
  const totalLitres = rows.reduce((s, r) => s + r.litres, 0)
  const totalAmount = rows.reduce((s, r) => s + r.amount, 0)
  const banks = [...new Set(members.map(m => m.bank_name))].sort()

  const handleExcelDownload = () => {
    if (type === 'company') exportCompanyExcel(rows, visibleCols, period, rate)
    else exportBankExcel(rows, visibleCols, period, rate)
    toast('Excel downloaded!')
  }

  const handlePdfDownload = () => {
    exportPdf(rows, visibleCols, type === 'company' ? 'GOVT. INCENTIVE REPORT' : 'BANK-WISE PAYMENT REPORT', period, rate)
    toast('PDF print dialog opened!')
  }

  return (
    <div className="fade-up space-y-4">
      {/* Header banner */}
      <div className="rounded-xl p-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg,rgba(0,208,132,.08),rgba(79,142,247,.05))', border: '1px solid var(--border)' }}>
        <div>
          <div className="text-base font-bold" style={{ color: 'var(--green)' }}>
            {type === 'company' ? 'GOVT. INCENTIVE REPORT' : 'BANK-WISE PAYMENT REPORT'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>PRD.143 — THONDAPADI MILK CO-OP</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">{period}</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>TNSC0011400</div>
        </div>
      </div>

      <Card>
        <div className="text-sm font-semibold mb-4">⚙️ Filters & Export</div>

        {/* Rate */}
        <PriceBox label="Price per Litre for this report:" value={rate} onChange={setRate} />

        {/* Date filters */}
        <div className="flex gap-3 flex-wrap mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">From Date</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="!w-auto" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">To Date</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="!w-auto" />
          </div>
          {type === 'company' && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">Member</label>
              <select value={memberFilter} onChange={e => setMemberFilter(e.target.value)} className="!w-auto">
                <option value="">All Members</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
          {type === 'bank' && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">Bank</label>
              <select value={bankFilter} onChange={e => setBankFilter(e.target.value)} className="!w-auto">
                <option value="">All Banks</option>
                {banks.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <Btn size="sm" variant="ghost" onClick={() => { setFrom(''); setTo(''); setMemberFilter(''); setBankFilter('') }}>Reset</Btn>
          </div>
        </div>

        {/* Column selector */}
        <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Select Columns to Export</div>
        <ColSelector cols={COLS} checked={checkedCols} onChange={setCheckedCols} />

        <div className="flex gap-2.5 flex-wrap">
          <Btn variant="green" onClick={handleExcelDownload}>⬇ Download Excel</Btn>
          <Btn variant="blue" onClick={handlePdfDownload}>📄 Download PDF</Btn>
        </div>
      </Card>

      <Card>
        {/* Summary */}
        <div className="flex gap-6 mb-4 p-3 rounded-lg" style={{ background: 'var(--card2)' }}>
          <div><div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Records</div><div className="font-bold font-mono">{rows.length}</div></div>
          <div><div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Total Litres</div><div className="font-bold font-mono">{totalLitres.toFixed(2)}</div></div>
          <div><div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Rate</div><div className="font-bold font-mono">₹{rate}/L</div></div>
          <div><div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Total Amount</div><div className="font-bold font-mono" style={{ color: 'var(--green)' }}>₹{Math.round(totalAmount).toLocaleString('en-IN')}</div></div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {visibleCols.map(c => (
                  <th key={c.id} className={['litres','amount','sl_no'].includes(c.id) ? 'r' : ''}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {visibleCols.map(c => (
                    <td key={c.id} className={['litres','amount','sl_no'].includes(c.id) ? 'r' : ''}>
                      {c.id === 'bank_name' ? <BankBadge bank={r.bank_name} /> :
                       c.id === 'litres' ? r.litres.toFixed(2) :
                       c.id === 'amount' ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>₹{Math.round(r.amount).toLocaleString('en-IN')}</span> :
                       c.id === 'ifsc_code' || c.id === 'account_no' ? <span className="font-mono text-[11px]">{(r as any)[c.id]}</span> :
                       (r as any)[c.id] || ''}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={visibleCols.length} className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>No data</td></tr>}
            </tbody>
            <tfoot>
              <tr>
                {visibleCols.map(c => (
                  <td key={c.id} className={['litres','amount'].includes(c.id) ? 'r' : ''}>
                    {c.id === 'litres' ? <b>{totalLitres.toFixed(2)} Liters</b> :
                     c.id === 'amount' ? <b>₹{Math.round(totalAmount).toLocaleString('en-IN')}</b> :
                     c.id === 'name' || c.id === 'bank_name' ? <b>TOTAL</b> : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
