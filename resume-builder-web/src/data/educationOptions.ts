export const EDUCATION_LEVEL_OPTIONS = [
  { value: '', label: '학력 구분 선택' },
  { value: '초등학교 졸업', label: '초등학교 졸업' },
  { value: '중학교 졸업', label: '중학교 졸업' },
  { value: '고등학교 졸업', label: '고등학교 졸업' },
  { value: '대학·대학원 이상 졸업', label: '대학·대학원 이상 졸업' },
] as const

export const UNIVERSITY_TYPE_OPTIONS = [
  { value: '', label: '대학구분 *' },
  { value: '대학(2,3년)', label: '대학(2,3년)' },
  { value: '대학교(4년)', label: '대학교(4년)' },
  { value: '대학원(석사)', label: '대학원(석사)' },
  { value: '대학원(박사)', label: '대학원(박사)' },
] as const

export const EDUCATION_STATUS_OPTIONS = [
  { value: '', label: '상태 선택' },
  { value: '졸업', label: '졸업' },
  { value: '재학', label: '재학' },
  { value: '휴학', label: '휴학' },
  { value: '수료', label: '수료' },
  { value: '중퇴', label: '중퇴' },
] as const

export const CLASS_TYPE_OPTIONS = [
  { value: '', label: '주·야 선택' },
  { value: '주간', label: '주간' },
  { value: '야간', label: '야간' },
  { value: '주야간', label: '주야간' },
] as const

export const REGION_OPTIONS = [
  { value: '', label: '지역 선택' },
  { value: '서울', label: '서울' },
  { value: '경기', label: '경기' },
  { value: '인천', label: '인천' },
  { value: '부산', label: '부산' },
  { value: '대구', label: '대구' },
  { value: '광주', label: '광주' },
  { value: '대전', label: '대전' },
  { value: '울산', label: '울산' },
  { value: '세종', label: '세종' },
  { value: '강원', label: '강원' },
  { value: '충북', label: '충북' },
  { value: '충남', label: '충남' },
  { value: '전북', label: '전북' },
  { value: '전남', label: '전남' },
  { value: '경북', label: '경북' },
  { value: '경남', label: '경남' },
  { value: '제주', label: '제주' },
] as const

export function isUniversityEducationLevel(level?: string): boolean {
  return (level ?? '').includes('대학')
}

export function formatEducationTitle(ed: {
  level?: string
  schoolType?: string
  status?: string
  degree?: string
  institution?: string
}): string {
  if (ed.institution?.trim()) return ed.institution.trim()
  if (ed.schoolType?.trim()) return ed.schoolType.trim()
  if (ed.level?.trim()) return ed.level.trim()
  return ed.degree?.trim() || '학력'
}

export function formatEducationMeta(ed: {
  level?: string
  schoolType?: string
  status?: string
  degree?: string
  major?: string
  transfer?: boolean
  classType?: string
  location?: string
}): string {
  return [
    ed.major,
    isUniversityEducationLevel(ed.level) ? ed.schoolType : ed.level,
    ed.transfer ? '편입' : null,
    ed.status,
    ed.classType,
    ed.location,
    !isUniversityEducationLevel(ed.level) ? ed.degree : null,
  ]
    .filter((v) => v != null && String(v).trim())
    .join(' · ')
}

export function formatYearMonth(value?: string): string {
  const raw = (value ?? '').replace(/\D/g, '')
  if (raw.length === 6) return `${raw.slice(0, 4)}.${raw.slice(4, 6)}`
  if (raw.length === 4) return raw
  return (value ?? '').trim()
}

export function formatEducationPeriod(start?: string, end?: string): string | null {
  const s = formatYearMonth(start)
  const e = formatYearMonth(end)
  if (!s && !e) return null
  return [s, e].filter(Boolean).join(' – ')
}
