import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, AlertCircle, ListTodo, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import TaskCard from '../components/TaskCard'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/dashboard/')
      setData(res.data)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/`, { status: newStatus })
      fetchDashboard()
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (loading) return <Layout><div className="spinner" /></Layout>

  const { summary, overdue_tasks } = data

  const STAT_CARDS = [
    { label: 'Total Tasks', value: summary.total, icon: <ListTodo size={20} />, color: 'var(--accent)' },
    { label: 'In Progress', value: summary.in_progress, icon: <Clock size={20} />, color: '#c084fc' },
    { label: 'Done', value: summary.done, icon: <CheckCircle2 size={20} />, color: 'var(--green)' },
    { label: 'Overdue', value: summary.overdue, icon: <AlertCircle size={20} />, color: 'var(--red)' },
  ]

  return (
    <Layout>
      <div className="section-head">
        <h1 className="page-title">Dashboard</h1>
        <Link to="/projects" className="btn btn-ghost btn-sm">
          All Projects <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        {STAT_CARDS.map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
              <span style={{ color }}>{icon}</span>
            </div>
            <span style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Overdue tasks */}
      <div className="section-head">
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
          Overdue Tasks
          {summary.overdue > 0 && (
            <span style={{ marginLeft: '10px', fontSize: '13px', color: 'var(--red)', fontWeight: 500 }}>
              {summary.overdue} need attention
            </span>
          )}
        </h2>
      </div>

      {overdue_tasks.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 size={40} />
          <p style={{ fontSize: '16px', fontWeight: 600 }}>You're all caught up!</p>
          <p style={{ fontSize: '14px', marginTop: '6px' }}>No overdue tasks.</p>
        </div>
      ) : (
        <div className="grid-2">
          {overdue_tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              canDelete={false}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}