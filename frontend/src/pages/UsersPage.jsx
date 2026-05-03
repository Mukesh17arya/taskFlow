import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await api.patch(`/users/${userId}/role`, { role })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: res.data.user.role } : u))
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    }
  }

  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Users</h1>
        <p className="text-ink-500 mt-1">{users.length} registered users</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left px-5 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Joined</th>
                <th className="text-left px-4 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-surface-1 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 text-xs font-semibold">
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-ink-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-ink-600">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${u.role === 'ADMIN' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-ink-400">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3.5">
                    <select
                      className="text-xs border border-ink-100 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
