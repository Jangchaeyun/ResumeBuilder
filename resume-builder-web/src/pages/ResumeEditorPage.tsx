import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch, normalizeResume, parseApiError } from '../lib/api'
import { getTemplateCatalogEntry } from '../data/templateCatalog'
import type {
  Certification,
  ContactInfo,
  Education,
  Language,
  ProfileInfo,
  Project,
  Resume,
  Skill,
  TemplatesResponse,
  WorkExperience,
} from '../types/models'

function toPutBody(r: Resume): Record<string, unknown> {
  return {
    ...r,
    _id: r.id,
    id: r.id,
  }
}

const HEX_6 = /^#[0-9A-Fa-f]{6}$/i

function normalizeHex6(v: string | undefined, fallback: string): string {
  const s = (v ?? '').trim()
  if (HEX_6.test(s)) return `#${s.slice(1).toLowerCase()}`
  return fallback
}

/** 저장값에서 색상 피커용 3칸(hex)을 만듭니다. 비 hex 값은 대체색으로 보입니다. */
function tripletFromPalette(p: string[] | undefined | null): [string, string, string] {
  const arr = p ?? []
  return [
    normalizeHex6(arr[0], '#94a3b8'),
    normalizeHex6(arr[1], '#0f172a'),
    normalizeHex6(arr[2], '#e2e8f0'),
  ]
}

const PALETTE_PRESETS: { label: string; colors: [string, string, string] }[] = [
  { label: '그레이 · 네이비', colors: ['#64748b', '#0f172a', '#e2e8f0'] },
  { label: '틸 · 차콜', colors: ['#2dd4bf', '#0f172a', '#94a3b8'] },
  { label: '바이올렛', colors: ['#a78bfa', '#1e1b4b', '#cbd5e1'] },
  { label: '선셋', colors: ['#fbbf24', '#0f172a', '#f472b6'] },
  { label: '포레스트', colors: ['#4ade80', '#14532d', '#dcfce7'] },
]

