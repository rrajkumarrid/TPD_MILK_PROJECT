export type Role = 'admin' | 'data_entry'

export interface UserRole {
  id: string
  user_id: string
  role: Role
  full_name: string
  created_at: string
}

export interface Member {
  id: string
  sl_no: number
  mem_no: string
  name: string
  bank_name: string
  ifsc_code: string
  account_no: string
  phone: string
  is_active: boolean
  created_at: string
}

export interface MilkEntry {
  id: string
  member_id: string
  entry_date: string
  litres: number
  rate: number
  amount: number
  note: string | null
  created_by: string
  created_at: string
  // joined
  member?: Member
}

export interface MemberWithStats extends Member {
  total_litres: number
  total_amount: number
  last_entry?: string
}
