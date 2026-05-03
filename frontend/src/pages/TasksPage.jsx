import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { format, isPast, parseISO } from 'date-fns'

const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }
const STATUS_BADGE = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' }
const PRIORITY_BADGE = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }

export default function TasksPage() {
  const { user, isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', priority: '' })

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter.status) params.status = filter.status
      if (filter.priority) params.priority = filter.priority
      if (!isAdmin) params.assigneeId = user.id
      const res = await api.get('/tasks', { params })
      setTasks(res.data.tasks)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [filter])

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status })
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{isAdmin ? 'All Tasks' : 'My Tasks'}</h1>
          <p className="text-ink-500 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="input w-auto" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select className="input w-auto" value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">✓</div>
          <h3 className="font-semibold text-ink-700">No tasks found</h3>
          <p className="text-ink-400 text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left px-5 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Task</th>
                  <th className="text-left px-4 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Project</th>
                  <th className="text-left px-4 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Assignee</th>
                  <th className="text-left px-4 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Priority</th>
                  <th className="text-left px-4 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-ink-400 font-medium text-xs uppercase tracking-wide">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {tasks.map(task => {
                  const overdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'DONE'
                  return (
                    <tr key={task.id} className="hover:bg-surface-1 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink-900">{task.title}</p>
                        {task.description && <p className="text-xs text-ink-400 mt-0.5 truncate max-w-xs">{task.description}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-ink-600">{task.project?.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-xs text-brand-700 font-medium">
                              {task.assignee.name[0]}
                            </div>
                            <span className="text-ink-600">{task.assignee.name}</span>
                          </div>
                        ) : <span className="text-ink-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={PRIORITY_BADGE[task.priority]}>{task.priority}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          className="text-xs border-0 bg-transparent cursor-pointer focus:outline-none"
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                          disabled={!isAdmin && task.assigneeId !== user.id}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        {task.dueDate ? (
                          <span className={`text-xs font-medium ${overdue ? 'text-red-500' : 'text-ink-500'}`}>
                            {overdue ? '⚠ ' : ''}{format(parseISO(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        ) : <span className="text-ink-300">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
