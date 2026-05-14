import { Link, useSearchParams } from 'react-router-dom'

export function PaymentFailPage() {
  const [params] = useSearchParams()
  const code = params.get('code')
  const message = params.get('message')

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>결제 실패</h1>
        <p className="muted">
          {message ? decodeURIComponent(message) : '결제가 중단되었습니다.'}
        </p>
        {code ? <p className="muted small">코드: {code}</p> : null}
        <Link className="btn btn--primary btn--block" to="/app/premium">
          다시 시도
        </Link>
        <Link className="btn btn--ghost btn--block" to="/app/dashboard">
          대시보드
        </Link>
      </div>
    </div>
  )
}
