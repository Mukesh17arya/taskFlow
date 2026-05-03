import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { format, isPast, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const statusBadge = (status) => {
  const map = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' }
  const labels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }
  return <span className={map[status]}>{labels[status]}</span>
}

const priorityBadge = (priority) => {
  const map = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
  return <span className={map[priority]}>{priority}</span>
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-ink-900">{value}</div>
        <div className="text-sm text-ink-500">{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { stats, recentTasks, myTasks } = data || {}

  return (
    <div className="animate-slide-up space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-ink-500 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Tasks" value={stats?.totalTasks} color="bg-brand-50" icon="📋" />
        <StatCard label="To Do" value={stats?.todoTasks} color="bg-slate-50" icon="○" />
        <StatCard label="In Progress" value={stats?.inProgressTasks} color="bg-blue-50" icon="⟳" />
        <StatCard label="Done" value={stats?.doneTasks} color="bg-emerald-50" icon="✓" />
        <StatCard label="Overdue" value={stats?.overdueTasks} color="bg-red-50" icon="!" />
        <StatCard label="Projects" value={stats?.totalProjects} color="bg-violet-50" icon="◈" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My open tasks */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">My Open Tasks</h2>
            <Link to="/tasks" className="text-xs text-brand-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-ink-100">
            {myTasks?.length === 0 && (
              <div className="px-5 py-8 text-center text-ink-400 text-sm">No open tasks 🎉</div>
            )}
            {myTasks?.slice(0, 6).map(task => (
              <div key={task.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface-1 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{task.title}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{task.project?.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.dueDate && isPast(parseISO(task.dueDate)) && (
                    <span className="text-xs text-red-500 font-medium">Overdue</span>
                  )}
                  {statusBadge(task.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100">
            <h2 className="font-semibold text-ink-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-ink-100">
            {recentTasks?.length === 0 && (
              <div className="px-5 py-8 text-center text-ink-400 text-sm">No recent tasks</div>
            )}
            {recentTasks?.slice(0, 6).map(task => (
              <div key={task.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface-1 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{task.title}</p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    {task.project?.name} {task.assignee ? `· ${task.assignee.name}` : ''}
                  </p>
                </div>
                {statusBadge(task.status)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
