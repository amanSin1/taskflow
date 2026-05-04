import { Calendar, User, Trash2 } from 'lucide-react'

/*
  Reusable task card used in both ProjectDetail and Dashboard.
  Props:
    task         — task object from API
    onStatusChange(taskId, newStatus) — callback
    onDelete(taskId)                  — callback (optional, admins only)
    canDelete                         — boolean
*/

const STATUS_OPTIONS = ['todo', 'in_progress', 'done']

export default function TaskCard({ task, onStatusChange, onDelete, canDelete }) {
  const isOverdue = task.is_overdue

  return (
    <div className="card" style={{
      borderLeft: `3px solid ${isOverdue ? 'var(--red)' : 'var(--border)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'transform 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontWeight: 600, fontSize: '15px', lineHeight: 1.3 }}>{task.title}</span>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          {isOverdue && <span className="badge" style={{ background: '#2a1414', color: 'var(--red)' }}>Overdue</span>}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
          {task.description.length > 100 ? task.description.slice(0, 100) + '…' : task.description}
        </p>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--muted)' }}>
        {task.assigned_to_detail && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} />
            {task.assigned_to_detail.username}
          </span>
        )}
        {task.due_date && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOverdue ? 'var(--red)' : 'var(--muted)' }}>
            <Calendar size={12} />
            {task.due_date}
          </span>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <select
          className="input"
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          style={{ width: 'auto', padding: '5px 10px', fontSize: '13px' }}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>

        <span className={`badge badge-${task.status}`}>
          {task.status.replace('_', ' ')}
        </span>

        {canDelete && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(task.id)}
            style={{ padding: '5px 10px' }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}