import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { getTemplateCatalogEntry } from '../data/templateCatalog'
import {
  formatEducationMeta,
  formatEducationPeriod,
  formatEducationTitle,
  isUniversityEducationLevel,
} from '../data/educationOptions'
import { formatProjectHeadline } from '../data/projectFormat'
import { parseCommaList } from '../lib/techTags'
import type { ContactInfo, Resume } from '../types/models'

const HEX_6 = /^#[0-9A-Fa-f]{6}$/i

function normalizeHex(v: string | undefined, fallback: string): string {
  const s = (v ?? '').trim()
  if (HEX_6.test(s)) return s
  return fallback
}

function paletteTriplet(resume: Resume): [string, string, string] {
  const p = resume.template?.colorPlette ?? []
  return [
    normalizeHex(p[0], '#2dd4bf'),
    normalizeHex(p[1], '#0f172a'),
    normalizeHex(p[2], '#94a3b8'),
  ]
}

function resolveThemeCode(resume: Resume): string {
  const theme = (resume.template?.theme ?? '').trim()
  if (theme === '01' || theme === '02' || theme === '03') return theme
  for (const code of ['01', '02', '03'] as const) {
    if (getTemplateCatalogEntry(code).themeHint === theme) return code
  }
  return '01'
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return `rgba(15, 23, 42, ${alpha})`
  const r = Number.parseInt(h.slice(0, 2), 16)
  const g = Number.parseInt(h.slice(2, 4), 16)
  const b = Number.parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

type ContactRow = { label: string; value: string; icon: string }

function contactRows(c: ContactInfo): ContactRow[] {
  const rows: ContactRow[] = []
  if (c.email?.trim()) rows.push({ label: 'Email', value: c.email.trim(), icon: '✉' })
  if (c.phone?.trim()) rows.push({ label: 'Phone', value: c.phone.trim(), icon: '☎' })
  if (c.github?.trim()) rows.push({ label: 'GitHub', value: c.github.trim(), icon: '⌘' })
  if (c.techBlog?.trim()) rows.push({ label: 'Blog', value: c.techBlog.trim(), icon: '✎' })
  if (c.website?.trim()) rows.push({ label: 'Web', value: c.website.trim(), icon: '↗' })
  return rows
}

function TechTags({ value }: { value?: string }) {
  const tags = parseCommaList(value)
  if (tags.length === 0) return null
  return (
    <p className="resume-doc__tech-tags">
      {tags.map((tag) => (
        <span key={tag} className="resume-doc__tech-tag">
          {tag}
        </span>
      ))}
    </p>
  )
}

function ProjectDescription({ text }: { text?: string }) {
  const lines = (text ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (lines.length === 0) return null
  return (
    <ul className="resume-doc__project-lines">
      {lines.map((line) => (
        <li key={line}>{line.startsWith('→') ? line : `→ ${line}`}</li>
      ))}
    </ul>
  )
}

function HighlightList({ text }: { text?: string }) {
  const lines = (text ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (lines.length === 0) return null
  return (
    <ul className="resume-doc__highlights">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  )
}

function Section({
  title,
  children,
  variant = 'main',
  compact,
}: {
  title: string
  children: ReactNode
  variant?: 'main' | 'sidebar'
  compact?: boolean
}) {
  if (!children) return null
  return (
    <section
      className={`resume-doc__section resume-doc__section--${variant}${compact ? ' resume-doc__section--compact' : ''}`}
    >
      <h2 className="resume-doc__section-title">
        <span className="resume-doc__section-mark" aria-hidden />
        <span>{title}</span>
      </h2>
      <div className="resume-doc__section-body">{children}</div>
    </section>
  )
}

function ProgressBar({ value, variant = 'main' }: { value: number; variant?: 'main' | 'sidebar' }) {
  const pct = Math.min(100, Math.max(0, value ?? 0))
  return (
    <div className={`resume-doc__progress resume-doc__progress--${variant}`} aria-hidden>
      <span className="resume-doc__progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

function ContactList({ rows, variant }: { rows: ContactRow[]; variant: 'inline' | 'stack' | 'sidebar' }) {
  if (rows.length === 0) return null
  return (
    <ul className={`resume-doc__contacts-list resume-doc__contacts-list--${variant}`}>
      {rows.map((row) => (
        <li key={row.label} className="resume-doc__contact-item">
          <span className="resume-doc__contact-icon" aria-hidden>
            {row.icon}
          </span>
          <span className="resume-doc__contact-text">{row.value}</span>
        </li>
      ))}
    </ul>
  )
}

/** html2canvas용 이력서 문서 — PDF·미리보기 공용 */
export const ResumePreviewDocument = forwardRef<HTMLDivElement, { resume: Resume }>(function ResumePreviewDocument(
  { resume },
  ref,
) {
  const themeCode = resolveThemeCode(resume)
  const [accent, base, muted] = paletteTriplet(resume)
  const pi = resume.profileInfo ?? {}
  const contacts = contactRows(resume.contactInfo ?? {})
  const work = resume.workExperiences ?? []
  const educations = resume.educations ?? []
  const skills = resume.skills ?? []
  const projects = resume.projects ?? []
  const certs = resume.certifications ?? []
  const languages = resume.languages ?? []
  const interests = resume.interests ?? []

  const hasWork = work.some(
    (w) => w.company || w.role || w.description || w.technologies || w.highlights,
  )
  const hasEdu = educations.some(
    (e) => e.level || e.schoolType || e.status || e.degree || e.institution || e.major,
  )
  const hasSkills = skills.some((s) => s.name)
  const hasProjects = projects.some((p) => p.title || p.description || p.role || p.technologies)
  const hasCerts = certs.some((c) => c.title)
  const hasLang = languages.some((l) => l.name)
  const hasInterests = interests.length > 0

  const docStyle = {
    '--resume-accent': accent,
    '--resume-base': base,
    '--resume-muted': muted,
    '--resume-accent-soft': hexToRgba(accent, 0.12),
    '--resume-accent-muted': hexToRgba(accent, 0.28),
    '--resume-base-soft': hexToRgba(base, 0.06),
  } as CSSProperties

  const avatarEl = (
    <div className="resume-doc__avatar">
      {pi.profileReviewUrl ? (
        <img src={pi.profileReviewUrl} alt="" crossOrigin="anonymous" />
      ) : (
        <span className="resume-doc__avatar-fallback">{pi.fullName?.[0]?.toUpperCase() ?? '·'}</span>
      )}
    </div>
  )

  const nameEl = (
    <>
      <h1 className="resume-doc__name">{pi.fullName || '이름'}</h1>
      {pi.designation ? <p className="resume-doc__role">{pi.designation}</p> : null}
    </>
  )

  const summaryBlock =
    pi.summary?.trim() ? (
      <Section title="자기소개" variant={themeCode === '01' ? 'main' : 'main'}>
        <blockquote className="resume-doc__summary">{pi.summary}</blockquote>
      </Section>
    ) : null

  const workBlock = hasWork ? (
    <Section title="경력" compact={themeCode === '02'}>
      <ul className="resume-doc__timeline">
        {work.map((wx, i) => (
          <li key={i} className="resume-doc__timeline-item">
            <span className="resume-doc__timeline-dot" aria-hidden />
            <div className="resume-doc__timeline-content">
              <div className="resume-doc__timeline-head">
                <div>
                  <strong className="resume-doc__timeline-title">{wx.role || '역할'}</strong>
                  {wx.company ? <span className="resume-doc__timeline-sub">{wx.company}</span> : null}
                </div>
                {wx.startDate || wx.endDate ? (
                  <span className="resume-doc__date-badge">
                    {[wx.startDate, wx.endDate].filter(Boolean).join(' – ')}
                  </span>
                ) : null}
              </div>
              <TechTags value={wx.technologies} />
              <HighlightList text={wx.highlights} />
              {wx.description ? <p className="resume-doc__desc">{wx.description}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  ) : null

  const eduBlock = hasEdu ? (
    <Section title="학력" compact={themeCode === '02'}>
      <ul className="resume-doc__timeline resume-doc__timeline--light">
        {educations.map((ed, i) => (
          <li key={i} className="resume-doc__timeline-item">
            <span className="resume-doc__timeline-dot" aria-hidden />
            <div className="resume-doc__timeline-content">
              <div className="resume-doc__timeline-head">
                <div>
                  <strong className="resume-doc__timeline-title">{formatEducationTitle(ed)}</strong>
                  {formatEducationMeta(ed) ? (
                    <span className="resume-doc__timeline-sub">{formatEducationMeta(ed)}</span>
                  ) : null}
                  {!isUniversityEducationLevel(ed.level) && ed.degree ? (
                    <span className="resume-doc__timeline-sub resume-doc__timeline-sub--muted">{ed.degree}</span>
                  ) : null}
                </div>
                {formatEducationPeriod(ed.startDate, ed.endDate) ? (
                  <span className="resume-doc__date-badge resume-doc__date-badge--soft">
                    {formatEducationPeriod(ed.startDate, ed.endDate)}
                  </span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  ) : null

  const skillsBlockMain = hasSkills ? (
    <Section title="기술 스택" compact={themeCode === '02'}>
      <ul className="resume-doc__skill-grid">
        {skills.map((sk, i) => (
          <li key={i} className="resume-doc__skill-chip">
            <span className="resume-doc__skill-chip-name">{sk.name}</span>
            <ProgressBar value={sk.progress ?? 0} />
          </li>
        ))}
      </ul>
    </Section>
  ) : null

  const skillsBlockSidebar = hasSkills ? (
    <Section title="기술 스택" variant="sidebar">
      <ul className="resume-doc__skill-bars">
        {skills.map((sk, i) => (
          <li key={i} className="resume-doc__skill-bar-item">
            <div className="resume-doc__skill-bar-head">
              <span>{sk.name}</span>
              <span className="resume-doc__skill-pct">{sk.progress ?? 0}%</span>
            </div>
            <ProgressBar value={sk.progress ?? 0} variant="sidebar" />
          </li>
        ))}
      </ul>
    </Section>
  ) : null

  const projectsBlock = hasProjects ? (
    <Section title="프로젝트">
      <ul className="resume-doc__cards">
        {projects.map((pj, i) => (
          <li key={i} className="resume-doc__card">
            <h3 className="resume-doc__card-title">{formatProjectHeadline(pj)}</h3>
            {pj.role ? <p className="resume-doc__card-role">{pj.role}</p> : null}
            <ProjectDescription text={pj.description} />
            {(pj.github || pj.liveDemo) && (
              <p className="resume-doc__links">
                {pj.github ? <span>{pj.github}</span> : null}
                {pj.github && pj.liveDemo ? <span className="resume-doc__link-sep">·</span> : null}
                {pj.liveDemo ? <span>{pj.liveDemo}</span> : null}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  ) : null

  const certsBlock = hasCerts ? (
    <Section title="자격증" compact>
      <ul className="resume-doc__badge-list">
        {certs.map((c, i) => (
          <li key={i} className="resume-doc__badge-item">
            <span className="resume-doc__badge-name">{c.title}</span>
            <span className="resume-doc__badge-meta">
              {[c.issuer, c.year].filter(Boolean).join(' · ')}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  ) : null

  const langBlockMain = hasLang ? (
    <Section title="외국어" compact>
      <ul className="resume-doc__skill-grid">
        {languages.map((lg, i) => (
          <li key={i} className="resume-doc__skill-chip">
            <span className="resume-doc__skill-chip-name">{lg.name}</span>
            <ProgressBar value={lg.progress ?? 0} />
          </li>
        ))}
      </ul>
    </Section>
  ) : null

  const langBlockSidebar = hasLang ? (
    <Section title="외국어" variant="sidebar">
      <ul className="resume-doc__skill-bars">
        {languages.map((lg, i) => (
          <li key={i} className="resume-doc__skill-bar-item">
            <div className="resume-doc__skill-bar-head">
              <span>{lg.name}</span>
              <span className="resume-doc__skill-pct">{lg.progress ?? 0}%</span>
            </div>
            <ProgressBar value={lg.progress ?? 0} variant="sidebar" />
          </li>
        ))}
      </ul>
    </Section>
  ) : null

  const interestsBlock = hasInterests ? (
    <Section title="관심 분야" variant={themeCode === '01' ? 'sidebar' : 'main'} compact>
      <p className="resume-doc__tags">
        {interests.map((tag) => (
          <span key={tag} className="resume-doc__tag">
            {tag}
          </span>
        ))}
      </p>
    </Section>
  ) : null

  if (themeCode === '01') {
    return (
      <div ref={ref} className="resume-doc resume-doc--theme-01" style={docStyle}>
        <div className="resume-doc__layout resume-doc__layout--sidebar">
          <aside className="resume-doc__sidebar">
            <div className="resume-doc__sidebar-accent" aria-hidden />
            <div className="resume-doc__sidebar-inner">
              <header className="resume-doc__sidebar-header">
                {avatarEl}
                <div className="resume-doc__sidebar-identity">{nameEl}</div>
              </header>
              <ContactList rows={contacts} variant="sidebar" />
              {skillsBlockSidebar}
              {langBlockSidebar}
              {interestsBlock}
            </div>
          </aside>
          <main className="resume-doc__main">
            {summaryBlock}
            {workBlock}
            {eduBlock}
            {projectsBlock}
            {certsBlock}
          </main>
        </div>
      </div>
    )
  }

  if (themeCode === '03') {
    return (
      <div ref={ref} className="resume-doc resume-doc--theme-03" style={docStyle}>
        <header className="resume-doc__hero">
          <div className="resume-doc__hero-bg" aria-hidden />
          <div className="resume-doc__hero-inner">
            <div className="resume-doc__hero-profile">
              {avatarEl}
              <div>{nameEl}</div>
            </div>
            <ContactList rows={contacts} variant="inline" />
          </div>
        </header>
        <main className="resume-doc__main resume-doc__main--portfolio">
          {summaryBlock}
          {projectsBlock}
          <div className="resume-doc__two-col">
            <div>{workBlock}</div>
            <div>{eduBlock}</div>
          </div>
          {skillsBlockMain}
          {certsBlock}
          {langBlockMain}
          {interestsBlock}
        </main>
      </div>
    )
  }

  return (
    <div ref={ref} className="resume-doc resume-doc--theme-02" style={docStyle}>
      <header className="resume-doc__masthead">
        <div className="resume-doc__masthead-left">
          {avatarEl}
          <div>
            {nameEl}
            <ContactList rows={contacts} variant="stack" />
          </div>
        </div>
        <div className="resume-doc__masthead-rule" aria-hidden />
      </header>
      <main className="resume-doc__main resume-doc__main--compact">
        {summaryBlock}
        {workBlock}
        {eduBlock}
        <div className="resume-doc__split">
          <div>{projectsBlock}</div>
          <div>
            {skillsBlockMain}
            {langBlockMain}
            {certsBlock}
            {interestsBlock}
          </div>
        </div>
      </main>
    </div>
  )
})
