import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/app/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-card__back">
          ← 홈
        </Link>
        <h1>로그인</h1>
        <p className="muted">이메일 인증을 마친 계정만 로그인할 수 있습니다.</p>
        <form className="form" onSubmit={onSubmit}>
          {error ? <div className="alert alert--error">{error}</div> : null}
          <label className="field">
            <span>이메일</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>비밀번호</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <button className="btn btn--primary btn--block" type="submit" disabled={pending}>
            {pending ? '확인 중…' : '로그인'}
          </button>
        </form>
        <p className="auth-card__footer">
          계정이 없나요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  )
}
