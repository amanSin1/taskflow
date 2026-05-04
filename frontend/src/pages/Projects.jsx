import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Users, X } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects/')
      setProjects(res.data.results || res.data)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/api/projects/', form)
      toast.success('Project created!')
      setShowModal(false)
      setForm({ name: '', description: '' })
      fetchProjects()
    } catch {
      toast.error('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Layout>
      <div className="section-head">
        <h1 className="page-title">Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} />
          <p style={{ fontSize: '16px', fontWeight: 600, marginTop: '8px' }}>No projects yet</p>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Create your first project to get started.</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(project => (
            <div
              key={project.id}
              className="card"
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{ cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{project.name}</h3>
                <FolderOpen size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              </div>

              {project.description && (
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {project.description.length > 80 ? project.description.slice(0, 80) + '…' : project.description}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
                <Users size={13} />
                <span>{project.member_count} member{project.member_count !== 1 ? 's' : ''}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px' }}>
                  Owner: {project.owner?.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>New Project</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="field">
                <label className="label">Project Name</label>
                <input className="input" placeholder="e.g. Mobile App Redesign"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">Description (optional)</label>
                <textarea className="input" placeholder="What is this project about?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}