import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, parseApiError } from '../lib/api'
import { getTemplateCatalogEntry } from '../data/templateCatalog'
import type { TemplatesResponse } from '../types/models'

export function TemplatesPage() {
  const [data, setData] = useState<TemplatesResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await apiFetch('/api/templates')
      if (cancelled) return
      if (!res.ok) {
        setError(await parseApiError(res))
        return
      }
      setData((await res.json()) as TemplatesResponse)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const availableSet = useMemo(() => new Set(data?.availableTemplates ?? []), [data?.availableTemplates])

  return (
    <div className="page templates-page">
      <header className="page__header templates-page__header">
        <div>
          <h1>이력서 템플릿</h1>
          <p className="muted templates-page__lead">
            각 카드는 <strong>디자인 스타일 묶음</strong>이에요. 마음에 드는 템플릿을 고른 뒤, 이력서 편집기의{' '}
            <strong>「템플릿」</strong> 항목에 안내된 <strong>테마 코드</strong>를 입력하면 적용할 수 있습니다.
          </p>
        </div>
      </header>

      {error ? <div className="alert alert--error">{error}</div> : null}

      {data ? (
        <>
          <section className="template-status-banner" aria-label="구독 상태">
            <div className="template-status-banner__main">
              <span className={`template-status-banner__badge${data.isPremium ? ' template-status-banner__badge--premium' : ''}`}>
                {data.isPremium ? '프리미엄' : '베이직'}
              </span>
              <div>
                <p className="template-status-banner__title">
                  {data.isPremium
                    ? '모든 템플릿을 사용할 수 있어요.'
                    : '지금은 스탠다드(01)만 사용할 수 있어요.'}
                </p>
                <p className="muted small">
                  서버 구독 값: <code className="inline-code">{data.subscription ?? '—'}</code>
                </p>
              </div>
            </div>
            {!data.isPremium ? (
              <Link className="btn btn--primary btn--sm" to="/app/premium">
                프리미엄으로 더 많은 템플릿 열기
              </Link>
            ) : (
              <Link className="btn btn--outline btn--sm" to="/app/dashboard">
                이력서로 돌아가기
              </Link>
            )}
          </section>

          <h2 className="templates-page__section-title">템플릿 목록</h2>
          <p className="muted small templates-page__section-desc">
            잠긴 카드는 결제 후 바로 같은 방식으로 적용할 수 있어요.
          </p>

          <ul className="template-list" role="list">
            {(data.allTemplates ?? []).map((code) => {
              const unlocked = availableSet.has(code)
              const info = getTemplateCatalogEntry(code)
              return (
                <li key={code} className="template-list__item" role="listitem">
                  <article className={`template-card-v2${unlocked ? '' : ' template-card-v2--locked'}`}>
                    <div
                      className={`template-card-v2__preview template-card-v2__preview--code-${code.replace(/\W/g, '') || 'default'}`}
                    >
                      <span className="template-card-v2__preview-label">{info.title}</span>
                      {!unlocked ? (
                        <span className="template-card-v2__lock-pill" aria-hidden>
                          잠금
                        </span>
                      ) : (
                        <span className="template-card-v2__ok-pill" aria-hidden>
                          사용 가능
                        </span>
                      )}
                    </div>
                    <div className="template-card-v2__body">
                      <p className="template-card-v2__tagline">{info.tagline}</p>
                      <ul className="template-card-v2__highlights">
                        {info.highlights.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                      <div className="template-card-v2__apply">
                        <span className="muted small">편집기에 넣을 테마 코드</span>
                        <div className="template-card-v2__code-row">
                          <code className="template-card-v2__code">{info.themeHint}</code>
                          <span className="muted small">← 이력서 편집기 → 템플릿 → 테마 코드</span>
                        </div>
                      </div>
                      <div className="template-card-v2__footer">
                        {unlocked ? (
                          <Link className="btn btn--primary btn--sm" to="/app/dashboard">
                            이력서에서 적용하기
                          </Link>
                        ) : (
                          <Link className="btn btn--secondary btn--sm" to="/app/premium">
                            프리미엄으로 잠금 해제
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>

          <section className="panel templates-page__howto" aria-labelledby="howto-title">
            <h2 id="howto-title" className="panel__title">
              적용 방법 (3단계)
            </h2>
            <ol className="templates-page__howto-list">
              <li>
                <strong>대시보드</strong>에서 편집할 이력서를 고릅니다.
              </li>
              <li>
                편집기 아래쪽 <strong>「템플릿」</strong> 섹션에서 <strong>테마 코드</strong>에 위 카드의 코드(예:{' '}
                <code className="inline-code">01</code>)를 입력합니다.
              </li>
              <li>
                잠시 후 자동 저장되며, PDF로 보내거나 메일로 보낼 때 같은 스타일이 유지됩니다.
              </li>
            </ol>
          </section>
        </>
      ) : (
        !error && <p className="muted">불러오는 중…</p>
      )}
    </div>
  )
}
