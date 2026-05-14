import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch, parseApiError } from '../lib/api'

export function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const paymentKey = params.get('paymentKey')
  const orderId = params.get('orderId')
  const amount = params.get('amount')

  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('err')
      setMessage('결제 정보가 URL에 없습니다.')
      return
    }
    let cancelled = false
    ;(async () => {
      setStatus('loading')
      const res = await apiFetch('/api/payments/verify', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ paymentKey, orderId, amount }),
      })
      if (cancelled) return
      if (!res.ok) {
        setStatus('err')
        setMessage(await parseApiError(res))
        return
      }
      setStatus('ok')
      setMessage('결제가 확인되었습니다. 앱으로 돌아가면 프리미엄이 반영됩니다.')
    })()
    return () => {
      cancelled = true
    }
  }, [paymentKey, orderId, amount])

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>결제 완료</h1>
        {status === 'loading' ? <p className="muted">승인 검증 중…</p> : null}
        {status === 'ok' ? <div className="alert alert--success">{message}</div> : null}
        {status === 'err' ? <div className="alert alert--error">{message}</div> : null}
        <Link className="btn btn--primary btn--block" to="/app/premium">
          프리미엄 페이지로
        </Link>
        <Link className="btn btn--ghost btn--block" to="/">
          홈
        </Link>
      </div>
    </div>
  )
}
