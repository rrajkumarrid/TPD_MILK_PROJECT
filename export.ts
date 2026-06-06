import * as XLSX from 'xlsx'
import { MilkEntry, Member } from './types'

// ---- COMPANY REPORT EXCEL ----
export function exportCompanyExcel(
  rows: any[],
  cols: { id: string; label: string }[],
  period: string,
  rate: number
) {
  const header = cols.map(c => c.label)
  const data = [
    ['PRD.143 THONDAPADI — GOVT. INCENTIVE REPORT'],
    [`Period: ${period} | Rate: ₹${rate}/Litre`],
    ['TNSC0011400'],
    [],
    header,
    ...rows.map(r => cols.map(c => {
      if (c.id === 'litres') return Number(r.litres.toFixed(2))
      if (c.id === 'amount') return Number(r.amount.toFixed(0))
      return r[c.id] || ''
    })),
    [],
    cols.map(c =>
      c.id === 'litres' ? rows.reduce((s, r) => s + r.litres, 0).toFixed(2) :
      c.id === 'amount' ? rows.reduce((s, r) => s + r.amount, 0).toFixed(0) :
      c.id === 'name' ? 'TOTAL' : ''
    ),
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = cols.map(c => ({ wch: ['account_no', 'ifsc_code'].includes(c.id) ? 20 : 16 }))

  // Style header row (row 5 = index 4)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Company Report')

  const today = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `PRD143_THONDAPADI_Company_${today}.xlsx`)
}

// ---- BANK REPORT EXCEL ----
export function exportBankExcel(
  rows: any[],
  cols: { id: string; label: string }[],
  period: string,
  rate: number
) {
  const header = cols.map(c => c.label)
  const data = [
    ['PRD.143 THONDAPADI — BANK-WISE PAYMENT REPORT'],
    [`Period: ${period} | Rate: ₹${rate}/Litre`],
    [],
    header,
    ...rows.map(r => cols.map(c => {
      if (c.id === 'litres') return Number(r.litres.toFixed(2))
      if (c.id === 'amount') return Number(r.amount.toFixed(0))
      return r[c.id] || ''
    })),
    [],
    cols.map(c =>
      c.id === 'litres' ? rows.reduce((s, r) => s + r.litres, 0).toFixed(2) :
      c.id === 'amount' ? rows.reduce((s, r) => s + r.amount, 0).toFixed(0) :
      c.id === 'bank_name' ? 'TOTAL' : ''
    ),
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = cols.map(() => ({ wch: 18 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Bank Report')

  const today = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `PRD143_THONDAPADI_Bank_${today}.xlsx`)
}

// ---- PDF (print window) ----
export function exportPdf(
  rows: any[],
  cols: { id: string; label: string }[],
  title: string,
  period: string,
  rate: number
) {
  const tL = rows.reduce((s, r) => s + r.litres, 0)
  const tA = rows.reduce((s, r) => s + r.amount, 0)

  const tableRows = rows.map((r, i) => {
    const vals: Record<string, string> = {
      sl: String(r.sl || i + 1),
      sl_no: String(r.sl || i + 1),
      mem_no: r.mem_no || '',
      name: r.name || '',
      bank_name: r.bank_name || '',
      ifsc_code: r.ifsc_code || '',
      account_no: r.account_no || '',
      phone: r.phone || '',
      litres: r.litres.toFixed(2),
      amount: '₹' + Math.round(r.amount).toLocaleString('en-IN'),
      period: r.period || '',
    }
    return `<tr>${cols.map(c => `<td${['litres','amount','sl','sl_no'].includes(c.id) ? ' class="num"' : ''}>${vals[c.id] || ''}</td>`).join('')}</tr>`
  }).join('')

  const footCells = cols.map(c =>
    `<td${['litres','amount'].includes(c.id) ? ' class="num"' : ''}>${
      c.id === 'litres' ? tL.toFixed(2) + ' Liters' :
      c.id === 'amount' ? '₹' + Math.round(tA).toLocaleString('en-IN') :
      c.id === 'name' || c.id === 'bank_name' ? 'TOTAL' : ''
    }</td>`
  ).join('')

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${title}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10px; color: #000; margin: 0; }
  .hdr { text-align: center; border-bottom: 2px solid #1a7a4a; padding-bottom: 8px; margin-bottom: 8px; }
  .hdr h1 { font-size: 14px; margin: 0 0 2px; color: #1a7a4a; }
  .hdr h2 { font-size: 11px; margin: 0 0 2px; }
  .hdr p { font-size: 10px; margin: 0; color: #555; }
  .rate-box { background: #fef3e2; border: 1px solid #f5a623; padding: 4px 10px; margin: 6px 0; font-size: 10px; display: inline-block; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { background: #1a7a4a; color: #fff; padding: 6px 7px; text-align: left; font-size: 9px; text-transform: uppercase; border: 1px solid #1a7a4a; }
  th.num, td.num { text-align: right; }
  td { padding: 5px 7px; border: 1px solid #ccc; font-size: 9.5px; }
  tr:nth-child(even) td { background: #f9fafb; }
  tfoot td { background: #e8f5ee; font-weight: 700; border-top: 2px solid #1a7a4a; }
  .sig { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 28px; text-align: center; font-size: 9px; }
  .sig div { border-top: 1px solid #000; padding-top: 4px; }
  @media print { .no-print { display: none; } }
</style></head>
<body>
<div class="hdr">
  <h1>PRD.143 THONDAPADI — GOVT. DAIRY CO-OPERATIVE</h1>
  <h2>${title.toUpperCase()}</h2>
  <p>${period} &nbsp;|&nbsp; TNSC0011400</p>
</div>
<div class="rate-box">💰 Rate: ₹${rate}/Litre &nbsp;|&nbsp; Total: ${tL.toFixed(2)} Litres &nbsp;|&nbsp; Amount: ₹${Math.round(tA).toLocaleString('en-IN')}</div>
<table>
  <thead><tr>${cols.map(c => `<th${['litres','amount','sl','sl_no'].includes(c.id) ? ' class="num"' : ''}>${c.label}</th>`).join('')}</tr></thead>
  <tbody>${tableRows}</tbody>
  <tfoot><tr>${footCells}</tr></tfoot>
</table>
<div class="sig">
  <div>சங்க ஓட்டைதாரர்<br><br>கையொப்பம்</div>
  <div>சங்க தலைவர்<br><br>கையொப்பம்</div>
  <div>வரவு செல்வு அலுவலர்<br><br>கையொப்பம்</div>
  <div>சங்க செயலாளர்<br><br>கையொப்பம்</div>
</div>
</body></html>`

  const w = window.open('', '_blank', 'width=1000,height=750')
  if (w) {
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 700)
  }
}
