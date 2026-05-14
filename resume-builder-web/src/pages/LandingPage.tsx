import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LANDING_FEATURES = [
  {
    title: '보안 로그인',
    desc: 'JWT와 이메일 인증으로 계정을 보호합니다.',
  },
  {
    title: '템플릿·결제',
    desc: '디자인 템플릿과 Toss 결제로 프리미엄을 열 수 있어요.',
  },
  {
    title: 'PDF·메일',
    desc: '작성한 이력서를 PDF로 첨부해 바로 메일 전송합니다.',
  },
] as const

export function LandingPage() {
  const { token } = useAuth()

  return (
    <div className="landing">
      <header className="landing__top">
        <div className="landing__logo">
          <span className="shell__brand-mark shell__brand-mark--lg" />
          <span>Resume Studio</span>
        </div>
        <div className="landing__actions">
          {token ? (
            <Link className="btn btn--primary" to="/app/dashboard">
              대시보드
            </Link>
          ) : (
            <>
              <Link className="btn btn--ghost" to="/login">
                로그인
              </Link>
              <Link className="btn btn--primary" to="/register">
                무료로 시작
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="landing__hero">
        <div className="landing__mesh" aria-hidden />
        <div className="landing__hero-inner">
          <p className="pill">클라우드 기반 이력서 빌더</p>
          <h1>
            한 곳에서 완성하는
            <br />
            <span className="text-gradient">프로페셔널 이력서</span>
          </h1>
          <p className="landing__lead">
            경력·학력·프로젝트·스킬을 구조화하고, 템플릿과 PDF 메일로 채용 담당자에게 바로 전달하세요.
          </p>
          <div className="landing__cta">
            <Link className="btn btn--primary btn--lg" to={token ? '/app/dashboard' : '/register'}>
              지금 만들기
            </Link>
            <Link className="btn btn--outline btn--lg" to="/login">
              계정이 있어요
            </Link>
          </div>
          <div className="landing__feature-grid" role="list">
            {LANDING_FEATURES.map((f) => (
              <article key={f.title} className="landing__feature-card" role="listitem">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
