import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch, parseApiError } from '../lib/api'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('err')
      setMessage('토큰이 없습니다.')
      return
    }
    let cancelled = false
    ;(async () => {
      setStatus('loading')
      const res = await apiFetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, { auth: false })
      if (cancelled) return
      if (!res.ok) {
        setStatus('err')
        setMessage(await parseApiError(res))
        return
      }
      setStatus('ok')
      setMessage('이메일 인증이 완료되었습니다. 로그인해 주세요.')
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>이메일 인증</h1>
        {status === 'loading' ? <p className="muted">처리 중…</p> : null}
        {status === 'ok' ? <div className="alert alert--success">{message}</div> : null}
        {status === 'err' ? <div className="alert alert--error">{message}</div> : null}
        <Link className="btn btn--primary btn--block" to="/login">
          로그인
        </Link>
      </div>
    </div>
  )
}