export function ResumeEditorPage() {
  const { id } = useParams<{ id: string }>()
  const [resume, setResume] = useState<Resume | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedTick, setSavedTick] = useState(0)
  const skipNextSave = useRef(false)
  const [templateAccess, setTemplateAccess] = useState<TemplatesResponse | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setError(null)
    const res = await apiFetch(`/api/resume/${id}`)
    if (!res.ok) {
      setError(await parseApiError(res))
      setLoading(false)
      return
    }
    const raw = (await res.json()) as Record<string, unknown>
    skipNextSave.current = true
    setResume(normalizeResume(raw))
    setLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await apiFetch('/api/templates')
      if (cancelled) return
      if (!res.ok) {
        setTemplateAccess({
          allTemplates: ['01', '02', '03'],
          availableTemplates: ['01'],
          isPremium: false,
        })
        return
      }
      setTemplateAccess((await res.json()) as TemplatesResponse)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const saveNow = useCallback(async (next: Resume) => {
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      const res = await apiFetch(`/api/resume/${id}`, {
        method: 'PUT',
        body: JSON.stringify(toPutBody(next)),
      })
      if (!res.ok) throw new Error(await parseApiError(res))
      setSavedTick((n) => n + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }, [id])

  useEffect(() => {
    if (!resume) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    const t = window.setTimeout(() => {
      void saveNow(resume)
    }, 900)
    return () => window.clearTimeout(t)
  }, [resume, saveNow])

  const patch = useCallback((fn: (draft: Resume) => void) => {
    setResume((prev) => {
      if (!prev) return prev
      const draft = structuredClone(prev)
      fn(draft)
      return draft
    })
  }, [])

  const setPaletteSlot = useCallback(
    (index: 0 | 1 | 2, hex: string) => {
      patch((d) => {
        d.template = d.template ?? {}
        const prev = d.template.colorPlette ?? []
        const t = tripletFromPalette(prev)
        t[index] = hex
        d.template.colorPlette = [...t, ...prev.slice(3)]
      })
    },
    [patch],
  )

  const applyPaletteTriplet = useCallback(
    (colors: [string, string, string]) => {
      patch((d) => {
        d.template = d.template ?? {}
        const rest = (d.template.colorPlette ?? []).slice(3)
        d.template.colorPlette = [...colors, ...rest]
      })
    },
    [patch],
  )

  async function onUploadProfileImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !id || !resume) return
    setError(null)
    const fd = new FormData()
    fd.append('profileImage', file)
    const res = await apiFetch(`/api/resume/${id}/upload-images`, { method: 'PUT', body: fd })
    if (!res.ok) {
      setError(await parseApiError(res))
      e.target.value = ''
      return
    }
    const data = (await res.json()) as { profilePreviewUrl?: string }
    if (data.profilePreviewUrl) {
      const merged: Resume = {
        ...resume,
        profileInfo: { ...(resume.profileInfo ?? {}), profileReviewUrl: data.profilePreviewUrl },
      }
      skipNextSave.current = true
      setResume(merged)
      await saveNow(merged)
    }
    e.target.value = ''
  }

  const [mailOpen, setMailOpen] = useState(false)
  const [mailTo, setMailTo] = useState('')
  const [mailSubject, setMailSubject] = useState('이력서 제출')
  const [mailBody, setMailBody] = useState('이력서를 첨부했습니다.\n\n감사합니다.')
  const [mailFile, setMailFile] = useState<File | null>(null)
  const [mailPending, setMailPending] = useState(false)

  async function onSendMail(e: FormEvent) {
    e.preventDefault()
    if (!mailTo || !mailFile) {
      setError('수신 이메일과 PDF 파일을 입력해 주세요.')
      return
    }
    setMailPending(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('recipientEmail', mailTo)
      fd.append('subject', mailSubject)
      fd.append('message', mailBody)
      fd.append('pdffile', mailFile)
      const res = await apiFetch('/api/email/send-resume', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await parseApiError(res))
      setMailOpen(false)
      setMailTo('')
      setMailFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '메일 전송에 실패했습니다.')
    } finally {
      setMailPending(false)
    }
  }

  const statusText = useMemo(() => {
    if (loading) return '불러오는 중…'
    if (saving) return '저장 중…'
    if (savedTick > 0) return '저장됨'
    return ''
  }, [loading, saving, savedTick])

  if (!id) return <p className="muted">잘못된 경로입니다.</p>
  if (loading || !resume) return <p className="muted">불러오는 중…</p>

  const pi: ProfileInfo = resume.profileInfo ?? {}
  const ci: ContactInfo = resume.contactInfo ?? {}

  return (
    <div className="page page--editor">
      <header className="page__header page__header--split">
        <div>
          <p className="muted small">
            <Link to="/app/dashboard">← 대시보드</Link>
          </p>
          <h1 className="editor-title">
            <input
              className="editor-title-input"
              value={resume.title}
              onChange={(e) => patch((d) => {
                d.title = e.target.value
              })}
            />
          </h1>
        </div>
        <div className="editor-toolbar">
          <span className="muted small">{statusText}</span>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => void saveNow(resume)}>
            즉시 저장
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setMailOpen(true)}>
            PDF 메일 보내기
          </button>
        </div>
      </header>

      {error ? <div className="alert alert--error">{error}</div> : null}

      <div className="editor-grid">
        <section className="panel">
          <h2 className="panel__title">프로필</h2>
          <div className="profile-row">
            <div className="avatar-lg">
              {pi.profileReviewUrl ? <img src={pi.profileReviewUrl} alt="" /> : <span>{pi.fullName?.[0] ?? '·'}</span>}
            </div>
            <label className="btn btn--outline btn--sm">
              사진 업로드
              <input hidden type="file" accept="image/*" onChange={(e) => void onUploadProfileImage(e)} />
            </label>
          </div>
          <label className="field">
            <span>이름</span>
            <input value={pi.fullName ?? ''} onChange={(e) => patch((d) => {
              d.profileInfo = d.profileInfo ?? {}
              d.profileInfo.fullName = e.target.value
            })} />
          </label>
          <label className="field">
            <span>직함</span>
            <input value={pi.designation ?? ''} onChange={(e) => patch((d) => {
              d.profileInfo = d.profileInfo ?? {}
              d.profileInfo.designation = e.target.value
            })} />
          </label>
          <label className="field">
            <span>요약</span>
            <textarea
              rows={4}
              value={pi.summary ?? ''}
              onChange={(e) => patch((d) => {
                d.profileInfo = d.profileInfo ?? {}
                d.profileInfo.summary = e.target.value
              })}
            />
          </label>
        </section>

        <section className="panel">
          <h2 className="panel__title">연락처</h2>
          <div className="field-grid">
            <label className="field">
              <span>이메일</span>
              <input value={ci.email ?? ''} onChange={(e) => patch((d) => {
                d.contactInfo = d.contactInfo ?? {}
                d.contactInfo.email = e.target.value
              })} />
            </label>
            <label className="field">
              <span>전화</span>
              <input value={ci.phone ?? ''} onChange={(e) => patch((d) => {
                d.contactInfo = d.contactInfo ?? {}
                d.contactInfo.phone = e.target.value
              })} />
            </label>
            <label className="field">
              <span>위치</span>
              <input value={ci.location ?? ''} onChange={(e) => patch((d) => {
                d.contactInfo = d.contactInfo ?? {}
                d.contactInfo.location = e.target.value
              })} />
            </label>
            <label className="field">
              <span>LinkedIn</span>
              <input value={ci.linkedIn ?? ''} onChange={(e) => patch((d) => {
                d.contactInfo = d.contactInfo ?? {}
                d.contactInfo.linkedIn = e.target.value
              })} />
            </label>
            <label className="field">
              <span>GitHub</span>
              <input value={ci.github ?? ''} onChange={(e) => patch((d) => {
                d.contactInfo = d.contactInfo ?? {}
                d.contactInfo.github = e.target.value
              })} />
            </label>
            <label className="field">
              <span>웹사이트</span>
              <input value={ci.website ?? ''} onChange={(e) => patch((d) => {
                d.contactInfo = d.contactInfo ?? {}
                d.contactInfo.website = e.target.value
              })} />
            </label>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">템플릿</h2>
          <p className="muted small template-picker__intro">
            원하는 디자인을 누르면 <strong>테마 코드</strong>와 <strong>기본 색 팔레트</strong>가 함께 저장됩니다.{' '}
            <Link to="/app/templates">템플릿 안내</Link>
            {templateAccess && !templateAccess.isPremium ? (
              <>
                {' · '}
                <Link to="/app/premium">프리미엄</Link>
              </>
            ) : null}
          </p>

          {!templateAccess ? <p className="muted small">구독·템플릿 권한을 확인하는 중…</p> : null}

          {templateAccess ? (
            <div className="template-picker" role="radiogroup" aria-label="이력서 디자인 템플릿">
              <div className="template-picker__grid">
                {(templateAccess.allTemplates ?? ['01', '02', '03']).map((code) => {
                  const info = getTemplateCatalogEntry(code)
                  const availableSet = new Set(templateAccess.availableTemplates ?? [])
                  const unlocked = availableSet.has(code)
                  const themeVal = (resume.template?.theme ?? '').trim()
                  const selected = themeVal === code || themeVal === info.themeHint
                  return (
                    <button
                      key={code}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={!unlocked}
                      className={`template-picker__option${selected ? ' template-picker__option--selected' : ''}${!unlocked ? ' template-picker__option--locked' : ''}`}
                      onClick={() => {
                        if (!unlocked) return
                        patch((d) => {
                          d.template = d.template ?? {}
                          d.template.theme = info.themeHint
                          d.template.colorPlette = [...info.defaultPalette]
                        })
                      }}
                    >
                      <span className="template-picker__swatches" aria-hidden>
                        {info.defaultPalette.slice(0, 3).map((hex) => (
                          <span key={hex} className="template-picker__dot" style={{ background: hex }} />
                        ))}
                      </span>
                      <span className="template-picker__title">{info.title}</span>
                      <span className="template-picker__code">코드 {code}</span>
                      {!unlocked ? <span className="template-picker__badge">프리미엄</span> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="palette-editor">
            <h3 className="palette-editor__title">팔레트</h3>
            <p className="muted small palette-editor__hint">
              색을 고르면 자동 저장됩니다. 앞의 세 가지가 대표 색으로 쓰입니다.
            </p>
            <div className="palette-editor__presets" role="group" aria-label="팔레트 빠른 선택">
              {PALETTE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="palette-editor__preset"
                  onClick={() => applyPaletteTriplet(p.colors)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="palette-editor__slots">
              {(['포인트', '베이스', '강조'] as const).map((label, i) => {
                const slotVals = tripletFromPalette(resume.template?.colorPlette)
                const idx = i as 0 | 1 | 2
                return (
                  <div key={label} className="palette-slot">
                    <span className="palette-slot__label">{label}</span>
                    <div className="palette-slot__wrap">
                      <input
                        type="color"
                        className="palette-slot__input"
                        value={slotVals[idx]}
                        onChange={(e) => setPaletteSlot(idx, e.target.value)}
                        aria-label={`${label} 색상`}
                      />
                    </div>
                    <code className="palette-slot__hex">{slotVals[idx]}</code>
                  </div>
                )
              })}
            </div>
            {(resume.template?.colorPlette ?? []).length > 3 ? (
              <p className="muted small palette-editor__extra">
                네 번째 이후 색은 그대로 유지됩니다. 이 화면에서는 앞 세 색만 바꿀 수 있어요.
              </p>
            ) : null}
          </div>

          <details className="template-picker__advanced">
            <summary>고급: 테마 코드 직접 입력</summary>
            <div className="field template-picker__advanced-field">
              <span>테마 코드</span>
              <input
                value={resume.template?.theme ?? ''}
                onChange={(e) => patch((d) => {
                  d.template = d.template ?? {}
                  d.template.theme = e.target.value
                })}
              />
            </div>
            <details className="template-picker__nested">
              <summary>팔레트를 텍스트(쉼표 구분)로 편집</summary>
              <label className="field template-picker__advanced-field">
                <span>HEX 등 쉼표로 구분</span>
                <input
                  value={(resume.template?.colorPlette ?? []).join(', ')}
                  onChange={(e) => patch((d) => {
                    d.template = d.template ?? {}
                    d.template.colorPlette = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  })}
                />
              </label>
            </details>
          </details>
        </section>

        <ListSection<WorkExperience>
          title="경력"
          items={resume.workExperiences ?? []}
          onChange={(items) => patch((d) => {
            d.workExperiences = items
          })}
          empty={() => ({ company: '', role: '', startDate: '', endDate: '', description: '' })}
          render={(wx, i, upd) => (
            <div className="stack" key={i}>
              <div className="field-grid">
                <label className="field">
                  <span>회사</span>
                  <input value={wx.company ?? ''} onChange={(e) => upd({ ...wx, company: e.target.value })} />
                </label>
                <label className="field">
                  <span>역할</span>
                  <input value={wx.role ?? ''} onChange={(e) => upd({ ...wx, role: e.target.value })} />
                </label>
                <label className="field">
                  <span>시작</span>
                  <input value={wx.startDate ?? ''} onChange={(e) => upd({ ...wx, startDate: e.target.value })} />
                </label>
                <label className="field">
                  <span>종료</span>
                  <input value={wx.endDate ?? ''} onChange={(e) => upd({ ...wx, endDate: e.target.value })} />
                </label>
              </div>
              <label className="field">
                <span>설명</span>
                <textarea rows={3} value={wx.description ?? ''} onChange={(e) => upd({ ...wx, description: e.target.value })} />
              </label>
            </div>
          )}
        />

        <ListSection<Education>
          title="학력"
          items={resume.educations ?? []}
          onChange={(items) => patch((d) => {
            d.educations = items
          })}
          empty={() => ({ degree: '', institution: '', startDate: '', endDate: '' })}
          render={(ed, i, upd) => (
            <div className="field-grid" key={i}>
              <label className="field">
                <span>학위</span>
                <input value={ed.degree ?? ''} onChange={(e) => upd({ ...ed, degree: e.target.value })} />
              </label>
              <label className="field">
                <span>학교</span>
                <input value={ed.institution ?? ''} onChange={(e) => upd({ ...ed, institution: e.target.value })} />
              </label>
              <label className="field">
                <span>시작</span>
                <input value={ed.startDate ?? ''} onChange={(e) => upd({ ...ed, startDate: e.target.value })} />
              </label>
              <label className="field">
                <span>종료</span>
                <input value={ed.endDate ?? ''} onChange={(e) => upd({ ...ed, endDate: e.target.value })} />
              </label>
            </div>
          )}
        />

        <ListSection<Skill>
          title="스킬"
          items={resume.skills ?? []}
          onChange={(items) => patch((d) => {
            d.skills = items
          })}
          empty={() => ({ name: '', progress: 50 })}
          render={(sk, i, upd) => (
            <div className="field-grid" key={i}>
              <label className="field">
                <span>이름</span>
                <input value={sk.name ?? ''} onChange={(e) => upd({ ...sk, name: e.target.value })} />
              </label>
              <label className="field">
                <span>숙련도 ({sk.progress ?? 0})</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sk.progress ?? 0}
                  onChange={(e) => upd({ ...sk, progress: Number(e.target.value) })}
                />
              </label>
            </div>
          )}
        />

        <ListSection<Project>
          title="프로젝트"
          items={resume.projects ?? []}
          onChange={(items) => patch((d) => {
            d.projects = items
          })}
          empty={() => ({ title: '', description: '', github: '', liveDemo: '' })}
          render={(pj, i, upd) => (
            <div className="stack" key={i}>
              <label className="field">
                <span>제목</span>
                <input value={pj.title ?? ''} onChange={(e) => upd({ ...pj, title: e.target.value })} />
              </label>
              <label className="field">
                <span>설명</span>
                <textarea rows={2} value={pj.description ?? ''} onChange={(e) => upd({ ...pj, description: e.target.value })} />
              </label>
              <div className="field-grid">
                <label className="field">
                  <span>GitHub</span>
                  <input value={pj.github ?? ''} onChange={(e) => upd({ ...pj, github: e.target.value })} />
                </label>
                <label className="field">
                  <span>Live</span>
                  <input value={pj.liveDemo ?? ''} onChange={(e) => upd({ ...pj, liveDemo: e.target.value })} />
                </label>
              </div>
            </div>
          )}
        />

        <ListSection<Certification>
          title="자격증"
          items={resume.certifications ?? []}
          onChange={(items) => patch((d) => {
            d.certifications = items
          })}
          empty={() => ({ title: '', issuer: '', year: '' })}
          render={(c, i, upd) => (
            <div className="field-grid" key={i}>
              <label className="field">
                <span>이름</span>
                <input value={c.title ?? ''} onChange={(e) => upd({ ...c, title: e.target.value })} />
              </label>
              <label className="field">
                <span>발급</span>
                <input value={c.issuer ?? ''} onChange={(e) => upd({ ...c, issuer: e.target.value })} />
              </label>
              <label className="field">
                <span>연도</span>
                <input value={c.year ?? ''} onChange={(e) => upd({ ...c, year: e.target.value })} />
              </label>
            </div>
          )}
        />

        <ListSection<Language>
          title="언어"
          items={resume.languages ?? []}
          onChange={(items) => patch((d) => {
            d.languages = items
          })}
          empty={() => ({ name: '', progress: 50 })}
          render={(lg, i, upd) => (
            <div className="field-grid" key={i}>
              <label className="field">
                <span>언어</span>
                <input value={lg.name ?? ''} onChange={(e) => upd({ ...lg, name: e.target.value })} />
              </label>
              <label className="field">
                <span>능숙도 ({lg.progress ?? 0})</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={lg.progress ?? 0}
                  onChange={(e) => upd({ ...lg, progress: Number(e.target.value) })}
                />
              </label>
            </div>
          )}
        />

        <section className="panel">
          <h2 className="panel__title">관심사</h2>
          <label className="field">
            <span>태그 (쉼표로 구분)</span>
            <input
              value={(resume.interests ?? []).join(', ')}
              onChange={(e) => patch((d) => {
                d.interests = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              })}
            />
          </label>
        </section>
      </div>

      {mailOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setMailOpen(false)}>
          <div className="modal" role="dialog" onMouseDown={(e) => e.stopPropagation()}>
            <h2>PDF 메일 보내기</h2>
            <p className="muted small">백엔드 SMTP 설정이 되어 있어야 전송됩니다.</p>
            <form className="form" onSubmit={onSendMail}>
              <label className="field">
                <span>수신 이메일</span>
                <input type="email" value={mailTo} onChange={(e) => setMailTo(e.target.value)} required />
              </label>
              <label className="field">
                <span>제목</span>
                <input value={mailSubject} onChange={(e) => setMailSubject(e.target.value)} />
              </label>
              <label className="field">
                <span>본문</span>
                <textarea rows={3} value={mailBody} onChange={(e) => setMailBody(e.target.value)} />
              </label>
              <label className="field">
                <span>PDF 파일</span>
                <input type="file" accept="application/pdf" onChange={(e) => setMailFile(e.target.files?.[0] ?? null)} required />
              </label>
              <div className="row row--end">
                <button type="button" className="btn btn--ghost" onClick={() => setMailOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn--primary" disabled={mailPending}>
                  {mailPending ? '전송 중…' : '보내기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ListSection<T>({
  title,
  items,
  onChange,
  empty,
  render,
}: {
  title: string
  items: T[]
  onChange: (next: T[]) => void
  empty: () => T
  render: (item: T, index: number, update: (next: T) => void) => ReactNode
}) {
  function updAt(i: number, next: T) {
    const copy = [...items]
    copy[i] = next
    onChange(copy)
  }
  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">{title}</h2>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => onChange([...items, empty()])}>
          항목 추가
        </button>
      </div>
      <div className="stack stack--gap">
        {items.map((it, i) => (
          <div key={i} className="list-item">
            <div className="list-item__body">{render(it, i, (next) => updAt(i, next))}</div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              삭제
            </button>
          </div>
        ))}
        {items.length === 0 ? <p className="muted small">항목이 없습니다.</p> : null}
      </div>
    </section>
  )
}
