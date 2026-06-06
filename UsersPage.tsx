'use client'
import { Card, Btn, toast } from '@/components/ui'
import { useUsers } from '@/hooks/useData'

export default function UsersPage() {
  const { users, loading, updateRole } = useUsers()

  return (
    <div className="fade-up max-w-2xl">
      <div className="mb-4">
        <div className="text-base font-bold">User Management</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          Manage admin and data entry access. To add users, go to your Supabase dashboard → Authentication → Users → Add User, then assign their role here.
        </div>
      </div>

      <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(79,142,247,.08)', border: '1px solid rgba(79,142,247,.2)' }}>
        <div className="text-sm font-semibold mb-1" style={{ color: '#4f8ef7' }}>ℹ️ How to add a new user</div>
        <ol className="text-xs space-y-1" style={{ color: 'var(--muted2)' }}>
          <li>1. Go to <b>supabase.com → Your Project → Authentication → Users</b></li>
          <li>2. Click <b>"Add User"</b> → enter their email + password</li>
          <li>3. Copy the new user's UUID</li>
          <li>4. In SQL Editor, run: <code className="font-mono bg-black/30 px-1 rounded">INSERT INTO user_roles (user_id, role, full_name) VALUES ('UUID', 'data_entry', 'Name');</code></li>
          <li>5. The user appears here and can log in immediately</li>
        </ol>
      </div>

      <Card>
        <div className="text-sm font-semibold mb-4">👥 Current Users</div>
        {loading && <div className="text-sm py-4 text-center" style={{ color: 'var(--muted)' }}>Loading...</div>}
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--card2)' }}>
              <div>
                <div className="text-sm font-medium">{u.full_name || 'Unnamed User'}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>{u.user_id?.slice(0, 16)}...</div>
              </div>
              <div className="flex items-center gap-2">
                <select value={u.role}
                  onChange={async e => {
                    const { error } = await updateRole(u.user_id, e.target.value)
                    if (error) toast(error.message, true); else toast('Role updated!')
                  }}
                  className="!w-auto text-xs">
                  <option value="admin">admin</option>
                  <option value="data_entry">data_entry</option>
                </select>
              </div>
            </div>
          ))}
          {!loading && users.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>No users found. Add users via Supabase dashboard.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
