import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { apiFetch, parseApiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { PaymentOrderResponse } from '../types/models'

/** Toss customerKey 규칙(길이·허용 문자)에 맞게 정리 */
function customerKeyForToss(userId: string) {
  const s = `rb_${userId}`.replace(/[^a-zA-Z0-9\-_=.@]/g, '')
  return s.slice(0, 50) || 'rb_user'
}

export function PremiumPage() {
  const { user, refreshProfile } = useAuth()
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isPremium = user?.subscriptionPlan?.toLowerCase() === 'premium'

  const startPayment = useCallback(async () => {
    const key = clientKey?.trim() ?? ''
    if (!key) {
      setError('VITE_TOSS_CLIENT_KEY를 .env에 설정한 뒤 dev 서버를 재시작하세요.')
      return
    }
    if (/^(test|live)_gck_/i.test(key)) {
      setError(
        '지금 키는 결제위젯용(test_gck_)입니다. 이 페이지는 API 개별 연동 결제창을 쓰므로 test_ck_ / live_ck_ 클라이언트 키를 넣어 주세요.',
      )
      return
    }
    if (!user?.id) return

    setError(null)
    setLoading(true)
    try {
      const orderRes = await apiFetch('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ planType: 'premium' }),
      })
      if (!orderRes.ok) throw new Error(await parseApiError(orderRes))
      const order = (await orderRes.json()) as PaymentOrderResponse

      const tossPayments = await loadTossPayments(key)
      const payment = tossPayments.payment({ customerKey: customerKeyForToss(user.id) })

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: order.currency ?? 'KRW', value: order.amount },
        orderId: order.orderId,
        orderName: '프리미엄 플랜',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: user.email ?? undefined,
        customerName: user.name ?? undefined,
        card: { flowMode: 'DEFAULT' },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '결제를 시작하지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [clientKey, user?.id, user?.email, user?.name])

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>프리미엄</h1>
          <p className="muted">API 개별 연동(test_ck_) · 카드 통합결제창 · 백엔드 4,900원 승인 검증</p>
        </div>
      </header>

      {isPremium ? (
        <div className="panel panel--success">
          <h2>이미 프리미엄입니다</h2>
          <p className="muted">템플릿 페이지에서 전체 테마를 확인해 보세요.</p>
          <Link className="btn btn--primary" to="/app/templates">
            템플릿으로 이동
          </Link>
        </div>
      ) : (
        <div className="premium-layout">
          <section className="panel">
            <h2 className="panel__title">결제 진행</h2>
            <ol className="steps">
              <li>아래 버튼을 누르면 서버에 주문이 만들어지고 토스 결제창이 열립니다.</li>
              <li>결제 완료 후 성공 페이지에서 승인 검증이 끝나면 프리미엄이 반영됩니다.</li>
              <li>백엔드 시크릿 키는 같은 「API 개별 연동」의 test_sk_ 와 짝이 맞아야 합니다.</li>
            </ol>
            {error ? <div className="alert alert--error">{error}</div> : null}
            <div className="row row--gap">
              <button type="button" className="btn btn--primary" onClick={() => void startPayment()} disabled={loading}>
                {loading ? '결제창 여는 중…' : '4,900원 결제하기 (토스 결제창)'}
              </button>
              <button type="button" className="btn btn--outline" onClick={() => void refreshProfile()} disabled={loading}>
                구독 상태 새로고침
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
