import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Member, MilkEntry } from '@/lib/types'

// ---- MEMBERS ----
export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('is_active', true)
      .order('sl_no')
    setMembers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const addMember = async (m: Omit<Member, 'id' | 'created_at' | 'is_active'>) => {
    const { error } = await supabase.from('members').insert({ ...m, is_active: true })
    if (!error) fetch()
    return { error }
  }

  const updateMember = async (id: string, m: Partial<Member>) => {
    const { error } = await supabase.from('members').update(m).eq('id', id)
    if (!error) fetch()
    return { error }
  }

  const deleteMember = async (id: string) => {
    const { error } = await supabase.from('members').update({ is_active: false }).eq('id', id)
    if (!error) fetch()
    return { error }
  }

  return { members, loading, refetch: fetch, addMember, updateMember, deleteMember }
}

// ---- MILK ENTRIES ----
export function useEntries(filters?: { from?: string; to?: string; member_id?: string }) {
  const [entries, setEntries] = useState<MilkEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('milk_entries')
      .select('*, member:members(id,sl_no,mem_no,name,bank_name,ifsc_code,account_no,phone)')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters?.from) q = q.gte('entry_date', filters.from)
    if (filters?.to) q = q.lte('entry_date', filters.to)
    if (filters?.member_id) q = q.eq('member_id', filters.member_id)

    const { data } = await q
    setEntries((data as any) || [])
    setLoading(false)
  }, [filters?.from, filters?.to, filters?.member_id])

  useEffect(() => { fetch() }, [fetch])

  const addEntry = async (e: {
    member_id: string; entry_date: string; litres: number; rate: number; note?: string; created_by: string
  }) => {
    const { error } = await supabase.from('milk_entries').insert(e)
    if (!error) fetch()
    return { error }
  }

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('milk_entries').delete().eq('id', id)
    if (!error) fetch()
    return { error }
  }

  return { entries, loading, refetch: fetch, addEntry, deleteEntry }
}

// ---- SETTINGS ----
export function useMilkPrice() {
  const [price, setPrice] = useState(33)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'milk_price').single()
      .then(({ data }) => { if (data) setPrice(parseFloat(data.value)) })
  }, [])

  const updatePrice = async (p: number) => {
    const { error } = await supabase.from('settings')
      .update({ value: p.toString(), updated_at: new Date().toISOString() })
      .eq('key', 'milk_price')
    if (!error) setPrice(p)
    return { error }
  }

  return { price, updatePrice }
}

// ---- USER MANAGEMENT (admin only) ----
export function useUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('user_roles').select('*').order('created_at')
    setUsers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const updateRole = async (userId: string, role: string) => {
    const { error } = await supabase.from('user_roles').update({ role }).eq('user_id', userId)
    if (!error) fetch()
    return { error }
  }

  return { users, loading, refetch: fetch, updateRole }
}
