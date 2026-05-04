import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, UserPlus, Trash2, X, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import TaskCard from '../components/TaskCard'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuthStore()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)

  // Task form
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', assigned_to: '', status: 'todo', priority: 'medium', due_date: ''
  })
  const [creatingTask, setCreatingTask] = useState(false)

  // Member form
  const [memberForm, setMemberForm] = useState({ user_id: '', role: 'member' })
  const [addingMember, setAddingMember] = useState(false)

  // Check if current user is admin of this project
  const isAdmin = project?.members?.some(
    m => m.user.id === user?.id && m.role === 'admin'
  )

  const fetchProject = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/api/projects/${id}/`),
        api.get(`/api/projects/${id}/tasks/`),
      ])
      setProject(projRes.data)
      setTasks(tasksRes.data.results || tasksRes.data)
    } catch {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchProject() }, [fetchProject])

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setCreatingTask(true)
    try {
      const payload = { ...taskForm, project: parseInt(id) }
      if (!payload.assigned_to) delete payload.assigned_to
      if (!payload.due_date) delete payload.due_date
      else payload.assigned_to = parseInt(payload.assigned_to)

      await api.post(`/api/projects/${id}/tasks/`, payload)
      toast.success('Task created!')
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', assigned_to: '', status: 'todo', priority: 'medium', due_date: '' })
      fetchProject()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : 'Failed to create task')
    } finally {
      setCreatingTask(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/`, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/api/tasks/${taskId}/`)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setAddingMember(true)
    try {
      await api.post(`/api/projects/${id}/members/`, {
        user_id: parseInt(memberForm.user_id),
        role: memberForm.role,
      })
      toast.success('Member added!')
      setShowMemberModal(false)
      setMemberForm({ user_id: '', role: 'member' })
      fetchProject()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/api/projects/${id}/members/`, { data: { user_id: userId } })
      toast.success('Member removed')
      fetchProject()
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter)

  if (loading) return <Layout><div className="spinner" /></Layout>
  if (!project) return <Layout><div className="empty-state">Project not found.</div></Layout>

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '13px', marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Projects
        </Link>
        <div className="section-head">
          <div>
            <h1 className="page-title">{project.name}</h1>
            {project.description && (
              <p style={{ color: 'var(--muted)', marginTop: '6px', fontSize: '14px' }}>{project.description}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isAdmin && (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowMemberModal(true)}>
                <UserPlus size={14} /> Add Member
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
              <Plus size={14} /> New Task
            </button>
          </div>
        </div>
      </div>

      {/* Members strip */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Members:</span>
          {project.members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface2)', padding: '4px 10px', borderRadius: '999px', fontSize: '13px' }}>
              <span>{m.user.username}</span>
              <span className={`badge badge-${m.role === 'admin' ? 'high' : 'low'}`} style={{ padding: '1px 6px', fontSize: '10px' }}>{m.role}</span>
              {isAdmin && m.user.id !== user?.id && (
                <button onClick={() => handleRemoveMember(m.user.id)} style={{ background: 'none', color: 'var(--muted)', display: 'flex', marginLeft: '2px' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'todo', 'in_progress', 'done'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '999px', fontSize: '11px' }}>
              {f === 'all' ? tasks.length : tasks.filter(t => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Task grid */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <Plus size={40} />
          <p style={{ fontSize: '15px', fontWeight: 600, marginTop: '8px' }}>No tasks here</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowTaskModal(true)}>
            <Plus size={14} /> Create Task
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              canDelete={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>New Task</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTaskModal(false)} style={{ padding: '6px' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="field">
                <label className="label">Title</label>
                <input className="input" placeholder="Task title"
                  value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">Description</label>
                <textarea className="input" placeholder="Optional details…" rows={2}
                  value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field">
                  <label className="label">Assign To</label>
                  <select className="input" value={taskForm.assigned_to}
                    onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.username}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Priority</label>
                  <select className="input" value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Status</label>
                  <select className="input" value={taskForm.status}
                    onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Due Date</label>
                  <input className="input" type="date" value={taskForm.due_date}
                    onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creatingTask}>
                  {creatingTask ? 'Creating…' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Add Member</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowMemberModal(false)} style={{ padding: '6px' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="field">
                <label className="label">User ID</label>
                <input className="input" type="number" placeholder="Enter the user's ID"
                  value={memberForm.user_id} onChange={e => setMemberForm({ ...memberForm, user_id: e.target.value })} required />
                <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  Ask the user to check their ID via GET /api/auth/me/
                </span>
              </div>
              <div className="field">
                <label className="label">Role</label>
                <select className="input" value={memberForm.role}
                  onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addingMember}>
                  {addingMember ? 'Adding…' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}