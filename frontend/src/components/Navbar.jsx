import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, LogOut, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '20px',
        color: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Zap size={20} fill="currentColor" />
        TaskFlow
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <NavLink to="/dashboard" active={location.pathname === '/dashboard'} icon={<LayoutDashboard size={16} />}>
          Dashboard
        </NavLink>
        <NavLink to="/projects" active={isActive('/projects')} icon={<FolderKanban size={16} />}>
          Projects
        </NavLink>
      </div>

      {/* User + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.username}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {user?.role}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  )
}

function NavLink({ to, active, icon, children }) {
  return (
    <Link to={to} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: 'var(--radius)',
      fontSize: '14px',
      fontWeight: 500,
      color: active ? 'var(--text)' : 'var(--muted)',
      background: active ? 'var(--surface2)' : 'transparent',
      transition: 'all 0.15s',
    }}>
      {icon}
      {children}
    </Link>
  )
}