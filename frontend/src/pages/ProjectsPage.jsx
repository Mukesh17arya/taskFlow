import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/projects', form)
      toast.success('Project created!')
      onCreated(res.data.project)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
        <h3 className="font-semibold text-ink-900 mb-4">New Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Project name</label>
            <input className="input" placeholder="e.g. Website Redesign" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea className="input resize-none" rows={3} placeholder="What's this project about?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data.projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return
    try {
      await api.delete(`/projects/${id}`)
      setProjects(p => p.filter(p => p.id !== id))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Projects</h1>
          <p className="text-ink-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">◈</div>
          <h3 className="font-semibold text-ink-700">No projects yet</h3>
          <p className="text-ink-400 text-sm mt-1">
            {isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project.id} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg">
                  {project.name[0].toUpperCase()}
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(project.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-red-500 transition-all text-xs px-2 py-1 rounded-lg hover:bg-red-50">
                    Delete
                  </button>
                )}
              </div>
              <Link to={`/projects/${project.id}`} className="block">
                <h3 className="font-semibold text-ink-900 hover:text-brand-600 transition-colors">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-ink-400 mt-1 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-ink-100 text-xs text-ink-400">
                  <span>👥 {project._count?.members} member{project._count?.members !== 1 ? 's' : ''}</span>
                  <span>✓ {project._count?.tasks} task{project._count?.tasks !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  )
}
