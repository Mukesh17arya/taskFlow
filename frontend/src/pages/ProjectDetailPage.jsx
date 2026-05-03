import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { format, isPast, parseISO } from 'date-fns'

const STATUS_COLS = [
  { key: 'TODO', label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { key: 'DONE', label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
]

const PRIORITY_COLORS = { HIGH: 'bg-red-400', MEDIUM: 'bg-amber-400', LOW: 'bg-emerald-400' }

function TaskModal({ projectId, members, task, onClose, onSaved }) {
  const isEdit = !!task
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    assigneeId: task?.assigneeId || '',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, projectId, assigneeId: form.assigneeId || null, dueDate: form.dueDate || null }
      const res = isEdit
        ? await api.put(`/tasks/${task.id}`, payload)
        : await api.post('/tasks', payload)
      toast.success(isEdit ? 'Task updated' : 'Task created')
      onSaved(res.data.task)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-ink-900 mb-5">{isEdit ? 'Edit Task' : 'New Task'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder="Task title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Task details..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Assignee</label>
              <select className="input" value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Due date</label>
              <input type="date" className="input" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isEdit ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email, role })
      toast.success('Member added!')
      onAdded(res.data.member)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up">
        <h3 className="font-semibold text-ink-900 mb-4">Add Team Member</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="member@company.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { isAdmin, user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [taskModal, setTaskModal] = useState(null) // null | 'create' | task object
  const [memberModal, setMemberModal] = useState(false)
  const [activeTab, setActiveTab] = useState('board')

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => setProject(res.data.project))
      .catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false))
  }, [id])

  const handleTaskSaved = (task) => {
    setProject(prev => {
      const existing = prev.tasks.find(t => t.id === task.id)
      if (existing) {
        return { ...prev, tasks: prev.tasks.map(t => t.id === task.id ? task : t) }
      }
      return { ...prev, tasks: [task, ...prev.tasks] }
    })
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      setProject(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${id}/members/${userId}`)
      setProject(prev => ({ ...prev, members: prev.members.filter(m => m.user.id !== userId) }))
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status })
      handleTaskSaved(res.data.task)
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!project) return <div className="text-center text-ink-400 mt-20">Project not found</div>

  const tasksByStatus = STATUS_COLS.reduce((acc, col) => {
    acc[col.key] = project.tasks.filter(t => t.status === col.key)
    return acc
  }, {})

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-ink-400 mb-1">
            <Link to="/projects" className="hover:text-brand-600">Projects</Link>
            <span>/</span>
            <span className="text-ink-700">{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900">{project.name}</h1>
          {project.description && <p className="text-ink-500 mt-1">{project.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setMemberModal(true)} className="btn-secondary">+ Member</button>
            <button onClick={() => setTaskModal('create')} className="btn-primary">+ Task</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 p-1 rounded-xl w-fit">
        {['board', 'members'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'board' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {STATUS_COLS.map(col => (
            <div key={col.key} className="bg-surface-2 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${col.color}`}>{col.label}</span>
                <span className="text-xs text-ink-400">{tasksByStatus[col.key]?.length}</span>
              </div>

              {tasksByStatus[col.key]?.map(task => (
                <div key={task.id} className="card p-4 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink-900 flex-1">{task.title}</p>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${PRIORITY_COLORS[task.priority]}`} title={task.priority} />
                  </div>
                  {task.description && <p className="text-xs text-ink-400 mt-1.5 line-clamp-2">{task.description}</p>}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {task.assignee && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-xs text-brand-700 font-medium">
                            {task.assignee.name[0]}
                          </div>
                          <span className="text-xs text-ink-400 hidden group-hover:block">{task.assignee.name}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <span className={`text-xs ${isPast(parseISO(task.dueDate)) && task.status !== 'DONE' ? 'text-red-500 font-medium' : 'text-ink-400'}`}>
                          {format(parseISO(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Status quick-change */}
                      {col.key !== 'TODO' && (
                        <button onClick={() => handleStatusChange(task.id, STATUS_COLS[STATUS_COLS.findIndex(c => c.key === col.key) - 1].key)}
                          className="text-xs text-ink-400 hover:text-ink-700 px-1.5 py-0.5 rounded hover:bg-surface-2">←</button>
                      )}
                      {col.key !== 'DONE' && (
                        <button onClick={() => handleStatusChange(task.id, STATUS_COLS[STATUS_COLS.findIndex(c => c.key === col.key) + 1].key)}
                          className="text-xs text-ink-400 hover:text-ink-700 px-1.5 py-0.5 rounded hover:bg-surface-2">→</button>
                      )}
                      {isAdmin && (
                        <>
                          <button onClick={() => setTaskModal(task)} className="text-xs text-ink-400 hover:text-brand-600 px-1.5 py-0.5 rounded hover:bg-surface-2">Edit</button>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-ink-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50">Del</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {tasksByStatus[col.key]?.length === 0 && (
                <div className="text-center py-8 text-ink-300 text-sm">Empty</div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100">
            <h2 className="font-semibold text-ink-900">Team Members ({project.members.length})</h2>
          </div>
          <div className="divide-y divide-ink-100">
            {project.members.map(member => (
              <div key={member.id} className="px-5 py-4 flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                  {member.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">{member.user.name}</p>
                  <p className="text-xs text-ink-400">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${member.role === 'ADMIN' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                    {member.role}
                  </span>
                  {isAdmin && member.user.id !== user.id && (
                    <button onClick={() => handleRemoveMember(member.user.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {taskModal && (
        <TaskModal
          projectId={id}
          members={project.members}
          task={taskModal === 'create' ? null : taskModal}
          onClose={() => setTaskModal(null)}
          onSaved={handleTaskSaved}
        />
      )}

      {memberModal && (
        <AddMemberModal
          projectId={id}
          onClose={() => setMemberModal(false)}
          onAdded={member => setProject(prev => ({ ...prev, members: [...prev.members, member] }))}
        />
      )}
    </div>
  )
}
