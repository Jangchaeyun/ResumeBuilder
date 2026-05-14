import { Link, useLocation } from 'react-router-dom'

export function RegisterDonePage() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>거의 다 됐어요</h1>
        <p className="muted">
          {email ? (
            <>
              <strong>{email}</strong>로 인증 메일을 보냈습니다. 메일함을 확인하고 링크를 눌러 인증을 완료한 뒤
              로그인해 주세요.
            </>
          ) : (
            <>인증 메일을 확인한 뒤 로그인해 주세요.</>
          )}
        </p>
        <Link className="btn btn--primary btn--block" to="/login">
          로그인으로 이동
        </Link>
      </div>
    </div>
  )
}
