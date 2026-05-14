import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/app/dashboard', label: '내 이력서', hint: '목록과 새 문서' },
  { to: '/app/templates', label: '템플릿', hint: '디자인·구독' },
  { to: '/app/premium', label: '프리미엄', hint: '결제·혜택' },
] as const

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="shell">
      <aside className="shell__aside">
        <button type="button" className="shell__brand" onClick={() => navigate('/app/dashboard')}>
          <span className="shell__brand-mark" />
          <span>
            <strong>Resume</strong>
            <small>Studio</small>
          </span>
        </button>
        <nav className="shell__nav" aria-label="주 메뉴">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `shell__link${isActive ? ' shell__link--active' : ''}`}
            >
              <span className="shell__link-inner">
                <span className="shell__link-label">{item.label}</span>
                <span className="shell__link-hint">{item.hint}</span>
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="shell__user">
          <div className="shell__avatar" aria-hidden>
            {user?.name?.slice(0, 1) ?? '?'}
          </div>
          <div className="shell__user-meta">
            <p className="shell__user-name">{user?.name}</p>
            <p className="shell__user-plan">
              {user?.subscriptionPlan?.toLowerCase() === 'premium' ? '프리미엄' : '베이직'} ·{' '}
              {user?.emailVerified ? '인증됨' : '미인증'}
            </p>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => logout()}>
            로그아웃
          </button>
        </div>
      </aside>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  )
}
