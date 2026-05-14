import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="route-loading">
        <div className="route-loading__spinner" aria-hidden />
        <p>불러오는 중…</p>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
