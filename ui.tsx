'use client'
import { ReactNode, useState } from 'react'
import clsx from 'clsx'

// ---- BUTTON ----
interface BtnProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'green' | 'ghost' | 'amber' | 'blue' | 'red'
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}
export function Btn({ children, onClick, variant = 'ghost', size = 'md', disabled, type = 'button', className }: BtnProps) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  const variants = {
    green: 'bg-[var(--green)] text-black font-semibold hover:bg-[var(--green2)] hover:shadow-lg hover:-translate-y-px',
    ghost: 'bg-white/5 text-[var(--muted2)] border border-[var(--border)] hover:bg-white/10 hover:text-[var(--text)]',
    amber: 'bg-amber-500/10 text-[var(--amber)] border border-amber-500/25 hover:bg-amber-500/20',
    blue:  'bg-blue-500/10 text-[#4f8ef7] border border-blue-500/25 hover:bg-blue-500/20',
    red:   'bg-red-500/10 text-[var(--red)] border border-red-500/25 hover:bg-red-500/15',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={clsx(base, sizes[size], variants[variant], className)}>
      {children}
    </button>
  )
}

// ---- CARD ----
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-[var(--card)] border border-[var(--border)] rounded-xl p-5', className)}>
      {children}
    </div>
  )
}

// ---- STAT CARD ----
interface StatCardProps {
  label: string; value: string; sub?: string; icon: string
  accent: 'green' | 'amber' | 'blue' | 'red'
}
const ACCENT = {
  green: { border: 'border-t-[var(--green)]', icon: 'bg-[var(--green-glow)]', val: 'text-[var(--green)]' },
  amber: { border: 'border-t-amber-500', icon: 'bg-amber-500/10', val: 'text-[var(--amber)]' },
  blue:  { border: 'border-t-blue-400', icon: 'bg-blue-500/10', val: 'text-[#4f8ef7]' },
  red:   { border: 'border-t-red-400', icon: 'bg-red-500/10', val: 'text-[var(--red)]' },
}
export function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  const a = ACCENT[accent]
  return (
    <div className={clsx('bg-[var(--card)] border border-[var(--border)] border-t-2 rounded-xl p-5 hover:-translate-y-0.5 transition-transform', a.border)}>
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3', a.icon)}>{icon}</div>
      <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">{label}</div>
      <div className={clsx('text-2xl font-bold font-mono tracking-tight', a.val)}>{value}</div>
      {sub && <div className="text-[11px] text-[var(--muted)] mt-1">{sub}</div>}
    </div>
  )
}

// ---- MODAL ----
export function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={clsx('bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]', wide ? 'w-full max-w-2xl' : 'w-full max-w-md')}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 hover:bg-red-500/15 hover:text-[var(--red)] text-[var(--muted)] transition-colors text-lg">✕</button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ---- FORM FIELD ----
export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <label className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

// ---- TOAST ----
let toastFn: ((msg: string, err?: boolean) => void) | null = null
export function setToastFn(fn: (msg: string, err?: boolean) => void) { toastFn = fn }
export function toast(msg: string, err?: boolean) { toastFn?.(msg, err) }

export function ToastProvider() {
  const [msg, setMsg] = useState<{ text: string; err: boolean } | null>(null)
  setToastFn((text, err = false) => {
    setMsg({ text, err })
    setTimeout(() => setMsg(null), 2800)
  })
  if (!msg) return null
  return (
    <div className={clsx(
      'fixed bottom-5 right-5 z-[999] px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl fade-up',
      msg.err ? 'bg-[var(--red)] text-white' : 'bg-[var(--green2)] text-black'
    )}>
      {msg.err ? '⚠ ' : '✓ '}{msg.text}
    </div>
  )
}

// ---- BADGE ----
export function BankBadge({ bank }: { bank: string }) {
  const cls = {
    TDCC: 'bank-tdcc', UBI: 'bank-ubi', CNR: 'bank-cnr',
  }[bank] || 'bank-tdcc'
  return <span className={`bank-badge ${cls}`}>{bank}</span>
}

// ---- PRICE BOX ----
export function PriceBox({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3.5 mb-4">
      <span className="text-[var(--amber)] text-sm font-semibold whitespace-nowrap">💰 {label}</span>
      <input type="number" value={value} step={0.5} min={1}
        onChange={e => onChange(parseFloat(e.target.value) || 33)}
        className="max-w-[110px] !bg-black/20 !border-amber-500/30 !text-[var(--amber)] font-bold font-mono text-base" />
      <span className="text-[var(--muted)] text-xs">Amount = Litres × ₹{value}</span>
    </div>
  )
}

// ---- COL SELECTOR ----
export function ColSelector({ cols, checked, onChange }: {
  cols: { id: string; label: string }[]
  checked: string[]
  onChange: (ids: string[]) => void
}) {
  const toggle = (id: string) =>
    onChange(checked.includes(id) ? checked.filter(c => c !== id) : [...checked, id])
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {cols.map(c => (
        <label key={c.id} className={clsx(
          'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer transition-all',
          checked.includes(c.id)
            ? 'bg-[var(--green-glow)] border-green-500/30 text-[var(--green)]'
            : 'bg-[var(--card2)] border-[var(--border)] text-[var(--muted2)]'
        )}>
          <input type="checkbox" checked={checked.includes(c.id)} onChange={() => toggle(c.id)}
            className="accent-[var(--green)] w-auto" />
          {c.label}
        </label>
      ))}
    </div>
  )
}

// ---- LOADING SKELETON ----
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton h-8 flex-1" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  )
}
