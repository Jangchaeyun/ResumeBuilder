import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, normalizeResume, parseApiError } from '../lib/api'
import type { Resume } from '../types/models'

export function DashboardPage() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    const res = await apiFetch('/api/resume')
    if (!res.ok) {
      setError(await parseApiError(res))
      setLoading(false)
      return
    }
    const data = (await res.json()) as Record<string, unknown>[]
    setResumes(data.map((r) => normalizeResume(r)))
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await apiFetch('/api/resume', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim() }),
      })
      if (!res.ok) throw new Error(await parseApiError(res))
      const created = normalizeResume((await res.json()) as Record<string, unknown>)
      setTitle('')
      navigate(`/app/resume/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성에 실패했습니다.')
    } finally {
      setCreating(false)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('이 이력서를 삭제할까요?')) return
    const res = await apiFetch(`/api/resume/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      setError(await parseApiError(res))
      return
    }
    void load()
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page-header__eyebrow">워크스페이스</p>
          <h1>내 이력서</h1>
          <p className="muted">새 문서를 만들고 편집기에서 섹션을 채워 넣으세요.</p>
        </div>
      </header>

      <section className="panel panel--accent">
        <h2 className="panel__title">새 이력서</h2>
        <form className="inline-form" onSubmit={onCreate}>
          <input
            className="input-grow"
            placeholder="예: 2026 백엔드 개발자 이력서"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn--primary" type="submit" disabled={creating}>
            {creating ? '만드는 중…' : '만들기'}
          </button>
        </form>
      </section>

      {error ? <div className="alert alert--error">{error}</div> : null}

      {loading ? (
        <p className="muted">불러오는 중…</p>
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <p>아직 이력서가 없습니다. 위에서 첫 문서를 만들어 보세요.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {resumes.map((r) => (
            <article key={r.id} className="resume-card">
              <div className="resume-card__top">
                <h3>{r.title}</h3>
                <p className="muted small">
                  수정: {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}
                </p>
              </div>
              <div className="resume-card__actions">
                <Link className="btn btn--primary btn--sm" to={`/app/resume/${r.id}`}>
                  편집
                </Link>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => void onDelete(r.id)}>
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
