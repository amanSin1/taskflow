import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '80px', fontWeight: 800, color: 'var(--border)' }}>404</div>
      <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Page not found.</p>
      <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
    </div>
  )
}