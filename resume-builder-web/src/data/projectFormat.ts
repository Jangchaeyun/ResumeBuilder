import { parseCommaList } from '../lib/techTags'

/** 채용 사이트 스타일: 제목(React·Node.js·MongoDB) */
export function formatProjectHeadline(pj: { title?: string; technologies?: string }): string {
  const title = pj.title?.trim() || '프로젝트'
  const tech = parseCommaList(pj.technologies)
    .map((t) => t.replace(/\s+/g, ''))
    .join('·')
  if (!tech) return title
  return `${title}(${tech})`
}
